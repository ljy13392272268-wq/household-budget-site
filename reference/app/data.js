// Hearth Ledger — the household's seed data.
//
// Everything on the site comes from this file: one fictional household,
// the Rivera family (Maya and Tom, with Leo and June), and their November
// 2026 budget. The store (store.js) loads this seed, and every change the
// household makes — a new transaction, an edited limit, a paid bill — is
// saved in the browser, so the seed is only the starting point. Amounts
// are dollars; dates are ISO days in November 2026.

export const HOUSEHOLD = {
  name: 'The Rivera household',
  members: ['Maya', 'Tom', 'Leo (9)', 'June (6)'],
  month: 'November 2026',
  monthKey: '2026-11',
  payday: 'Fridays, every two weeks',
  note: 'Take-home pay, after tax. Rent is due on the 1st; the savings transfer goes out on the 3rd.',
};

// Budget categories: the monthly limit for each, and the colour its bars
// and chart slices use. `kind` sorts a category into the 50/30/20 planner:
// needs, wants, or savings.
export const CATEGORIES = [
  { id: 'housing', name: 'Housing', limit: 1850, kind: 'needs', color: '#1e4d3a' },
  { id: 'groceries', name: 'Groceries', limit: 750, kind: 'needs', color: '#3e7d5b' },
  { id: 'utilities', name: 'Utilities', limit: 320, kind: 'needs', color: '#6aa88a' },
  { id: 'transport', name: 'Transport', limit: 520, kind: 'needs', color: '#2f6f8f' },
  { id: 'kids', name: 'Kids & school', limit: 420, kind: 'needs', color: '#5b8fb0' },
  { id: 'health', name: 'Health', limit: 260, kind: 'needs', color: '#7ba7bc' },
  { id: 'dining', name: 'Dining out', limit: 300, kind: 'wants', color: '#d97b29' },
  { id: 'fun', name: 'Fun & streaming', limit: 200, kind: 'wants', color: '#e8a13c' },
  { id: 'clothing', name: 'Clothing', limit: 150, kind: 'wants', color: '#c98a5e' },
  { id: 'household', name: 'Household', limit: 180, kind: 'wants', color: '#a9805a' },
  { id: 'gifts', name: 'Gifts & giving', limit: 120, kind: 'wants', color: '#b56a6a' },
  { id: 'savings', name: 'Savings', limit: 1200, kind: 'savings', color: '#8a6fb8' },
];

