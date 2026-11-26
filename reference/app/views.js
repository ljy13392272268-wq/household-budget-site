// Hearth Ledger — the pages, as HTML strings.
//
// Each view reads the store and returns the page's markup. Charts are
// <canvas> placeholders here; main.js draws into them after the page is
// in the document. Every button and form on these pages does something:
// the wiring lives in main.js, keyed by data-action.

import { escapeHtml, money, moneyShort, percent, prettyDate } from './store.js';
import { store } from './store.js';

function categoryBar(category, spent) {
  const used = percent(spent, category.limit);
  const over = spent > category.limit;
  const barClass = over ? 'bar bar-over' : 'bar';
  const status = over
    ? `${money(spent - category.limit)} over`
    : `${money(category.limit - spent)} left`;
  return `<div class="cat-row">
    <span class="dot" style="background:${category.color}"></span>
    <span class="cat-name">${escapeHtml(category.name)}</span>
    <span class="cat-figures">${money(spent)} of ${money(category.limit)}</span>
    <span class="cat-status ${over ? 'over' : ''}">${status}</span>
    <div class="${barClass}"><span style="width:${Math.min(100, used)}%;background:${category.color}"></span></div>
    <span class="cat-pct">${used}%</span>
  </div>`;
}

function transactionRows(transactions) {  if (transactions.length === 0) {
    return '<tr><td colspan="5" class="empty">Nothing matches — try a different filter, or add a transaction below.</td></tr>';
  }
  return transactions
    .map((t) => {
      const cat = t.category ? store.category(t.category) : null;
      return `<tr>
      <td>${prettyDate(t.date)}</td>
      <td>${escapeHtml(t.description)}</td>
      <td>${cat ? escapeHtml(cat.name) : 'Income'}</td>
      <td class="amount ${t.type}">${t.type === 'income' ? '+' : '−'}${money(t.amount)}</td>
      <td><button class="link-button danger" data-action="delete-transaction" data-id="${t.id}" aria-label="Delete ${escapeHtml(t.description)}">Delete</button></td>
    </tr>`;
    })
    .join('');
}

function addTransactionForm() {
  const options = store.state.categories
    .map((c) => `<option value="${c.id}">${escapeHtml(c.name)}</option>`)
    .join('');
  return `<form id="add-transaction" class="card form-card">
    <h3>Add a transaction</h3>
    <div class="form-grid">
      <label>Date <input type="date" name="date" value="2026-11-26" required></label>
      <label>Description <input type="text" name="description" placeholder="e.g. GreenMart weekly shop" required maxlength="80"></label>
      <label>Type
        <select name="type"><option value="expense">Expense</option><option value="income">Income</option></select>
      </label>
      <label>Category <select name="category">${options}</select></label>
      <label>Amount ($) <input type="number" name="amount" min="0.01" step="0.01" placeholder="0.00" required></label>
      <button type="submit" class="button">Add to the ledger</button>
    </div>
    <p class="hint">It appears in the ledger at once, and every total, bar and chart on the site updates with it.</p>
  </form>`;
}

