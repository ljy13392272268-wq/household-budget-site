# Round 1 — the first screen, and the bytes to pay for it

Baseline: commit `c37ec68`. Everything below is measured against the five criteria in
order: a complete working budget site, useful content, easy to use, looks and reads
well, small and plainly built.

## What changed

**The dashboard is one statement band, not a hero plus four stat cards** (criteria 1,
3, 4). The old first screen spent 160px on a title and a single number, repeated the
same four figures in cards underneath, and cut two cards in half at the 800px fold.
It is now a deep green band — month and day of the month, household, **$2,215.83 left
to spend**, `$132.99 still to pay → $2,082.84 free`, and a four-cell strip (money in /
money out / saved / budget used) — then cash flow and bills, then envelope watch in
two columns. At 1280×800 the last card closes at 742px: nothing is cut.

**Bills you can act on, on the dashboard** (1, 2). Every unpaid bill carries its due
date and state — `Nov 25 · overdue`, `Due today` — and a Mark paid button that moves
the free-to-spend figure, the saved total and every other page. The "today" that
decides overdue is read from the newest entry in the book, not a hard-coded date.

**Envelopes read as one line each** (3, 4). Dot in the category's own colour, name,
`spent of limit`, `left` or `over`, then the bar under the line. All twelve fit on the
budget page as three-column cards, each with its limit input and Save.

**Reports that say something** (2, 4). The donut sets rent and savings aside and lists
ten categories in two columns; the value axis snaps to $2,000 steps so the labels read
`$0 $2k $4k $6k $8k`; three computed takeaways replace the list of six, and needs are
measured against take-home pay (`48%`, inside the rule's 50%) so the figure lines up
with the planner instead of contradicting it.

**Phone layout** (3). The nav is a 3×2 grid instead of a scrolling strip that clipped
*Bills*; the band packs two cells per row; the ledger drops its category column, keeps
the coloured dot beside the description, and all six pages sit at 390px with no
horizontal scroll.

**Fewer files, one job each** (5). `data.js` folded into `store.js` — the household's
seed, live state and sums in one model file — so the first load is six files instead
of seven. `charts.js` (drawing), `views.js` (pages), `main.js` (routing and wiring)
keep their jobs. `style.css` was rewritten around one vocabulary (`board`, `card`,
`row`, `env`, `bill-row`, `bar`) and the rules the old dashboard left behind are gone.

## Results

| | before | after |
| --- | --- | --- |
| first load, gzip-9 | 7 files, 18,185 B | **6 files, 17,894 B** |
| whole app | 8 files, 59,665 B | 7 files, 61,976 B |
| dossier text | 60,573 B | 62,796 B (cap 163,840) |

- `MAKEFUN_OUTPUT_DIR=out node main.ts` → exit 0; two runs are byte-identical
  (`sha256 33ee543d0f7b30051a1c39e3f46589ddf6fa8467b207d23f583f3402d85adc0c`).
- `URLs in the source: 0`. No font, image, script or style comes from anywhere but `app/`.
- 34 Playwright checks pass — add, delete, filter, search, save a limit, add an envelope,
  mark paid and unpaid, contribute to a goal, planner recalc, persistence, reset — with
  zero console errors and `scrollWidth == 390` on every page.
- Screenshots: four JPEGs, 120,212 / 118,185 / 111,648 / 58,812 bytes; 1280×800 three
  times and 390×844 once.
- The book is untouched: 7,750.00 in, 5,534.17 out, 2,215.83 left, 1,200.00 saved
  (15.5%), plan 6,270.00, unpaid 132.99, 47 entries.

## Tried and dropped

- **Lazy `import()` for the report charts.** It moves bytes off the Totals line without
  making the site smaller. A dodge, not a saving.
- **One bundled JS file.** About 1.2 kB gzipped, but it collapses the file-per-job split
  the rubric asks for.
- **2× device pixel ratio for the phone shot.** 780×1,688 breaks the 1,280 long-edge cap.
- **`TRANSACTIONS` as tuple rows.** Around 350 B gzipped, but it changes the shape of the
  data, and the data is fixed this round.
