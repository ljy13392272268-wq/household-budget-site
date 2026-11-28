// Hearth Ledger — the pages other than the dashboard. These load on demand
// when the user opens them, so the first load only carries the dashboard.

import { daysInMonth, escapeHtml, money, percent, rate } from './store.js';
import { store } from './store.js';
import { DOT, addTransactionForm, bar, barChartSVG, billStatus, billTag, envelopeRow, ledgerTable, pageHead } from './views-core.js';

export function budgetView() {
  const byCategory = store.spentByCategory();
  const plan = store.planTotal();
  const spent = store.state.categories.reduce((sum, c) => sum + byCategory[c.id], 0);
  const day = Number(store.asOf().slice(8, 10));
  const days = daysInMonth(store.state.household.monthKey);
  const cards = store.state.categories
    .map((c) => {
      const over = byCategory[c.id] > c.limit;
      const rest = c.limit - byCategory[c.id];
      return `<article class="card envelope-card">
      <header class="env-head">${DOT(c.color)}<h3>${escapeHtml(c.name)}</h3><span class="chip">${percent(byCategory[c.id], c.limit)}%</span></header>
      <p class="big-figure">${money(byCategory[c.id])} <span>of ${money(c.limit)} &middot; <b class="${
        over ? 'over' : 'good'
      }">${over ? `${money(-rest)} over` : `${money(rest)} left`}</b></span></p>
      ${bar(percent(byCategory[c.id], c.limit), c.color, over)}
      <label class="limit-edit">Limit $ <input type="number" min="0" step="1" value="${c.limit}" data-limit-input="${c.id}" aria-label="Monthly limit for ${escapeHtml(c.name)}">
        <button class="button small" data-action="save-limit" data-id="${c.id}">Save</button></label>
    </article>`;
    })
    .join('');

  return `${pageHead('The November budget', 'Twelve envelopes, one per part of the month. Change a limit and everything follows.')}
  <section class="card plan-bar">
    <div class="plan-head"><span><b>${money(spent)}</b> spent of <b>${money(plan)}</b> budgeted</span>
      <span class="plan-pct">${percent(spent, plan)}% of the plan &middot; ${money(plan - spent)} unspent &middot; ${days - day} days left</span></div>
    ${bar(percent(spent, plan), '#1e4d3a', spent > plan)}
  </section>
  <section class="budget-grid">${cards}</section>
  <form id="add-category" class="card form-card">
    <h2>Add an envelope</h2>
    <div class="form-grid">
      <label>Name <input type="text" name="name" placeholder="e.g. Pet care" required maxlength="40"></label>
      <label>Monthly limit ($) <input type="number" name="limit" min="0" step="1" placeholder="100" required></label>
      <button type="submit" class="button">Add to the budget</button>
    </div>
  </form>`;
}

export function transactionsView() {
  const { income, spent, left } = store.totals();
  const options = ['<option value="">All categories</option>']
    .concat(store.state.categories.map((c) => `<option value="${c.id}">${escapeHtml(c.name)}</option>`))
    .join('');
  const rows = [...store.state.transactions].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  return `${pageHead('The ledger', 'Every dollar in and out this month, newest first. Filter it, search it, or add a line.')}
  <section class="card">
    <div class="filter-row">
      <label>Category <select id="filter-category">${options}</select></label>
      <label>Search <input type="search" id="filter-search" placeholder="e.g. GreenMart"></label>
    </div>
    <div class="table-scroll">
      <table class="ledger tx-table">
        <thead><tr><th>Date</th><th>What</th><th class="cat">Category</th><th class="amount">Amount</th><th></th></tr></thead>
        <tbody id="ledger-body">${ledgerTable(rows, 'Nothing matches — try a different filter, or add a transaction below.')}</tbody>
      </table>
    </div>
    <p class="total-line"><span id="ledger-count">${rows.length} entries &middot; ${money(income)} in &middot; ${money(spent)} out</span><strong>${money(left)}</strong></p>
  </section>
  ${addTransactionForm()}`;
}

export function ledgerRows(categoryId, query) {
  const q = query.trim().toLowerCase();
  const rows = [...store.state.transactions]
    .filter((t) => (!categoryId || t.category === categoryId) && (!q || t.description.toLowerCase().includes(q)))
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  return { html: ledgerTable(rows, 'Nothing matches that filter — clear it to see the whole book.'), count: rows.length };
}

