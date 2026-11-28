// Hearth Ledger — the shared page pieces and the dashboard. The other
// pages live in views-pages.js and load on demand, so the first load only
// carries what the dashboard needs.

import { daysInMonth, escapeHtml, money, percent, prettyDate, rate } from './store.js';
import { store } from './store.js';

export const DOT = (color) => `<span class="dot" style="background:${color}"></span>`;

export function pageHead(title, lede) {
  return `<section class="page-head"><h1>${title}</h1><p class="lede">${lede}</p></section>`;
}

export function bar(pct, color, over = false) {
  return `<div class="bar${over ? ' bar-over' : ''}"><span style="width:${Math.min(100, Math.max(0, pct))}%;background:${
    over ? 'var(--red)' : color
  }"></span></div>`;
}

export function envelopeRow(category, spent) {
  const over = spent > category.limit;
  const rest = category.limit - spent;
  return `<div class="env">
    ${DOT(category.color)}<span class="env-name">${escapeHtml(category.name)}</span>
    <span class="env-figure">${money(spent)} <span class="of">of ${money(category.limit)}</span></span>
    <span class="env-left${over ? ' over' : ''}">${over ? `${money(-rest)} over` : `${money(rest)} left`}</span>
    ${bar(percent(spent, category.limit), category.color, over)}
  </div>`;
}

export function billStatus(bill, day) {
  if (bill.paid) return '<span class="good">Paid</span>';
  if (bill.dueDay < day) return '<span class="over">Overdue</span>';
  if (bill.dueDay === day) return '<span class="today">Due today</span>';
  return '<span class="hint">Due</span>';
}
export function billTag(bill, day) {
  if (bill.paid) return '<span class="good">Paid</span>';
  if (bill.dueDay < day) return `<span class="over">Nov ${bill.dueDay} &middot; overdue</span>`;
  if (bill.dueDay === day) return '<span class="today">Due today</span>';
  return `<span class="hint">Nov ${bill.dueDay}</span>`;
}

export function ledgerTable(rows, emptyNote) {
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

export function addTransactionForm() {
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
  </form>`;
}

// Grouped bars for income against spending, drawn as inline SVG so the
// dashboard and the reports need no chart library on first load.
export function barChartSVG(months) {
  const W = 640;
  const H = 200;
  const pad = { top: 14, right: 6, bottom: 24, left: 40 };
  const plotW = W - pad.left - pad.right;
  const plotH = H - pad.top - pad.bottom;
  const peak = Math.max(...months.flatMap((m) => [m.income, m.spent]), 1);
  const step = [500, 1000, 2000, 2500, 5000].find((s) => s * 4 >= peak) ?? 5000;
  const max = step * 4;
  const f = (n) => n.toFixed(1);
  let out = `<svg class="chart chart-flow" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" font-family="system-ui, 'Segoe UI', sans-serif" role="img" aria-label="Bar chart of monthly income and spending">`;
  for (let i = 0; i <= 4; i += 1) {
    const y = pad.top + plotH - (plotH * step * i) / max;
    out += `<line x1="${pad.left}" y1="${f(y)}" x2="${W - pad.right}" y2="${f(y)}" stroke="${i === 0 ? '#cfc8b4' : '#e4ddcc'}"/>`;
    out += `<text x="${pad.left - 7}" y="${f(y + 4)}" text-anchor="end" font-size="11" fill="#6f6a5e">${i === 0 ? '$0' : `$${(step * i) / 1000}k`}</text>`;
  }
  const groupW = plotW / months.length;
  const barW = Math.min(20, Math.max(8, (groupW - 10) / 2));
  months.forEach((m, i) => {
    const center = pad.left + groupW * i + groupW / 2;
    const incomeH = Math.max(1, (plotH * m.income) / max);
    const spentH = Math.max(1, (plotH * m.spent) / max);
    out += `<rect x="${f(center - barW - 2)}" y="${f(pad.top + plotH - incomeH)}" width="${f(barW)}" height="${f(incomeH)}" fill="#1e4d3a"/>`;
    out += `<rect x="${f(center + 2)}" y="${f(pad.top + plotH - spentH)}" width="${f(barW)}" height="${f(spentH)}" fill="#c96f22"/>`;
    out += `<text x="${f(center)}" y="${H - 7}" text-anchor="middle" font-size="11" fill="${i === months.length - 1 ? '#22302a' : '#6f6a5e'}" font-weight="${i === months.length - 1 ? 'bold' : 'normal'}">${m.month}</text>`;
  });
  return `${out}</svg>`;
}

export function dashboardView() {
  const { income, spent, left } = store.totals();
  const byCategory = store.spentByCategory();
  const plan = store.planTotal();
  const saved = byCategory.savings ?? 0;
  const owed = store.unpaid();
  const day = Number(store.asOf().slice(8, 10));
  const days = daysInMonth(store.state.household.monthKey);
  const safe = store.safePerDay();
  const debt = store.totalDebt();
  const debtFree = store.payoff(100, 'avalanche');

  const paychecks = store.state.transactions.filter((t) => t.type === 'income').length;
  const purchases = store.state.transactions.filter((t) => t.type === 'expense').length;

  const envelopes = store.state.categories
    .filter((c) => c.kind !== 'savings')
    .map((c) => ({ c, spent: byCategory[c.id] }))
    .sort((a, b) => a.c.limit - a.spent - (b.c.limit - b.spent))
    .slice(0, 4);
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
      <div><span class="micro">Safe to spend</span><strong>${money(safe.perDay)} a day</strong><small>${safe.daysLeft} days left &middot; ${money(safe.remaining)} under budget</small></div>
      <div><span class="micro">Debt</span><strong>${money(debt.total)}</strong><small>clear in ${debtFree.months} mo &middot; $100 extra/mo</small></div>
    </div>
  </section>

  <div class="row row-main">
    <article class="card">
      <header class="card-head">
        <h2>Cash flow</h2>
        <p class="legend"><i class="sw sw-in"></i>Income <i class="sw sw-out"></i>Spending</p>
      </header>
      <p class="card-note">Pay vs spending, December to November; November is live.</p>
      ${barChartSVG([...store.state.history, { month: 'Nov', income, spent }])}
      <p class="takeaway">November is <b>${money(Math.abs(cheaper))}</b> ${cheaper >= 0 ? 'below' : 'above'} ${
        prev ? escapeHtml(prev.month) : 'last month'
      }${lowest ? ' &mdash; the lowest of the twelve months' : ''}.</p>
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
        <h2>Envelopes closest to the limit <span class="chip">${near} of ${envelopeCount} within $25</span></h2>
        <a class="card-link" href="#/budget">All envelopes &rarr;</a>
      </header>
      <div class="env-grid">${envelopes.map((e) => envelopeRow(e.c, e.spent)).join('')}</div>
    </article>
  </div>`;
}
