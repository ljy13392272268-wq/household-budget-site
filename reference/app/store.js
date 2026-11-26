// Hearth Ledger — the household's working state.
//
// The store loads the seed from data.js, keeps every change the household
// makes, and saves it in the browser (localStorage) so the ledger survives
// a reload. Where storage is unavailable — a private window, or a host
// that blocks it — the site keeps working in memory for the visit instead.
// Nothing here ever leaves the browser.

import { BILLS, CATEGORIES, GOALS, HISTORY, HOUSEHOLD, TRANSACTIONS } from './data.js';

const STORAGE_KEY = 'hearth-ledger-v1';

function freshSeed() {
  return {
    categories: CATEGORIES.map((c) => ({ ...c })),
    transactions: TRANSACTIONS.map((t, i) => ({ ...t, id: `seed-${i + 1}` })),
    bills: BILLS.map((b) => ({ ...b })),
    goals: GOALS.map((g) => ({ ...g })),
    history: HISTORY.map((h) => ({ ...h })),
    household: { ...HOUSEHOLD },
    nextId: TRANSACTIONS.length + 1,
  };
}

function loadSaved() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.transactions) || !Array.isArray(parsed.categories)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export const store = {
  state: loadSaved() ?? freshSeed(),
  memoryOnly: (() => {
    try {
      window.localStorage.setItem('__hearth_probe', '1');
      window.localStorage.removeItem('__hearth_probe');
      return false;
    } catch {
      return true;
    }
  })(),

  save() {
    if (this.memoryOnly) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      // A full or blocked store is not the household's problem: the site
      // keeps working in memory for this visit.
    }
  },

  reset() {
    this.state = freshSeed();
    this.save();
  },

  category(id) {
    return this.state.categories.find((c) => c.id === id);
  },

  // Money in and out for the month in progress, computed from the ledger
  // itself so every page agrees.
  totals() {
    const income = this.state.transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const spent = this.state.transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    return { income, spent, left: income - spent };
  },

  spentByCategory() {
    const spent = {};
    for (const c of this.state.categories) spent[c.id] = 0;
    for (const t of this.state.transactions) {
      if (t.type === 'expense' && t.category && t.category in spent) spent[t.category] += t.amount;
    }
    return spent;
  },

  spentByKind() {
    const byCategory = this.spentByCategory();
    const kinds = { needs: 0, wants: 0, savings: 0 };
    for (const c of this.state.categories) kinds[c.kind] += byCategory[c.id] ?? 0;
    return kinds;
  },

  addTransaction({ date, description, category, amount, type }) {
    const id = `user-${this.state.nextId}`;
    this.state.nextId += 1;
    this.state.transactions.push({ id, date, description, category: type === 'income' ? null : category, amount, type });
    this.save();
    return id;
  },

  removeTransaction(id) {
    this.state.transactions = this.state.transactions.filter((t) => t.id !== id);
    this.save();
  },

  setLimit(categoryId, limit) {
    const c = this.category(categoryId);
    if (!c) return;
    c.limit = Math.max(0, Math.round(limit));
    this.save();
  },

  addCategory(name, limit) {
    const id = `custom-${this.state.nextId}`;
    this.state.nextId += 1;
    this.state.categories.push({ id, name, limit: Math.max(0, Math.round(limit)), kind: 'wants', color: '#8a7d6b' });
    this.save();
    return id;
  },

  toggleBill(index) {
    const bill = this.state.bills[index];
    if (!bill) return;
    bill.paid = !bill.paid;
    this.save();
  },

  contribute(goalId, amount) {
    const goal = this.state.goals.find((g) => g.id === goalId);
    if (!goal) return;
    goal.saved = Math.min(goal.target, Math.round((goal.saved + amount) * 100) / 100);
    this.save();
  },
};

// --- Formatting helpers, shared by every page. ---

export function money(amount) {
  const sign = amount < 0 ? '−' : '';
  return `${sign}$${Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function moneyShort(amount) {
  return `$${Math.round(amount).toLocaleString('en-US')}`;
}

export function percent(part, whole) {
  if (!whole) return 0;
  return Math.round((part / whole) * 100);
}

export function prettyDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}
