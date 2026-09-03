---
order: 1
title: "Planer"
summary: "Grafik, czas pracy i urlopy rozproszone między WordPressem, Excelem i papierem → jedna aplikacja pracownicza dla blisko 100-osobowego zespołu."
scale: "wdrożenie dla blisko 100 pracowników"
stack: ["FastAPI", "Jinja2", "htmx", "Alpine.js", "PostgreSQL", "SQLAlchemy"]
status: "wdrożony · 08.2026"
codeVisibility: "private"
codeNote: "Repozytorium jest prywatne, ponieważ aplikacja została zbudowana dla wewnętrznych procesów firmy. Na rozmowie mogę omówić architekturę, decyzje techniczne i bezpieczne fragmenty implementacji."
---

## Problem

Firma logistyczno-magazynowa prowadziła grafik pracy na starym WordPressie,
rozliczała godziny do wypłat ręcznie w Excelu, a wnioski urlopowe krążyły
papierowo i mailowo. Każde z tych narzędzi opisywało tylko fragment procesu.

## Moja rola

Z własnej inicjatywy przełożyłem realny proces firmy na wymagania, zaprojektowałem
rozwiązanie, zbudowałem aplikację i przeprowadziłem ją od prototypu do produkcji.
Odpowiadałem również za testy i wdrożenie. Pracowałem w modelu AI-assisted
development: podejmowałem decyzje produktowe i techniczne, a wynik weryfikowałem
w kodzie, testach i na działającym środowisku.

## Rozwiązanie

Planer łączy najważniejsze procesy pracownicze w jednym miejscu:

- miesięczny grafik z edycją pojedynczego dnia bez naruszania reszty planu
- rejestrację czasu pracy i obsługę przerw
- elektroniczne wnioski urlopowe z akceptacją przełożonego
- raporty XLSX do rozliczeń oraz historię zmian
- dokumenty i poradniki pracownicze
- widoki dopasowane do ról oraz urządzeń mobilnych i terminali magazynowych

## Najważniejsze decyzje

- Interfejs jest renderowany po stronie serwera, a biblioteki frontendowe są
  self-hosted — aplikacja działa również w sieci firmowej bez dostępu do internetu.
- Testy i produkcja korzystają z PostgreSQL, żeby sprawdzać logikę na tym samym
  silniku bazy, na którym działa system.
- Dostęp do danych jest ograniczany po stronie serwera według roli i zakresu
  organizacyjnego, a ważne operacje zapisują się w logu audytowym.

## Dowody

- wdrożenie produkcyjne dla firmy w sierpniu 2026
- kolejne migracje i wydania były sprawdzane na realnych danych oraz smoke testami
- pełna suita przekroczyła 1000 testów uruchamianych na PostgreSQL

## Status

Planer został przeze mnie wdrożony produkcyjnie w sierpniu 2026. Po zakończeniu
współpracy z firmą nie odpowiadam za jego dalszy rozwój ani obecny stan. Publicznie
nie pokazuję nazwy firmy, danych pracowników ani zamkniętego repozytorium.
