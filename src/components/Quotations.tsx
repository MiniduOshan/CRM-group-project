import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Plus, Search, FileText, Send, Trash2, Edit3, X, Calculator, History, ArrowRightLeft, UserRound } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { CustomerProfile, InventoryItem, Quotation, QuotationItem } from '../types';

interface QuotationsProps {
  customers: CustomerProfile[];
  quotations: Quotation[];
  inventoryItems: InventoryItem[];
  selectedCustomerId: string;
  selectedQuotationId: string;
  openCreateOnMount: boolean;
  onCreateQuotation: (quotation: {
    customerId: string;
    customerName: string;
    customerPhone: string;
    items: QuotationItem[];
    discount: number;
    totalAmount: number;
  }) => Quotation;
  onUpdateQuotation: (quotationId: string, updates: Partial<Omit<Quotation, 'id' | 'createdAt' | 'history'>>) => void;
  onSelectCustomer: (customerId: string) => void;
  onSelectQuotation: (quotationId: string) => void;
  onRequestInvoice: (quotationId: string) => void;
  onDeleteQuotation: (quotationId: string) => void;
  onCloseComposer: () => void;
}

interface LineItemDraft {
  mode: 'catalog' | 'adhoc';
  inventoryItemId: string;
  sourceType: 'GRN' | 'DIRECT' | 'ADHOC';
  name: string;
  unit: string;
  quantity: string;
  unitPrice: string;
  lineDiscount: string;
  lockPrice: boolean;
}

const emptyLineItem = (): LineItemDraft => ({
  mode: 'catalog',
  inventoryItemId: '',
  sourceType: 'DIRECT',
  name: '',
  unit: 'Pieces',
  quantity: '1',
  unitPrice: '0',
  lineDiscount: '0',
  lockPrice: false
});