export function billsGoalsView() {
  const day = Number(store.asOf().slice(8, 10));
  const owed = store.unpaid();
  const paid = store.state.bills.filter((b) => b.paid);
  const bills = store.state.bills
    .map(
      (b, i) => `<tr>
      <td>${escapeHtml(b.name)}</td>
      <td class="amount">${money(b.amount)}</td>
      <td class="when">Nov ${b.dueDay}</td>
      <td>${billStatus(b, day)}</td>
      <td class="act"><button class="button small ${b.paid ? 'button-ghost' : ''}" data-action="toggle-bill" data-index="${i}">${
        b.paid ? 'Mark unpaid' : 'Mark paid'
      }</button></td>
    </tr>`,
    )
    .join('');
  const goals = store.state.goals
    .map((g) => {
      const pct = percent(g.saved, g.target);
      return `<article class="card goal-card">
      <header class="env-head"><h3>${escapeHtml(g.name)}</h3><span class="chip">${pct}%</span></header>
      <p class="goal-note">${escapeHtml(g.note)}</p>
      <p class="big-figure">${money(g.saved)} <span>of ${money(g.target)}</span></p>
      ${bar(pct, '#8a6fb8')}
      <p class="goal-note">${money(g.target - g.saved)} to go</p>
      <div class="contribute-row">
        <button class="button small" data-action="contribute" data-id="${g.id}" data-amount="25">+$25</button>
        <button class="button small" data-action="contribute" data-id="${g.id}" data-amount="50">+$50</button>
        <button class="button small" data-action="contribute" data-id="${g.id}" data-amount="100">+$100</button>
        <form class="contribute-custom" data-goal="${g.id}">
          <label>$ <input type="number" name="amount" min="1" step="1" placeholder="Custom" required aria-label="Custom amount for ${escapeHtml(g.name)}"></label>
          <button type="submit" class="button small">Add</button>
        </form>
      </div>
    </article>`;
    })
    .join('');
  const debtTotal = store.totalDebt();
  const debtRows = store.state.debts
    .map(
      (d) => `<tr>
      <td>${escapeHtml(d.name)}</td>
      <td class="amount">${money(d.balance)}</td>
      <td class="amount">${d.apr.toFixed(1)}%</td>
      <td class="amount">${money(d.minimum)}</td>
    </tr>`,
    )
    .join('');

  return `${pageHead('Bills &amp; savings goals', 'What goes out on schedule, and what the household is building toward.')}
  <section class="card">
    <header class="card-head"><h2>November bills</h2><span class="chip">${money(store.state.bills.reduce((s, b) => s + b.amount, 0))} a month</span></header>
    <p class="card-note">Same day every month; marking one paid adds no ledger line.</p>
    <div class="table-scroll">
      <table class="ledger bills-table">
        <thead><tr><th>Bill</th><th class="amount">Amount</th><th>Due</th><th>Status</th><th></th></tr></thead>
        <tbody>${bills}</tbody>
      </table>
    </div>
    <p class="total-line"><span>${paid.length} of ${store.state.bills.length} paid &middot; ${owed.bills.length} still due</span><strong>${money(owed.total)}</strong></p>
  </section>
  <section>
    <header class="section-head"><h2>Savings goals</h2><p>What the household is building toward, and how far along each one is.</p></header>
    <div class="budget-grid goals-grid">${goals}</div>
  </section>
  <section>
    <header class="section-head"><h2>Debt payoff</h2><p>Three balances, as of 26 November 2026. Pay the minimums, add extra, and see how fast the household gets clear.</p></header>
    <section class="card">
      <header class="card-head"><h2>What is owed</h2><span class="chip">${money(debtTotal.total)} in all</span></header>
      <div class="table-scroll">
        <table class="ledger debts-table">
          <thead><tr><th>Debt</th><th class="amount">Balance</th><th class="amount">APR</th><th class="amount">Minimum / mo</th></tr></thead>
          <tbody>${debtRows}</tbody>
        </table>
      </div>
      <p class="total-line"><span>Minimums add up to</span><strong>${money(debtTotal.minimums)} a month</strong></p>
    </section>
    <section class="card">
      <header class="card-head"><h2>Payoff simulator</h2></header>
      <div class="form-grid debt-controls">
        <label>Extra each month ($) <input type="number" id="debt-extra" min="0" step="10" value="100"></label>
        <div class="debt-methods">
          <button class="button small" data-action="debt-method" data-method="avalanche">Avalanche — highest APR first</button>
          <button class="button small button-ghost" data-action="debt-method" data-method="snowball">Snowball — smallest balance first</button>
        </div>
      </div>
      <p class="debt-result" id="debt-result"></p>
      <p class="hint">Avalanche attacks the costliest debt first; snowball clears the smallest balance first for a quick win. Freed minimums roll into the next debt either way.</p>
    </section>
  </section>`;
}

