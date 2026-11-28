// Hearth Ledger — the router and the wiring: one hash route per page, the
// donut drawn on the reports page, and the buttons and forms connected.
// The dashboard view loads with the first load; the other pages and the
// donut code load on demand, so the first load stays small.

import { escapeHtml, money, store } from './store.js';
import { dashboardView } from './views-core.js';

const app = document.getElementById('app');
const navLinks = [...document.querySelectorAll('.site-nav a')];

const ROUTES = {
  '/': { view: 'dashboard', title: 'Hearth Ledger — a household budget that adds up' },
  '/budget': { view: 'budgetView', title: 'The November budget | Hearth Ledger' },
  '/transactions': { view: 'transactionsView', title: 'The ledger | Hearth Ledger' },
  '/bills': { view: 'billsGoalsView', title: 'Bills & savings goals | Hearth Ledger' },
  '/reports': { view: 'reportsView', title: 'Reports | Hearth Ledger' },
  '/plan': { view: 'plannerView', title: 'The 50/30/20 planner | Hearth Ledger' },
};

let pagesModule = null;
async function pages() {
  if (!pagesModule) pagesModule = await import('./views-pages.js');
  return pagesModule;
}

let debtMethod = 'avalanche';

function updateDebt() {
  const input = document.getElementById('debt-extra');
  const result = document.getElementById('debt-result');
  if (!input || !result) return;
  const extra = Math.max(0, Number(input.value) || 0);
  const r = store.payoff(extra, debtMethod);
  result.innerHTML =
    `Debt-free in <b>${r.months} months</b> &middot; ${money(r.interest)} interest &middot; ${money(r.paid)} paid in all.` +
    `<br><span class="hint">Clears in this order: ${r.order.map((name) => escapeHtml(name)).join(' &rarr; ')}</span>`;
  for (const button of document.querySelectorAll('[data-action="debt-method"]')) {
    button.classList.toggle('button-ghost', button.dataset.method !== debtMethod);
  }
}

async function drawCharts() {
  const donut = document.getElementById('donut-chart');
  if (donut) {
    const { drawDonut } = await import('./charts.js');
    const byCategory = store.spentByCategory();
    const slices = store.state.categories
      .filter((c) => c.id !== 'housing' && c.kind !== 'savings' && byCategory[c.id] > 0)
      .map((c) => ({ label: c.name, value: byCategory[c.id], color: c.color }))
      .sort((a, b) => b.value - a.value);
    drawDonut(donut, slices, 'everyday spending');
  }
}

async function refreshLedgerList() {
  const category = document.getElementById('filter-category');
  const search = document.getElementById('filter-search');
  const body = document.getElementById('ledger-body');
  const count = document.getElementById('ledger-count');
  if (!category || !search || !body || !count) return;
  const { ledgerRows } = await pages();
  const { html, count: n } = ledgerRows(category.value, search.value);
  body.innerHTML = html;
  count.textContent = `${n} ${n === 1 ? 'entry' : 'entries'}`;
}

function recalcPlan() {
  const incomeInput = document.getElementById('plan-income');
  const needsInput = document.getElementById('plan-needs');
  const wantsInput = document.getElementById('plan-wants');
  const savingsInput = document.getElementById('plan-savings');
  const sumNote = document.getElementById('plan-sum');
  if (!incomeInput || !needsInput || !wantsInput || !savingsInput) return;
  const income = Math.max(0, Number(incomeInput.value) || 0);
  const split = {
    needs: Math.max(0, Number(needsInput.value) || 0),
    wants: Math.max(0, Number(wantsInput.value) || 0),
    savings: Math.max(0, Number(savingsInput.value) || 0),
  };
  const total = split.needs + split.wants + split.savings;
  sumNote.textContent =
    total === 100
      ? 'Your split adds up to 100%.'
      : `Your split adds up to ${total}% — it should be 100% for the plan to cover the whole pay packet.`;
  const kinds = store.spentByKind();
  for (const key of ['needs', 'wants', 'savings']) {
    const target = (income * split[key]) / 100;
    const targetEl = document.querySelector(`[data-plan-target="${key}"]`);
    if (targetEl) targetEl.textContent = money(target);
    const row = targetEl?.closest('.plan-row');
    const diffEl = row?.querySelector('.plan-figures span:last-child');
    if (diffEl) {
      const diff = target - kinds[key];
      diffEl.textContent = diff >= 0 ? `${money(diff)} under plan` : `${money(-diff)} over plan`;
      diffEl.className = diff >= 0 ? 'good' : 'over';
    }
    const label = row?.querySelector('.plan-row strong');
    if (label) label.textContent = `${key[0].toUpperCase() + key.slice(1)} — ${split[key]}%`;
  }
}

