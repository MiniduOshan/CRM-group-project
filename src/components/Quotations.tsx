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
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">Quotations</h2>
          <p className="text-gray-500 text-sm">Create, edit, and hand over quotations to invoices without losing history.</p>
        </div>
        <button
          onClick={openCreateComposer}
          className="bg-brand-accent text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-brand-accent/20 w-full sm:w-auto justify-center"
        >
          <Plus size={18} />
          New Quotation
        </button>
      </header>

      {selectedCustomer && (
        <div className="bg-white p-4 rounded-xl border border-brand-line shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Selected Customer</p>
            <p className="text-sm font-semibold text-gray-900 mt-1">
              {selectedCustomer.name} <span className="text-gray-400 font-medium">({selectedCustomer.phone})</span>
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <UserRound size={14} />
            The next quotation will be linked to this customer.
          </div>
        </div>
      )}

      <div className="bg-white p-4 rounded-xl border border-brand-line shadow-sm flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search quotations by ID, customer, phone, or status"
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredQuotations.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-brand-line p-10 text-center text-sm text-gray-500">
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
                className={`bg-white p-6 rounded-xl border shadow-sm transition-all group ${isSelected ? 'border-brand-accent/40 ring-1 ring-brand-accent/20' : 'border-brand-line hover:border-brand-accent/30'}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-brand-accent/5 group-hover:text-brand-accent transition-colors">
                      <FileText size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-sm tracking-tight">{quotation.id}</h3>
                        <span
                          className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold uppercase tracking-wider border ${
                            quotation.status === 'Draft'
                              ? 'bg-gray-50 text-gray-500 border-gray-200'
                              : quotation.status === 'Sent'
                                ? 'bg-blue-50 text-blue-600 border-blue-100'
                                : quotation.status === 'Invoiced'
                                  ? 'bg-violet-50 text-violet-600 border-violet-100'
                                  : 'bg-green-50 text-green-600 border-green-100'
                          }`}
                        >
                          {quotation.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Customer:{' '}
                        <span className="text-gray-600 font-medium">
                          {quotation.customerName ? `${quotation.customerName} (${quotation.customerPhone})` : `Lead #${quotation.leadId}`}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Total Amount</p>
                      <p className="text-lg font-bold font-mono text-brand-ink">${quotation.totalAmount.toFixed(2)}</p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      <button
                        title="Edit"
                        onClick={() => openEditComposer(quotation)}
                        className="p-2 text-gray-400 hover:text-brand-accent hover:bg-brand-accent/5 rounded-lg transition-colors"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button
                        title="Hand over to invoice"
                        onClick={() => onRequestInvoice(quotation.id)}
                        className="p-2 text-gray-400 hover:text-brand-accent hover:bg-brand-accent/5 rounded-lg transition-colors"
                      >
                        <Send size={18} />
                      </button>
                      <button
                        title="Status: Sent"
                        onClick={() => handleQuotationStatus(quotation.id, 'Sent')}
                        className="p-2 text-gray-400 hover:text-brand-accent hover:bg-brand-accent/5 rounded-lg transition-colors"
                      >
                        <ArrowRightLeft size={18} />
                      </button>
                      <button
                        title="View History"
                        onClick={() => {
                          setSelectedDetailId((current) => (current === quotation.id ? '' : quotation.id));
                          onSelectQuotation(quotation.id);
                        }}
                        className="p-2 text-gray-400 hover:text-brand-accent hover:bg-brand-accent/5 rounded-lg transition-colors"
                      >
                        <History size={18} />
                      </button>
                      <div className="w-px h-6 bg-gray-100 mx-1" />
                      <button
                        title="Delete"
                        onClick={() => {
                          if (window.confirm(`Delete quotation ${quotation.id}?`)) {
                            onDeleteQuotation(quotation.id);
                          }
                        }}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-50 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-1 text-[10px] text-gray-400">
                      <span>GRN-linked items keep original base price; only discount is adjusted.</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 font-mono">Last modified: {new Date(quotation.updatedAt).toLocaleString()}</p>
                </div>

                {selectedDetailId === quotation.id && (
                  <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2 mb-3">
                        <History size={14} /> Revision History
                      </p>
                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {quotation.history.length === 0 ? (
                          <p className="text-sm text-gray-500">No edits yet.</p>
                        ) : (
                          quotation.history.slice().reverse().map((entry) => (
                            <div key={entry.id} className="bg-white border border-gray-100 rounded-lg p-3 shadow-sm">
                              <div className="flex items-center justify-between gap-2 text-[11px] text-gray-400 font-semibold">
                                <span>{entry.editor}</span>
                                <span>{new Date(entry.timestamp).toLocaleDateString()}</span>
                              </div>
                              <p className="text-sm text-gray-700 mt-1">{entry.note}</p>
                              <p className="text-xs text-gray-500 mt-1">Total: ${entry.totalAmount.toFixed(2)} | Discount: ${entry.discount.toFixed(2)}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2 mb-3">
                        <Calculator size={14} /> Document Preview
                      </p>
                      <div className="space-y-2 text-sm text-gray-600">
                        {quotation.items.map((item) => (
                          <div key={item.itemId} className="flex items-center justify-between gap-4 bg-white border border-gray-100 rounded-lg px-3 py-2">
                            <div>
                              <p className="font-semibold text-gray-800">{item.name}</p>
                              <p className="text-xs text-gray-500">Qty {item.quantity} x ${item.unitPrice.toFixed(2)} | {item.sourceType ?? 'DIRECT'}</p>
                            </div>
                            <p className="font-semibold text-gray-900">${item.total.toFixed(2)}</p>
                          </div>
                        ))}
                        <div className="pt-2 border-t border-gray-200 space-y-1 text-xs text-gray-500">
                          <p>Subtotal: ${quotation.items.reduce((sum, item) => sum + item.total, 0).toFixed(2)}</p>
                          <p>Discount: ${quotation.discount.toFixed(2)}</p>
                          <p className="text-sm font-bold text-brand-accent">Total: ${quotation.totalAmount.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
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
                  <h3 className="font-bold text-lg">{editingQuotationId ? 'Edit Quotation' : 'Create New Quotation'}</h3>
                  <p className="text-xs text-gray-500">Choose stock items or add ad-hoc lines. GRN item price is locked; use discount.</p>
                </div>
                <button onClick={closeComposer} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveQuotation} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Customer</label>
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
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
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
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Customer Phone</label>
                    <input
                      required
                      value={newQuotation.customerPhone}
                      onChange={(event) => setNewQuotation((prev) => ({ ...prev, customerPhone: event.target.value }))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                      placeholder="0771234567"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Customer Name</label>
                  <input
                    required
                    value={newQuotation.customerName}
                    onChange={(event) => setNewQuotation((prev) => ({ ...prev, customerName: event.target.value }))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                    placeholder="Enter customer name"
                  />
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
                      <div key={`line-${index}`} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center bg-gray-50 p-2 rounded-lg border border-gray-200">
                        <div className="md:col-span-2 flex gap-1">
                          <button
                            type="button"
                            onClick={() => toggleLineMode(index, 'catalog')}
                            className={`flex-1 text-[11px] py-2 rounded border ${item.mode === 'catalog' ? 'bg-white border-brand-accent text-brand-accent font-bold' : 'border-gray-200 text-gray-500'}`}
                          >
                            Catalog
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleLineMode(index, 'adhoc')}
                            className={`flex-1 text-[11px] py-2 rounded border ${item.mode === 'adhoc' ? 'bg-white border-brand-accent text-brand-accent font-bold' : 'border-gray-200 text-gray-500'}`}
                          >
                            Ad-hoc
                          </button>
                        </div>
                        {item.mode === 'catalog' ? (
                          <select
                            value={item.inventoryItemId}
                            onChange={(event) => applyCatalogItem(index, event.target.value)}
                            className="md:col-span-3 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
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
                            className="md:col-span-3 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
                            placeholder="Custom item name"
                            required
                          />
                        )}
                        <input
                          value={item.unit}
                          onChange={(event) => updateLineItem(index, 'unit', event.target.value)}
                          className="md:col-span-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
                          placeholder="Unit"
                          required
                        />
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(event) => updateLineItem(index, 'quantity', event.target.value)}
                          className="md:col-span-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
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
                          className="md:col-span-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm read-only:bg-gray-100"
                          placeholder="Unit price"
                          required
                        />
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.lineDiscount}
                          onChange={(event) => updateLineItem(index, 'lineDiscount', event.target.value)}
                          className="md:col-span-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
                          placeholder="Disc"
                        />
                        <button
                          type="button"
                          onClick={() => removeLineItem(index)}
                          disabled={lineItems.length === 1}
                          className="md:col-span-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-red-500 hover:bg-red-50 disabled:text-gray-300 disabled:hover:bg-transparent"
                        >
                          Remove
                        </button>
                        {item.lockPrice && (
                          <p className="md:col-span-12 text-[11px] text-amber-700 px-2">GRN item detected: base selling price is locked. Apply discount only.</p>
                        )}
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
                      onChange={(event) => setNewQuotation((prev) => ({ ...prev, discount: event.target.value }))}
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
                    onClick={closeComposer}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-brand-accent text-white rounded-lg text-sm font-bold hover:bg-blue-700"
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
