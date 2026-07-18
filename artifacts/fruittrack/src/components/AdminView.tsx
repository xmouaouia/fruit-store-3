import React, { useState } from 'react';
import { useStore } from '../hooks/useStore';
import { formatDA, formatKg } from '../utils/format';
import { Package, Apple, Plus, AlertTriangle, Trash2, Edit2, Users, DollarSign, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const AdminView: React.FC = () => {
  const { data, addFruit, updateFruit, deleteFruit, addPurchase, resetData, addUser, addExpense } = useStore();
  const { currentUser, users, expenses, sales, wastes } = data;
  const { toast } = useToast();

  const isAdmin = currentUser?.role === 'admin';
  const [activeTab, setActiveTab] = useState<'fruits' | 'restock' | 'expenses' | 'users'>('fruits');

  // Add Fruit State
  const [newFruitName, setNewFruitName] = useState('');
  const [newFruitEmoji, setNewFruitEmoji] = useState('🍎');
  const [newFruitBuy, setNewFruitBuy] = useState('');
  const [newFruitSell, setNewFruitSell] = useState('');

  // Edit Fruit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ name: '', emoji: '', buy: '', sell: '' });

  // Restock State
  const [restockFruitId, setRestockFruitId] = useState('');
  const [restockQty, setRestockQty] = useState('');
  const [restockCost, setRestockCost] = useState('');

  // Expense State
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expensePaidBy, setExpensePaidBy] = useState('');

  // User State
  const [newUserName, setNewUserName] = useState('');

  const handleAddFruit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFruitName || !newFruitEmoji || !newFruitSell) return;
    if (isAdmin && !newFruitBuy) return;

    addFruit({
      name: newFruitName,
      emoji: newFruitEmoji,
      purchasePricePerKg: isAdmin ? parseFloat(newFruitBuy) : 0,
      sellingPricePerKg: parseFloat(newFruitSell),
    });

    setNewFruitName('');
    setNewFruitBuy('');
    setNewFruitSell('');
    toast({ title: "Fruit added", description: `${newFruitEmoji} ${newFruitName} has been added to your inventory.` });
  };

  const startEditing = (fruit: any) => {
    setEditingId(fruit.id);
    setEditData({
      name: fruit.name,
      emoji: fruit.emoji,
      buy: fruit.purchasePricePerKg.toString(),
      sell: fruit.sellingPricePerKg.toString()
    });
  };

  const saveEdit = () => {
    if (editingId) {
      updateFruit(editingId, {
        name: editData.name,
        emoji: editData.emoji,
        purchasePricePerKg: isAdmin ? parseFloat(editData.buy) : 0,
        sellingPricePerKg: parseFloat(editData.sell),
      });
      setEditingId(null);
      toast({ title: "Fruit updated" });
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      deleteFruit(id);
      toast({ title: "Fruit deleted", variant: "destructive" });
    }
  };

  const handleRestock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockFruitId || !restockQty || !restockCost) return;

    const qty = parseFloat(restockQty);
    const cost = parseFloat(restockCost);
    const fruit = data.fruits.find(f => f.id === restockFruitId);

    addPurchase(restockFruitId, qty, cost);
    setRestockQty('');
    
    toast({ 
      title: "Purchase logged", 
      description: `Logged ${qty}kg of ${fruit?.name}`,
      className: "bg-primary text-primary-foreground border-none"
    });
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseDesc || !expenseAmount || !expensePaidBy) return;

    addExpense(expenseDesc, parseFloat(expenseAmount), expensePaidBy);
    setExpenseDesc('');
    setExpenseAmount('');
    setExpensePaidBy('');
    toast({ 
      title: "Expense logged", 
      description: `Logged expense of ${formatDA(parseFloat(expenseAmount))}` 
    });
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName) return;

    addUser(newUserName);
    setNewUserName('');
    toast({ 
      title: "User created", 
      description: `${newUserName} can now log in.` 
    });
  };

  const handleResetData = () => {
    if (window.confirm("WARNING: This will delete ALL sales, purchases, wastage, expenses, and custom fruits, restoring default mock data. Are you absolutely sure?")) {
      resetData();
      toast({ title: "Data reset to defaults", variant: "destructive" });
    }
  };

  const onRestockFruitSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setRestockFruitId(id);
    const fruit = data.fruits.find(f => f.id === id);
    if (fruit) {
      setRestockCost(fruit.purchasePricePerKg.toString());
    }
  };

  const handleExportCSV = (type: 'sales' | 'wastes' | 'expenses') => {
    let csvContent = "";
    let fileName = `fruittrack-${type}-${new Date().toISOString().split('T')[0]}.csv`;
    
    if (type === 'sales') {
      csvContent = "Date,Fruit,Quantity (kg),Price per kg (DA),Total (DA)\n";
      sales.forEach(sale => {
        const fruit = data.fruits.find(f => f.id === sale.fruitId);
        const fruitName = fruit ? fruit.name : "Unknown";
        csvContent += `"${new Date(sale.timestamp).toLocaleString()}","${fruitName}",${sale.quantityKg},${sale.pricePerKg},${sale.total}\n`;
      });
    } else if (type === 'wastes') {
      csvContent = "Date,Fruit,Quantity (kg),Cost per kg (DA),Total Loss (DA)\n";
      wastes.forEach(waste => {
        const fruit = data.fruits.find(f => f.id === waste.fruitId);
        const fruitName = fruit ? fruit.name : "Unknown";
        csvContent += `"${new Date(waste.timestamp).toLocaleString()}","${fruitName}",${waste.quantityKg},${waste.costPerKg},${waste.total}\n`;
      });
    } else if (type === 'expenses') {
      csvContent = "Date,Description,Amount (DA),Paid By\n";
      expenses.forEach(exp => {
        csvContent += `"${new Date(exp.timestamp).toLocaleString()}","${exp.description}",${exp.amount},"${exp.paidBy}"\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "CSV Exported", description: `Downloaded ${fileName}` });
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto animate-in fade-in duration-300">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Admin & Inventory</h1>
        <p className="text-muted-foreground mt-1">
          {isAdmin ? 'Manage your store products, restocking, users, and business expenses.' : 'Add and view store products.'}
        </p>
      </header>

      {isAdmin && (
        <div className="flex bg-muted/50 p-1 rounded-xl mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('fruits')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all shrink-0 ${
              activeTab === 'fruits' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <Apple className="w-5 h-5" /> Manage Fruits
          </button>
          <button
            onClick={() => setActiveTab('restock')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all shrink-0 ${
              activeTab === 'restock' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <Package className="w-5 h-5" /> Log Purchase (Restock)
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all shrink-0 ${
              activeTab === 'expenses' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <DollarSign className="w-5 h-5" /> Expenses
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all shrink-0 ${
              activeTab === 'users' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <Users className="w-5 h-5" /> User Management
          </button>
        </div>
      )}

      {activeTab === 'fruits' && (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" /> Add New Fruit
            </h2>
            <form onSubmit={handleAddFruit} className={`grid grid-cols-1 md:grid-cols-2 ${isAdmin ? 'lg:grid-cols-5' : 'lg:grid-cols-4'} gap-4`}>
              <div className="lg:col-span-2">
                <label className="block text-xs font-medium text-muted-foreground mb-1">Name</label>
                <input required value={newFruitName} onChange={e => setNewFruitName(e.target.value)} type="text" className="w-full bg-background border border-input rounded-xl px-4 py-3 text-foreground" placeholder="e.g. Strawberry" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Emoji</label>
                <input required value={newFruitEmoji} onChange={e => setNewFruitEmoji(e.target.value)} type="text" className="w-full bg-background border border-input rounded-xl px-4 py-3 text-center text-xl" placeholder="🍓" />
              </div>
              {isAdmin && (
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Buy Price (DA/kg)</label>
                  <input required={isAdmin} value={newFruitBuy} onChange={e => setNewFruitBuy(e.target.value)} type="number" step="any" min="0" className="w-full bg-background border border-input rounded-xl px-4 py-3" placeholder="150" />
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Sell Price (DA/kg)</label>
                <input required value={newFruitSell} onChange={e => setNewFruitSell(e.target.value)} type="number" step="any" min="0" className="w-full bg-background border border-input rounded-xl px-4 py-3" placeholder="250" />
              </div>
              <div className={`md:col-span-2 ${isAdmin ? 'lg:col-span-5' : 'lg:col-span-4'} pt-2`}>
                <button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 rounded-xl shadow-sm transition-all">
                  Add Product
                </button>
              </div>
            </form>
          </div>

          <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-muted/50 text-muted-foreground text-sm uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Fruit</th>
                    {isAdmin && <th className="px-6 py-4 font-semibold">Buy (DA/kg)</th>}
                    <th className="px-6 py-4 font-semibold">Sell (DA/kg)</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.fruits.map(fruit => (
                    <tr key={fruit.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        {editingId === fruit.id ? (
                          <div className="flex gap-2">
                            <input value={editData.emoji} onChange={e => setEditData({...editData, emoji: e.target.value})} className="w-12 border border-input rounded-md px-2 py-1 text-center" />
                            <input value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} className="flex-1 border border-input rounded-md px-2 py-1" />
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <span className="text-2xl bg-muted w-10 h-10 rounded-full flex items-center justify-center">{fruit.emoji}</span>
                            <span className="font-bold text-foreground">{fruit.name}</span>
                          </div>
                        )}
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 font-medium text-muted-foreground">
                          {editingId === fruit.id ? (
                            <input type="number" value={editData.buy} onChange={e => setEditData({...editData, buy: e.target.value})} className="w-24 border border-input rounded-md px-2 py-1" />
                          ) : formatDA(fruit.purchasePricePerKg)}
                        </td>
                      )}
                      <td className="px-6 py-4 font-medium text-foreground">
                        {editingId === fruit.id ? (
                          <input type="number" value={editData.sell} onChange={e => setEditData({...editData, sell: e.target.value})} className="w-24 border border-input rounded-md px-2 py-1" />
                        ) : formatDA(fruit.sellingPricePerKg)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {editingId === fruit.id ? (
                          <div className="flex justify-end gap-2">
                            <button onClick={() => setEditingId(null)} className="px-3 py-1 bg-muted text-muted-foreground rounded-md text-sm font-medium">Cancel</button>
                            <button onClick={saveEdit} className="px-3 py-1 bg-primary text-primary-foreground rounded-md text-sm font-bold">Save</button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-2">
                            <button onClick={() => startEditing(fruit)} className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(fruit.id, fruit.name)} className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {data.fruits.length === 0 && (
                    <tr><td colSpan={isAdmin ? 4 : 3} className="px-6 py-8 text-center text-muted-foreground">No fruits added yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {isAdmin && activeTab === 'restock' && (
        <div className="space-y-8 animate-in slide-in-from-left-4 duration-300">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-foreground mb-4">Log Incoming Stock</h2>
            <form onSubmit={handleRestock} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Select Fruit</label>
                <select required value={restockFruitId} onChange={onRestockFruitSelect} className="w-full bg-background border border-input rounded-xl px-4 py-3 text-foreground appearance-none">
                  <option value="" disabled>Choose fruit...</option>
                  {data.fruits.map(f => <option key={f.id} value={f.id}>{f.emoji} {f.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Weight Received (kg)</label>
                <input required type="number" step="any" min="0" value={restockQty} onChange={e => setRestockQty(e.target.value)} className="w-full bg-background border border-input rounded-xl px-4 py-3" placeholder="e.g. 50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Cost (DA/kg)</label>
                <input required type="number" step="any" min="0" value={restockCost} onChange={e => setRestockCost(e.target.value)} className="w-full bg-background border border-input rounded-xl px-4 py-3" placeholder="e.g. 150" />
              </div>
              
              <div className="md:col-span-3 mt-2 flex items-center justify-between p-4 bg-muted rounded-xl">
                <span className="font-medium text-muted-foreground">Total Cost:</span>
                <span className="text-2xl font-bold text-foreground">
                  {formatDA((parseFloat(restockQty) || 0) * (parseFloat(restockCost) || 0))}
                </span>
              </div>
              
              <div className="md:col-span-3 pt-2">
                <button type="submit" disabled={!restockFruitId || !restockQty || !restockCost} className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold py-4 rounded-xl shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg">
                  Log Purchase
                </button>
              </div>
            </form>
          </div>

          <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-muted/30">
              <h3 className="font-bold text-foreground">Recent Purchases (Restocks)</h3>
            </div>
            <div className="divide-y divide-border">
              {data.purchases.slice(0, 20).map(purchase => {
                const fruit = data.fruits.find(f => f.id === purchase.fruitId);
                return (
                  <div key={purchase.id} className="p-4 px-6 flex items-center justify-between hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl bg-muted w-12 h-12 rounded-full flex items-center justify-center">
                        {fruit?.emoji || '📦'}
                      </div>
                      <div>
                        <p className="font-bold text-foreground">{fruit?.name || 'Unknown Item'}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatKg(purchase.quantityKg)} at {formatDA(purchase.costPerKg)}/kg
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground text-lg">{formatDA(purchase.total)}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(purchase.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })}
              {data.purchases.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">No purchases logged yet.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {isAdmin && activeTab === 'expenses' && (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" /> Log Expense
            </h2>
            <form onSubmit={handleAddExpense} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Description</label>
                <input required value={expenseDesc} onChange={e => setExpenseDesc(e.target.value)} type="text" className="w-full bg-background border border-input rounded-xl px-4 py-3 text-foreground" placeholder="e.g. Fuel, packaging bags" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Amount (DA)</label>
                <input required value={expenseAmount} onChange={e => setExpenseAmount(e.target.value)} type="number" min="0" className="w-full bg-background border border-input rounded-xl px-4 py-3" placeholder="e.g. 1500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Paid By</label>
                <select required value={expensePaidBy} onChange={e => setExpensePaidBy(e.target.value)} className="w-full bg-background border border-input rounded-xl px-4 py-3 text-foreground appearance-none">
                  <option value="" disabled>Select payer...</option>
                  {users.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                </select>
              </div>
              <div className="md:col-span-3 pt-2">
                <button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3.5 rounded-xl shadow-sm transition-all">
                  Log Expense
                </button>
              </div>
            </form>
          </div>

          <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-muted/30">
              <h3 className="font-bold text-foreground">Expense Logs</h3>
            </div>
            <div className="divide-y divide-border">
              {expenses.map(expense => (
                <div key={expense.id} className="p-4 px-6 flex items-center justify-between hover:bg-muted/30 transition-colors">
                  <div>
                    <p className="font-bold text-foreground">{expense.description}</p>
                    <p className="text-sm text-muted-foreground">Paid by: <span className="font-medium text-foreground">{expense.paidBy}</span></p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-destructive text-lg">{formatDA(expense.amount)}</p>
                    <p className="text-xs text-muted-foreground mt-1">{new Date(expense.timestamp).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
              {expenses.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">No expenses logged yet.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {isAdmin && activeTab === 'users' && (
        <div className="space-y-8 animate-in slide-in-from-left-4 duration-300">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" /> Add New User
            </h2>
            <form onSubmit={handleAddUser} className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-xs font-medium text-muted-foreground mb-1">Name</label>
                <input required value={newUserName} onChange={e => setNewUserName(e.target.value)} type="text" className="w-full bg-background border border-input rounded-xl px-4 py-3 text-foreground" placeholder="e.g. Mourad" />
              </div>
              <button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 py-3.5 rounded-xl shadow-sm transition-all shrink-0">
                Create User
              </button>
            </form>
          </div>

          <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-muted/30">
              <h3 className="font-bold text-foreground">Registered Users</h3>
            </div>
            <div className="divide-y divide-border">
              {users.map(u => (
                <div key={u.id} className="p-4 px-6 flex items-center justify-between hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                      {u.name[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{u.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{u.role === 'admin' ? 'Owner' : 'Staff'}</p>
                    </div>
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full font-bold bg-muted text-muted-foreground border border-border">
                    {u.role === 'admin' ? 'Owner' : 'Staff'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CSV Data Export Section */}
      {isAdmin && (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm mt-8">
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Download className="w-5 h-5 text-primary" /> Export Reports
          </h2>
          <p className="text-muted-foreground text-sm mb-4">Download your current sales, wastage, and expense logs as CSV files for spreadsheet software.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => handleExportCSV('sales')}
              className="py-3 px-4 bg-muted hover:bg-primary hover:text-white rounded-xl font-bold text-sm text-foreground flex items-center justify-center gap-2 transition-all active:scale-95 border border-border"
            >
              <Download className="w-4 h-4" /> Download Sales CSV
            </button>
            <button
              onClick={() => handleExportCSV('wastes')}
              className="py-3 px-4 bg-muted hover:bg-destructive hover:text-white rounded-xl font-bold text-sm text-foreground flex items-center justify-center gap-2 transition-all active:scale-95 border border-border"
            >
              <Download className="w-4 h-4" /> Download Wastage CSV
            </button>
            <button
              onClick={() => handleExportCSV('expenses')}
              className="py-3 px-4 bg-muted hover:bg-secondary hover:text-white rounded-xl font-bold text-sm text-foreground flex items-center justify-center gap-2 transition-all active:scale-95 border border-border"
            >
              <Download className="w-4 h-4" /> Download Expenses CSV
            </button>
          </div>
        </div>
      )}

      {isAdmin && (
        <div className="mt-12 pt-8 border-t border-border">
          <button 
            onClick={handleResetData}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-destructive bg-destructive/10 hover:bg-destructive hover:text-destructive-foreground font-bold transition-all"
          >
            <AlertTriangle className="w-5 h-5" /> Reset All App Data
          </button>
          <p className="text-center text-xs text-muted-foreground mt-3">
            This action cannot be undone. Useful for testing or wiping old data.
          </p>
        </div>
      )}
    </div>
  );
};

