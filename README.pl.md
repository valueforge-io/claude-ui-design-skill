🇬🇧 [English version](README.md)

# UI Design Rules — skill dla Claude Code

System reguł projektowania dla frontendów budowanych przez AI. Ten skill sprawia, że Claude Code stosuje profesjonalne zasady projektowania UI — spójnie i weryfikowalnie — przy każdym budowaniu lub przeglądzie interfejsów React + Tailwind.

Modele językowe dobrze piszą działające UI, ale nierówno wychodzi im sprawienie, żeby *wyglądało na zaprojektowane*: przypadkowe odstępy, cztery prawie identyczne szarości, trzy konkurujące przyciski CTA, tekst oblewający testy kontrastu. Ten skill zastępuje gust-z-przypadku systemem:

- **Workflow styleguide-first** — zanim cokolwiek zostanie ostylowane, Claude ustala tokeny (paleta, role typograficzne, skala odstępów), a potem styluje wyłącznie z tokenów.
- **Twarde wartości domyślne** — siatka odstępów 4pt, modularna skala typograficzna, pary kolorów sprawdzone pod WCAG, jedna główna akcja na widok, komplet stanów interaktywnych.
- **Ważone reguły** — standardy, zasady, defaulty i heurystyki są jawnie rozróżnione: agent wie, co musi obowiązywać zawsze, co zwykle, a co jest tylko soczewką — i odstępuje świadomie.
- **Inteligencja projektowa** — brief intencji i dziesięć archetypów produktowych decyduje, CZYM interfejs ma być; dwanaście gramatyk kierunków wizualnych proponuje, JAK ma wyglądać; `design-system/MASTER.md` pamięta jedno i drugie między sesjami.
- **Dwa tryby** — *Build* (tworzenie i stylowanie UI) oraz *Review* (audyt istniejącego UI: problemy oznaczone wagą, poprawki w formie przed → po).
- **Samoweryfikacja** — Claude robi zrzuty ekranu własnej pracy (dołączonym skryptem Playwright) i ogląda piksele przed oddaniem; kontrasty i zgodność z siatką są liczone, nie oceniane na oko. Trzecim torem weryfikacji jest audyt klawiatury (spacer Tabem, widoczność fokusa, rozmiary celów).

## Instalacja

**Zalecana — jako plugin Claude Code:**

```
/plugin marketplace add valueforge-io/claude-ui-design-skill
/plugin install ui-design@valueforge-skills
```

**Ręczna — jako skill osobisty:**

```bash
git clone https://github.com/valueforge-io/claude-ui-design-skill.git
cd claude-ui-design-skill && ./install.sh
```

(albo samodzielnie skopiuj `plugins/ui-design/skills/ui-design-rules/` do `~/.claude/skills/`; per projekt: do `<projekt>/.claude/skills/`).

## Opcjonalnie: weryfikacja wizualna

Skill potrafi obejrzeć to, co zbudował. Potrzebuje do tego przeglądarki headless w projekcie:

```bash
npm i -D playwright && npx playwright install chromium
```

Pobranie przeglądarki (~150 MB) dzieje się raz na maszynę; biblioteka instalowana jest per projekt. Bez niej skill nadal działa — schodzi do weryfikacji na poziomie kodu (liczone kontrasty, grep siatki, pokrycie stanów) zamiast zrzutów. Claude Code sam zaproponuje instalację, gdy skill pierwszy raz jej potrzebuje. Skrypty uruchamiaj z katalogu głównego projektu — znajdą projektowego Playwrighta automatycznie, mimo że same leżą w katalogu pluginu.

## Użycie

Skill uruchamia się automatycznie przy pracy nad UI — budowaniu stron, stylowaniu komponentów, „niech to wygląda profesjonalnie", przeglądach designu. Możesz też wywołać go jawnie: `/ui-design-rules`.

Przykładowe prompty:

```
Zbuduj landing page dla naszego SaaS-a do śledzenia czasu: hero, 3 ficzery, cennik, stopka.
Ostyluj ten formularz ustawień tak, żeby był spójny z resztą aplikacji.
Zrób przegląd designu src/components/Dashboard.tsx i wypisz konkretne poprawki.
```

W świeżym projekcie bez istniejących stylów skill szkicuje intencję projektową (archetyp produktu, gęstość, ekspresja) i proponuje 2–3 kierunki wizualne — paleta, typografia i charakter gęstości z uzasadnieniem. Wybierasz w kilka sekund albo mówisz „bierz domyślne"; wybór zostaje zapamiętany w `design-system/MASTER.md`.

