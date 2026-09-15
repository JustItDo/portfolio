---
order: 1
title: "Planer"
summary: "Grafik, czas pracy i urlopy rozproszone między WordPressem, Excelem i papierem → jedna aplikacja pracownicza projektowana dla blisko 100-osobowego zespołu."
scale: "pilotaż na danych ok. 70 pracowników"
stack: ["FastAPI", "Jinja2", "htmx", "Alpine.js", "PostgreSQL", "SQLAlchemy"]
status: "pilotaż · 08.2026"
codeVisibility: "private"
codeNote: "Repozytorium jest prywatne. Na rozmowie mogę pokazać demo na danych testowych oraz omówić architekturę i decyzje techniczne."
screenshots:
  - src: "/screenshots/planer/grafik-pracownika.webp"
    alt: "Widok pracownika: własny grafik miesięczny, tylko do odczytu"
  - src: "/screenshots/planer/grafik-kierownika.webp"
    alt: "Widok kierownika: siatka miesięczna grafiku całego zespołu z edycją pojedynczego dnia"
  - src: "/screenshots/planer/panel-zarzadzania.webp"
    alt: "Panel zarządzania: obłożenie stanowisk, oczekujące wnioski i szybkie akcje"
  - src: "/screenshots/planer/wnioski-urlopowe.webp"
    alt: "Kolejka wniosków urlopowych oczekujących na akceptację przełożonego"
  - src: "/screenshots/planer/rcp-zegar.webp"
    alt: "Rejestracja czasu pracy: zegar startu, przerwy i osi dnia"
  - src: "/screenshots/planer/raport-czasu-pracy.webp"
    alt: "Raport czasu pracy zespołu z eksportem do XLSX i ostrzeżeniem o przekroczonym limicie przerwy"
---

## Problem

Firma logistyczno-magazynowa prowadziła grafik pracy na starym WordPressie,
rozliczała godziny do wypłat ręcznie w Excelu, a wnioski urlopowe krążyły
papierowo i mailowo. Każde z tych narzędzi opisywało tylko fragment procesu.

## Moja rola

Z własnej inicjatywy przełożyłem realny proces firmy na wymagania, zaprojektowałem
rozwiązanie, zbudowałem aplikację i przeprowadziłem ją od prototypu do pilotażu
na serwerze firmy. Odpowiadałem również za testy i wdrożenie na serwer. Pracowałem w modelu AI-assisted
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

## Przed i po

Wniosek urlopowy wcześniej krążył papierowo lub mailowo. W Planerze pracownik
składa go elektronicznie, a przełożony akceptuje go w aplikacji.

Godziny do wypłat wcześniej rozliczano ręcznie w Excelu. Planer łączy rejestrację
czasu pracy z raportami XLSX do rozliczeń — dane o czasie i raport powstają
w jednym systemie.

## Najważniejsze decyzje

- Interfejs jest renderowany po stronie serwera, a biblioteki frontendowe są
  self-hosted — aplikacja działa również w sieci firmowej bez dostępu do internetu.
- Testy i produkcja korzystają z PostgreSQL, żeby sprawdzać logikę na tym samym
  silniku bazy, na którym działa system.
- Dostęp do danych jest ograniczany po stronie serwera według roli i zakresu
  organizacyjnego, a ważne operacje zapisują się w logu audytowym.

## Dowody

- wdrożenie na serwerze firmy i dwutygodniowy pilotaż w sierpniu 2026 — kierowniczka
  wprowadziła dane ok. 70 pracowników i zgłaszała uwagi przed startem
- kolejne migracje i wydania były sprawdzane na realnych danych oraz smoke testami
- blisko 1000 testów automatycznych uruchamianych na PostgreSQL

## Status

W sierpniu 2026 wdrożyłem Planer na serwerze firmy i przeprowadziłem pilotaż.
Uruchomienie dla wszystkich pracowników nie doszło do skutku — współpraca z firmą
zakończyła się wcześniej. Kod pozostał przy mnie i dalej go rozwijam. Publicznie
nie pokazuję nazwy firmy, danych pracowników ani zamkniętego repozytorium.
