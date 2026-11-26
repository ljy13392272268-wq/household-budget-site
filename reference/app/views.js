// Hearth Ledger — the pages, as HTML strings. Each view reads the store;
// main.js draws the charts and wires the controls keyed by data-action.

import { daysInMonth, escapeHtml, money, percent, prettyDate, rate } from './store.js';
import { store } from './store.js';

const DOT = (color) => `<span class="dot" style="background:${color}"></span>`;

function pageHead(title, lede) {
  return `<section class="page-head"><h1>${title}</h1><p class="lede">${lede}</p></section>`;
}

function bar(pct, color, over = false) {
  return `<div class="bar${over ? ' bar-over' : ''}"><span style="width:${Math.min(100, Math.max(0, pct))}%;background:${
    over ? 'var(--red)' : color
  }"></span></div>`;
}

function envelopeRow(category, spent) {
  const over = spent > category.limit;
  const rest = category.limit - spent;
  return `<div class="env">
    ${DOT(category.color)}<span class="env-name">${escapeHtml(category.name)}</span>
    <span class="env-figure">${money(spent)} <span class="of">of ${money(category.limit)}</span></span>
    <span class="env-left${over ? ' over' : ''}">${over ? `${money(-rest)} over` : `${money(rest)} left`}</span>
    ${bar(percent(spent, category.limit), category.color, over)}
  </div>`;
}

function billStatus(bill, day) {
  if (bill.paid) return '<span class="good">Paid</span>';
  if (bill.dueDay < day) return '<span class="over">Overdue</span>';
  if (bill.dueDay === day) return '<span class="today">Due today</span>';
  return '<span class="hint">Due</span>';
}
function billTag(bill, day) {
  if (bill.paid) return '<span class="good">Paid</span>';
  if (bill.dueDay < day) return `<span class="over">Nov ${bill.dueDay} &middot; overdue</span>`;
  if (bill.dueDay === day) return '<span class="today">Due today</span>';
  return `<span class="hint">Nov ${bill.dueDay}</span>`;
}

function ledgerTable(rows, emptyNote) {
  if (rows.length === 0) return `<tr><td colspan="5" class="empty">${emptyNote}</td></tr>`;
  return rows
    .map((t) => {
      const cat = t.category ? store.category(t.category) : null;
      return `<tr>
      <td class="when">${prettyDate(t.date)}</td>
      <td>${cat ? DOT(cat.color) : '<span class="dot dot-in"></span>'}${escapeHtml(t.description)}</td>
      <td class="cat">${cat ? escapeHtml(cat.name) : 'Income'}</td>
      <td class="amount ${t.type}">${t.type === 'income' ? '+' : '−'}${money(t.amount)}</td>
      <td class="act"><button class="act-link" data-action="delete-transaction" data-id="${t.id}" aria-label="Delete ${escapeHtml(t.description)}">Delete</button></td>
    </tr>`;
    })
    .join('');
}

