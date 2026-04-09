import { useMemo, useState, type FormEvent } from 'react';
import { Search, Printer, Edit3, History, X, Calculator, ReceiptText, Trash2, Mail, Download, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { AdvancePayment, CustomerProfile, Invoice, Quotation, QuotationItem } from '../types';

interface InvoicesProps {
  customers: CustomerProfile[];
  quotations: Quotation[];
  invoices: Invoice[];
  advancePayments: AdvancePayment[];
  selectedCustomerId: string;
  selectedQuotationId: string;
  selectedInvoiceId: string;
  onSelectCustomer: (customerId: string) => void;
  onSelectQuotation: (quotationId: string) => void;
  onSelectInvoice: (invoiceId: string) => void;
  onUpdateInvoice: (invoiceId: string, updates: Partial<Omit<Invoice, 'id' | 'quotationId' | 'createdAt' | 'history'>>) => void;
  onPrintInvoice: (invoiceId: string) => void;
  onDeleteInvoice: (invoiceId: string) => void;
  onRecordAdvancePayment: (invoiceId: string, payment: { amount: number; method: 'Cash' | 'Card' | 'Bank Transfer'; reference: string }) => void;
  onSendInvoiceByEmail: (invoiceId: string) => void;
  onDownloadInvoicePdf: (invoiceId: string) => void;
}

interface LineItemDraft {
  name: string;
  quantity: string;
  unitPrice: string;
}

const emptyLineItem = (): LineItemDraft => ({ name: '', quantity: '1', unitPrice: '0' });

const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const buildInvoicePrintHtml = (
  invoice: Invoice,
  quotation: Quotation | undefined
) => {
  const issueDate = new Date(invoice.createdAt).toLocaleDateString();
  const updatedAt = new Date(invoice.updatedAt).toLocaleString();

  const itemRows = invoice.items
    .map(
      (item, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${escapeHtml(item.name)}</td>
          <td class="num">${item.quantity}</td>
          <td class="num">${formatCurrency(item.unitPrice)}</td>
          <td class="num">${formatCurrency(item.total)}</td>
        </tr>
      `
    )
    .join('');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Invoice ${escapeHtml(invoice.id)}</title>
  <style>
    @page { margin: 14mm; }
    body {
      font-family: "Segoe UI", Tahoma, Arial, sans-serif;
      color: #111827;
      margin: 0;
      background: #ffffff;
      font-size: 12px;
      line-height: 1.45;
    }
    .invoice {
      max-width: 900px;
      margin: 0 auto;
      border: 1px solid #e5e7eb;
      padding: 24px;
      box-sizing: border-box;
    }
    .header {
      display: flex;
      justify-content: space-between;
      gap: 24px;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 14px;
      margin-bottom: 16px;
    }
    .company h1 {
      margin: 0;
      font-size: 20px;
      letter-spacing: 0.5px;
    }
    .company p, .meta p {
      margin: 2px 0;
      color: #4b5563;
      font-size: 11px;
    }
    .meta {
      text-align: right;
    }
    .meta .invoice-id {
      font-size: 16px;
      font-weight: 700;
      color: #1d4ed8;
      margin-bottom: 6px;
    }
    .two-col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
      margin: 12px 0 16px;
    }
    .card {
      border: 1px solid #e5e7eb;
      padding: 10px;
      border-radius: 6px;
      min-height: 74px;
    }
    .card-title {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      color: #6b7280;
      margin-bottom: 6px;
      font-weight: 700;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      border: 1px solid #e5e7eb;
      padding: 7px 8px;
      text-align: left;
      vertical-align: top;
    }
    th {
      background: #f9fafb;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      color: #374151;
    }
    .num { text-align: right; }
    .summary {
      margin-top: 14px;
      width: 320px;
      margin-left: auto;
    }
    .summary td {
      border: none;
      border-bottom: 1px solid #e5e7eb;
      padding: 6px 0;
    }
    .summary tr:last-child td {
      border-bottom: 2px solid #1d4ed8;
      font-weight: 700;
      color: #1d4ed8;
      font-size: 14px;
    }
    .section-title {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.7px;
      color: #374151;
      font-weight: 700;
      margin: 20px 0 8px;
    }
    .footer {
      margin-top: 24px;
      border-top: 1px solid #e5e7eb;
      padding-top: 10px;
      font-size: 11px;
      color: #6b7280;
      display: flex;
      justify-content: space-between;
      gap: 12px;
    }
  </style>
</head>
<body>
  <div class="invoice">
    <div class="header">
      <div class="company">
        <h1>CRM Solutions</h1>
        <p>Kitchen and Interior Specialists</p>
        <p>Colombo, Sri Lanka</p>
        <p>Phone: +94 77 000 0000</p>
      </div>
      <div class="meta">
        <p class="invoice-id">INVOICE ${escapeHtml(invoice.id)}</p>
        <p>Issue Date: ${escapeHtml(issueDate)}</p>
        <p>Status: ${escapeHtml(invoice.status)}</p>
        <p>Revision: ${invoice.revisionNo ?? 1}</p>
      </div>
    </div>

    <div class="two-col">
      <div class="card">
        <div class="card-title">Bill To</div>
        <p><strong>${escapeHtml(invoice.customerName)}</strong></p>
        <p>Phone: ${escapeHtml(invoice.customerPhone)}</p>
      </div>
      <div class="card">
        <div class="card-title">Reference</div>
        <p>Quotation: ${escapeHtml(invoice.quotationId)}</p>
        <p>Printed Copies: ${invoice.printCount + 1}</p>
        <p>Last Updated: ${escapeHtml(updatedAt)}</p>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 42px;">#</th>
          <th>Description</th>
          <th style="width: 90px;" class="num">Qty</th>
          <th style="width: 110px;" class="num">Unit Price</th>
          <th style="width: 120px;" class="num">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
      </tbody>
    </table>

    <table class="summary">
      <tbody>
        <tr>
          <td>Subtotal</td>
          <td class="num">${formatCurrency(invoice.subtotal)}</td>
        </tr>
        <tr>
          <td>Discount</td>
          <td class="num">${formatCurrency(invoice.discount)}</td>
        </tr>
        <tr>
          <td>Advance Paid</td>
          <td class="num">${formatCurrency(invoice.advancePaid ?? 0)}</td>
        </tr>
        <tr>
          <td>Balance Due</td>
          <td class="num">${formatCurrency(invoice.balanceDue ?? invoice.totalAmount)}</td>
        </tr>
        <tr>
          <td>Total Due</td>
          <td class="num">${formatCurrency(invoice.totalAmount)}</td>
        </tr>
      </tbody>
    </table>

    <div class="footer">
      <span>Thank you for your business.</span>
      <span>${escapeHtml(quotation ? `Source quotation: ${quotation.id}` : 'Generated from invoice module')}</span>
    </div>
  </div>
</body>
</html>`;
};

export default function Invoices({
  customers,
  quotations,
  invoices,
  advancePayments,
  selectedCustomerId,
  selectedQuotationId,
  selectedInvoiceId,
  onSelectCustomer,
  onSelectQuotation,
  onSelectInvoice,
  onUpdateInvoice,
  onPrintInvoice,
  onDeleteInvoice,
  onRecordAdvancePayment,
  onSendInvoiceByEmail,
  onDownloadInvoicePdf
}: InvoicesProps) {
  const [search, setSearch] = useState('');
  const [editingInvoiceId, setEditingInvoiceId] = useState('');
  const [selectedDetailId, setSelectedDetailId] = useState(selectedInvoiceId);
  const [invoiceDraft, setInvoiceDraft] = useState({
    customerId: selectedCustomerId,
    customerName: '',
    customerPhone: '',
    discount: '0',
    status: 'Draft' as Invoice['status']
  });
  const [lineItems, setLineItems] = useState<LineItemDraft[]>([emptyLineItem()]);
  const [paymentForm, setPaymentForm] = useState({ amount: '0', method: 'Bank Transfer' as 'Cash' | 'Card' | 'Bank Transfer', reference: '' });

  const selectedInvoice = invoices.find((invoice) => invoice.id === selectedDetailId);
  const selectedCustomer = customers.find((customer) => customer.id === (invoiceDraft.customerId || selectedCustomerId));
  const linkedQuotation = quotations.find((quotation) => quotation.id === (selectedInvoice?.quotationId ?? selectedQuotationId));

  const openEditComposer = (invoice: Invoice) => {
    setEditingInvoiceId(invoice.id);
    setSelectedDetailId(invoice.id);
    onSelectInvoice(invoice.id);
    onSelectCustomer(invoice.customerId);
    onSelectQuotation(invoice.quotationId);
    setInvoiceDraft({
      customerId: invoice.customerId,
      customerName: invoice.customerName,
      customerPhone: invoice.customerPhone,
      discount: String(invoice.discount),
      status: invoice.status
    });
    setLineItems(
      invoice.items.length > 0
        ? invoice.items.map((item) => ({
            name: item.name,
            quantity: String(item.quantity),
            unitPrice: String(item.unitPrice)
          }))
        : [emptyLineItem()]
    );
  };

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

  const discountValue = Number(invoiceDraft.discount) || 0;
  const total = Math.max(0, subTotal - discountValue);

  const filteredInvoices = invoices.filter((invoice) => {
    const query = search.toLowerCase();
    return (
      invoice.id.toLowerCase().includes(query) ||
      invoice.quotationId.toLowerCase().includes(query) ||
      invoice.customerName.toLowerCase().includes(query) ||
      invoice.customerPhone.includes(search) ||
      invoice.status.toLowerCase().includes(query)
    );
  });

  const resetForm = () => {
    setInvoiceDraft({
      customerId: selectedCustomerId,
      customerName: '',
      customerPhone: '',
      discount: '0',
      status: 'Draft'
    });
    setLineItems([emptyLineItem()]);
  };

  const closeComposer = () => {
    setEditingInvoiceId('');
    resetForm();
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

  const prepareItems = (): QuotationItem[] =>
    lineItems
      .filter((item) => item.name.trim() !== '')
      .map((item, index) => {
        const quantity = Number(item.quantity) || 0;
        const unitPrice = Number(item.unitPrice) || 0;
        return {
          itemId: `inv-${Date.now()}-${index}`,
          name: item.name.trim(),
          quantity,
          unitPrice,
          total: quantity * unitPrice
        };
      })
      .filter((item) => item.quantity > 0 && item.unitPrice >= 0);

  const handleSaveInvoice = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingInvoiceId) {
      return;
    }

    const items = prepareItems();
    if (items.length === 0) {
      return;
    }

    const customer = customers.find((item) => item.id === invoiceDraft.customerId);
    onUpdateInvoice(editingInvoiceId, {
      customerId: invoiceDraft.customerId,
      customerName: invoiceDraft.customerName.trim() || customer?.name || 'Customer',
      customerPhone: invoiceDraft.customerPhone.trim() || customer?.phone || '',
      items,
      subtotal: subTotal,
      discount: discountValue,
      totalAmount: total,
      status: invoiceDraft.status
    });

    setEditingInvoiceId('');
    resetForm();
  };

  const handlePrintInvoice = (invoice: Invoice) => {
    const relatedQuotation = quotations.find((quotation) => quotation.id === invoice.quotationId);
    const printMarkup = buildInvoicePrintHtml(invoice, relatedQuotation);

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.setAttribute('aria-hidden', 'true');
    document.body.appendChild(iframe);

    const iframeDocument = iframe.contentDocument ?? iframe.contentWindow?.document;
    if (!iframeDocument || !iframe.contentWindow) {
      document.body.removeChild(iframe);
      window.alert('Unable to start print. Please try again.');
      return;
    }

    iframeDocument.open();
    iframeDocument.write(printMarkup);
    iframeDocument.close();

    onSelectInvoice(invoice.id);
    onSelectCustomer(invoice.customerId);
    onSelectQuotation(invoice.quotationId);
    onUpdateInvoice(invoice.id, {
      status: 'Printed',
      printCount: invoice.printCount + 1
    });
    onPrintInvoice(invoice.id);

    iframe.onload = () => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();

      // Cleanup the temporary print frame once print dialog has had time to initialize.
      window.setTimeout(() => {
        if (iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
      }, 1000);
    };
  };

  const handleAdvancePayment = (invoiceId: string) => {
    const amount = Number(paymentForm.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return;
    }
    onRecordAdvancePayment(invoiceId, {
      amount,
      method: paymentForm.method,
      reference: paymentForm.reference
    });
    setPaymentForm({ amount: '0', method: 'Bank Transfer', reference: '' });
  };

  const selectedQuotation = linkedQuotation ?? quotations.find((quotation) => quotation.id === selectedQuotationId);

  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black tracking-tight text-brand-ink">Invoices</h2>
          <p className="text-brand-text font-medium text-sm mt-1">Edit, print, and keep revision history for every invoice handed over from a quotation.</p>
        </div>
      </header>

      {(selectedInvoice || selectedQuotation) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {selectedInvoice && (
            <div className="card">
              <p className="text-[10px] uppercase tracking-[0.2em] text-brand-text font-black">Selected Invoice</p>
              <div className="mt-2 flex flex-col gap-1">
                <p className="text-sm font-bold text-brand-ink">{selectedInvoice.id}</p>
                <p className="text-sm text-slate-500 font-medium">{selectedInvoice.customerName} ({selectedInvoice.customerPhone})</p>
                <p className="text-xs text-brand-text">From quotation {selectedInvoice.quotationId}</p>
              </div>
            </div>
          )}
          {selectedQuotation && (
            <div className="card">
              <p className="text-[10px] uppercase tracking-[0.2em] text-brand-text font-black">Linked Quotation</p>
              <div className="mt-2 flex flex-col gap-1">
                <p className="text-sm font-bold text-brand-ink">{selectedQuotation.id}</p>
                <p className="text-sm text-slate-500 font-medium">{selectedQuotation.customerName} ({selectedQuotation.customerPhone})</p>
                <p className="text-xs text-brand-text font-semibold">Status: <span className="text-brand-accent">{selectedQuotation.status}</span></p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="card !p-4 flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search invoices by ID, quotation, customer, phone, or status"
            className="input-field pl-10"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredInvoices.length === 0 ? (
          <div className="card border-dashed p-10 text-center text-sm font-semibold text-brand-text">
            No invoices yet. Handover a quotation to start an invoice history.
          </div>
        ) : (
          filteredInvoices.map((invoice) => {
            const isSelected = selectedDetailId === invoice.id;
            return (
              <motion.div
                key={invoice.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`card transition-all group ${isSelected ? 'border-brand-accent/50 ring-2 ring-brand-accent/20 shadow-md' : 'hover:border-brand-accent/30 hover:shadow-elevated'}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-brand-subtle flex items-center justify-center text-slate-400 group-hover:bg-brand-accent/10 group-hover:text-brand-accent transition-colors shadow-sm">
                      <ReceiptText size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-extrabold text-brand-ink text-sm tracking-tight">{invoice.id}</h3>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${invoice.status === 'Draft' ? 'bg-slate-50 text-slate-500 border-slate-200' : invoice.status === 'Printed' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                          {invoice.status}
                        </span>
                      </div>
                      <p className="text-xs text-brand-text mt-1 font-medium">
                        Customer:{' '}
                        <span className="text-slate-600 font-bold">
                          {invoice.customerName} ({invoice.customerPhone})
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-[10px] text-brand-text font-black uppercase tracking-[0.1em]">Total Amount</p>
                      <p className="text-lg font-black font-mono text-brand-ink mt-0.5">${invoice.totalAmount.toFixed(2)}</p>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      <button
                        title="Edit"
                        onClick={() => openEditComposer(invoice)}
                        className="p-2.5 text-slate-400 hover:text-brand-accent hover:bg-brand-accent/10 rounded-xl transition-all font-bold shadow-sm border border-transparent hover:border-brand-accent/20"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button
                        title="Print"
                        onClick={() => handlePrintInvoice(invoice)}
                        className="p-2.5 text-slate-400 hover:text-brand-accent hover:bg-brand-accent/10 rounded-xl transition-all font-bold shadow-sm border border-transparent hover:border-brand-accent/20"
                      >
                        <Printer size={18} />
                      </button>
                      <button
                        title="View History"
                        onClick={() => {
                          setSelectedDetailId((current) => (current === invoice.id ? '' : invoice.id));
                          onSelectInvoice(invoice.id);
                        }}
                        className={`p-2.5 rounded-xl transition-all font-bold shadow-sm border ${isSelected ? 'bg-brand-accent/10 border-brand-accent/20 text-brand-accent' : 'text-slate-400 hover:text-brand-accent hover:bg-brand-accent/10 border-transparent hover:border-brand-accent/20'}`}
                      >
                        <History size={18} />
                      </button>
                      <button
                        title="Delete"
                        onClick={() => {
                          if (window.confirm(`Delete invoice ${invoice.id}?`)) {
                            onDeleteInvoice(invoice.id);
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
                      <Calculator size={14} className="text-violet-500" />
                      <span>Print count <span className="text-brand-ink">{invoice.printCount}</span></span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-brand-text">
                      <Wallet size={14} className="text-emerald-500" />
                      <span>Advance <span className="text-emerald-600">${((invoice.advancePaid ?? 0)).toFixed(2)}</span> | Balance <span className="text-amber-600">${((invoice.balanceDue ?? invoice.totalAmount)).toFixed(2)}</span></span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono font-medium">Last modified: {new Date(invoice.updatedAt).toLocaleString()}</p>
                </div>

                {isSelected && (
                  <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="bg-brand-subtle border border-brand-line rounded-xl p-4">
                      <p className="text-xs font-black uppercase tracking-[0.1em] text-brand-text flex items-center gap-2 mb-3">
                        <History size={14} className="text-brand-accent" /> Revision History
                      </p>
                      <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                        {invoice.history.length === 0 ? (
                          <p className="text-sm text-slate-500">No edits yet.</p>
                        ) : (
                          invoice.history.slice().reverse().map((entry) => (
                            <div key={entry.id} className="bg-white border border-brand-line rounded-xl p-3 shadow-sm">
                              <div className="flex items-center justify-between gap-2 text-[11px] text-slate-400 font-bold tracking-wider uppercase">
                                <span>{entry.editor}</span>
                                <span>{new Date(entry.timestamp).toLocaleDateString()}</span>
                              </div>
                              <p className="text-sm text-brand-ink font-semibold mt-1">v{invoice.revisionNo ?? 1} - {entry.note}</p>
                              <p className="text-xs text-brand-text font-medium mt-1">Total: <span className="font-bold text-brand-ink">${entry.totalAmount.toFixed(2)}</span> | Discount: ${entry.discount.toFixed(2)}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="bg-brand-bg border border-brand-line rounded-xl p-4">
                      <p className="text-xs font-black uppercase tracking-[0.1em] text-brand-text flex items-center gap-2 mb-3">
                        <Calculator size={14} className="text-brand-accent" /> Invoice Preview
                      </p>
                      <div className="space-y-3 text-sm text-brand-text font-medium">
                        {invoice.items.map((item) => (
                          <div key={item.itemId} className="flex items-center justify-between gap-4 card !p-3">
                            <div>
                              <p className="font-bold text-brand-ink">{item.name}</p>
                              <p className="text-xs text-slate-500 mt-0.5">Qty <span className="font-bold">{item.quantity}</span> x ${item.unitPrice.toFixed(2)}</p>
                            </div>
                            <p className="font-black text-brand-ink">${item.total.toFixed(2)}</p>
                          </div>
                        ))}
                        <div className="pt-3 border-t border-brand-line space-y-1.5 text-xs text-brand-text">
                          <p className="flex justify-between"><span>Subtotal:</span> <span>${invoice.subtotal.toFixed(2)}</span></p>
                          <p className="flex justify-between"><span>Discount:</span> <span>${invoice.discount.toFixed(2)}</span></p>
                          <p className="flex justify-between text-sm font-black text-brand-ink mt-1 pt-1 border-t border-slate-200"><span>Total:</span> <span>${invoice.totalAmount.toFixed(2)}</span></p>
                          <p className="flex justify-between text-xs font-bold text-emerald-600 mt-1"><span>Advance:</span> <span>${((invoice.advancePaid ?? 0)).toFixed(2)}</span></p>
                          <p className="flex justify-between text-sm font-black text-brand-accent mt-1"><span>Balance:</span> <span>${((invoice.balanceDue ?? invoice.totalAmount)).toFixed(2)}</span></p>
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-2 bg-brand-subtle border border-brand-line rounded-xl p-5">
                      <p className="text-xs font-black uppercase tracking-[0.1em] text-brand-text mb-4">Advance Payment & Delivery</p>
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={paymentForm.amount}
                          onChange={(event) => setPaymentForm((prev) => ({ ...prev, amount: event.target.value }))}
                          className="md:col-span-1 input-field !py-2.5"
                          placeholder="Amount"
                        />
                        <select
                          value={paymentForm.method}
                          onChange={(event) => setPaymentForm((prev) => ({ ...prev, method: event.target.value as 'Cash' | 'Card' | 'Bank Transfer' }))}
                          className="md:col-span-1 input-field !py-2.5"
                        >
                          <option value="Bank Transfer">Bank Transfer</option>
                          <option value="Card">Card</option>
                          <option value="Cash">Cash</option>
                        </select>
                        <input
                          value={paymentForm.reference}
                          onChange={(event) => setPaymentForm((prev) => ({ ...prev, reference: event.target.value }))}
                          className="md:col-span-2 input-field !py-2.5"
                          placeholder="Reference"
                        />
                        <button
                          onClick={() => handleAdvancePayment(invoice.id)}
                          className="md:col-span-1 btn-primary !bg-emerald-600 hover:!bg-emerald-700 w-full"
                        >
                          Record
                        </button>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <button
                          onClick={() => onSendInvoiceByEmail(invoice.id)}
                          className="btn-secondary flex items-center justify-center gap-2 text-xs"
                        >
                          <Mail size={16} className="text-brand-accent inline" /> Send by Email
                        </button>
                        <button
                          onClick={() => onDownloadInvoicePdf(invoice.id)}
                          className="btn-secondary flex items-center justify-center gap-2 text-xs"
                        >
                          <Download size={16} className="text-brand-accent inline" /> Download PDF
                        </button>
                      </div>
                      <div className="mt-4 pt-3 border-t border-brand-line space-y-1.5">
                        <p className="text-xs text-brand-text font-black uppercase tracking-[0.1em]">Invoice delivery history</p>
                        {(invoice.emailLog ?? []).length === 0 ? (
                          <p className="text-xs text-slate-400 font-medium">No email sent yet.</p>
                        ) : (
                          (invoice.emailLog ?? []).map((entry) => (
                            <p key={entry} className="text-xs text-slate-600 font-medium">{entry}</p>
                          ))
                        )}
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
        {editingInvoiceId && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white rounded-2xl shadow-2xl border border-brand-line w-full max-w-4xl overflow-hidden"
            >
              <div className="p-6 border-b border-brand-line flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-extrabold text-lg text-brand-ink">Edit Invoice</h3>
                  <p className="text-xs text-brand-text font-medium mt-1">Update invoice details. Previous version is captured in invoice history.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={closeComposer}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button type="button" onClick={closeComposer} className="text-gray-400 hover:text-gray-600" title="Close">
                    <X size={20} />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSaveInvoice} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black tracking-[0.1em] text-brand-text">Customer</label>
                    <select
                      value={invoiceDraft.customerId}
                      onChange={(event) => {
                        const customer = customers.find((item) => item.id === event.target.value);
                        setInvoiceDraft((prev) => ({
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
                      value={invoiceDraft.customerPhone}
                      onChange={(event) => setInvoiceDraft((prev) => ({ ...prev, customerPhone: event.target.value }))}
                      className="input-field !py-2.5"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black tracking-[0.1em] text-brand-text">Customer Name</label>
                  <input
                    required
                    value={invoiceDraft.customerName}
                    onChange={(event) => setInvoiceDraft((prev) => ({ ...prev, customerName: event.target.value }))}
                    className="input-field !py-2.5"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black tracking-[0.1em] text-brand-text">Status</label>
                  <select
                    value={invoiceDraft.status}
                    onChange={(event) => setInvoiceDraft((prev) => ({ ...prev, status: event.target.value as Invoice['status'] }))}
                    className="input-field !py-2.5"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Printed">Printed</option>
                    <option value="Paid">Paid</option>
                  </select>
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

                  <div className="space-y-3">
                    {lineItems.map((item, index) => (
                      <div key={`inv-line-${index}`} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                        <input
                          value={item.name}
                          onChange={(event) => updateLineItem(index, 'name', event.target.value)}
                          className="md:col-span-5 input-field !py-2.5"
                          placeholder="Item name"
                          required
                        />
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(event) => updateLineItem(index, 'quantity', event.target.value)}
                          className="md:col-span-2 input-field !py-2.5"
                          placeholder="Qty"
                          required
                        />
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(event) => updateLineItem(index, 'unitPrice', event.target.value)}
                          className="md:col-span-3 input-field !py-2.5"
                          placeholder="Unit price"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => removeLineItem(index)}
                          disabled={lineItems.length === 1}
                          className="md:col-span-2 btn-danger disabled:opacity-50 disabled:cursor-not-allowed !py-2.5 w-full"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black tracking-[0.1em] text-brand-text">Discount</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={invoiceDraft.discount}
                      onChange={(event) => setInvoiceDraft((prev) => ({ ...prev, discount: event.target.value }))}
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

                <div className="pt-4 mt-4 border-t border-brand-line flex gap-3">
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
                    Save as New Revision
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="card">
        <p className="text-xs font-black uppercase tracking-[0.1em] text-brand-text flex items-center gap-2 mb-3">
          <Wallet size={16} className="text-brand-accent" /> Advance Payment Ledger
        </p>
        <div className="mt-2 max-h-44 overflow-y-auto space-y-3 pr-1">
          {advancePayments.length === 0 ? (
            <p className="text-sm text-slate-500 font-medium">No advance payments recorded.</p>
          ) : (
            advancePayments.map((entry) => (
              <div key={entry.id} className="border border-brand-line bg-brand-subtle rounded-xl p-3 text-sm">
                <p className="font-bold text-brand-ink">{entry.invoiceId} - <span className="text-emerald-600">${entry.amount.toFixed(2)}</span></p>
                <p className="text-xs font-medium text-brand-text mt-1">{entry.method} | {entry.reference || 'No ref'} | {new Date(entry.paidAt).toLocaleString()}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
