// Hearth Ledger — the Rivera household's book and the state around it: the
// November seed, every change saved in localStorage, and the sums pages read.
// The seed data is kept as compact rows and mapped to objects once, so the
// first load stays small; twelve months of history, the household's debts
// with a payoff simulator, and a six-month projection all live here too.

// [id, name, limit, kind, color]
const CATEGORIES = [
  ['housing', 'Housing', 1850, 'needs', '#1e4d3a'],
  ['groceries', 'Groceries', 750, 'needs', '#3e7d5b'],
  ['utilities', 'Utilities', 320, 'needs', '#6aa88a'],
  ['transport', 'Transport', 520, 'needs', '#2f6f8f'],
  ['kids', 'Kids & school', 420, 'needs', '#5b8fb0'],
  ['health', 'Health', 260, 'needs', '#7ba7bc'],
  ['dining', 'Dining out', 300, 'wants', '#d97b29'],
  ['fun', 'Fun & streaming', 200, 'wants', '#e8a13c'],
  ['clothing', 'Clothing', 150, 'wants', '#c98a5e'],
  ['household', 'Household', 180, 'wants', '#a9805a'],
  ['gifts', 'Gifts & giving', 120, 'wants', '#b56a6a'],
  ['savings', 'Savings', 1200, 'savings', '#8a6fb8'],
];
// [date, description, category (null for income), amount, type]
const TRANSACTIONS = [
  ['2026-11-01', 'November rent — Maple Court Apt 4B', 'housing', 1850.0, 'expense'],
  ['2026-11-01', 'GreenMart weekly shop', 'groceries', 132.4, 'expense'],
  ['2026-11-02', 'City power — October bill', 'utilities', 128.4, 'expense'],
  ['2026-11-03', 'Transfer to emergency fund', 'savings', 1200.0, 'expense'],
  ['2026-11-03', 'Corner Bakery — school lunch boxes', 'kids', 24.5, 'expense'],
  ['2026-11-04', 'Shell — Tom’s commute fill-up', 'transport', 42.1, 'expense'],
  ['2026-11-05', 'Riverside Gym — family membership', 'health', 39.0, 'expense'],
  ['2026-11-06', 'Paycheck — Maya (Riverbend Clinic)', null, 2075.0, 'income'],
  ['2026-11-06', 'Paycheck — Tom (Northline Freight)', null, 1800.0, 'income'],
  ['2026-11-06', 'Pasta night — Trattoria Alba', 'dining', 64.2, 'expense'],
  ['2026-11-07', 'StreamPlus monthly', 'fun', 15.49, 'expense'],
  ['2026-11-07', 'GreenMart weekly shop', 'groceries', 96.18, 'expense'],
  ['2026-11-08', 'Leo’s swim lessons — November', 'kids', 95.0, 'expense'],
  ['2026-11-09', 'Car insurance — monthly premium', 'transport', 148.0, 'expense'],
  ['2026-11-10', 'Pharmacy — June’s allergy refill', 'health', 28.4, 'expense'],
  ['2026-11-10', 'Taco truck Tuesday', 'dining', 31.75, 'expense'],
  ['2026-11-11', 'GreenMart weekly shop', 'groceries', 154.72, 'expense'],
  ['2026-11-12', 'City water — quarterly bill', 'utilities', 46.2, 'expense'],
  ['2026-11-12', 'June’s birthday gift — art set', 'gifts', 45.0, 'expense'],
  ['2026-11-13', 'Shell — Maya’s fill-up', 'transport', 38.75, 'expense'],
  ['2026-11-13', 'Friday pizza — delivery', 'dining', 42.9, 'expense'],
  ['2026-11-14', 'Movie night — four tickets', 'fun', 46.0, 'expense'],
  ['2026-11-14', 'Hardware store — light bulbs & batteries', 'household', 18.75, 'expense'],
  ['2026-11-15', 'Fiber internet — monthly', 'utilities', 79.0, 'expense'],
  ['2026-11-15', 'GreenMart weekly shop', 'groceries', 88.05, 'expense'],
  ['2026-11-16', 'School book fair — Leo & June', 'kids', 42.3, 'expense'],
  ['2026-11-17', 'Bus passes — Maya & Tom', 'transport', 96.0, 'expense'],
  ['2026-11-18', 'Dentist copay — Tom’s check-up', 'health', 85.0, 'expense'],
  ['2026-11-18', 'GreenMart weekly shop', 'groceries', 121.36, 'expense'],
  ['2026-11-19', 'Sushi takeaway — date night', 'dining', 58.4, 'expense'],
  ['2026-11-20', 'Paycheck — Maya (Riverbend Clinic)', null, 2075.0, 'income'],
  ['2026-11-20', 'Paycheck — Tom (Northline Freight)', null, 1800.0, 'income'],
  ['2026-11-20', 'Tom’s winter jacket', 'clothing', 89.0, 'expense'],
  ['2026-11-21', 'Board game — Family Game Night', 'fun', 32.99, 'expense'],
  ['2026-11-21', 'GreenMart weekly shop', 'groceries', 74.9, 'expense'],
  ['2026-11-22', 'Leo’s new trainers', 'kids', 68.99, 'expense'],
  ['2026-11-22', 'Gas — heating, November', 'utilities', 58.3, 'expense'],
  ['2026-11-23', 'Cleaning supplies & paper goods', 'household', 34.2, 'expense'],
  ['2026-11-23', 'Rideshare — airport run for Grandma', 'transport', 24.5, 'expense'],
  ['2026-11-24', 'Breakfast café — Saturday treat', 'dining', 38.6, 'expense'],
  ['2026-11-24', 'Vitamins & cold medicine', 'health', 18.9, 'expense'],
  ['2026-11-25', 'GreenMart — Thanksgiving top-up', 'groceries', 58.2, 'expense'],
  ['2026-11-25', 'New bath towels', 'household', 42.0, 'expense'],
  ['2026-11-25', 'Flowers for Grandma’s visit', 'gifts', 28.0, 'expense'],
  ['2026-11-26', 'Shell — pre-Thanksgiving fill-up', 'transport', 45.6, 'expense'],
  ['2026-11-26', 'Bakery — Thanksgiving pies', 'dining', 52.15, 'expense'],
  ['2026-11-26', 'MusicStream monthly', 'fun', 9.99, 'expense'],
];
// [name, amount, dueDay, paid]
const BILLS = [
  ['Rent — Maple Court Apt 4B', 1850.0, 1, true],
  ['Riverside Gym — family', 39.0, 5, true],
  ['StreamPlus', 15.49, 7, true],
  ['Car insurance', 148.0, 9, true],
  ['City power', 128.4, 12, true],
  ['Fiber internet', 79.0, 15, true],
  ['Mobile — two lines', 112.0, 21, true],
  ['Trash & recycling', 28.0, 25, false],
  ['Leo’s swim lessons', 95.0, 26, false],
  ['MusicStream', 9.99, 26, false],
];
// [id, name, target, saved, note]
const GOALS = [
  ['emergency', 'Emergency fund', 10000, 7350, 'Six months of rent and groceries, for a rainy day.'],
  ['trip', 'Summer road trip', 2400, 1150, 'Two weeks down the coast, campsites included.'],
  ['car', 'Next family car', 8000, 2300, 'Replace the 2014 wagon before it gives up.'],
  ['college', 'College fund — Leo & June', 25000, 4800, 'A little every month, since they were small.'],
];
// [month, income, spent] — December 2025 to October 2026; November is live.
const HISTORY = [
  ['Dec', 7750, 6210],
  ['Jan', 7750, 5870],
  ['Feb', 7750, 6040],
  ['Mar', 7750, 6590],
  ['Apr', 7900, 6710],
  ['May', 7750, 6180],
  ['Jun', 7750, 5980],
  ['Jul', 7750, 6410],
  ['Aug', 7900, 6890],
  ['Sep', 7750, 6120],
  ['Oct', 7750, 6340],
];
// [id, name, balance, apr (%), monthly minimum] — balances as of 26 Nov 2026.
const DEBTS = [
  ['card', 'Credit card — Maple Bank', 2600, 24.9, 75],
  ['student', 'Student loan — Maya', 1200, 5.8, 60],
  ['car', 'Car loan — 2014 wagon', 6200, 7.2, 210],
];
const HOUSEHOLD = {
  name: 'The Rivera household',
  members: ['Maya', 'Tom', 'Leo (9)', 'June (6)'],
  month: 'November 2026',
  monthKey: '2026-11',
};