export function dashboardView() {
  const { income, spent, left } = store.totals();
  const byCategory = store.spentByCategory();
  const saved = byCategory.savings ?? 0;
  const rate = percent(saved, income);
  const top = [...store.state.categories]
    .filter((c) => c.id !== 'savings')
    .sort((a, b) => percent(byCategory[b.id], b.limit) - percent(byCategory[a.id], a.limit))
    .slice(0, 5);
  const recent = [...store.state.transactions].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 8);
  const unpaid = store.state.bills.filter((b) => !b.paid);
  const unpaidTotal = unpaid.reduce((sum, b) => sum + b.amount, 0);

  return `<section class="hero">
    <div>
      <p class="eyebrow">${escapeHtml(store.state.household.month)} · 26 days in</p>
      <h1>November, at a glance</h1>
      <p class="lede">${escapeHtml(store.state.household.name)} — ${escapeHtml(store.state.household.members.join(', '))}. Payday is ${escapeHtml(store.state.household.payday.toLowerCase())}.</p>
    </div>
    <div class="hero-left">
      <span class="hero-label">Left to spend</span>
      <span class="hero-amount">${money(left)}</span>
      <span class="hero-sub">of ${money(income)} in · ${money(spent)} out</span>
    </div>
  </section>

  <section class="stats" aria-label="Month totals">
    <div class="stat"><span>Money in</span><strong>${money(income)}</strong><small>4 paychecks</small></div>
    <div class="stat"><span>Money out</span><strong>${money(spent)}</strong><small>across ${store.state.transactions.filter((t) => t.type === 'expense').length} purchases</small></div>
    <div class="stat"><span>Saved</span><strong>${money(saved)}</strong><small>${rate}% of income</small></div>
    <div class="stat"><span>Bills still due</span><strong>${money(unpaidTotal)}</strong><small>${unpaid.length} bills left in November</small></div>
  </section>

  <section class="grid-two">
    <div class="card">
      <h2>Cash flow — six months</h2>
      <p class="hint">Take-home pay against spending, June to November. November is live from the ledger.</p>
      <canvas id="cashflow-chart" class="chart" width="640" height="260" aria-label="Bar chart of monthly income and spending"></canvas>
      <p class="legend"><span class="swatch" style="background:#1e4d3a"></span> Income <span class="swatch" style="background:#d97b29"></span> Spending</p>
    </div>
    <div class="card">
      <h2>Budget health</h2>
      <p class="hint">The categories closest to their limit, first.</p>
      ${top.map((c) => categoryBar(c, byCategory[c.id])).join('')}
      <p><a href="#/budget">See the whole budget &rarr;</a></p>
    </div>
  </section>

  <section class="grid-two">
    <div class="card">
      <h2>Recent spending</h2>
      <div class="table-scroll">
      <table class="ledger">
        <thead><tr><th>Date</th><th>What</th><th>Category</th><th>Amount</th><th></th></tr></thead>
        <tbody>${transactionRows(recent)}</tbody>
      </table>
      </div>
      <p><a href="#/transactions">Open the full ledger &rarr;</a></p>
    </div>
    <div class="card">
      <h2>Bills still to pay</h2>
      ${unpaid.length === 0
        ? '<p>Every November bill is paid. Nice work.</p>'
        : `<ul class="bill-list">${unpaid
            .map((b) => `<li><span>${escapeHtml(b.name)}</span><span>${money(b.amount)} · due Nov ${b.dueDay}</span></li>`)
            .join('')}</ul>
          <p><a href="#/bills">Bills &amp; savings goals &rarr;</a></p>`}
      <h2 class="subhead">Savings goals</h2>
      ${store.state.goals
        .map((g) => `<div class="goal-mini"><span>${escapeHtml(g.name)}</span><div class="bar"><span style="width:${percent(g.saved, g.target)}%;background:#8a6fb8"></span></div><span>${moneyShort(g.saved)} of ${moneyShort(g.target)}</span></div>`)
        .join('')}
    </div>
  </section>`;
}

export function budgetView() {
  const byCategory = store.spentByCategory();
  const totalLimit = store.state.categories.reduce((sum, c) => sum + c.limit, 0);
  const totalSpent = store.state.categories.reduce((sum, c) => sum + byCategory[c.id], 0);
  const cards = store.state.categories
    .map((c) => {
      const spent = byCategory[c.id];
      const over = spent > c.limit;
      return `<article class="card budget-card">
      <header><span class="dot" style="background:${c.color}"></span><h3>${escapeHtml(c.name)}</h3></header>
      <p class="big-figure">${money(spent)} <span>of ${money(c.limit)}</span></p>
      <div class="bar ${over ? 'bar-over' : ''}"><span style="width:${Math.min(100, percent(spent, c.limit))}%;background:${c.color}"></span></div>
      <p class="${over ? 'over' : ''}">${over ? `${money(spent - c.limit)} over the limit` : `${money(c.limit - spent)} left · ${percent(spent, c.limit)}% used`}</p>
      <label class="limit-edit">Monthly limit $
        <input type="number" min="0" step="1" value="${c.limit}" data-limit-input="${c.id}" aria-label="Monthly limit for ${escapeHtml(c.name)}">
        <button class="button small" data-action="save-limit" data-id="${c.id}">Save limit</button>
      </label>
    </article>`;
    })
    .join('');

  return `<section class="page-head">
    <h1>The November budget</h1>
    <p class="lede">Twelve envelopes, one for each part of the month. Change a limit and the whole site follows it.</p>
  </section>
  <section class="card total-bar-card">
    <div class="total-bar-head"><span><strong>${money(totalSpent)}</strong> spent of <strong>${money(totalLimit)}</strong> budgeted</span><span>${percent(totalSpent, totalLimit)}% of the month's plan</span></div>
    <div class="bar big"><span style="width:${Math.min(100, percent(totalSpent, totalLimit))}%;background:#1e4d3a"></span></div>
  </section>
  <section class="budget-grid">${cards}</section>
  <form id="add-category" class="card form-card">
    <h3>Add a category</h3>
    <div class="form-grid">
      <label>Name <input type="text" name="name" placeholder="e.g. Pet care" required maxlength="40"></label>
      <label>Monthly limit ($) <input type="number" name="limit" min="0" step="1" placeholder="100" required></label>
      <button type="submit" class="button">Add category</button>
    </div>
  </form>`;
}