export default function Quotations({
  customers,
  quotations,
  inventoryItems,
  selectedCustomerId,
  selectedQuotationId,
  openCreateOnMount,
  onCreateQuotation,
  onUpdateQuotation,
  onSelectCustomer,
  onSelectQuotation,
  onRequestInvoice,
  onDeleteQuotation,
  onCloseComposer
}: QuotationsProps) {
  const [search, setSearch] = useState('');
  const [isCreating, setIsCreating] = useState(openCreateOnMount);
  const [editingQuotationId, setEditingQuotationId] = useState('');
  const [selectedDetailId, setSelectedDetailId] = useState(selectedQuotationId);
  const [newQuotation, setNewQuotation] = useState({
    customerId: selectedCustomerId,
    customerName: '',
    customerPhone: '',
    discount: '0'
  });
  const [lineItems, setLineItems] = useState<LineItemDraft[]>([emptyLineItem()]);

  const selectedCustomer = customers.find((customer) => customer.id === (newQuotation.customerId || selectedCustomerId));
  const editingQuotation = quotations.find((quotation) => quotation.id === editingQuotationId);
  const selectedQuotation = quotations.find((quotation) => quotation.id === selectedDetailId);

  useEffect(() => {
    if (openCreateOnMount) {
      setIsCreating(true);
      setNewQuotation((prev) => ({
        ...prev,
        customerId: selectedCustomerId || prev.customerId,
        customerName: customers.find((customer) => customer.id === selectedCustomerId)?.name ?? prev.customerName,
        customerPhone: customers.find((customer) => customer.id === selectedCustomerId)?.phone ?? prev.customerPhone
      }));
    }
  }, [customers, openCreateOnMount, selectedCustomerId]);

  useEffect(() => {
    setSelectedDetailId(selectedQuotationId);
  }, [selectedQuotationId]);

  const subTotal = useMemo(
    () =>
      lineItems.reduce((sum, item) => {
        const quantity = Number(item.quantity);
        const unitPrice = Number(item.unitPrice);
        const lineDiscount = Number(item.lineDiscount);
        if (!Number.isFinite(quantity) || !Number.isFinite(unitPrice)) {
          return sum;
        }
        return sum + Math.max(0, quantity * unitPrice - (Number.isFinite(lineDiscount) ? lineDiscount : 0));
      }, 0),
    [lineItems]
  );

  const discountValue = Number(newQuotation.discount) || 0;
  const total = Math.max(0, subTotal - discountValue);

  const filteredQuotations = quotations.filter((quotation) => {
    const query = search.toLowerCase();
    return (
      quotation.id.toLowerCase().includes(query) ||
      quotation.leadId.toLowerCase().includes(query) ||
      (quotation.customerName ?? '').toLowerCase().includes(query) ||
      (quotation.customerPhone ?? '').includes(search) ||
      quotation.status.toLowerCase().includes(query)
    );
  });

  const resetCreateForm = () => {
    setNewQuotation({
      customerId: selectedCustomerId,
      customerName: customers.find((customer) => customer.id === selectedCustomerId)?.name ?? '',
      customerPhone: customers.find((customer) => customer.id === selectedCustomerId)?.phone ?? '',
      discount: '0'
    });
    setLineItems([emptyLineItem()]);
  };

  const openCreateComposer = () => {
    setNewQuotation({
      customerId: selectedCustomerId,
      customerName: customers.find((customer) => customer.id === selectedCustomerId)?.name ?? '',
      customerPhone: customers.find((customer) => customer.id === selectedCustomerId)?.phone ?? '',
      discount: '0'
    });
    setIsCreating(true);
    setEditingQuotationId('');
    setLineItems([emptyLineItem()]);
  };

  const addLineItem = () => {
    setLineItems((prev) => [...prev, emptyLineItem()]);
  };

  const removeLineItem = (index: number) => {
    setLineItems((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  };

  const updateLineItem = (index: number, field: keyof LineItemDraft, value: string) => {
    setLineItems((prev) => prev.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item)));
  };

  const prepareItems = () =>
    lineItems
      .filter((item) => item.name.trim() !== '')
      .map((item, index) => {
        const quantity = Number(item.quantity) || 0;
        const unitPrice = Number(item.unitPrice) || 0;
        const lineDiscount = Number(item.lineDiscount) || 0;
        const lineTotal = Math.max(0, quantity * unitPrice - lineDiscount);
        return {
          itemId: item.inventoryItemId || `adhoc-${Date.now()}-${index}`,
          inventoryItemId: item.inventoryItemId || undefined,
          sourceType: item.sourceType,
          name: item.name.trim(),
          unit: item.unit,
          quantity,
          baseUnitPrice: unitPrice,
          unitPrice,
          lineDiscount,
          editablePrice: !item.lockPrice,
          total: lineTotal
        };
      })
      .filter((item) => item.quantity > 0 && item.unitPrice >= 0);

  const openEditComposer = (quotation: Quotation) => {
    setEditingQuotationId(quotation.id);
    setIsCreating(true);
    setNewQuotation({
      customerId: quotation.customerId,
      customerName: quotation.customerName ?? '',
      customerPhone: quotation.customerPhone ?? '',
      discount: String(quotation.discount)
    });
    setLineItems(
      quotation.items.length > 0
        ? quotation.items.map((item) => ({
            mode: item.sourceType === 'ADHOC' ? 'adhoc' : 'catalog',
            inventoryItemId: item.inventoryItemId ?? '',
            sourceType: item.sourceType ?? 'DIRECT',
            name: item.name,
            unit: item.unit ?? 'Pieces',
            quantity: String(item.quantity),
            unitPrice: String(item.unitPrice),
            lineDiscount: String(item.lineDiscount ?? 0),
            lockPrice: item.sourceType === 'GRN'
          }))
        : [emptyLineItem()]
    );
  };

  const handleSaveQuotation = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const items = prepareItems();
    if (items.length === 0) {
      return;
    }

    const customer = customers.find((item) => item.id === newQuotation.customerId);
    const payload = {
      customerId: newQuotation.customerId,
      customerName: newQuotation.customerName.trim() || customer?.name || 'Customer',
      customerPhone: newQuotation.customerPhone.trim() || customer?.phone || '',
      items,
      discount: discountValue,
      totalAmount: total
    };

    if (editingQuotationId) {
      onUpdateQuotation(editingQuotationId, {
        customerId: payload.customerId,
        leadId: payload.customerId,
        customerName: payload.customerName,
        customerPhone: payload.customerPhone,
        items: payload.items,
        discount: payload.discount,
        totalAmount: payload.totalAmount,
        status: editingQuotation?.status ?? 'Draft'
      });
      onSelectQuotation(editingQuotationId);
    } else {
      const createdQuotation = onCreateQuotation(payload);
      onSelectQuotation(createdQuotation.id);
      onSelectCustomer(payload.customerId);
    }

    setIsCreating(false);
    setEditingQuotationId('');
    resetCreateForm();
    onCloseComposer();
  };

  const applyCatalogItem = (index: number, inventoryItemId: string) => {
    const item = inventoryItems.find((entry) => entry.id === inventoryItemId);
    if (!item) {
      return;
    }

    setLineItems((prev) =>
      prev.map((line, lineIndex) =>
        lineIndex === index
          ? {
              ...line,
              mode: 'catalog',
              inventoryItemId,
              sourceType: item.sourceType === 'GRN' ? 'GRN' : 'DIRECT',
              name: item.name,
              unit: item.unit,
              unitPrice: String(item.sellingPrice),
              lockPrice: item.sourceType === 'GRN',
              lineDiscount: line.lineDiscount || '0'
            }
          : line
      )
    );
  };

  const toggleLineMode = (index: number, mode: 'catalog' | 'adhoc') => {
    setLineItems((prev) =>
      prev.map((line, lineIndex) => {
        if (lineIndex !== index) {
          return line;
        }
        if (mode === 'adhoc') {
          return {
            ...line,
            mode: 'adhoc',
            inventoryItemId: '',
            sourceType: 'ADHOC',
            lockPrice: false
          };
        }
        return {
          ...emptyLineItem(),
          mode: 'catalog'
        };
      })
    );
  };

  const handleQuotationStatus = (quotationId: string, status: Quotation['status']) => {
    onUpdateQuotation(quotationId, { status });
    onSelectQuotation(quotationId);
  };

  const closeComposer = () => {
    setIsCreating(false);
    setEditingQuotationId('');
    resetCreateForm();
    onCloseComposer();
  };

  return (
    <div className="relative p-4 md:p-8 space-y-4 md:space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black tracking-tight text-brand-ink">Quotations</h2>
          <p className="text-brand-text font-medium text-sm mt-1">Create, edit, and hand over quotations to invoices without losing history.</p>
        </div>
        <button
          onClick={openCreateComposer}
          className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          New Quotation
        </button>
      </header>

      {selectedCustomer && (
        <div className="card !p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-brand-text font-black">Selected Customer</p>
            <p className="text-sm font-bold text-brand-ink mt-1">
              {selectedCustomer.name} <span className="text-slate-500 font-medium">({selectedCustomer.phone})</span>
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-brand-text font-semibold">
            <UserRound size={16} className="text-brand-accent" />
            The next quotation will be linked to this customer.
          </div>
        </div>
      )}

      <div className="card !p-4 flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search quotations by ID, customer, phone, or status"
            className="input-field pl-10"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredQuotations.length === 0 ? (
          <div className="card border-dashed p-10 text-center text-sm font-semibold text-brand-text">
            No quotations found. Create the first quotation for the selected customer.
          </div>
        ) : (
          filteredQuotations.map((quotation) => {
            const isSelected = selectedQuotationId === quotation.id;
            const historyPreview = quotation.history.slice(-2).reverse();
            return (
              <motion.div
                key={quotation.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`card transition-all group ${isSelected ? 'border-brand-accent/50 ring-2 ring-brand-accent/20 shadow-md' : 'hover:border-brand-accent/30 hover:shadow-elevated'}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-brand-subtle flex items-center justify-center text-slate-400 group-hover:bg-brand-accent/10 group-hover:text-brand-accent transition-colors shadow-sm">
                      <FileText size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-extrabold text-sm tracking-tight text-brand-ink">{quotation.id}</h3>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${
                            quotation.status === 'Draft'
                              ? 'bg-slate-50 text-slate-500 border-slate-200'
                              : quotation.status === 'Sent'
                                ? 'bg-blue-50 text-blue-600 border-blue-200'
                                : quotation.status === 'Invoiced'
                                  ? 'bg-violet-50 text-violet-600 border-violet-200'
                                  : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                          }`}
                        >
                          {quotation.status}
                        </span>
                      </div>
                      <p className="text-xs text-brand-text mt-1 font-medium">
                        Customer:{' '}
                        <span className="text-slate-600 font-bold">
                          {quotation.customerName ? `${quotation.customerName} (${quotation.customerPhone})` : `Lead #${quotation.leadId}`}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-[10px] text-brand-text font-black uppercase tracking-[0.1em]">Total Amount</p>
                      <p className="text-lg font-black font-mono text-brand-ink mt-0.5">${quotation.totalAmount.toFixed(2)}</p>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      <button
                        title="Edit"
                        onClick={() => openEditComposer(quotation)}
                        className="p-2.5 text-slate-400 hover:text-brand-accent hover:bg-brand-accent/10 rounded-xl transition-all font-bold shadow-sm border border-transparent hover:border-brand-accent/20"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button
                        title="Hand over to invoice"
                        onClick={() => onRequestInvoice(quotation.id)}
                        className="p-2.5 text-slate-400 hover:text-brand-accent hover:bg-brand-accent/10 rounded-xl transition-all font-bold shadow-sm border border-transparent hover:border-brand-accent/20"
                      >
                        <Send size={18} />
                      </button>
                      <button
                        title="Status: Sent"
                        onClick={() => handleQuotationStatus(quotation.id, 'Sent')}
                        className="p-2.5 text-slate-400 hover:text-brand-accent hover:bg-brand-accent/10 rounded-xl transition-all font-bold shadow-sm border border-transparent hover:border-brand-accent/20"
                      >
                        <ArrowRightLeft size={18} />
                      </button>
                      <button
                        title="View History"
                        onClick={() => {
                          setSelectedDetailId((current) => (current === quotation.id ? '' : quotation.id));
                          onSelectQuotation(quotation.id);
                        }}
                        className={`p-2.5 rounded-xl transition-all font-bold shadow-sm border ${selectedDetailId === quotation.id ? 'bg-brand-accent/10 border-brand-accent/20 text-brand-accent' : 'text-slate-400 hover:text-brand-accent hover:bg-brand-accent/10 border-transparent hover:border-brand-accent/20'}`}
                      >
                        <History size={18} />
                      </button>
                      <div className="w-px h-6 bg-slate-200 mx-1" />
                      <button
                        title="Delete"
                        onClick={() => {
                          if (window.confirm(`Delete quotation ${quotation.id}?`)) {
                            onDeleteQuotation(quotation.id);
                          }
                        }}
                        className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all font-bold shadow-sm border border-transparent hover:border-red-200"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-brand-line flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-brand-text">
                      <span>GRN-linked items keep original base price; only discount is adjusted.</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono font-medium">Last modified: {new Date(quotation.updatedAt).toLocaleString()}</p>
                </div>

                  <div className="mt-4 pt-4 border-t border-brand-line grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="bg-brand-subtle border border-brand-line rounded-xl p-4">
                      <p className="text-xs font-black uppercase tracking-[0.1em] text-brand-text flex items-center gap-2 mb-3">
                        <History size={14} className="text-brand-accent" /> Revision History
                      </p>
                      <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                        {quotation.history.length === 0 ? (
                          <p className="text-sm text-slate-500">No edits yet.</p>
                        ) : (
                          quotation.history.slice().reverse().map((entry) => (
                            <div key={entry.id} className="bg-white border border-brand-line rounded-xl p-3 shadow-sm">
                              <div className="flex items-center justify-between gap-2 text-[11px] text-slate-400 font-bold tracking-wider uppercase">
                                <span>{entry.editor}</span>
                                <span>{new Date(entry.timestamp).toLocaleDateString()}</span>
                              </div>
                              <p className="text-sm text-brand-ink font-semibold mt-1">{entry.note}</p>
                              <p className="text-xs text-brand-text font-medium mt-1">Total: <span className="font-bold text-brand-ink">${entry.totalAmount.toFixed(2)}</span> | Discount: ${entry.discount.toFixed(2)}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="bg-brand-bg border border-brand-line rounded-xl p-4">
                      <p className="text-xs font-black uppercase tracking-[0.1em] text-brand-text flex items-center gap-2 mb-3">
                        <Calculator size={14} className="text-brand-accent" /> Document Preview
                      </p>
                      <div className="space-y-3 text-sm text-brand-text font-medium">
                        {quotation.items.map((item) => (
                          <div key={item.itemId} className="flex items-center justify-between gap-4 card !p-3">
                            <div>
                              <p className="font-bold text-brand-ink">{item.name}</p>
                              <p className="text-xs text-slate-500 mt-0.5">Qty <span className="font-bold">{item.quantity}</span> x ${item.unitPrice.toFixed(2)} | {item.sourceType ?? 'DIRECT'}</p>
                            </div>
                            <p className="font-black text-brand-ink">${item.total.toFixed(2)}</p>
                          </div>
                        ))}
                        <div className="pt-3 border-t border-brand-line space-y-1.5 text-xs text-brand-text">
                          <p className="flex justify-between"><span>Subtotal:</span> <span>${quotation.items.reduce((sum, item) => sum + item.total, 0).toFixed(2)}</span></p>
                          <p className="flex justify-between"><span>Discount:</span> <span>${quotation.discount.toFixed(2)}</span></p>
                          <p className="flex justify-between text-sm font-black text-brand-ink mt-1 pt-1 border-t border-slate-200"><span>Total:</span> <span>${quotation.totalAmount.toFixed(2)}</span></p>
                        </div>
                      </div>
                    </div>
                  </div>
              </motion.div>
            );
          })
        )}
      </div>

      <AnimatePresence>
        {isCreating && (
          <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] z-20 flex items-start justify-center p-4 md:p-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white rounded-2xl shadow-2xl border border-brand-line w-full max-w-4xl overflow-hidden mt-4"
            >
              <div className="p-6 border-b border-brand-line flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-extrabold text-lg text-brand-ink">{editingQuotationId ? 'Edit Quotation' : 'Create New Quotation'}</h3>
                  <p className="text-xs text-brand-text font-medium mt-1">Choose stock items or add ad-hoc lines. GRN item price is locked; use discount.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={closeComposer}
                    className="btn-secondary !py-1.5 !px-3 text-xs"
                  >
                    Cancel
                  </button>
                  <button onClick={closeComposer} className="text-slate-400 hover:text-slate-600 ml-2" title="Close">
                    <X size={20} />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSaveQuotation} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black tracking-[0.1em] text-brand-text">Customer</label>
                    <select
                      value={newQuotation.customerId}
                      onChange={(event) => {
                        const customer = customers.find((item) => item.id === event.target.value);
                        setNewQuotation((prev) => ({
                          ...prev,
                          customerId: event.target.value,
                          customerName: customer?.name ?? prev.customerName,
                          customerPhone: customer?.phone ?? prev.customerPhone
                        }));
                        onSelectCustomer(event.target.value);
                      }}
                      className="input-field !py-2.5"
                    >
                      <option value="">Select customer</option>
                      {customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name} - {customer.phone}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black tracking-[0.1em] text-brand-text">Customer Phone</label>
                    <input
                      required
                      value={newQuotation.customerPhone}
                      onChange={(event) => setNewQuotation((prev) => ({ ...prev, customerPhone: event.target.value }))}
                      className="input-field !py-2.5"
                      placeholder="0771234567"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black tracking-[0.1em] text-brand-text">Customer Name</label>
                  <input
                    required
                    value={newQuotation.customerName}
                    onChange={(event) => setNewQuotation((prev) => ({ ...prev, customerName: event.target.value }))}
                    className="input-field !py-2.5"
                    placeholder="Enter customer name"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-extrabold text-brand-ink">Line Items</h4>
                    <button
                      type="button"
                      onClick={addLineItem}
                      className="btn-secondary !py-1.5 !px-3 text-xs"
                    >
                      Add Item
                    </button>
                  </div>

                  <div className="space-y-4">
                    {lineItems.map((item, index) => (
                      <div key={`line-${index}`} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center bg-brand-subtle p-3 rounded-xl border border-brand-line">
                        <div className="md:col-span-2 flex gap-1 bg-white border border-brand-line rounded-lg p-1">
                          <button
                            type="button"
                            onClick={() => toggleLineMode(index, 'catalog')}
                            className={`flex-1 text-[11px] py-1.5 rounded-md font-bold transition-colors ${item.mode === 'catalog' ? 'bg-brand-accent text-white shadow-sm' : 'text-slate-500 hover:text-brand-ink'}`}
                          >
                            Catalog
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleLineMode(index, 'adhoc')}
                            className={`flex-1 text-[11px] py-1.5 rounded-md font-bold transition-colors ${item.mode === 'adhoc' ? 'bg-brand-accent text-white shadow-sm' : 'text-slate-500 hover:text-brand-ink'}`}
                          >
                            Ad-hoc
                          </button>
                        </div>
                        {item.mode === 'catalog' ? (
                          <select
                            value={item.inventoryItemId}
                            onChange={(event) => applyCatalogItem(index, event.target.value)}
                            className="md:col-span-3 input-field !py-2.5"
                            required
                          >
                            <option value="">Select item</option>
                            {inventoryItems.map((inventoryItem) => (
                              <option key={inventoryItem.id} value={inventoryItem.id}>
                                {inventoryItem.name} ({inventoryItem.sourceType ?? 'DIRECT'})
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            value={item.name}
                            onChange={(event) => updateLineItem(index, 'name', event.target.value)}
                            className="md:col-span-3 input-field !py-2.5"
                            placeholder="Custom item name"
                            required
                          />
                        )}
                        <input
                          value={item.unit}
                          onChange={(event) => updateLineItem(index, 'unit', event.target.value)}
                          className="md:col-span-1 input-field !py-2.5"
                          placeholder="Unit"
                          required
                        />
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(event) => updateLineItem(index, 'quantity', event.target.value)}
                          className="md:col-span-1 input-field !py-2.5"
                          placeholder="Qty"
                          required
                        />
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(event) => updateLineItem(index, 'unitPrice', event.target.value)}
                          readOnly={item.lockPrice}
                          className="md:col-span-2 input-field !py-2.5 read-only:bg-slate-100 read-only:text-slate-500"
                          placeholder="Unit price"
                          required
                        />
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.lineDiscount}
                          onChange={(event) => updateLineItem(index, 'lineDiscount', event.target.value)}
                          className="md:col-span-1 input-field !py-2.5"
                          placeholder="Disc"
                        />
                        <button
                          type="button"
                          onClick={() => removeLineItem(index)}
                          disabled={lineItems.length === 1}
                          className="md:col-span-2 btn-danger disabled:opacity-50 disabled:cursor-not-allowed !py-2.5 w-full"
                        >
                          Remove
                        </button>
                        {item.lockPrice && (
                          <p className="md:col-span-12 text-[11px] text-amber-600 px-2 font-bold flex items-center gap-1.5"><History size={12}/> GRN item detected: base selling price is locked. Apply discount only.</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black tracking-[0.1em] text-brand-text">Overall Discount</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={newQuotation.discount}
                      onChange={(event) => setNewQuotation((prev) => ({ ...prev, discount: event.target.value }))}
                      className="input-field !py-2.5"
                    />
                  </div>
                  <div className="card !p-4 bg-brand-subtle flex flex-col justify-center">
                    <p className="text-brand-text font-black text-xs uppercase tracking-[0.1em] flex items-center gap-2 mb-2"><Calculator size={14} className="text-brand-accent" /> Summary</p>
                    <p className="flex justify-between items-center text-sm font-medium text-slate-600">Subtotal: <span className="font-bold text-brand-ink">${subTotal.toFixed(2)}</span></p>
                    <p className="flex justify-between items-center text-sm font-medium text-slate-600">Discount: <span className="font-bold text-brand-ink">${discountValue.toFixed(2)}</span></p>
                    <p className="flex justify-between items-center text-sm font-black text-brand-ink mt-2 pt-2 border-t border-brand-line">Total: <span className="text-brand-accent text-lg">${total.toFixed(2)}</span></p>
                  </div>
                </div>

                <div className="pt-4 mt-6 border-t border-brand-line flex gap-3">
                  <button
                    type="button"
                    onClick={closeComposer}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-primary"
                  >
                    {editingQuotationId ? 'Save Changes' : 'Save Quotation'}
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