const STORAGE_KEY = 'hearth-ledger-v1';

function freshSeed() {
  return {
    categories: CATEGORIES.map(([id, name, limit, kind, color]) => ({ id, name, limit, kind, color })),
    transactions: TRANSACTIONS.map(([date, description, category, amount, type], i) => ({
      id: `seed-${i + 1}`,
      date,
      description,
      category,
      amount,
      type,
    })),
    bills: BILLS.map(([name, amount, dueDay, paid]) => ({ name, amount, dueDay, paid })),
    goals: GOALS.map(([id, name, target, saved, note]) => ({ id, name, target, saved, note })),
    history: HISTORY.map(([month, income, spent]) => ({ month, income, spent })),
    debts: DEBTS.map(([id, name, balance, apr, minimum]) => ({ id, name, balance, apr, minimum })),
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

// A saved book from before the debt and twelve-month additions has no debts
// and a short history; fill those in so the new pages always have data.
const initialState = loadSaved() ?? freshSeed();
if (!Array.isArray(initialState.debts)) {
  initialState.debts = DEBTS.map(([id, name, balance, apr, minimum]) => ({ id, name, balance, apr, minimum }));
}
if (!Array.isArray(initialState.history) || initialState.history.length < HISTORY.length) {
  initialState.history = HISTORY.map(([month, income, spent]) => ({ month, income, spent }));
}

export const store = {
  state: initialState,
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
    }
  },

  reset() {
    this.state = freshSeed();
    this.save();
  },

  category(id) {
    return this.state.categories.find((c) => c.id === id);
  },
  totals() {
    const income = this.state.transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const spent = this.state.transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    return { income, spent, left: income - spent };
  },
  planTotal() {
    return this.state.categories.reduce((sum, c) => sum + c.limit, 0);
  },
  unpaid() {
    const bills = this.state.bills.filter((b) => !b.paid);
    return { bills, total: bills.reduce((sum, b) => sum + b.amount, 0) };
  },
  asOf() {
    return this.state.transactions.reduce((latest, t) => (t.date > latest ? t.date : latest), '');
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

  // What the household can still spend each day and stay inside the budget.
  safePerDay() {
    const { spent } = this.totals();
    const remaining = this.planTotal() - spent;
    const day = Number(this.asOf().slice(8, 10));
    const days = daysInMonth(this.state.household.monthKey);
    const daysLeft = Math.max(0, days - day);
    return { perDay: daysLeft > 0 ? remaining / daysLeft : remaining, daysLeft, remaining };
  },

  totalDebt() {
    const total = this.state.debts.reduce((sum, d) => sum + d.balance, 0);
    const minimums = this.state.debts.reduce((sum, d) => sum + d.minimum, 0);
    return { total, minimums };
  },

  // Simulate paying every debt off: each month interest accrues, every
  // minimum is paid, and the extra — plus the minimums freed by debts
  // already cleared — goes to one target. Avalanche picks the highest APR;
  // snowball picks the smallest balance. Returns the months to clear, the
  // interest paid, the total paid, and the order the debts clear in.
  payoff(extra, method) {
    const ds = this.state.debts.map((d) => ({ ...d, paidAt: 0 }));
    const initial = ds.reduce((sum, d) => sum + d.balance, 0);
    const extraPerMonth = Math.max(0, Number(extra) || 0);
    let months = 0;
    let interest = 0;
    while (ds.some((d) => d.balance > 0.005) && months < 600) {
      months += 1;
      const freed = ds.filter((d) => d.balance <= 0.005).reduce((sum, d) => sum + d.minimum, 0);
      for (const d of ds) {
        if (d.balance > 0.005) {
          const due = (d.balance * d.apr) / 100 / 12;
          d.balance += due;
          interest += due;
        }
      }
      for (const d of ds) {
        if (d.balance > 0.005) {
          const pay = Math.min(d.minimum, d.balance);
          d.balance -= pay;
          if (d.balance <= 0.005 && !d.paidAt) d.paidAt = months;
        }
      }
      let pool = extraPerMonth + freed;
      while (pool > 0.005 && ds.some((d) => d.balance > 0.005)) {
        const active = ds.filter((d) => d.balance > 0.005);
        const target =
          method === 'snowball'
            ? active.reduce((a, b) => (a.balance <= b.balance ? a : b))
            : active.reduce((a, b) => (a.apr >= b.apr ? a : b));
        const pay = Math.min(pool, target.balance);
        target.balance -= pay;
        pool -= pay;
        if (target.balance <= 0.005 && !target.paidAt) target.paidAt = months;
      }
    }
    const order = ds
      .filter((d) => d.paidAt > 0)
      .sort((a, b) => a.paidAt - b.paidAt)
      .map((d) => d.name);
    return { months, interest, paid: initial + interest, order };
  },

  // Six months ahead, from the twelve-month average: same pay coming in,
  // the average month's spending, the rest saved, the balance carried on.
  projection() {
    const { income, spent } = this.totals();
    const months = [...this.state.history, { month: 'Nov', income, spent }];
    const avgIncome = months.reduce((sum, m) => sum + m.income, 0) / months.length;
    const avgSpent = months.reduce((sum, m) => sum + m.spent, 0) / months.length;
    const labels = ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'];
    let balance = this.totals().left;
    return labels.map((label) => {
      const saved = avgIncome - avgSpent;
      balance += saved;
      return { month: label, income: avgIncome, spent: avgSpent, saved, balance };
    });
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

export function money(amount) {
  const sign = amount < 0 ? '−' : '';
  return `${sign}$${Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function percent(part, whole) {
  if (!whole) return 0;
  return Math.round((part / whole) * 100);
}
export function rate(part, whole) {
  if (!whole) return '0.0';
  return ((part / whole) * 100).toFixed(1);
}

export function prettyDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
export function daysInMonth(monthKey) {
  const [y, m] = monthKey.split('-').map(Number);
  return new Date(y, m, 0).getDate();
}

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}
