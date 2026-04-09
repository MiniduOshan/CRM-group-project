import { useMemo, useState, type FormEvent } from 'react';
import { 
  Plus, 
  Search, 
  FileText, 
  Download, 
  Send,
  Trash2,
  Edit3,
  CheckCircle2,
  X,
  Calculator
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Quotation, QuotationItem } from '../types';

const mockQuotations: Quotation[] = [
  {
    id: 'QT-2024-001',
    leadId: '1',
    customerName: 'Sarah Jenkins',
    customerPhone: '0771234567',
    items: [],
    totalAmount: 1250.00,
    discount: 50.00,
    status: 'Sent',
    createdAt: '2024-03-22T11:00:00Z'
  },
  {
    id: 'QT-2024-002',
    leadId: '2',
    customerName: 'Michael Chen',
    customerPhone: '0779876543',
    items: [],
    totalAmount: 3400.00,
    discount: 0,
    status: 'Draft',
    createdAt: '2024-03-23T15:30:00Z'
  }
];

export default function Quotations() {
  const [quotations, setQuotations] = useState<Quotation[]>(mockQuotations);
  const [search, setSearch] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newQuotation, setNewQuotation] = useState({
    customerName: '',
    customerPhone: '',
    discount: '0'
  });
  const [lineItems, setLineItems] = useState<Array<{ name: string; quantity: string; unitPrice: string }>>([
    { name: '', quantity: '1', unitPrice: '0' }
  ]);

  const subTotal = useMemo(
    () =>
      lineItems.reduce((sum, item) => {
        const quantity = Number(item.quantity);
        const unitPrice = Number(item.unitPrice);
        if (!Number.isFinite(quantity) || !Number.isFinite(unitPrice)) {
          return sum;
        }
        return sum + quantity * unitPrice;
      }, 0),
    [lineItems]
  );

  const discountValue = Number(newQuotation.discount) || 0;
  const total = Math.max(0, subTotal - discountValue);

  const filteredQuotations = quotations.filter((qt) => {
    const query = search.toLowerCase();
    return (
      qt.id.toLowerCase().includes(query) ||
      qt.leadId.toLowerCase().includes(query) ||
      (qt.customerName ?? '').toLowerCase().includes(query) ||
      (qt.customerPhone ?? '').includes(search)
    );
  });

  const resetCreateForm = () => {
    setNewQuotation({ customerName: '', customerPhone: '', discount: '0' });
    setLineItems([{ name: '', quantity: '1', unitPrice: '0' }]);
  };

  const addLineItem = () => {
    setLineItems((prev) => [...prev, { name: '', quantity: '1', unitPrice: '0' }]);
  };

  const removeLineItem = (index: number) => {
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateLineItem = (index: number, field: 'name' | 'quantity' | 'unitPrice', value: string) => {
    setLineItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const generateQuotationId = () => {
    const year = new Date().getFullYear();
    const serial = String(quotations.length + 1).padStart(3, '0');
    return `QT-${year}-${serial}`;
  };

  const handleCreateQuotation = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const preparedItems: QuotationItem[] = lineItems
      .filter((item) => item.name.trim() !== '')
      .map((item, index) => {
        const quantity = Number(item.quantity) || 0;
        const unitPrice = Number(item.unitPrice) || 0;
        return {
          itemId: `itm-${Date.now()}-${index}`,
          name: item.name.trim(),
          quantity,
          unitPrice,
          total: quantity * unitPrice
        };
      })
      .filter((item) => item.quantity > 0 && item.unitPrice >= 0);

    if (preparedItems.length === 0) {
      return;
    }

    const quotation: Quotation = {
      id: generateQuotationId(),
      leadId: newQuotation.customerPhone.trim() || String(Date.now()),
      customerName: newQuotation.customerName.trim(),
      customerPhone: newQuotation.customerPhone.trim(),
      items: preparedItems,
      totalAmount: total,
      discount: discountValue,
      status: 'Draft',
      createdAt: new Date().toISOString()
    };

    setQuotations((prev) => [quotation, ...prev]);
    setIsCreating(false);
    resetCreateForm();
  };

  const updateStatus = (id: string, status: Quotation['status']) => {
    setQuotations((prev) => prev.map((qt) => (qt.id === id ? { ...qt, status } : qt)));
  };

  const removeQuotation = (id: string) => {
    setQuotations((prev) => prev.filter((qt) => qt.id !== id));
  };

  return (
    <div className="p-8 space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Quotations & Invoices</h2>
          <p className="text-gray-500 text-sm">Generate and manage professional pricing documents.</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="bg-brand-accent text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-brand-accent/20"
        >
          <Plus size={18} />
          Create New Quotation
        </button>
      </header>

      <div className="bg-white p-4 rounded-xl border border-brand-line shadow-sm flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search quotations by ID or Lead..." 
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredQuotations.map((qt) => (
          <motion.div 
            key={qt.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-6 rounded-xl border border-brand-line shadow-sm hover:border-brand-accent/30 transition-all group"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-brand-accent/5 group-hover:text-brand-accent transition-colors">
                  <FileText size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm tracking-tight">{qt.id}</h3>
                    <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold uppercase tracking-wider border ${
                      qt.status === 'Draft' ? 'bg-gray-50 text-gray-500 border-gray-200' :
                      qt.status === 'Sent' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                      'bg-green-50 text-green-600 border-green-100'
                    }`}>
                      {qt.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Customer:{' '}
                    <span className="text-gray-600 font-medium">
                      {qt.customerName ? `${qt.customerName} (${qt.customerPhone})` : `Lead #${qt.leadId}`}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="text-right">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Total Amount</p>
                  <p className="text-lg font-bold font-mono text-brand-ink">${qt.totalAmount.toFixed(2)}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <button title="Edit" className="p-2 text-gray-400 hover:text-brand-accent hover:bg-brand-accent/5 rounded-lg transition-colors">
                    <Edit3 size={18} />
                  </button>
                  <button title="Download PDF" className="p-2 text-gray-400 hover:text-brand-accent hover:bg-brand-accent/5 rounded-lg transition-colors">
                    <Download size={18} />
                  </button>
                  <button
                    title="Send to Customer"
                    onClick={() => updateStatus(qt.id, 'Sent')}
                    className="p-2 text-gray-400 hover:text-brand-accent hover:bg-brand-accent/5 rounded-lg transition-colors"
                  >
                    <Send size={18} />
                  </button>
                  <div className="w-px h-6 bg-gray-100 mx-1" />
                  <button
                    title="Delete"
                    onClick={() => removeQuotation(qt.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-[10px] text-gray-400">
                  <CheckCircle2 size={12} className="text-green-500" />
                  <span>Cost Price Locked</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-gray-400">
                  <CheckCircle2 size={12} className="text-green-500" />
                  <span>Inventory Linked</span>
                </div>
              </div>
              <p className="text-[10px] text-gray-400 font-mono">Last modified: {new Date(qt.createdAt).toLocaleString()}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {isCreating && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white rounded-2xl shadow-2xl border border-brand-line w-full max-w-3xl overflow-hidden"
            >
              <div className="p-6 border-b border-brand-line flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg">Create New Quotation</h3>
                  <p className="text-xs text-gray-500">Build a quotation with items and totals.</p>
                </div>
                <button onClick={() => { setIsCreating(false); resetCreateForm(); }} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateQuotation} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Customer Name</label>
                    <input
                      required
                      value={newQuotation.customerName}
                      onChange={(e) => setNewQuotation((prev) => ({ ...prev, customerName: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                      placeholder="Enter customer name"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Customer Phone</label>
                    <input
                      required
                      value={newQuotation.customerPhone}
                      onChange={(e) => setNewQuotation((prev) => ({ ...prev, customerPhone: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                      placeholder="0771234567"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold">Line Items</h4>
                    <button
                      type="button"
                      onClick={addLineItem}
                      className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      Add Item
                    </button>
                  </div>

                  <div className="space-y-2">
                    {lineItems.map((item, index) => (
                      <div key={`line-${index}`} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                        <input
                          value={item.name}
                          onChange={(e) => updateLineItem(index, 'name', e.target.value)}
                          className="md:col-span-5 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                          placeholder="Item name"
                          required
                        />
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateLineItem(index, 'quantity', e.target.value)}
                          className="md:col-span-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                          placeholder="Qty"
                          required
                        />
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => updateLineItem(index, 'unitPrice', e.target.value)}
                          className="md:col-span-3 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                          placeholder="Unit price"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => removeLineItem(index)}
                          disabled={lineItems.length === 1}
                          className="md:col-span-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-red-500 hover:bg-red-50 disabled:text-gray-300 disabled:hover:bg-transparent"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Discount</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={newQuotation.discount}
                      onChange={(e) => setNewQuotation((prev) => ({ ...prev, discount: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                    />
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm">
                    <p className="text-gray-500 flex items-center gap-1 mb-1"><Calculator size={14} /> Summary</p>
                    <p>Subtotal: <span className="font-semibold">${subTotal.toFixed(2)}</span></p>
                    <p>Discount: <span className="font-semibold">${discountValue.toFixed(2)}</span></p>
                    <p className="text-base mt-1">Total: <span className="font-bold text-brand-accent">${total.toFixed(2)}</span></p>
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => { setIsCreating(false); resetCreateForm(); }}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-brand-accent text-white rounded-lg text-sm font-bold hover:bg-blue-700"
                  >
                    Save Quotation
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
