import type { APIRoute } from "astro";

export const prerender = false;

// jedyny dynamiczny endpoint strony — wysyłka wiadomości z formularza przez
// Resend (decyzje: wiki/06-decyzje-techniczne.md). Bez bazy: wiadomość istnieje
// tylko jako mail w skrzynce odbiorcy. Warunki wdrożeniowe (Node przypięty do
// 127.0.0.1, Caddy: X-Forwarded-For + max_size body) — wiki/06, sekcja deploy.

const ODBIORCA = "kontakt@justdolt.pl";
const LIMITY = { name: 100, email: 200, subject: 150, message: 5000 };
// przecinek wykluczony także w domenie — "a@b.com,evil.com" nie przejdzie
const EMAIL_RE = /^[^\s@,]+@[^\s@,]+\.[^\s@,]+$/;

// prosty rate-limit w pamięci procesu: max 5 faktycznych prób wysyłki / 10 min
// / IP. Sprawdzany PRZED parsowaniem body (tani 429 przy floodzie), naliczany
// dopiero przy realnej próbie wysyłki (nieudane walidacje nie zjadają puli).
const OKNO_MS = 10 * 60 * 1000;
const MAX_W_OKNIE = 5;
const historia = new Map<string, number[]>();

function czyPrzekroczony(ip: string): boolean {
	const teraz = Date.now();
	const wpisy = (historia.get(ip) ?? []).filter((t) => teraz - t < OKNO_MS);
	if (wpisy.length) historia.set(ip, wpisy);
	else historia.delete(ip);
	return wpisy.length >= MAX_W_OKNIE;
}

function zapiszProbe(ip: string) {
	const wpisy = historia.get(ip) ?? [];
	wpisy.push(Date.now());
	historia.set(ip, wpisy);
	// twardy cap pamięci: flood unikalnymi IP nie może rosnąć bez końca —
	// powyżej 2000 wpisów wylatują te najdawniej aktywne
	if (historia.size > 2000) {
		const posortowane = [...historia.entries()].sort(
			(a, b) => (a[1][a[1].length - 1] ?? 0) - (b[1][b[1].length - 1] ?? 0),
		);
		for (const [klucz] of posortowane.slice(0, historia.size - 1000)) {
			historia.delete(klucz);
		}
	}
}

// znaki kontrolne (w tym CR/LF) nie mają czego szukać w imieniu ani temacie
const odkontroluj = (t: string) => t.replace(/[\r\n\x00-\x1f\x7f]/g, " ").trim();

const odpowiedz = (status: number, body: Record<string, unknown>) =>
	new Response(JSON.stringify(body), {
		status,
		headers: { "Content-Type": "application/json" },
	});

export const POST: APIRoute = async (context) => {
	const { request } = context;

	// CSRF-ish: jeśli przeglądarka przysłała Origin, musi zgadzać się z hostem
	const origin = request.headers.get("origin");
	if (origin) {
		try {
			if (new URL(origin).host !== new URL(request.url).host) {
				return odpowiedz(403, { ok: false, blad: "odmowa" });
			}
		} catch {
			return odpowiedz(403, { ok: false, blad: "odmowa" });
		}
	}

	// destrukturyzacja w sygnaturze wywołałaby getter clientAddress (rzucający
	// ClientAddressNotAvailable) przed wejściem do try — stąd dostęp dopiero tu
	let ip = "nieznany";
	try {
		ip = context.clientAddress;
	} catch {
		// brak adresu — rate-limit per "nieznany"
	}
	if (czyPrzekroczony(ip)) {
		return odpowiedz(429, { ok: false, blad: "za dużo wiadomości — spróbuj za kilka minut" });
	}

	let dane: Record<string, unknown>;
	try {
		dane = await request.json();
	} catch {
		return odpowiedz(400, { ok: false, blad: "nieprawidłowe dane" });
	}

	const name = odkontroluj(String(dane.name ?? ""));
	const email = String(dane.email ?? "").trim();
	const subject = odkontroluj(String(dane.subject ?? ""));
	const message = String(dane.message ?? "").trim();
	const honeypot = String(dane.website ?? "").trim();

	// bot wypełnił ukryte pole → udajemy sukces, żeby nie zdradzać mechanizmu
	if (honeypot) return odpowiedz(200, { ok: true });

	if (!name || !email || !message) {
		return odpowiedz(400, { ok: false, blad: "wypełnij imię, e-mail i wiadomość" });
	}
	if (!EMAIL_RE.test(email)) {
		return odpowiedz(400, { ok: false, blad: "podaj poprawny adres e-mail" });
	}
	if (
		name.length > LIMITY.name ||
		email.length > LIMITY.email ||
		subject.length > LIMITY.subject ||
		message.length > LIMITY.message
	) {
		return odpowiedz(400, { ok: false, blad: "wiadomość jest za długa" });
	}

	// process.env najpierw (sekret z runtime'u, np. systemd EnvironmentFile),
	// import.meta.env jako fallback dla dev — build robimy BEZ klucza w env,
	// żeby nic nie zostało zainlinowane do artefaktu
	const klucz = process.env.RESEND_API_KEY || import.meta.env.RESEND_API_KEY;
	if (!klucz) {
		return odpowiedz(503, { ok: false, blad: "wysyłka chwilowo niedostępna" });
	}

	zapiszProbe(ip);

	try {
		const res = await fetch("https://api.resend.com/emails", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${klucz}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				from: "Portfolio <kontakt@justdolt.pl>",
				to: [ODBIORCA],
				reply_to: email,
				subject: subject ? `[portfolio] ${subject}` : `[portfolio] wiadomość od ${name}`,
				text: `Od: ${name} <${email}>\n\n${message}`,
			}),
		});
		if (!res.ok) {
			// tylko status — treść odpowiedzi Resend potrafi echować e-mail
			// nadawcy (reply_to) i lądowałaby w logach systemowych
			console.error("Resend error, status:", res.status);
			return odpowiedz(502, { ok: false, blad: "wysyłka nie powiodła się" });
		}
		return odpowiedz(200, { ok: true });
	} catch (e) {
		console.error("Resend fetch failed:", e);
		return odpowiedz(502, { ok: false, blad: "wysyłka nie powiodła się" });
	}
};