## Co jest w środku

| Plik | Zawartość |
|---|---|
| `SKILL.md` | Workflow (build + review), rdzeń wartości domyślnych, checklista weryfikacji |
| `references/design-intent.md` | Brief intencji, dziesięć archetypów produktowych, priorytety weryfikacji |
| `references/visual-directions.md` | Dwanaście gramatyk stylu i przekład kierunku na tokeny |
| `references/color.md` | Sloty kolorów, przepis na paletę, reguły kontrastu i harmonii, dark mode |
| `references/typography.md` | Role typograficzne, skala modularna, reguły grubości/interlinii/trackingu |
| `references/spacing-layout.md` | Baza 4pt, drabinka odstępów, gridy i guttery |
| `references/components.md` | Przepisy na 26 komponentów (przyciski → dialogi → toasty) |
| `references/visual-hierarchy.md` | Wzorce skanowania, siedem dźwigni hierarchii, poziomy akcji |
| `references/interaction.md` | Modele klawiaturowe, zarządzanie fokusem, macierz stanów komponentów |
| `references/accessibility.md` | Podłogi WCAG 2.2: rozmiar celu, zoom/reflow, reduced motion, formularze |
| `references/motion.md` | Pięć zadań ruchu, defaulty czasów i easingu, reduced-motion |
| `references/data-viz.md` | Dobór wykresu od pytania, kolory wykresów z tokenów, dostępność |
| `references/content-design.md` | Etykiety akcji, błędy, empty states, potwierdzenie vs undo |
| `references/design-process.md` | Wireframe → styleguide → implementacja → design system |
| `references/review-checklist.md` | Procedura audytu, poziomy wag, format raportu |
| `scripts/screenshot.mjs` | Pomocnik „wyrenderuj i obejrzyj" (Playwright/Puppeteer) |
| `scripts/palette-check.mjs` | Audyt harmonii barw wyrenderowanej strony (rodziny odcieni, wykrywanie zgrzytów) |
| `scripts/interaction-check.mjs` | Audyt klawiatury i fokusa: spacer Tabem, widoczność fokusa, rozmiary celów |

Claude czyta `SKILL.md`, gdy skill się uruchomi, a pojedyncze pliki referencyjne dociąga tylko wtedy, gdy zadanie ich dotyczy — rutynowa praca pozostaje tania.

## Czy to naprawdę pomaga?

Zmierzone przeciwko temu samemu modelowi bez skilla, na identycznych zadaniach (landing page, tabela administracyjna, formularz ustawień), ocenianych obiektywnymi asercjami — naruszenia kontrastu wg axe-core, zgodność z siatką 4pt, pokrycie stanów interaktywnych, overflow mobilny, hierarchia akcji:

| | zaliczone |
|---|---|
| ze skillem | **97%** |
| bez skilla | 75% |

Porażki wersji bez skilla skupiły się dokładnie tam, gdzie łatwo zgadnąć: kontrast tekstu, brakujące stany focus, konkurujące przyciski primary.

*Pomiar wykonany na wersji 1.0 na trzech zadaniach budowania. Od tego czasu skill zyskał modele interakcji, podłogi dostępności, inteligencję projektową i trzy kolejne domeny wiedzy (zob. CHANGELOG); szerszy, wielokrotny benchmark jest w planach.*

## Źródła zasad

Reguły kodują szeroko przyjętą praktykę projektowania UI: minima kontrastu WCAG 2.x, systemy odstępów 4-punktowych, modularne skale typograficzne, rozkład kolorów 60-30-10 oraz standardowe konwencje komponentów i hierarchii wizualnej stosowane w dojrzałych design systemach.

## Wydawanie wersji (maintainerzy)

1. Edytuj pliki skilla.
2. Podbij `version` w `plugins/ui-design/.claude-plugin/plugin.json` **i** we wpisie pluginu w `.claude-plugin/marketplace.json` (trzymaj oba w synchronie).
3. Dodaj wpis do `CHANGELOG.md`.
4. Commit, push, potem tag: `git tag vX.Y.Z && git push --tags`.

Użytkownicy dostają aktualizacje przez auto-odświeżanie marketplace'u w tle albo ręcznie: `/plugin marketplace update valueforge-skills`.

## Licencja

MIT
