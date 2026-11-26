# Round 2 — the cover reads at a glance, and the reports add up

Baseline: commit `54934ea` (round 1). Judged against the five criteria in order:
a working site in screenshots, useful content, easy to use, look and originality,
speed and structure.

The judge sees one contact sheet: this entry's cover at 768×480 and the other three
shots in row beneath it, each about 256×160. That is the constraint round 2 works
against — a figure has to survive a 0.6 scale on the cover and a 0.2 scale in the
row. Round 1 left two things that did not: the dashboard's envelope list was six
rows of 11–14px type in two columns (about 7px in the sheet, i.e. grey texture),
and the reports donut totalled $2,484 next to a ledger that says $5,534.17 out,
with only a one-line note explaining the difference.

## What changed

**The dashboard's bottom card is four envelopes with room to read** (criteria 1, 3).
Six rows in two columns became four rows in one column: name at 0.98rem instead of
0.85, figures at 0.92/0.9 instead of 0.8/0.74, a 10px bar instead of 8. The four are
the *closest to their limit*, sorted by dollars remaining, so the card is a decision
("these four are about to run out") rather than a slice of a list. The "4 of 11
within $25" count moved from a caption line into a chip inside the heading, which
also removed a line of height: the card now closes at 793px, 7px above the 800px
fold, so the cover ends on a finished card instead of a clipped footer rule.

**The reports page shows the arithmetic that produces the donut** (criteria 1, 2).
Above the ring, a four-cell strip: `ALL OUT $5,534.17` − `LESS RENT $1,850.00` −
`LESS SAVINGS $1,200.00` = `EQUALS EVERYDAY $2,484.17`, the last cell tinted green,
and the donut's centre now reads `$2,484.17` in the same money format. The card is
titled "Everyday spending by category" and the ring is a drill-down of the month's
total instead of a second, unexplained total. Every cell is computed from the book.

**The page closes inside 800px** (criterion 4). `.site-footer` and `.page` lost
about 40px of padding; the reports page now ends with a whole footer inside the
frame instead of a line of footer text sliced by the bottom edge, and the planner
page has that much more room under it.

**Bytes paid for by dead weight** (criterion 5). The seed's `payday` and `note`
fields were never read by any view — removed. Two form hints that restated what the
form does ("Every total, bar and chart moves with it", "It joins the grid…") — cut.
`reportsView` carried an unused `day`. The donut's centre figure now goes through
the same `money()` as every other figure instead of its own rounding.

## Results

| | round 1 | round 2 |
| --- | --- | --- |
| first load, gzip-9 | 6 files, 17,894 B | **6 files, 17,879 B** |
| whole app | 7 files, 61,976 B | 7 files, 62,543 B |
| dossier text | 62,796 B | 63,363 B (cap 163,840) |
| dossier.json | 610,437 B | 708,452 B |

- `MAKEFUN_OUTPUT_DIR=out node main.ts` → exit 0 both runs, byte-identical:
  `sha256 5674eca37923499181e894e2295ec1cfa21208a0742a1034aeda4d03b341e1ec`.
- `URLs in the source: 0`. No script, style, font, image or frame comes from anywhere
  but `app/`.
- 90 checks pass in a fresh Chrome against the real site: all six pages at 1280×800
  and 390×844 with `scrollWidth == clientWidth`, one active nav link, every canvas
  actually painted, zero console messages, and every control — add and delete a
  transaction, filter and search the ledger, save a limit, add an envelope, mark a
  bill paid and unpaid, contribute to a goal, recalculate the planner, reload to see
  the change persisted, reset to the seed.
- The kit's own `check`, run on the baseline commit and on this worktree, prints the
  same rows both times: 4 passed (`competition_open`, `snapshot`, `license_osi`,
  `entrypoint`), 1 failed — `transcripts_present`, because this working copy has no
  transcript bundle — and 15 skipped. Round 1's 14/0 was those same rows plus the
  transcript checks, which only run with the bundle; nothing on the repository side
  regressed.
- Screenshots re-rendered from this commit in headless Chromium 146 at dpr 1:
  1280×800 ×3 and 390×844 ×1, 143,082 / 138,132 / 132,313 / 68,402 bytes.
- The book is untouched: 7,750.00 in, 5,534.17 out, 2,215.83 left, 1,200.00 saved
  (15.5%), plan 6,270.00, unpaid 132.99, 47 entries, day 26 of 30.

## Tried and dropped

- **The seed as tuples.** `['2026-11-01', 'November rent…', 'housing', 1850, 'expense']`
  saves 2,254 raw bytes over the object form — and 41 bytes gzipped, because gzip-9
  has already collapsed the repeated keys. Not worth the loss of readable data, and
  a useful reminder that on this metric only *unique* text is expensive.
- **Growing the reports page to push its footer out of frame** (taller cash-flow
  chart, larger donut). The donut card sets the row's height, so a taller chart only
  moves white space from the bottom of one card to the other; a larger donut makes
  the shorter card emptier still. Tightening the footer was the honest fix.
- **A muted subtitle on the card-head line.** `.card-head` is `space-between`, so a
  third child floated in the middle of the header. A chip inside the heading reads
  as a badge on the title and costs less.
- **Shrinking the donut to balance the two report cards.** It levels the bottoms and
  shrinks the page's marquee chart for no content gain.

---

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