function addTransactionForm() {
  const options = store.state.categories.map((c) => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');
  return `<form id="add-transaction" class="card form-card">
    <h2>Add a transaction</h2>
    <div class="form-grid">
      <label>Date <input type="date" name="date" value="${store.asOf()}" required></label>
      <label>Description <input type="text" name="description" placeholder="e.g. GreenMart milk and bread" required maxlength="80"></label>
      <label>Type
        <select name="type"><option value="expense">Expense</option><option value="income">Income</option></select>
      </label>
      <label>Category <select name="category">${options}</select></label>
      <label>Amount ($) <input type="number" name="amount" min="0.01" step="0.01" placeholder="0.00" required></label>
      <button type="submit" class="button">Add to the ledger</button>
    </div>
    <p class="hint">Every total, bar and chart moves with it.</p>
  </form>`;
}

export function dashboardView() {
  const { income, spent, left } = store.totals();
  const byCategory = store.spentByCategory();
  const plan = store.planTotal();
  const saved = byCategory.savings ?? 0;
  const owed = store.unpaid();
  const day = Number(store.asOf().slice(8, 10));
  const days = daysInMonth(store.state.household.monthKey);
  const remaining = days - day;
  const under = plan - spent;

  const paychecks = store.state.transactions.filter((t) => t.type === 'income').length;
  const purchases = store.state.transactions.filter((t) => t.type === 'expense').length;

  const envelopes = store.state.categories
    .filter((c) => c.kind !== 'savings')
    .map((c) => ({ c, spent: byCategory[c.id] }))
    .sort((a, b) => percent(b.spent, b.c.limit) - percent(a.spent, a.c.limit))
    .slice(0, 6);
  const near = store.state.categories.filter((c) => c.kind !== 'savings' && c.limit - byCategory[c.id] <= 25).length;
  const envelopeCount = store.state.categories.filter((c) => c.kind !== 'savings').length;

  const prev = store.state.history[store.state.history.length - 1];
  const cheaper = prev ? prev.spent - spent : 0;
  const lowest = spent <= Math.min(...store.state.history.map((h) => h.spent));

  const bills = store.state.bills
    .map((b, index) => ({ ...b, index }))
    .filter((b) => !b.paid)
    .sort((a, b) => a.dueDay - b.dueDay)
    .map(
      (b) => `<li class="bill-row">
      <span class="bill-name">${escapeHtml(b.name)}${billTag(b, day)}</span>
      <span class="bill-amount">${money(b.amount)}</span>
      <button class="act-link" data-action="toggle-bill" data-index="${b.index}" aria-label="Mark ${escapeHtml(b.name)} paid">Mark paid</button>
    </li>`,
    )
    .join('');

  return `<section class="board">
    <div class="board-top">
      <div class="board-title">
        <p class="eyebrow">${escapeHtml(store.state.household.month)} &middot; day ${day} of ${days}</p>
        <h1>November, at a glance</h1>
        <p class="board-note">${escapeHtml(store.state.household.name)} &mdash; ${escapeHtml(store.state.household.members.join(', '))}.</p>
      </div>
      <div class="board-money">
        <span class="micro">Left to spend</span>
        <strong>${money(left)}</strong>
        <span class="board-sub">${money(owed.total)} still to pay &rarr; <b>${money(left - owed.total)}</b> free to spend</span>
      </div>
    </div>
    <div class="board-strip">
      <div><span class="micro">Money in</span><strong>${money(income)}</strong><small>${paychecks} paychecks</small></div>
      <div><span class="micro">Money out</span><strong>${money(spent)}</strong><small>${purchases} purchases</small></div>
      <div><span class="micro">Saved</span><strong>${money(saved)}</strong><small>${rate(saved, income)}% of pay &middot; 20% target</small></div>
      <div><span class="micro">Budget used</span><strong>${percent(spent, plan)}%</strong><small>${money(under)} under &middot; ${remaining} days left</small></div>
    </div>
  </section>

  <div class="row row-main">
    <article class="card">
      <header class="card-head">
        <h2>Cash flow</h2>
        <p class="legend"><i class="sw sw-in"></i>Income <i class="sw sw-out"></i>Spending</p>
      </header>
      <p class="card-note">Pay vs spending, June to November; November is live.</p>
      <canvas id="cashflow-chart" class="chart chart-flow" width="640" height="200" aria-label="Bar chart of monthly income and spending"></canvas>
      <p class="takeaway">November is <b>${money(Math.abs(cheaper))}</b> ${cheaper >= 0 ? 'below' : 'above'} ${
        prev ? escapeHtml(prev.month) : 'last month'
      }${lowest ? ' &mdash; the lowest of the six months' : ''}.</p>
    </article>

    <article class="card">
      <header class="card-head">
        <h2>Bills still due</h2>
        <span class="chip">${owed.bills.length} left</span>
      </header>
      <p class="card-note">Not yet paid, soonest first.</p>
      ${owed.bills.length ? `<ul class="bill-rows">${bills}</ul>` : '<p class="all-paid">Every November bill is paid. Nothing else comes out this month.</p>'}
      <div class="total-line"><span>Still to pay</span><strong>${money(owed.total)}</strong></div>
      <p class="card-foot"><a href="#/bills">Bills &amp; savings goals &rarr;</a></p>
    </article>
  </div>

  <div class="row">
    <article class="card">
      <header class="card-head">
        <h2>Envelope watch</h2>
        <a class="card-link" href="#/budget">All ${store.state.categories.length} &rarr;</a>
      </header>
      <p class="card-note">${near} of ${envelopeCount} within $25 of the limit</p>
      <div class="env-grid">${envelopes.map((e) => envelopeRow(e.c, e.spent)).join('')}</div>
    </article>
  </div>`;
}

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
    <p class="hint">It joins the grid and counts toward the month's plan.</p>
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
  </section>`;
}

export function reportsView() {
  const { income, spent } = store.totals();
  const byCategory = store.spentByCategory();
  const day = Number(store.asOf().slice(8, 10));
  const donutSlices = store.state.categories
    .filter((c) => c.id !== 'housing' && c.kind !== 'savings' && byCategory[c.id] > 0)
    .map((c) => ({ label: c.name, value: byCategory[c.id], color: c.color }))
    .sort((a, b) => b.value - a.value);
  const everydayTotal = donutSlices.reduce((sum, s) => sum + s.value, 0);
  const biggest = donutSlices[0];
  const biggestTx = [...store.state.transactions]
    .filter((t) => t.type === 'expense' && t.category !== 'housing' && t.category !== 'savings')
    .sort((a, b) => b.amount - a.amount)[0];
  const diningTrips = store.state.transactions.filter((t) => t.category === 'dining').length;
  const saved = byCategory.savings ?? 0;
  const bestMonth = [...store.state.history].sort((a, b) => a.spent - b.spent)[0];
  const needs = percent(store.spentByKind().needs, income);

  return `${pageHead('Reports', 'Where November’s money went, and how it stacks up against the last five.')}
  <section class="row row-main">
    <article class="card">
      <header class="card-head"><h2>November spending by category</h2><span class="chip">${money(everydayTotal)}</span></header>
      <p class="card-note">Rent and savings set aside; this is what the household chooses.</p>
      <canvas id="donut-chart" class="chart chart-donut" width="640" height="300" aria-label="Donut chart of spending by category"></canvas>
      <ul class="donut-legend">
        ${donutSlices.map((s) => `<li><i class="sw" style="background:${s.color}"></i>${escapeHtml(s.label)}<b>${money(s.value)}</b></li>`).join('')}
      </ul>
    </article>
    <article class="card">
      <header class="card-head"><h2>Income vs spending</h2>
        <p class="legend"><i class="sw sw-in"></i>Income <i class="sw sw-out"></i>Spending</p></header>
      <p class="card-note">November is live from the ledger; the rest is the household’s record.</p>
      <canvas id="cashflow-chart" class="chart chart-flow" width="640" height="200" aria-label="Bar chart of monthly income and spending"></canvas>
      <h2 class="subhead">What the numbers say</h2>
      <ul class="insights">
        <li><b>${escapeHtml(biggest.label)}</b> leads everyday spending at ${money(biggest.value)} (${percent(biggest.value, everydayTotal)}% of it); the biggest purchase outside rent was <b>${escapeHtml(biggestTx.description)}</b>, ${money(biggestTx.amount)}.</li>
        <li>Needs are <b>${needs}%</b> of take-home pay, inside the 50% the rule allows; the household ate out ${diningTrips} times.</li>
        <li>Savings run at <b>${rate(saved, income)}%</b> of take-home pay — the 50/30/20 rule wants 20%, or ${money(
          income * 0.2 - saved,
        )} more a month. ${escapeHtml(bestMonth.month)} was the cheapest of the six months at ${money(bestMonth.spent)}.</li>
      </ul>
    </article>
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
  </section>`;
}

export function missingView() {
  return `${pageHead('That page is not in the house', 'There is no page at this address.')}
  <p><a href="#/">Back to the dashboard &rarr;</a></p>`;
}