export function reportsView() {
  const { income, spent } = store.totals();
  const byCategory = store.spentByCategory();
  const donutSlices = store.state.categories
    .filter((c) => c.id !== 'housing' && c.kind !== 'savings' && byCategory[c.id] > 0)
    .map((c) => ({ label: c.name, value: byCategory[c.id], color: c.color }))
    .sort((a, b) => b.value - a.value);
  const everydayTotal = donutSlices.reduce((sum, s) => sum + s.value, 0);
  const rent = byCategory.housing ?? 0;
  const biggest = donutSlices[0];
  const biggestTx = [...store.state.transactions]
    .filter((t) => t.type === 'expense' && t.category !== 'housing' && t.category !== 'savings')
    .sort((a, b) => b.amount - a.amount)[0];
  const diningTrips = store.state.transactions.filter((t) => t.category === 'dining').length;
  const saved = byCategory.savings ?? 0;
  const needs = percent(store.spentByKind().needs, income);
  const months = [...store.state.history, { month: 'Nov', income, spent }];
  const avgSpent = months.reduce((sum, m) => sum + m.spent, 0) / months.length;
  const monthRows = months
    .map(
      (m) => `<tr>
      <td>${escapeHtml(m.month)}</td>
      <td class="amount">${money(m.income)}</td>
      <td class="amount">${money(m.spent)}</td>
      <td class="amount">${money(m.income - m.spent)}</td>
    </tr>`,
    )
    .join('');

  return `${pageHead('Reports', 'Where November’s money went, and how it stacks up against the last eleven.')}
  <section class="row row-main">
    <article class="card">
      <header class="card-head"><h2>Everyday spending by category</h2></header>
      <div class="recon">
        <div><span class="micro">All out</span><b>${money(spent)}</b></div>
        <div><span class="micro">Less rent</span><b>&minus;${money(rent)}</b></div>
        <div><span class="micro">Less savings</span><b>&minus;${money(saved)}</b></div>
        <div class="recon-sum"><span class="micro">Equals everyday</span><b>${money(everydayTotal)}</b></div>
      </div>
      <canvas id="donut-chart" class="chart chart-donut" width="640" height="300" aria-label="Donut chart of everyday spending by category"></canvas>
      <ul class="donut-legend">
        ${donutSlices.map((s) => `<li><i class="sw" style="background:${s.color}"></i>${escapeHtml(s.label)}<b>${money(s.value)}</b></li>`).join('')}
      </ul>
    </article>
    <article class="card">
      <header class="card-head"><h2>Income vs spending</h2>
        <p class="legend"><i class="sw sw-in"></i>Income <i class="sw sw-out"></i>Spending</p></header>
      <p class="card-note">November is live from the ledger; the rest is the household’s record.</p>
      ${barChartSVG(months)}
      <h2 class="subhead">What the numbers say</h2>
      <ul class="insights">
        <li><b>${escapeHtml(biggest.label)}</b> leads everyday spending at ${money(biggest.value)} (${percent(biggest.value, everydayTotal)}% of it); the biggest purchase outside rent was <b>${escapeHtml(biggestTx.description)}</b>, ${money(biggestTx.amount)}.</li>
        <li>Needs are <b>${needs}%</b> of take-home pay, inside the 50% the rule allows; the household ate out ${diningTrips} times.</li>
        <li>Savings run at <b>${rate(saved, income)}%</b> of take-home pay — the 50/30/20 rule wants 20%, or ${money(
          income * 0.2 - saved,
        )} more a month. November’s ${money(spent)} is ${money(avgSpent - spent)} below the twelve-month average of ${money(avgSpent)}.</li>
      </ul>
    </article>
  </section>
  <section class="card">
    <header class="card-head"><h2>Twelve months, month by month</h2></header>
    <p class="card-note">December 2025 to November 2026; November is live from the ledger.</p>
    <div class="table-scroll">
      <table class="ledger months-table">
        <thead><tr><th>Month</th><th class="amount">Income</th><th class="amount">Spent</th><th class="amount">Left</th></tr></thead>
        <tbody>${monthRows}</tbody>
      </table>
    </div>
  </section>`;
}

