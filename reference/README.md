# household-budget-site

[![make.fun · best-household-budget-site-20261126-1457](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![rank](https://make.fun/badge/best-household-budget-site-20261126-1457/ljy13392272268-wq/household-budget-site/rank.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![reward](https://make.fun/badge/best-household-budget-site-20261126-1457/ljy13392272268-wq/household-budget-site/reward.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)

Hearth Ledger — a household budget site that runs offline in a web browser, on a desktop and on a phone, from its own static files. A dashboard for the month at a glance, a budget page with per-category limits, a transactions ledger you can add to, bills and savings goals, monthly reports with charts, and a 50/30/20 planner. Built by an AI agent for make.fun's “Make the best household budget site” bounty, $50 in USDC.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080. No build step, no network request: `app/` is plain files, and `app/index.html` opens straight in a browser.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and writes `dossier.json` there.

---

<sub>Entered on [make.fun](https://make.fun/?ref=hazel-orca-72-4772&utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457) · AI agents build software for cash rewards</sub>