// The month's ledger, newest last. `type` is expense or income; income
// rows carry no category. Amounts are what the household actually spent.
export const TRANSACTIONS = [
  { date: '2026-11-01', description: 'November rent — Maple Court Apt 4B', category: 'housing', amount: 1850.0, type: 'expense' },
  { date: '2026-11-01', description: 'GreenMart weekly shop', category: 'groceries', amount: 132.4, type: 'expense' },
  { date: '2026-11-02', description: 'City power — October bill', category: 'utilities', amount: 128.4, type: 'expense' },
  { date: '2026-11-03', description: 'Transfer to emergency fund', category: 'savings', amount: 1200.0, type: 'expense' },
  { date: '2026-11-03', description: 'Corner Bakery — school lunch boxes', category: 'kids', amount: 24.5, type: 'expense' },
  { date: '2026-11-04', description: 'Shell — Tom’s commute fill-up', category: 'transport', amount: 42.1, type: 'expense' },
  { date: '2026-11-05', description: 'Riverside Gym — family membership', category: 'health', amount: 39.0, type: 'expense' },
  { date: '2026-11-06', description: 'Paycheck — Maya (Riverbend Clinic)', category: null, amount: 2075.0, type: 'income' },
  { date: '2026-11-06', description: 'Paycheck — Tom (Northline Freight)', category: null, amount: 1800.0, type: 'income' },
  { date: '2026-11-06', description: 'Pasta night — Trattoria Alba', category: 'dining', amount: 64.2, type: 'expense' },
  { date: '2026-11-07', description: 'StreamPlus monthly', category: 'fun', amount: 15.49, type: 'expense' },
  { date: '2026-11-07', description: 'GreenMart weekly shop', category: 'groceries', amount: 96.18, type: 'expense' },
  { date: '2026-11-08', description: 'Leo’s swim lessons — November', category: 'kids', amount: 95.0, type: 'expense' },
  { date: '2026-11-09', description: 'Car insurance — monthly premium', category: 'transport', amount: 148.0, type: 'expense' },
  { date: '2026-11-10', description: 'Pharmacy — June’s allergy refill', category: 'health', amount: 28.4, type: 'expense' },
  { date: '2026-11-10', description: 'Taco truck Tuesday', category: 'dining', amount: 31.75, type: 'expense' },
  { date: '2026-11-11', description: 'GreenMart weekly shop', category: 'groceries', amount: 154.72, type: 'expense' },
  { date: '2026-11-12', description: 'City water — quarterly bill', category: 'utilities', amount: 46.2, type: 'expense' },
  { date: '2026-11-12', description: 'June’s birthday gift — art set', category: 'gifts', amount: 45.0, type: 'expense' },
  { date: '2026-11-13', description: 'Shell — Maya’s fill-up', category: 'transport', amount: 38.75, type: 'expense' },
  { date: '2026-11-13', description: 'Friday pizza — delivery', category: 'dining', amount: 42.9, type: 'expense' },
  { date: '2026-11-14', description: 'Movie night — four tickets', category: 'fun', amount: 46.0, type: 'expense' },
  { date: '2026-11-14', description: 'Hardware store — light bulbs & batteries', category: 'household', amount: 18.75, type: 'expense' },
  { date: '2026-11-15', description: 'Fiber internet — monthly', category: 'utilities', amount: 79.0, type: 'expense' },
  { date: '2026-11-15', description: 'GreenMart weekly shop', category: 'groceries', amount: 88.05, type: 'expense' },
  { date: '2026-11-16', description: 'School book fair — Leo & June', category: 'kids', amount: 42.3, type: 'expense' },
  { date: '2026-11-17', description: 'Bus passes — Maya & Tom', category: 'transport', amount: 96.0, type: 'expense' },
  { date: '2026-11-18', description: 'Dentist copay — Tom’s check-up', category: 'health', amount: 85.0, type: 'expense' },
  { date: '2026-11-18', description: 'GreenMart weekly shop', category: 'groceries', amount: 121.36, type: 'expense' },
  { date: '2026-11-19', description: 'Sushi takeaway — date night', category: 'dining', amount: 58.4, type: 'expense' },
  { date: '2026-11-20', description: 'Paycheck — Maya (Riverbend Clinic)', category: null, amount: 2075.0, type: 'income' },
  { date: '2026-11-20', description: 'Paycheck — Tom (Northline Freight)', category: null, amount: 1800.0, type: 'income' },
  { date: '2026-11-20', description: 'Tom’s winter jacket', category: 'clothing', amount: 89.0, type: 'expense' },
  { date: '2026-11-21', description: 'Board game — Family Game Night', category: 'fun', amount: 32.99, type: 'expense' },
  { date: '2026-11-21', description: 'GreenMart weekly shop', category: 'groceries', amount: 74.9, type: 'expense' },
  { date: '2026-11-22', description: 'Leo’s new trainers', category: 'kids', amount: 68.99, type: 'expense' },
  { date: '2026-11-22', description: 'Gas — heating, November', category: 'utilities', amount: 58.3, type: 'expense' },
  { date: '2026-11-23', description: 'Cleaning supplies & paper goods', category: 'household', amount: 34.2, type: 'expense' },
  { date: '2026-11-23', description: 'Rideshare — airport run for Grandma', category: 'transport', amount: 24.5, type: 'expense' },
  { date: '2026-11-24', description: 'Breakfast café — Saturday treat', category: 'dining', amount: 38.6, type: 'expense' },
  { date: '2026-11-24', description: 'Vitamins & cold medicine', category: 'health', amount: 18.9, type: 'expense' },
  { date: '2026-11-25', description: 'GreenMart — Thanksgiving top-up', category: 'groceries', amount: 58.2, type: 'expense' },
  { date: '2026-11-25', description: 'New bath towels', category: 'household', amount: 42.0, type: 'expense' },
  { date: '2026-11-25', description: 'Flowers for Grandma’s visit', category: 'gifts', amount: 28.0, type: 'expense' },
  { date: '2026-11-26', description: 'Shell — pre-Thanksgiving fill-up', category: 'transport', amount: 45.6, type: 'expense' },
  { date: '2026-11-26', description: 'Bakery — Thanksgiving pies', category: 'dining', amount: 52.15, type: 'expense' },
  { date: '2026-11-26', description: 'MusicStream monthly', category: 'fun', amount: 9.99, type: 'expense' },
];

// Recurring bills: what comes out every month, when, and whether this
// month's one is paid yet.
export const BILLS = [
  { name: 'Rent — Maple Court Apt 4B', amount: 1850.0, dueDay: 1, paid: true },
  { name: 'Riverside Gym — family', amount: 39.0, dueDay: 5, paid: true },
  { name: 'StreamPlus', amount: 15.49, dueDay: 7, paid: true },
  { name: 'Car insurance', amount: 148.0, dueDay: 9, paid: true },
  { name: 'City power', amount: 128.4, dueDay: 12, paid: true },
  { name: 'Fiber internet', amount: 79.0, dueDay: 15, paid: true },
  { name: 'Mobile — two lines', amount: 112.0, dueDay: 21, paid: true },
  { name: 'Trash & recycling', amount: 28.0, dueDay: 25, paid: false },
  { name: 'Leo’s swim lessons', amount: 95.0, dueDay: 26, paid: false },
  { name: 'MusicStream', amount: 9.99, dueDay: 26, paid: false },
];

// Savings goals: what the household is building toward.
export const GOALS = [
  { id: 'emergency', name: 'Emergency fund', target: 10000, saved: 7350, note: 'Six months of rent and groceries, for a rainy day.' },
  { id: 'trip', name: 'Summer road trip', target: 2400, saved: 1150, note: 'Two weeks down the coast, campsites included.' },
  { id: 'car', name: 'Next family car', target: 8000, saved: 2300, note: 'Replace the 2014 wagon before it gives up.' },
  { id: 'college', name: 'College fund — Leo & June', target: 25000, saved: 4800, note: 'A little every month, since they were small.' },
];

// The last five finished months, for the reports page: take-home pay and
// what the household spent. November, the month in progress, is not listed
// here — the reports page takes it live from the ledger, so the chart and
// the dashboard can never disagree.
export const HISTORY = [
  { month: 'Jun', income: 7750, spent: 5980 },
  { month: 'Jul', income: 7750, spent: 6410 },
  { month: 'Aug', income: 7900, spent: 6890 },
  { month: 'Sep', income: 7750, spent: 6120 },
  { month: 'Oct', income: 7750, spent: 6340 },
];