export function transactionsView() {
  const { income, spent } = store.totals();
  const options = ['<option value="">All categories</option>']
    .concat(store.state.categories.map((c) => `<option value="${c.id}">${escapeHtml(c.name)}</option>`))
    .join('');
  const rows = [...store.state.transactions].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  return `<section class="page-head">
    <h1>The ledger</h1>
    <p class="lede">Every dollar in and out in November, newest first. Add one below and the totals move at once.</p>
  </section>
  <section class="stats" aria-label="Ledger totals">
    <div class="stat"><span>Money in</span><strong>${money(income)}</strong></div>
    <div class="stat"><span>Money out</span><strong>${money(spent)}</strong></div>
    <div class="stat"><span>Entries</span><strong>${store.state.transactions.length}</strong></div>
  </section>
  <section class="card">
    <div class="filter-row">
      <label>Category <select id="filter-category">${options}</select></label>
      <label>Search <input type="search" id="filter-search" placeholder="e.g. GreenMart"></label>
    </div>
    <div class="table-scroll">
    <table class="ledger">
      <thead><tr><th>Date</th><th>What</th><th>Category</th><th>Amount</th><th></th></tr></thead>
      <tbody id="ledger-body">${transactionRows(rows)}</tbody>
    </table>
    </div>
    <p class="hint" id="ledger-count">${rows.length} entries</p>
  </section>
  ${addTransactionForm()}`;
}

// The ledger's rows for a category filter and a search string, for the
// transactions page to refresh without rebuilding the whole page.
export function ledgerRows(categoryId, query) {
  const q = query.trim().toLowerCase();
  const rows = [...store.state.transactions]
    .filter((t) => (!categoryId || t.category === categoryId) && (!q || t.description.toLowerCase().includes(q)))
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  return { html: transactionRows(rows), count: rows.length };
}

