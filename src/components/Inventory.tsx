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
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">Inventory & Stock</h2>
          <p className="text-gray-500 text-sm">Item registration, GRN intake, and supplier payments in one place.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
          <button
            onClick={() => setActiveDialog('register-item')}
            className="bg-brand-accent text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700"
          >
            Register Item
          </button>
          <button
            onClick={() => setActiveDialog('create-grn')}
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700"
          >
            Create GRN (Stock In)
          </button>
          <button
            onClick={() => setActiveDialog('supplier-payment')}
            className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-amber-700"
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
              <form onSubmit={handleCreateItem} className="p-4 space-y-2">
                <input required value={itemForm.name} onChange={(e) => setItemForm((p) => ({ ...p, name: e.target.value }))} placeholder="Item name" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
                <div className="grid grid-cols-2 gap-2">
                  <input required value={itemForm.category} onChange={(e) => setItemForm((p) => ({ ...p, category: e.target.value }))} placeholder="Category" className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
                  <input required value={itemForm.unit} onChange={(e) => setItemForm((p) => ({ ...p, unit: e.target.value }))} placeholder="Unit" className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <input type="number" min="0" step="0.01" value={itemForm.costPrice} onChange={(e) => setItemForm((p) => ({ ...p, costPrice: e.target.value }))} className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" placeholder="Cost" />
                  <input type="number" min="0" step="0.01" value={itemForm.sellingPrice} onChange={(e) => setItemForm((p) => ({ ...p, sellingPrice: e.target.value }))} className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" placeholder="Sell" />
                  <input type="number" min="0" value={itemForm.openingStock} onChange={(e) => setItemForm((p) => ({ ...p, openingStock: e.target.value }))} className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" placeholder="Stock" />
                </div>
                <input type="number" min="0" value={itemForm.minimumStockLevel} onChange={(e) => setItemForm((p) => ({ ...p, minimumStockLevel: e.target.value }))} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" placeholder="Minimum stock level" />
                <select value={itemForm.sourceType} onChange={(e) => setItemForm((p) => ({ ...p, sourceType: e.target.value as 'GRN' | 'DIRECT' }))} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                  <option value="DIRECT">Direct / Service Item</option>
                  <option value="GRN">GRN Linked Item</option>
                </select>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setActiveDialog(null)} className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
                  <button type="submit" className="px-3 py-2 rounded-lg bg-brand-accent text-white text-sm font-semibold hover:bg-blue-700">Save Item</button>
                </div>
              </form>
            )}

            {activeDialog === 'create-grn' && (
              <form onSubmit={handleCreateGrn} className="p-4 space-y-2">
                <input required value={grnForm.supplierName} onChange={(e) => setGrnForm((p) => ({ ...p, supplierName: e.target.value }))} placeholder="Supplier name" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
                <select required value={grnForm.inventoryItemId} onChange={(e) => setGrnForm((p) => ({ ...p, inventoryItemId: e.target.value }))} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                  <option value="">Select item</option>
                  {inventoryItems.map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" min="1" value={grnForm.quantity} onChange={(e) => setGrnForm((p) => ({ ...p, quantity: e.target.value }))} className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" placeholder="Qty" />
                  <input type="number" min="0" step="0.01" value={grnForm.costPrice} onChange={(e) => setGrnForm((p) => ({ ...p, costPrice: e.target.value }))} className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" placeholder="Cost price" />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setActiveDialog(null)} className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
                  <button type="submit" className="px-3 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700">Post GRN</button>
                </div>
              </form>
            )}

            {activeDialog === 'supplier-payment' && (
              <form onSubmit={handleAddPayment} className="p-4 space-y-2">
                <select required value={paymentForm.grnId} onChange={(e) => {
                  const selected = grnRecords.find((record) => record.id === e.target.value);
                  setPaymentForm((prev) => ({ ...prev, grnId: e.target.value, supplierName: selected?.supplierName ?? prev.supplierName }));
                }} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                  <option value="">Select GRN</option>
                  {grnRecords.map((record) => (
                    <option key={record.id} value={record.id}>{record.id} - {record.supplierName}</option>
                  ))}
                </select>
                <input required value={paymentForm.supplierName} onChange={(e) => setPaymentForm((p) => ({ ...p, supplierName: e.target.value }))} placeholder="Supplier" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" min="0" step="0.01" value={paymentForm.amount} onChange={(e) => setPaymentForm((p) => ({ ...p, amount: e.target.value }))} className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" placeholder="Amount" />
                  <select value={paymentForm.paymentMethod} onChange={(e) => setPaymentForm((p) => ({ ...p, paymentMethod: e.target.value as 'Cash' | 'Bank Transfer' | 'Cheque' }))} className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cash">Cash</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
                <input value={paymentForm.reference} onChange={(e) => setPaymentForm((p) => ({ ...p, reference: e.target.value }))} placeholder="Reference" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setActiveDialog(null)} className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
                  <button type="submit" className="px-3 py-2 rounded-lg bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700">Record Payment</button>
                </div>
              </form>
            )}

            {activeDialog === 'edit-item' && (
              <form onSubmit={handleUpdateItemPricing} className="p-4 space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={updateForm.costPrice}
                    disabled={isCostLocked}
                    onChange={(e) => setUpdateForm((p) => ({ ...p, costPrice: e.target.value }))}
                    className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm disabled:bg-gray-100 disabled:text-gray-400"
                    placeholder="Cost price"
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={updateForm.sellingPrice}
                    onChange={(e) => setUpdateForm((p) => ({ ...p, sellingPrice: e.target.value }))}
                    className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                    placeholder="Selling price"
                  />
                  <input
                    type="number"
                    min="0"
                    value={updateForm.minimumStockLevel}
                    onChange={(e) => setUpdateForm((p) => ({ ...p, minimumStockLevel: e.target.value }))}
                    className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                    placeholder="Minimum stock"
                  />
                </div>
                {isCostLocked && (
                  <p className="text-xs text-amber-700">Cost price editing is disabled because this item is linked to GRN.</p>
                )}
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setActiveDialog(null)} className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
                  <button type="submit" className="px-3 py-2 rounded-lg bg-slate-700 text-white text-sm font-semibold hover:bg-slate-800">Update Item</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white p-6 rounded-xl border border-brand-line shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-lg text-brand-accent">
            <Package size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Items</p>
            <p className="text-2xl font-bold">{inventoryItems.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-brand-line shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-lg text-red-600">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Low Stock Alerts</p>
            <p className="text-2xl font-bold">{lowStockCount}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-brand-line shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 rounded-lg text-green-600">
            <History size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Recent GRNs</p>
            <p className="text-2xl font-bold">{grnRecords.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-brand-line shadow-sm flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search inventory..." 
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-brand-line shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-gray-50 border-b border-brand-line">
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Item Name</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Cost Price</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Selling Price</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Profit / Unit</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Stock Level</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Min Stock</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Unit</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Edit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold">{item.name}</p>
                    <p className="text-[10px] text-gray-400 font-mono">{item.id}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded uppercase">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="text-xs font-mono text-gray-500">${item.costPrice.toFixed(2)}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="text-xs font-mono font-bold text-brand-ink">${item.sellingPrice.toFixed(2)}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="text-xs font-mono font-bold text-emerald-600">${(item.sellingPrice - item.costPrice).toFixed(2)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-xs font-bold text-gray-700">
                        {item.stockLevel}
                      </span>
                      <div className="w-16 h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full ${(item.stockLevel <= (item.minimumStockLevel ?? 5)) ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: '100%' }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <p className="text-xs font-bold text-gray-700">{item.minimumStockLevel ?? 5}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">{item.unit}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{item.sourceType ?? 'DIRECT'}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => {
                        handleSelectUpdateItem(item.id);
                        setActiveDialog('edit-item');
                      }}
                      className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-brand-accent"
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
        <div className="bg-white rounded-xl border border-brand-line shadow-sm p-4">
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2"><History size={16} /> GRN History</h3>
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {grnRecords.map((record) => (
              <div key={record.id} className="border border-gray-100 rounded-lg p-3 text-sm">
                <p className="font-semibold">{record.id} - {record.supplierName}</p>
                <p className="text-xs text-gray-500">Total ${record.totalAmount.toFixed(2)} | {record.paymentStatus}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-brand-line shadow-sm p-4">
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2"><Wallet size={16} /> Purchase Payment Log</h3>
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {purchasePayments.map((payment) => (
              <div key={payment.id} className="border border-gray-100 rounded-lg p-3 text-sm">
                <p className="font-semibold">{payment.grnId} - ${payment.amount.toFixed(2)}</p>
                <p className="text-xs text-gray-500">{payment.supplierName} | {payment.paymentMethod} | {payment.reference || 'No ref'}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-3">GRN value ${totalGrnValue.toFixed(2)} | Paid ${totalPaid.toFixed(2)}</p>
        </div>

        <div className="bg-white rounded-xl border border-brand-line shadow-sm p-4 lg:col-span-2">
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2"><History size={16} /> Stock History Log</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {stockHistory.map((entry) => (
              <div key={entry.id} className="border border-gray-100 rounded-lg p-3 text-sm">
                <p className="font-semibold">{entry.itemName} - {entry.changeType}</p>
                <p className="text-xs text-gray-500">Qty {entry.quantityChange >= 0 ? `+${entry.quantityChange}` : entry.quantityChange} | Stock {entry.previousStock} -&gt; {entry.newStock}</p>
                <p className="text-xs text-gray-500">{entry.note}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}