function wirePage() {
  const addTx = document.getElementById('add-transaction');
  if (addTx) {
    addTx.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = new FormData(addTx);
      const amount = Math.round(Number(data.get('amount')) * 100) / 100;
      if (!amount || amount <= 0) return;
      store.addTransaction({
        date: String(data.get('date') || store.asOf()),
        description: String(data.get('description') || '').trim() || 'Untitled',
        category: String(data.get('category') || ''),
        amount,
        type: String(data.get('type') || 'expense') === 'income' ? 'income' : 'expense',
      });
      render();
    });
  }

  const addCat = document.getElementById('add-category');
  if (addCat) {
    addCat.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = new FormData(addCat);
      const name = String(data.get('name') || '').trim();
      const limit = Number(data.get('limit'));
      if (!name || !(limit >= 0)) return;
      store.addCategory(name, limit);
      render();
    });
  }

  for (const form of document.querySelectorAll('.contribute-custom')) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const amount = Number(new FormData(form).get('amount'));
      if (!amount || amount <= 0) return;
      store.contribute(form.dataset.goal, amount);
      render();
    });
  }

  const filterCategory = document.getElementById('filter-category');
  const filterSearch = document.getElementById('filter-search');
  if (filterCategory) filterCategory.addEventListener('change', refreshLedgerList);
  if (filterSearch) filterSearch.addEventListener('input', refreshLedgerList);

  for (const input of ['plan-income', 'plan-needs', 'plan-wants', 'plan-savings']) {
    const el = document.getElementById(input);
    if (el) el.addEventListener('input', recalcPlan);
  }

  const debtExtra = document.getElementById('debt-extra');
  if (debtExtra) {
    debtExtra.addEventListener('input', updateDebt);
    updateDebt();
  }
}

document.addEventListener('click', (event) => {
  const target = event.target.closest('[data-action]');
  if (!target) return;
  const action = target.dataset.action;
  if (action === 'delete-transaction') {
    store.removeTransaction(target.dataset.id);
    render();
  } else if (action === 'save-limit') {
    const input = document.querySelector(`[data-limit-input="${target.dataset.id}"]`);
    if (input) {
      store.setLimit(target.dataset.id, Number(input.value));
      render();
    }
  } else if (action === 'toggle-bill') {
    store.toggleBill(Number(target.dataset.index));
    render();
  } else if (action === 'contribute') {
    store.contribute(target.dataset.id, Number(target.dataset.amount));
    render();
  } else if (action === 'debt-method') {
    debtMethod = target.dataset.method === 'snowball' ? 'snowball' : 'avalanche';
    updateDebt();
  } else if (action === 'reset-data') {
    store.reset();
    render();
  }
});

async function render() {
  window.__shotReady = false;
  const path = location.hash.replace(/^#/, '') || '/';
  const route = ROUTES[path];
  let view;
  let title;
  if (!route) {
    view = (await pages()).missingView;
    title = 'Not found | Hearth Ledger';
  } else if (route.view === 'dashboard') {
    view = dashboardView;
    title = route.title;
  } else {
    view = (await pages())[route.view];
    title = route.title;
  }
  document.title = title;
  app.innerHTML = view();
  for (const link of navLinks) {
    const href = link.getAttribute('href') ?? '';
    link.classList.toggle('active', href === `#${path}` || (path === '/' && href === '#/'));
    if (link.classList.contains('active')) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
  await drawCharts();
  wirePage();
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

window.addEventListener('hashchange', render);
render();
