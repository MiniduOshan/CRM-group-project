import { useMemo, useState, type FormEvent } from 'react';
import {
  Plus,
  Search,
  Package,
  ArrowDownCircle,
  AlertTriangle,
  History,
  Wallet,
  Pencil,
  X
} from 'lucide-react';
import { motion } from 'motion/react';
import type { GRNRecord, InventoryItem, PurchasePayment, StockHistoryEntry } from '../types';

interface InventoryProps {
  inventoryItems: InventoryItem[];
  grnRecords: GRNRecord[];
  purchasePayments: PurchasePayment[];
  stockHistory: StockHistoryEntry[];
  onRegisterItem: (input: {
    name: string;
    category: string;
    unit: string;
    costPrice: number;
    sellingPrice: number;
    openingStock: number;
    minimumStockLevel: number;
    sourceType: 'GRN' | 'DIRECT';
  }) => void;
  onUpdateItemPricing: (input: { itemId: string; sellingPrice: number; costPrice: number; minimumStockLevel: number }) => void;
  onCreateGrn: (input: { supplierName: string; inventoryItemId: string; quantity: number; costPrice: number }) => void;
  onAddPurchasePayment: (input: {
    grnId: string;
    supplierName: string;
    amount: number;
    paymentMethod: 'Cash' | 'Bank Transfer' | 'Cheque';
    reference: string;
  }) => void;
}