export function billsGoalsView() {
  const bills = store.state.bills
    .map((b, i) => `<tr>
      <td>${escapeHtml(b.name)}</td>
      <td>${money(b.amount)}</td>
      <td>Nov ${b.dueDay}</td>
      <td class="${b.paid ? 'paid' : 'due'}">${b.paid ? 'Paid' : 'Due'}</td>
      <td><button class="button small" data-action="toggle-bill" data-index="${i}">${b.paid ? 'Mark unpaid' : 'Mark paid'}</button></td>
    </tr>`)
    .join('');
  const paidTotal = store.state.bills.filter((b) => b.paid).reduce((s, b) => s + b.amount, 0);
  const dueTotal = store.state.bills.filter((b) => !b.paid).reduce((s, b) => s + b.amount, 0);
  const goals = store.state.goals
    .map((g) => {
      const pct = percent(g.saved, g.target);
      return `<article class="card goal-card">
      <h3>${escapeHtml(g.name)}</h3>
      <p>${escapeHtml(g.note)}</p>
      <p class="big-figure">${money(g.saved)} <span>of ${money(g.target)}</span></p>
      <div class="bar"><span style="width:${pct}%;background:#8a6fb8"></span></div>
      <p>${pct}% there · ${money(g.target - g.saved)} to go</p>
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

  return `<section class="page-head">
    <h1>Bills &amp; savings goals</h1>
    <p class="lede">What goes out on schedule, and what the household is building toward.</p>
  </section>
  <section class="stats" aria-label="Bill totals">
    <div class="stat"><span>Paid this month</span><strong>${money(paidTotal)}</strong></div>
    <div class="stat"><span>Still due</span><strong>${money(dueTotal)}</strong></div>
    <div class="stat"><span>Recurring bills</span><strong>${store.state.bills.length}</strong></div>
  </section>
  <section class="card">
    <h2>November bills</h2>
    <div class="table-scroll">
    <table class="ledger">
      <thead><tr><th>Bill</th><th>Amount</th><th>Due</th><th>Status</th><th></th></tr></thead>
      <tbody>${bills}</tbody>
    </table>
    </div>
  </section>
  <section>
    <h2>Savings goals</h2>
    <div class="budget-grid">${goals}</div>
  </section>`;
}

export function reportsView() {
  const { income, spent } = store.totals();
  const byCategory = store.spentByCategory();
  const donutSlices = store.state.categories
    .filter((c) => c.id !== 'housing' && c.id !== 'savings' && byCategory[c.id] > 0)
    .map((c) => ({ label: c.name, value: byCategory[c.id], color: c.color }))
    .sort((a, b) => b.value - a.value);
  const everydayTotal = donutSlices.reduce((sum, s) => sum + s.value, 0);
  const months = [...store.state.history, { month: 'Nov', income, spent }];
  const biggest = donutSlices[0];
  const biggestTx = [...store.state.transactions]
    .filter((t) => t.type === 'expense' && t.category !== 'housing' && t.category !== 'savings')
    .sort((a, b) => b.amount - a.amount)[0];
  const diningTrips = store.state.transactions.filter((t) => t.category === 'dining').length;
  const daily = spent / 26;
  const projected = daily * 30;
  const saved = byCategory.savings ?? 0;
  const bestMonth = [...store.state.history].sort((a, b) => a.spent - b.spent)[0];

  return `<section class="page-head">
    <h1>Reports</h1>
    <p class="lede">Where November's money went, and how the month stacks up against the last five.</p>
  </section>
  <section class="grid-two">
    <div class="card">
      <h2>November spending by category</h2>
      <p class="hint">Rent and the savings transfer are set aside — this is the spending the household chooses day to day.</p>
      <canvas id="donut-chart" class="chart donut" width="640" height="300" aria-label="Donut chart of spending by category"></canvas>
      <ul class="donut-legend">
        ${donutSlices.map((s) => `<li><span class="swatch" style="background:${s.color}"></span>${escapeHtml(s.label)}<strong>${money(s.value)}</strong></li>`).join('')}
      </ul>
    </div>
    <div class="card">
      <h2>Income vs spending — six months</h2>
      <p class="hint">November is live from the ledger; the rest is the household's record.</p>
      <canvas id="cashflow-chart" class="chart" width="640" height="260" aria-label="Bar chart of monthly income and spending"></canvas>
      <p class="legend"><span class="swatch" style="background:#1e4d3a"></span> Income <span class="swatch" style="background:#d97b29"></span> Spending</p>
      <h2 class="subhead">What the numbers say</h2>
      <ul class="insights">
        <li><strong>${escapeHtml(biggest.label)}</strong> is the biggest everyday spend at ${money(biggest.value)} — ${percent(biggest.value, everydayTotal)}% of everyday spending.</li>
        <li>The biggest single purchase was <strong>${escapeHtml(biggestTx.description)}</strong> at ${money(biggestTx.amount)} on ${prettyDate(biggestTx.date)}.</li>
        <li>The household ate out <strong>${diningTrips} times</strong> in November, ${money(byCategory.dining ?? 0)} in all.</li>
        <li>At ${money(daily)} a day, November is on pace to finish near <strong>${money(projected)}</strong>.</li>
        <li>Savings are running at <strong>${percent(saved, income)}%</strong> of take-home pay — the plan is 20%.</li>
        <li>${escapeHtml(bestMonth.month)} was the cheapest recent month at ${money(bestMonth.spent)} spent.</li>
      </ul>
    </div>
  </section>`;
}

export function plannerView() {
  const { income, spent } = store.totals();
  const kinds = store.spentByKind();
  const saved = kinds.savings;
  const rows = [
    { key: 'needs', label: 'Needs', blurb: 'Rent, groceries, utilities, transport, kids and health — the must-pays.', target: 50, actual: kinds.needs },
    { key: 'wants', label: 'Wants', blurb: 'Dining out, fun, clothes, the house and gifts — the nice-to-haves.', target: 30, actual: kinds.wants },
    { key: 'savings', label: 'Savings', blurb: 'The transfer out on the 3rd, and anything extra the month allows.', target: 20, actual: saved },
  ];
  return `<section class="page-head">
    <h1>The 50/30/20 planner</h1>
    <p class="lede">A classic rule of thumb: half the take-home pay on needs, 30% on wants, 20% saved. Set your income and your split, and see how November measures up.</p>
  </section>
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
          <div class="plan-figures"><span>Plan: <strong data-plan-target="${r.key}">${money(targetAmount)}</strong></span><span>Actual: <strong>${money(r.actual)}</strong></span><span class="${diff >= 0 ? 'good' : 'over'}">${diff >= 0 ? `${money(diff)} under plan` : `${money(-diff)} over plan`}</span></div>
        </div>`;
        })
        .join('')}
    </div>
    <p class="hint">Actuals come from the live ledger — add a transaction anywhere and this page moves with it. November's total out is ${money(spent)} against ${money(income)} in.</p>
  </section>
  <section class="card">
    <h2>How the rule works</h2>
    <p>Needs are the bills that keep the household running; wants are the choices that make the month pleasant; savings is the money the future household gets. A month where needs run over half is a month to look at the big bills — rent, the car, the grocery shop — before trimming the small pleasures. The percentages are yours to move: a household saving for a house might run 40/30/30, and one paying down debt might run 60/20/20 for a season.</p>
  </section>`;
}

export function missingView() {
  return `<section class="page-head">
    <h1>That page is not in the house</h1>
    <p class="lede">There is no page at this address. The budget lives on the pages above.</p>
    <p><a href="#/">Back to the dashboard &rarr;</a></p>
  </section>`;
}
