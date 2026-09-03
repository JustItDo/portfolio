// Wspólne efekty "żywego terminala": decode/scramble i typewriter komend.
// Każda funkcja no-opuje przy prefers-reduced-motion — tekst zostaje statyczny.

export const reduceMotion = () =>
	window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const ZNAKI = "!<>-_\\/[]{}=+*^?#$%&@ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

const losowyZnak = () => ZNAKI[Math.floor(Math.random() * ZNAKI.length)];

/**
 * Efekt decode: tekst elementu zaczyna jako losowe znaki i "rozszyfrowuje się"
 * od lewej do prawej. Font mono + stała długość = zero przesunięć layoutu.
 * Spacje zostają spacjami, żeby zachować łamanie wierszy.
 */
export function scramble(el: Element, duration = 900): Promise<void> {
	const tekst = el.textContent ?? "";
	if (reduceMotion() || !tekst.trim()) return Promise.resolve();

	return new Promise((resolve) => {
		const start = performance.now();
		const dlugosc = tekst.length;

		function klatka(teraz: number) {
			const postep = Math.min((teraz - start) / duration, 1);
			// ile znaków od lewej jest już "rozszyfrowanych"
			const ustalone = Math.floor(postep * dlugosc);
			let wynik = "";
			for (let i = 0; i < dlugosc; i++) {
				const znak = tekst[i];
				wynik += i < ustalone || znak === " " || znak === "\n" ? znak : losowyZnak();
			}
			el.textContent = wynik;
			if (postep < 1) {
				requestAnimationFrame(klatka);
			} else {
				el.textContent = tekst;
				resolve();
			}
		}
		requestAnimationFrame(klatka);
	});
}

/**
 * Typewriter: czyści element i wpisuje jego oryginalny tekst znak po znaku
 * z blokowym kursorem na końcu. Zwraca Promise rozwiązywany po dopisaniu.
 * Wywołujący odpowiada za wcześniejsze ukrycie "outputu" pod komendą.
 */
export function typeCommand(el: Element, msNaZnak = 26): Promise<void> {
	const tekst = el.textContent ?? "";
	if (reduceMotion() || !tekst.trim()) return Promise.resolve();

	el.textContent = "";

	return new Promise((resolve) => {
		let i = 0;
		const start = performance.now();

		function klatka(teraz: number) {
			const docelowo = Math.min(Math.floor((teraz - start) / msNaZnak), tekst.length);
			if (docelowo !== i) {
				i = docelowo;
				el.textContent = tekst.slice(0, i) + (i < tekst.length ? "▌" : "");
			}
			if (i < tekst.length) {
				requestAnimationFrame(klatka);
			} else {
				el.textContent = tekst;
				resolve();
			}
		}
		requestAnimationFrame(klatka);
	});
}
