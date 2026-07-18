export type Fruit = {
  id: string;
  name: string;
  emoji: string;
  purchasePricePerKg: number;
  sellingPricePerKg: number;
};

export type Sale = {
  id: string;
  fruitId: string;
  quantityKg: number;
  pricePerKg: number;
  total: number;
  timestamp: string;
};

export type Purchase = {
  id: string;
  fruitId: string;
  quantityKg: number;
  costPerKg: number;
  total: number;
  timestamp: string;
};

export type User = {
  id: string;
  name: string;
  role: 'admin' | 'user';
};

export type Waste = {
  id: string;
  fruitId: string;
  quantityKg: number;
  costPerKg: number;
  total: number;
  timestamp: string;
};

export type Expense = {
  id: string;
  description: string;
  amount: number;
  paidBy: string;
  timestamp: string;
};

export type FruitTrackData = {
  fruits: Fruit[];
  sales: Sale[];
  purchases: Purchase[];
  wastes: Waste[];
  expenses: Expense[];
  users: User[];
  currentUser: User | null;
  shiftStartTimestamp: string;
};

export const DEFAULT_FRUITS: Fruit[] = [
  { id: crypto.randomUUID(), name: 'Apple', emoji: '🍎', purchasePricePerKg: 180, sellingPricePerKg: 250 },
  { id: crypto.randomUUID(), name: 'Banana', emoji: '🍌', purchasePricePerKg: 120, sellingPricePerKg: 180 },
  { id: crypto.randomUUID(), name: 'Orange', emoji: '🍊', purchasePricePerKg: 100, sellingPricePerKg: 160 },
  { id: crypto.randomUUID(), name: 'Mango', emoji: '🥭', purchasePricePerKg: 350, sellingPricePerKg: 500 },
  { id: crypto.randomUUID(), name: 'Grapes', emoji: '🍇', purchasePricePerKg: 200, sellingPricePerKg: 300 },
  { id: crypto.randomUUID(), name: 'Watermelon', emoji: '🍉', purchasePricePerKg: 60, sellingPricePerKg: 100 },
];

export const generateSeedData = (): FruitTrackData => {
  const fruits = [...DEFAULT_FRUITS];
  const sales: Sale[] = [];
  const purchases: Purchase[] = [];
  const wastes: Waste[] = [];
  const expenses: Expense[] = [];
  
  const now = new Date();

  const users: User[] = [
    { id: 'admin-xmouaouia', name: 'xmouaouia', role: 'admin' },
    { id: 'user-amine', name: 'Amine', role: 'user' },
    { id: 'user-sofiane', name: 'Sofiane', role: 'user' },
  ];
  
  // Generate 15 recent sales
  for (let i = 0; i < 15; i++) {
    const randomDaysAgo = Math.floor(Math.random() * 7);
    const randomHoursAgo = Math.floor(Math.random() * 24);
    const date = new Date(now);
    date.setDate(date.getDate() - randomDaysAgo);
    date.setHours(date.getHours() - randomHoursAgo);
    
    const fruit = fruits[Math.floor(Math.random() * fruits.length)];
    const qty = parseFloat((Math.random() * 4.5 + 0.5).toFixed(2));
    
    sales.push({
      id: crypto.randomUUID(),
      fruitId: fruit.id,
      quantityKg: qty,
      pricePerKg: fruit.sellingPricePerKg,
      total: Math.round(qty * fruit.sellingPricePerKg),
      timestamp: date.toISOString(),
    });
  }
  
  // Sort sales newest first
  sales.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  // Generate 5 recent purchases
  for (let i = 0; i < 5; i++) {
    const randomDaysAgo = Math.floor(Math.random() * 7);
    const date = new Date(now);
    date.setDate(date.getDate() - randomDaysAgo);
    date.setHours(6, 30, 0, 0); // Usually restock in the morning
    
    const fruit = fruits[Math.floor(Math.random() * fruits.length)];
    const qty = parseFloat((Math.random() * 40 + 10).toFixed(2));
    
    purchases.push({
      id: crypto.randomUUID(),
      fruitId: fruit.id,
      quantityKg: qty,
      costPerKg: fruit.purchasePricePerKg,
      total: Math.round(qty * fruit.purchasePricePerKg),
      timestamp: date.toISOString(),
    });
  }

  // Generate 3 recent wastes
  for (let i = 0; i < 3; i++) {
    const randomDaysAgo = Math.floor(Math.random() * 5);
    const date = new Date(now);
    date.setDate(date.getDate() - randomDaysAgo);
    
    const fruit = fruits[Math.floor(Math.random() * fruits.length)];
    const qty = parseFloat((Math.random() * 2 + 0.5).toFixed(2));
    wastes.push({
      id: crypto.randomUUID(),
      fruitId: fruit.id,
      quantityKg: qty,
      costPerKg: fruit.purchasePricePerKg,
      total: Math.round(qty * fruit.purchasePricePerKg),
      timestamp: date.toISOString(),
    });
  }

  // Generate 2 recent expenses
  expenses.push({
    id: crypto.randomUUID(),
    description: 'Transport box delivery',
    amount: 1500,
    paidBy: 'xmouaouia',
    timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  });
  expenses.push({
    id: crypto.randomUUID(),
    description: 'Paper packaging bags',
    amount: 800,
    paidBy: 'Amine',
    timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  });
  
  // Sort purchases newest first
  purchases.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return { 
    fruits, 
    sales, 
    purchases, 
    wastes, 
    expenses, 
    users, 
    currentUser: null, 
    shiftStartTimestamp: now.toISOString() 
  };
};