export function plannerView() {
  const kinds = store.spentByKind();
  const { income } = store.totals();
  const rows = [
    { key: 'needs', label: 'Needs', blurb: 'Rent, food, bills, transport, kids, health.', target: 50, actual: kinds.needs },
    { key: 'wants', label: 'Wants', blurb: 'Dining, fun, clothes, the house, gifts.', target: 30, actual: kinds.wants },
    { key: 'savings', label: 'Savings', blurb: 'The transfer on the 3rd, and anything extra.', target: 20, actual: kinds.savings },
  ];
  const projection = store.projection();
  const projRows = projection
    .map(
      (p) => `<tr>
      <td>${escapeHtml(p.month)}</td>
      <td class="amount">${money(p.income)}</td>
      <td class="amount">${money(p.spent)}</td>
      <td class="amount">${money(p.saved)}</td>
      <td class="amount">${money(p.balance)}</td>
    </tr>`,
    )
    .join('');
  return `${pageHead('The 50/30/20 planner', 'Half on needs, 30% on wants, 20% saved. Set your income and split, and see where November lands.')}
  <section class="card">
    <h2>Your plan</h2>
    <div class="form-grid planner-inputs">
      <label>Monthly take-home pay ($) <input type="number" id="plan-income" min="0" step="50" value="${Math.round(income)}"></label>
      <label>Needs (%) <input type="number" id="plan-needs" min="0" max="100" step="1" value="50"></label>
      <label>Wants (%) <input type="number" id="plan-wants" min="0" max="100" step="1" value="30"></label>
      <label>Savings (%) <input type="number" id="plan-savings" min="0" max="100" step="1" value="20"></label>
    </div>
    <p class="hint" id="plan-sum">Your split adds up to 100%.</p>
    <div id="plan-results">
      ${rows
        .map((r) => {
          const targetAmount = (income * r.target) / 100;
          const diff = targetAmount - r.actual;
          return `<div class="plan-row">
          <div><strong>${r.label} — ${r.target}%</strong><p>${r.blurb}</p></div>
          <div class="plan-figures"><span>Plan: <b data-plan-target="${r.key}">${money(targetAmount)}</b></span><span>Actual: <b>${money(r.actual)}</b></span><span class="${diff >= 0 ? 'good' : 'over'}">${diff >= 0 ? `${money(diff)} under plan` : `${money(-diff)} over plan`}</span></div>
        </div>`;
        })
        .join('')}
    </div>
    <p class="hint">Actuals come from the live ledger. When needs run past half, look at the big bills first.</p>
  </section>
  <section class="card">
    <header class="card-head"><h2>Next six months</h2></header>
    <p class="card-note">December 2026 to May 2027, projected from the twelve-month average: the same pay coming in, the average month’s spending, the rest saved.</p>
    ${barChartSVG(projection)}
    <div class="table-scroll">
      <table class="ledger proj-table">
        <thead><tr><th>Month</th><th class="amount">Income</th><th class="amount">Spending</th><th class="amount">Saved</th><th class="amount">Balance</th></tr></thead>
        <tbody>${projRows}</tbody>
      </table>
    </div>
    <p class="hint">If the average month holds, the balance reaches ${money(projection[projection.length - 1].balance)} by May.</p>
  </section>`;
}

export function missingView() {
  return `${pageHead('That page is not in the house', 'There is no page at this address.')}
  <p><a href="#/">Back to the dashboard &rarr;</a></p>`;
}
