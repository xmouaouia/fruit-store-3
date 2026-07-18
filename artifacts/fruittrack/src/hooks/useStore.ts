import { useState, useEffect, useCallback } from 'react';
import { FruitTrackData, Fruit, Sale, Purchase, User, Waste, Expense, generateSeedData } from '../utils/seedData';

const STORAGE_KEY = 'fruittrack_data';

export const useStore = () => {
  const [data, setData] = useState<FruitTrackData>({
    fruits: [],
    sales: [],
    purchases: [],
    wastes: [],
    expenses: [],
    users: [],
    currentUser: null,
    shiftStartTimestamp: new Date().toISOString(),
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setData(JSON.parse(stored));
      } else {
        const seed = generateSeedData();
        setData(seed);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      }
    } catch (e) {
      console.error("Failed to load store data", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [data, isLoaded]);

  const addSale = useCallback((fruitId: string, quantityKg: number, pricePerKg: number) => {
    const total = Math.round(quantityKg * pricePerKg);
    const newSale: Sale = {
      id: crypto.randomUUID(),
      fruitId,
      quantityKg,
      pricePerKg,
      total,
      timestamp: new Date().toISOString(),
    };
    
    setData(prev => ({
      ...prev,
      sales: [newSale, ...prev.sales],
    }));
    
    return newSale;
  }, []);

  const addPurchase = useCallback((fruitId: string, quantityKg: number, costPerKg: number) => {
    const total = Math.round(quantityKg * costPerKg);
    const newPurchase: Purchase = {
      id: crypto.randomUUID(),
      fruitId,
      quantityKg,
      costPerKg,
      total,
      timestamp: new Date().toISOString(),
    };
    
    setData(prev => ({
      ...prev,
      purchases: [newPurchase, ...prev.purchases],
    }));
    
    return newPurchase;
  }, []);

  const addFruit = useCallback((fruit: Omit<Fruit, 'id'>) => {
    const newFruit: Fruit = {
      ...fruit,
      id: crypto.randomUUID(),
    };
    setData(prev => ({
      ...prev,
      fruits: [...prev.fruits, newFruit],
    }));
  }, []);

  const updateFruit = useCallback((id: string, updates: Partial<Fruit>) => {
    setData(prev => ({
      ...prev,
      fruits: prev.fruits.map(f => f.id === id ? { ...f, ...updates } : f),
    }));
  }, []);

  const deleteFruit = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      fruits: prev.fruits.filter(f => f.id !== id),
    }));
  }, []);

  const resetData = useCallback(() => {
    const seed = generateSeedData();
    setData(seed);
  }, []);

  const setCurrentUser = useCallback((user: User | null) => {
    setData(prev => ({
      ...prev,
      currentUser: user,
    }));
  }, []);

  const addUser = useCallback((name: string) => {
    const newUser: User = {
      id: crypto.randomUUID(),
      name,
      role: 'user',
    };
    setData(prev => ({
      ...prev,
      users: [...prev.users, newUser],
    }));
    return newUser;
  }, []);

  const addWaste = useCallback((fruitId: string, quantityKg: number) => {
    const fruit = data.fruits.find(f => f.id === fruitId);
    const costPerKg = fruit ? fruit.purchasePricePerKg : 0;
    const total = Math.round(quantityKg * costPerKg);
    const newWaste: Waste = {
      id: crypto.randomUUID(),
      fruitId,
      quantityKg,
      costPerKg,
      total,
      timestamp: new Date().toISOString(),
    };
    setData(prev => ({
      ...prev,
      wastes: [newWaste, ...prev.wastes],
    }));
    return newWaste;
  }, [data.fruits]);

  const addExpense = useCallback((description: string, amount: number, paidBy: string) => {
    const newExpense: Expense = {
      id: crypto.randomUUID(),
      description,
      amount,
      paidBy,
      timestamp: new Date().toISOString(),
    };
    setData(prev => ({
      ...prev,
      expenses: [newExpense, ...prev.expenses],
    }));
    return newExpense;
  }, []);

  const resetShift = useCallback(() => {
    const now = new Date().toISOString();
    setData(prev => ({
      ...prev,
      shiftStartTimestamp: now,
    }));
  }, []);

  return {
    data,
    isLoaded,
    addSale,
    addPurchase,
    addFruit,
    updateFruit,
    deleteFruit,
    resetData,
    setCurrentUser,
    addUser,
    addWaste,
    addExpense,
    resetShift,
  };
};