export default function Inventory({
  inventoryItems,
  grnRecords,
  purchasePayments,
  stockHistory,
  onRegisterItem,
  onUpdateItemPricing,
  onCreateGrn,
  onAddPurchasePayment
}: InventoryProps) {
  type DialogKey = 'register-item' | 'create-grn' | 'supplier-payment' | 'edit-item';

  const [search, setSearch] = useState('');
  const [activeDialog, setActiveDialog] = useState<DialogKey | null>(null);

  const [itemForm, setItemForm] = useState({
    name: '',
    category: 'Hardware',
    unit: 'Pieces',
    costPrice: '0',
    sellingPrice: '0',
    openingStock: '0',
    minimumStockLevel: '5',
    sourceType: 'DIRECT' as 'GRN' | 'DIRECT'
  });

  const [updateForm, setUpdateForm] = useState({
    itemId: '',
    costPrice: '0',
    sellingPrice: '0',
    minimumStockLevel: '5'
  });

  const [grnForm, setGrnForm] = useState({
    supplierName: '',
    inventoryItemId: '',
    quantity: '1',
    costPrice: '0'
  });

  const [paymentForm, setPaymentForm] = useState({
    grnId: '',
    supplierName: '',
    amount: '0',
    paymentMethod: 'Bank Transfer' as 'Cash' | 'Bank Transfer' | 'Cheque',
    reference: ''
  });

  const filteredItems = inventoryItems.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase())
  );

  const lowStockCount = useMemo(
    () => inventoryItems.filter((item) => item.stockLevel <= (item.minimumStockLevel ?? 5)).length,
    [inventoryItems]
  );

  const totalGrnValue = useMemo(
    () => grnRecords.reduce((sum, record) => sum + record.totalAmount, 0),
    [grnRecords]
  );

  const totalPaid = useMemo(
    () => purchasePayments.reduce((sum, payment) => sum + payment.amount, 0),
    [purchasePayments]
  );

  const handleCreateItem = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onRegisterItem({
      name: itemForm.name,
      category: itemForm.category,
      unit: itemForm.unit,
      costPrice: Number(itemForm.costPrice) || 0,
      sellingPrice: Number(itemForm.sellingPrice) || 0,
      openingStock: Number(itemForm.openingStock) || 0,
      minimumStockLevel: Number(itemForm.minimumStockLevel) || 0,
      sourceType: itemForm.sourceType
    });
    setItemForm({
      name: '',
      category: 'Hardware',
      unit: 'Pieces',
      costPrice: '0',
      sellingPrice: '0',
      openingStock: '0',
      minimumStockLevel: '5',
      sourceType: 'DIRECT'
    });
    setActiveDialog(null);
  };

  const selectedUpdateItem = inventoryItems.find((item) => item.id === updateForm.itemId);
  const isCostLocked = selectedUpdateItem ? selectedUpdateItem.sourceType === 'GRN' || Boolean(selectedUpdateItem.lastGrnId) : false;

  const handleSelectUpdateItem = (itemId: string) => {
    const item = inventoryItems.find((entry) => entry.id === itemId);
    if (!item) {
      setUpdateForm({ itemId: '', costPrice: '0', sellingPrice: '0', minimumStockLevel: '5' });
      return;
    }

    setUpdateForm({
      itemId,
      costPrice: String(item.costPrice),
      sellingPrice: String(item.sellingPrice),
      minimumStockLevel: String(item.minimumStockLevel ?? 5)
    });
  };

  const handleUpdateItemPricing = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!updateForm.itemId) {
      return;
    }

    onUpdateItemPricing({
      itemId: updateForm.itemId,
      costPrice: Number(updateForm.costPrice) || 0,
      sellingPrice: Number(updateForm.sellingPrice) || 0,
      minimumStockLevel: Number(updateForm.minimumStockLevel) || 0
    });
    setActiveDialog(null);
  };

  const handleCreateGrn = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!grnForm.inventoryItemId) {
      return;
    }
    onCreateGrn({
      supplierName: grnForm.supplierName,
      inventoryItemId: grnForm.inventoryItemId,
      quantity: Math.max(1, Number(grnForm.quantity) || 1),
      costPrice: Math.max(0, Number(grnForm.costPrice) || 0)
    });
    setGrnForm({
      supplierName: '',
      inventoryItemId: '',
      quantity: '1',
      costPrice: '0'
    });
    setActiveDialog(null);
  };

  const handleAddPayment = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!paymentForm.grnId) {
      return;
    }
    onAddPurchasePayment({
      grnId: paymentForm.grnId,
      supplierName: paymentForm.supplierName,
      amount: Math.max(0, Number(paymentForm.amount) || 0),
      paymentMethod: paymentForm.paymentMethod,
      reference: paymentForm.reference
    });
    setPaymentForm({
      grnId: '',
      supplierName: '',
      amount: '0',
      paymentMethod: 'Bank Transfer',
      reference: ''
    });
    setActiveDialog(null);
  };

  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-6">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black tracking-tight text-brand-ink">Inventory & Stock</h2>
          <p className="text-brand-text text-sm font-medium mt-1">Item registration, GRN intake, and supplier payments in one place.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <button
            onClick={() => setActiveDialog('register-item')}
            className="btn-primary"
          >
            Register Item
          </button>
          <button
            onClick={() => setActiveDialog('create-grn')}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-600 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            Create GRN (Stock In)
          </button>
          <button
            onClick={() => setActiveDialog('supplier-payment')}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-600 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            Supplier Payment
          </button>
        </div>
      </header>

      {activeDialog && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[1px] flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white rounded-2xl border border-brand-line shadow-2xl">
            <div className="p-4 border-b border-brand-line flex items-center justify-between">
              <h3 className="text-sm font-bold tracking-wide">
                {activeDialog === 'register-item' && 'Register Item'}
                {activeDialog === 'create-grn' && 'Create GRN (Stock In)'}
                {activeDialog === 'supplier-payment' && 'Supplier Payment'}
                {activeDialog === 'edit-item' && 'Edit Item Pricing'}
              </h3>
              <button onClick={() => setActiveDialog(null)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            {activeDialog === 'register-item' && (
              <form onSubmit={handleCreateItem} className="p-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                  <input required value={itemForm.name} onChange={(e) => setItemForm((p) => ({ ...p, name: e.target.value }))} placeholder="Item name" className="input-field !py-2.5 w-full" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <input required value={itemForm.category} onChange={(e) => setItemForm((p) => ({ ...p, category: e.target.value }))} placeholder="Category" className="input-field !py-2.5 w-full" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                    <input required value={itemForm.unit} onChange={(e) => setItemForm((p) => ({ ...p, unit: e.target.value }))} placeholder="Unit" className="input-field !py-2.5 w-full" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cost Price</label>
                    <input type="number" min="0" step="0.01" value={itemForm.costPrice} onChange={(e) => setItemForm((p) => ({ ...p, costPrice: e.target.value }))} className="input-field !py-2.5 w-full" placeholder="Cost" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price</label>
                    <input type="number" min="0" step="0.01" value={itemForm.sellingPrice} onChange={(e) => setItemForm((p) => ({ ...p, sellingPrice: e.target.value }))} className="input-field !py-2.5 w-full" placeholder="Sell" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Opening Stock</label>
                    <input type="number" min="0" value={itemForm.openingStock} onChange={(e) => setItemForm((p) => ({ ...p, openingStock: e.target.value }))} className="input-field !py-2.5 w-full" placeholder="Stock" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Stock Level</label>
                  <input type="number" min="0" value={itemForm.minimumStockLevel} onChange={(e) => setItemForm((p) => ({ ...p, minimumStockLevel: e.target.value }))} className="input-field !py-2.5 w-full" placeholder="Minimum stock level" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Item Type</label>
                  <select value={itemForm.sourceType} onChange={(e) => setItemForm((p) => ({ ...p, sourceType: e.target.value as 'GRN' | 'DIRECT' }))} className="input-field !py-2.5 w-full">
                    <option value="DIRECT">Direct / Service Item</option>
                    <option value="GRN">GRN Linked Item</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setActiveDialog(null)} className="btn-secondary">Cancel</button>
                  <button type="submit" className="btn-primary">Save Item</button>
                </div>
              </form>
            )}

            {activeDialog === 'create-grn' && (
              <form onSubmit={handleCreateGrn} className="p-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Name</label>
                  <input required value={grnForm.supplierName} onChange={(e) => setGrnForm((p) => ({ ...p, supplierName: e.target.value }))} placeholder="Supplier name" className="input-field !py-2.5 w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Inventory Item</label>
                  <select required value={grnForm.inventoryItemId} onChange={(e) => setGrnForm((p) => ({ ...p, inventoryItemId: e.target.value }))} className="input-field !py-2.5 w-full">
                    <option value="">Select item</option>
                    {inventoryItems.map((item) => (
                      <option key={item.id} value={item.id}>{item.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                    <input type="number" min="1" value={grnForm.quantity} onChange={(e) => setGrnForm((p) => ({ ...p, quantity: e.target.value }))} className="input-field !py-2.5 w-full" placeholder="Qty" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cost Price</label>
                    <input type="number" min="0" step="0.01" value={grnForm.costPrice} onChange={(e) => setGrnForm((p) => ({ ...p, costPrice: e.target.value }))} className="input-field !py-2.5 w-full" placeholder="Cost price" />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setActiveDialog(null)} className="btn-secondary">Cancel</button>
                  <button type="submit" className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold shadow-md hover:bg-emerald-700 active:scale-[0.98] transition-all">Post GRN</button>
                </div>
              </form>
            )}

            {activeDialog === 'supplier-payment' && (
              <form onSubmit={handleAddPayment} className="p-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select GRN</label>
                  <select required value={paymentForm.grnId} onChange={(e) => {
                    const selected = grnRecords.find((record) => record.id === e.target.value);
                    setPaymentForm((prev) => ({ ...prev, grnId: e.target.value, supplierName: selected?.supplierName ?? prev.supplierName }));
                  }} className="input-field !py-2.5 w-full">
                    <option value="">Select GRN</option>
                    {grnRecords.map((record) => (
                      <option key={record.id} value={record.id}>{record.id} - {record.supplierName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                  <input required value={paymentForm.supplierName} onChange={(e) => setPaymentForm((p) => ({ ...p, supplierName: e.target.value }))} placeholder="Supplier" className="input-field !py-2.5 w-full" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                    <input type="number" min="0" step="0.01" value={paymentForm.amount} onChange={(e) => setPaymentForm((p) => ({ ...p, amount: e.target.value }))} className="input-field !py-2.5 w-full" placeholder="Amount" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                    <select value={paymentForm.paymentMethod} onChange={(e) => setPaymentForm((p) => ({ ...p, paymentMethod: e.target.value as 'Cash' | 'Bank Transfer' | 'Cheque' }))} className="input-field !py-2.5 w-full">
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Cash">Cash</option>
                      <option value="Cheque">Cheque</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reference</label>
                  <input value={paymentForm.reference} onChange={(e) => setPaymentForm((p) => ({ ...p, reference: e.target.value }))} placeholder="Reference" className="input-field !py-2.5 w-full" />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setActiveDialog(null)} className="btn-secondary">Cancel</button>
                  <button type="submit" className="px-5 py-2.5 rounded-xl bg-amber-600 text-white text-sm font-bold shadow-md hover:bg-amber-700 active:scale-[0.98] transition-all">Record Payment</button>
                </div>
              </form>
            )}

            {activeDialog === 'edit-item' && (
              <form onSubmit={handleUpdateItemPricing} className="p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cost Price</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={updateForm.costPrice}
                      disabled={isCostLocked}
                      onChange={(e) => setUpdateForm((p) => ({ ...p, costPrice: e.target.value }))}
                      className="input-field !py-2.5 w-full disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                      placeholder="Cost price"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={updateForm.sellingPrice}
                      onChange={(e) => setUpdateForm((p) => ({ ...p, sellingPrice: e.target.value }))}
                      className="input-field !py-2.5 w-full"
                      placeholder="Selling price"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Stock Level</label>
                    <input
                      type="number"
                      min="0"
                      value={updateForm.minimumStockLevel}
                      onChange={(e) => setUpdateForm((p) => ({ ...p, minimumStockLevel: e.target.value }))}
                      className="input-field !py-2.5 w-full"
                      placeholder="Minimum stock"
                    />
                  </div>
                </div>
                {isCostLocked && (
                  <p className="text-xs text-amber-700">Cost price editing is disabled because this item is linked to GRN.</p>
                )}
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setActiveDialog(null)} className="btn-secondary">Cancel</button>
                  <button type="submit" className="px-5 py-2.5 rounded-xl bg-brand-ink text-white text-sm font-bold shadow-md hover:bg-brand-ink/90 active:scale-[0.98] transition-all">Update Item</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="card flex items-center gap-4 hover:shadow-elevated transition-shadow">
          <div className="p-3 bg-brand-accent/10 rounded-2xl text-brand-accent">
            <Package size={24} />
          </div>
          <div>
            <p className="text-xs text-brand-text font-black uppercase tracking-[0.1em]">Total Items</p>
            <p className="text-2xl font-black text-brand-ink mt-0.5">{inventoryItems.length}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4 hover:shadow-elevated transition-shadow">
          <div className="p-3 bg-red-500/10 rounded-2xl text-red-600">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-xs text-brand-text font-black uppercase tracking-[0.1em]">Low Stock Alerts</p>
            <p className="text-2xl font-black text-brand-ink mt-0.5">{lowStockCount}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4 hover:shadow-elevated transition-shadow">
          <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-600">
            <History size={24} />
          </div>
          <div>
            <p className="text-xs text-brand-text font-black uppercase tracking-[0.1em]">Recent GRNs</p>
            <p className="text-2xl font-black text-brand-ink mt-0.5">{grnRecords.length}</p>
          </div>
        </div>
      </div>

      <div className="card !p-4 flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search inventory..."
            className="input-field pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="data-grid w-full">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr>
                <th className="data-header">Item Name</th>
                <th className="data-header">Category</th>
                <th className="data-header text-right">Cost Price</th>
                <th className="data-header text-right">Selling Price</th>
                <th className="data-header text-right">Profit / Unit</th>
                <th className="data-header text-center">Stock Level</th>
                <th className="data-header text-center">Min Stock</th>
                <th className="data-header">Unit</th>
                <th className="data-header text-center">Edit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-line">
              {filteredItems.map((item) => (
                <tr key={item.id} className="data-row">
                  <td className="data-cell">
                    <p className="text-sm font-bold text-brand-ink">{item.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono tracking-tight mt-0.5">{item.id}</p>
                  </td>
                  <td className="data-cell">
                    <span className="px-2.5 py-1 bg-brand-subtle text-brand-text text-[10px] font-bold rounded-md uppercase tracking-wide">
                      {item.category}
                    </span>
                  </td>
                  <td className="data-cell text-right">
                    <p className="mono-data">${item.costPrice.toFixed(2)}</p>
                  </td>
                  <td className="data-cell text-right">
                    <p className="mono-data !font-bold">${item.sellingPrice.toFixed(2)}</p>
                  </td>
                  <td className="data-cell text-right">
                    <p className="mono-data !font-bold text-emerald-600">${(item.sellingPrice - item.costPrice).toFixed(2)}</p>
                  </td>
                  <td className="data-cell">
                    <div className="flex flex-col items-center gap-1.5">
                      <span className="text-xs font-black text-brand-ink">
                        {item.stockLevel}
                      </span>
                      <div className="w-16 h-1.5 bg-brand-line rounded-full overflow-hidden shadow-inner">
                        <div className={`h-full ${(item.stockLevel <= (item.minimumStockLevel ?? 5)) ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]'}`} style={{ width: '100%' }} />
                      </div>
                    </div>
                  </td>
                  <td className="data-cell text-center">
                    <p className="text-xs font-bold text-brand-text">{item.minimumStockLevel ?? 5}</p>
                  </td>
                  <td className="data-cell">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{item.unit}</p>
                    <p className="text-[10px] text-brand-text mt-0.5 font-medium">{item.sourceType ?? 'DIRECT'}</p>
                  </td>
                  <td className="data-cell text-center">
                    <button
                      onClick={() => {
                        handleSelectUpdateItem(item.id);
                        setActiveDialog('edit-item');
                      }}
                      className="p-2 rounded-xl border border-brand-line bg-white text-slate-500 hover:bg-brand-subtle hover:text-brand-accent hover:border-brand-accent/30 transition-all shadow-sm"
                      title="Edit item"
                    >
                      <Pencil size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="text-sm font-extrabold mb-4 flex items-center gap-2 text-brand-ink"><History size={16} className="text-brand-accent" /> GRN History</h3>
          <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
            {grnRecords.map((record) => (
              <div key={record.id} className="border border-brand-line bg-brand-subtle rounded-xl p-3 text-sm">
                <p className="font-bold text-brand-ink">{record.id} - {record.supplierName}</p>
                <p className="text-xs text-brand-text font-medium mt-1">
                  Total <span className="font-bold text-emerald-600">${record.totalAmount.toFixed(2)}</span> | {record.paymentStatus}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="card flex flex-col">
          <h3 className="text-sm font-extrabold mb-4 flex items-center gap-2 text-brand-ink"><Wallet size={16} className="text-amber-500" /> Purchase Payment Log</h3>
          <div className="space-y-3 max-h-56 overflow-y-auto pr-1 flex-1">
            {purchasePayments.map((payment) => (
              <div key={payment.id} className="border border-brand-line bg-brand-subtle rounded-xl p-3 text-sm">
                <p className="font-bold text-brand-ink">{payment.grnId} - <span className="text-emerald-600">${payment.amount.toFixed(2)}</span></p>
                <p className="text-xs text-brand-text font-medium mt-1">{payment.supplierName} | {payment.paymentMethod} | {payment.reference || 'No ref'}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-brand-line">
            <p className="text-xs font-bold text-brand-text flex justify-between">
              <span>GRN value <span className="text-brand-ink font-black">${totalGrnValue.toFixed(2)}</span></span>
              <span>Paid <span className="text-emerald-600 font-black">${totalPaid.toFixed(2)}</span></span>
            </p>
          </div>
        </div>

        <div className="card lg:col-span-2">
          <h3 className="text-sm font-extrabold mb-4 flex items-center gap-2 text-brand-ink"><History size={16} className="text-brand-accent" /> Stock History Log</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {stockHistory.map((entry) => (
              <div key={entry.id} className="border border-brand-line bg-brand-subtle rounded-xl p-3 text-sm">
                <p className="font-bold text-brand-ink">{entry.itemName} - <span className="text-brand-accent">{entry.changeType}</span></p>
                <div className="flex items-center gap-3 mt-1.5">
                  <p className="text-xs text-brand-text font-medium">Qty <span className={`font-bold ${entry.quantityChange >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{entry.quantityChange >= 0 ? `+${entry.quantityChange}` : entry.quantityChange}</span></p>
                  <p className="text-xs text-brand-text font-medium border-l border-brand-line pl-3">Stock <span className="mono-data">{entry.previousStock}</span> &rarr; <span className="mono-data font-bold text-brand-ink">{entry.newStock}</span></p>
                </div>
                {entry.note && <p className="text-xs text-slate-500 mt-2 bg-white px-2 py-1.5 rounded-lg border border-brand-line">{entry.note}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}