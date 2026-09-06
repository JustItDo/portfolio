---
order: 2
title: "CRM AI Act"
summary: "Leady, telefony, audyty i dalsze kroki sprzedaży → samodzielnie rozwijany CRM prowadzący mały zespół przez proces usług związanych ze zgodnością z AI Act."
scale: "wewnętrzne narzędzie dla 3-osobowego zespołu"
stack: ["Python 3.14", "FastAPI", "Jinja2", "htmx", "PostgreSQL 18", "Docker", "Caddy"]
status: "wdrożony · rozwój trwa"
codeVisibility: "private"
codeNote: "Repozytorium pozostaje prywatne, ponieważ zawiera model procesu sprzedaży i zabezpieczenia danych leadów. Na rozmowie mogę omówić architekturę, sposób testowania i wybrane decyzje techniczne bez ujawniania danych biznesowych."
screenshots:
  - src: "/screenshots/crm-ai-act/kolejka-pracy.webp"
    alt: "Dzienny rejestr pracy: kolejka zadań posegregowana według pilności (SLA, zaległe, dzisiejsze)"
  - src: "/screenshots/crm-ai-act/nowy-lead-zgoda.webp"
    alt: "Formularz nowego leada: kanał pozyskania, zakres zgody i wymagany dowód zgody"
  - src: "/screenshots/crm-ai-act/rejestr-sprzeciwow.webp"
    alt: "Rejestr blokad kontaktu: zgłoszenie sprzeciwu wobec marketingu poza rozmową (art. 21)"
  - src: "/screenshots/crm-ai-act/raport-audytu.webp"
    alt: "Wygenerowany raport z audytu zgodności z AI Act, gotowy do zapisu jako PDF"
  - src: "/screenshots/crm-ai-act/karta-deala-zadania.webp"
    alt: "Karta szansy sprzedaży: zadania, wartość oferty i historia zmian etapów"
  - src: "/screenshots/crm-ai-act/widok-settera-mobile.webp"
    alt: "Mobilny widok settera: lista dzisiejszych rozmów i szybkie oznaczenie wyniku"
---

## Problem

Trzyosobowy zespół potrzebował jednego miejsca do obsługi całego procesu: od leada
z kampanii i zgody na kontakt, przez telefon i audyt użycia AI w firmie, po ofertę,
zadania i dalszą realizację. Gotowa lista kontaktów nie wystarczała — system musiał
pilnować również odpowiedzialności, historii zdarzeń i ograniczeń prawnych.

## Moja rola

Samodzielnie odpowiadam za projekt produktu i całą stronę techniczną: model procesu,
architekturę, implementację, testy, bezpieczeństwo oraz przygotowanie i utrzymanie
środowiska produkcyjnego. Wspólnie z osobą prowadzącą audyty doprecyzowuję część
merytoryczną.

## Zbudowany zakres

- role dla administratora, osoby sprzedającej i settera oraz unieważnialne sesje
- firmy, kontakty, szanse sprzedaży, zadania i historia zmian etapów
- kanban procesu i osobna kolejka codziennej pracy
- odbiór leadów z formularzy Meta z kontrolą źródła, deduplikacją i dowodem zgody
- formularz audytu AI oraz generator raportu dla klienta
- tryb PWA dla settera, przygotowany do pracy przy niestabilnym połączeniu

## Jak przebiega praca w CRM

Lead z formularza Meta trafia do CRM, gdzie system sprawdza źródło i duplikaty
oraz zachowuje dowód zgody. Zespół prowadzi kolejne kroki w kanbanie i kolejce
codziennej pracy: kontakt, audyt, ofertę i dalsze zadania. Formularz audytu
pozwala przygotować raport dla klienta.

Pełny start operacyjny jest jeszcze przed zespołem.

## Najważniejsze decyzje

- CRM i przyszła platforma kursowa mają osobne schematy oraz role PostgreSQL.
  Strefa uczestnika nie ma dostępu do danych CRM nawet przy błędzie aplikacji.
- Zgody, sprzeciwy i kluczowe zdarzenia są projektowane jako historia append-only,
  zamiast rekordów nadpisywanych bez śladu.
- Produkcja działa w kontenerach na VPS w UE; publicznie wystawiony jest tylko Caddy
  z HTTPS, a aplikacja i PostgreSQL nie mają portów hosta.

## Dowody

- środowisko produkcyjne z aplikacją, PostgreSQL i HTTPS działa od września 2026
- migracje, uprawnienia i granica między strefami są testowane na realnym PostgreSQL
- zmiany dotyczące danych i dostępu przechodzą osobne przeglądy bezpieczeństwa i RODO

## Status

Rdzeń CRM i środowisko produkcyjne działają, ale rozwój nadal trwa przed pełnym
uruchomieniem operacyjnym. Platforma kursowa nie jest jeszcze zbudowana — na tym
etapie nie przedstawiam jej jako gotowej części systemu.
