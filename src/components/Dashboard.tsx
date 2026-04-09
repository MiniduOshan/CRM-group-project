import { useMemo, useRef, useState, type FormEvent } from 'react';
import {
  Users,
  UserPlus,
  FileText,
  Calculator,
  Phone,
  ClipboardList,
  BadgeDollarSign,
  NotebookPen,
  Upload,
  Plus,
  Pencil,
  MapPin,
  Share2,
  Clock3,
  Crown,
  CircleDot
} from 'lucide-react';

interface DashboardCustomer {
  id: string;
  name: string;
  phone: string;
  address: string;
}

interface DashboardQuotation {
  id: string;
  customerId: string;
  customerName: string;
  amount: number;
  discount: number;
  finalAmount: number;
  createdAt: string;
  note?: string;
}

const initialCustomers: DashboardCustomer[] = [
  { id: 'c-1', name: 'Sarah Jenkins', phone: '0771234567', address: '123 Main St, Colombo' },
  { id: 'c-2', name: 'Michael Chen', phone: '0779876543', address: '45 Park Ave, Kandy' }
];

export default function Dashboard() {
  const [customers, setCustomers] = useState<DashboardCustomer[]>(initialCustomers);
  const [quotations, setQuotations] = useState<DashboardQuotation[]>([]);
  const [activeCustomerId, setActiveCustomerId] = useState(initialCustomers[0]?.id ?? '');
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', address: '' });
  const [quoteForm, setQuoteForm] = useState({ amount: '0', discount: '0', note: '' });
  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  const [editCustomer, setEditCustomer] = useState({ name: '', phone: '', address: '' });
  const amountInputRef = useRef<HTMLInputElement | null>(null);

  const selectedCustomer = customers.find((customer) => customer.id === activeCustomerId);

  const quoteAmount = Number(quoteForm.amount) || 0;
  const quoteDiscount = Number(quoteForm.discount) || 0;
  const quoteFinal = Math.max(0, quoteAmount - quoteDiscount);

  const totalRevenue = useMemo(
    () => quotations.reduce((sum, quotation) => sum + quotation.finalAmount, 0),
    [quotations]
  );

  const selectedCustomerQuotations = useMemo(
    () => quotations.filter((quotation) => quotation.customerId === activeCustomerId),
    [quotations, activeCustomerId]
  );

  const addCustomer = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const phoneExists = customers.some((customer) => customer.phone === newCustomer.phone.trim());
    if (phoneExists) {
      return;
    }

    const customer: DashboardCustomer = {
      id: `c-${Date.now()}`,
      name: newCustomer.name.trim(),
      phone: newCustomer.phone.trim(),
      address: newCustomer.address.trim()
    };

    setCustomers((prev) => [customer, ...prev]);
    setActiveCustomerId(customer.id);
    setNewCustomer({ name: '', phone: '', address: '' });
  };

  const beginEditSelectedCustomer = () => {
    if (!selectedCustomer) {
      return;
    }

    setEditCustomer({
      name: selectedCustomer.name,
      phone: selectedCustomer.phone,
      address: selectedCustomer.address
    });
    setIsEditingCustomer(true);
  };

  const saveSelectedCustomer = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedCustomer) {
      return;
    }

    const duplicatePhone = customers.some(
      (customer) => customer.id !== selectedCustomer.id && customer.phone === editCustomer.phone.trim()
    );

    if (duplicatePhone) {
      return;
    }

    setCustomers((prev) =>
      prev.map((customer) =>
        customer.id === selectedCustomer.id
          ? {
              ...customer,
              name: editCustomer.name.trim(),
              phone: editCustomer.phone.trim(),
              address: editCustomer.address.trim()
            }
          : customer
      )
    );

    setIsEditingCustomer(false);
  };

  const createQuotation = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedCustomer || quoteAmount <= 0) {
      return;
    }

    const quotation: DashboardQuotation = {
      id: `QT-${new Date().getFullYear()}-${String(quotations.length + 1).padStart(3, '0')}`,
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      amount: quoteAmount,
      discount: quoteDiscount,
      finalAmount: quoteFinal,
      createdAt: new Date().toISOString(),
      note: quoteForm.note.trim()
    };

    setQuotations((prev) => [quotation, ...prev]);
    setQuoteForm({ amount: '0', discount: '0', note: '' });
  };

  const handleQuickAction = (action: 'call-note' | 'generate-quote' | 'upload-design') => {
    if (action === 'call-note') {
      setQuoteForm((prev) => ({
        ...prev,
        note: prev.note.trim() === '' ? `Call note for ${selectedCustomer?.name ?? 'customer'}: ` : prev.note
      }));
      return;
    }

    if (action === 'generate-quote') {
      amountInputRef.current?.focus();
      return;
    }

    setQuoteForm((prev) => ({
      ...prev,
      note: prev.note.trim() === '' ? 'Design document uploaded and shared.' : prev.note
    }));
  };

  const customerDuplicatePhone = customers.some((customer) => customer.phone === newCustomer.phone.trim());

  const handleShareDetails = async () => {
    if (!selectedCustomer) {
      return;
    }

    const message = `${selectedCustomer.name} | ${selectedCustomer.phone} | ${selectedCustomer.address}`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(message);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <header>
        <h2 className="text-2xl font-bold tracking-tight">Single Customer Workspace</h2>
        <p className="text-gray-500 text-sm">Select one customer, edit details if needed, then create a quotation for that same customer.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-brand-line shadow-sm p-4">
          <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Customers</p>
          <p className="mt-1 text-2xl font-bold text-gray-700 flex items-center gap-2"><Users size={20} className="text-brand-accent" />{customers.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-brand-line shadow-sm p-4">
          <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Selected Customer</p>
          <p className="mt-1 text-lg font-bold text-gray-700 truncate">{selectedCustomer?.name ?? 'None selected'}</p>
        </div>
        <div className="bg-white rounded-xl border border-brand-line shadow-sm p-4">
          <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Quotations Created</p>
          <p className="mt-1 text-2xl font-bold text-gray-700 flex items-center gap-2"><ClipboardList size={20} className="text-brand-accent" />{quotations.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <section className="xl:col-span-1 bg-white rounded-xl border border-brand-line p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm">Customers</h3>
            <span className="text-xs font-mono text-gray-400">{customers.length}</span>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto">
            {customers.map((customer) => {
              const active = customer.id === activeCustomerId;
              return (
                <button
                  key={customer.id}
                  onClick={() => {
                    setActiveCustomerId(customer.id);
                    setIsEditingCustomer(false);
                  }}
                  className={`w-full text-left rounded-lg border px-3 py-2 ${active ? 'border-brand-accent bg-brand-accent/5' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`}
                >
                  <p className="text-sm font-semibold text-gray-700">{customer.name}</p>
                  <p className="text-xs text-gray-500">{customer.phone}</p>
                </button>
              );
            })}
          </div>

          {selectedCustomer && (
            <button
              type="button"
              onClick={beginEditSelectedCustomer}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
            >
              <Pencil size={14} /> Edit Selected Customer
            </button>
          )}
        </section>

        <section className="xl:col-span-1 bg-white rounded-xl border border-brand-line p-6 shadow-sm">
          <h3 className="font-bold text-sm flex items-center gap-2 mb-4"><UserPlus size={16} className="text-brand-accent" /> Add Customer</h3>
          <form onSubmit={addCustomer} className="space-y-3">
            <input
              required
              value={newCustomer.name}
              onChange={(e) => setNewCustomer((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Customer full name"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
            />
            <input
              required
              value={newCustomer.phone}
              onChange={(e) => setNewCustomer((prev) => ({ ...prev, phone: e.target.value }))}
              placeholder="Telephone number"
              className={`w-full px-3 py-2 bg-gray-50 border rounded-lg text-sm ${customerDuplicatePhone ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
            />
            {customerDuplicatePhone && <p className="text-xs text-red-600">This phone number is already registered.</p>}
            <textarea
              required
              value={newCustomer.address}
              onChange={(e) => setNewCustomer((prev) => ({ ...prev, address: e.target.value }))}
              placeholder="Address"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm h-20"
            />
            <button
              type="submit"
              disabled={customerDuplicatePhone}
              className="w-full bg-brand-accent text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Customer
            </button>
          </form>

          {isEditingCustomer && selectedCustomer && (
            <form onSubmit={saveSelectedCustomer} className="space-y-2 mt-5 pt-4 border-t border-gray-100">
              <p className="text-xs font-bold uppercase text-gray-400 tracking-wider">Edit Active Customer</p>
              <input
                required
                value={editCustomer.name}
                onChange={(e) => setEditCustomer((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
              />
              <input
                required
                value={editCustomer.phone}
                onChange={(e) => setEditCustomer((prev) => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
              />
              <textarea
                required
                value={editCustomer.address}
                onChange={(e) => setEditCustomer((prev) => ({ ...prev, address: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm h-20"
              />
              <div className="flex gap-2">
                <button type="button" onClick={() => setIsEditingCustomer(false)} className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600">
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-3 py-2 bg-brand-accent text-white rounded-lg text-xs font-semibold">
                  Save Edit
                </button>
              </div>
            </form>
          )}
        </section>

        <section className="xl:col-span-1 bg-white rounded-xl border border-brand-line p-6 shadow-sm">
          <h3 className="font-bold text-sm flex items-center gap-2 mb-4"><FileText size={16} className="text-brand-accent" /> Make Quotation</h3>
          <form onSubmit={createQuotation} className="space-y-3">
            {selectedCustomer && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-600 space-y-1">
                <p className="font-semibold text-gray-700">Selected Customer</p>
                <p className="flex items-center gap-1"><Phone size={12} className="text-gray-400" /> {selectedCustomer.phone}</p>
                <p>{selectedCustomer.address}</p>
              </div>
            )}

            <input
              ref={amountInputRef}
              type="number"
              min="0"
              value={quoteForm.amount}
              onChange={(e) => setQuoteForm((prev) => ({ ...prev, amount: e.target.value }))}
              placeholder="Quotation amount"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
            />
            <input
              type="number"
              min="0"
              value={quoteForm.discount}
              onChange={(e) => setQuoteForm((prev) => ({ ...prev, discount: e.target.value }))}
              placeholder="Discount"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
            />

            <textarea
              value={quoteForm.note}
              onChange={(e) => setQuoteForm((prev) => ({ ...prev, note: e.target.value }))}
              placeholder="Optional note"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm h-20"
            />

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm">
              <p className="flex items-center gap-1 font-medium text-blue-700"><Calculator size={14} /> Final Total</p>
              <p className="text-lg font-bold text-blue-800 mt-1">${quoteFinal.toFixed(2)}</p>
            </div>

            <button
              type="submit"
              disabled={!selectedCustomer || quoteAmount <= 0}
              className="w-full bg-brand-accent text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Quotation
            </button>
          </form>
        </section>

        <aside className="xl:col-span-1 bg-[#f8fafc] rounded-2xl border border-gray-200 p-4 shadow-sm h-fit">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-3">Quick Actions</p>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => handleQuickAction('call-note')}
              className="w-full flex items-center justify-between rounded-lg border border-gray-200 bg-[#eef2f7] px-3 py-2 text-sm text-gray-700 hover:bg-[#e9eef6]"
            >
              <span className="inline-flex items-center gap-2"><NotebookPen size={14} /> Log a Call/Note</span>
              <Plus size={14} className="text-gray-400" />
            </button>
            <button
              type="button"
              onClick={() => handleQuickAction('generate-quote')}
              className="w-full flex items-center justify-between rounded-lg border border-gray-200 bg-[#eef2f7] px-3 py-2 text-sm text-gray-700 hover:bg-[#e9eef6]"
            >
              <span className="inline-flex items-center gap-2"><FileText size={14} /> Generate Quote</span>
              <Plus size={14} className="text-gray-400" />
            </button>
            <button
              type="button"
              onClick={() => handleQuickAction('upload-design')}
              className="w-full flex items-center justify-between rounded-lg border border-gray-200 bg-[#eef2f7] px-3 py-2 text-sm text-gray-700 hover:bg-[#e9eef6]"
            >
              <span className="inline-flex items-center gap-2"><Upload size={14} /> Upload Design Doc</span>
              <Plus size={14} className="text-gray-400" />
            </button>
          </div>

          <div className="mt-3 text-xs text-gray-500 bg-white border border-gray-200 rounded-lg p-3">
            Actions apply to: <span className="font-semibold text-gray-700">{selectedCustomer?.name ?? 'No customer selected'}</span>
          </div>
        </aside>
      </div>

      <section className="bg-white rounded-xl border border-brand-line shadow-sm overflow-hidden">
        <div className="p-5 border-b border-brand-line flex items-center justify-between">
          <h3 className="text-xl font-bold tracking-tight">Customer Profile</h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={beginEditSelectedCustomer}
              className="inline-flex items-center gap-2 border border-gray-200 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              <Pencil size={12} /> Edit Profile
            </button>
            <button
              type="button"
              onClick={handleShareDetails}
              className="inline-flex items-center gap-2 border border-gray-200 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-gray-900 hover:bg-gray-800"
            >
              <Share2 size={12} /> Share Details
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3">
          <div className="lg:col-span-1 p-4 border-r border-brand-line bg-gray-50/40">
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="h-16 bg-gradient-to-r from-slate-900 to-slate-700" />
              <div className="px-4 pb-4 -mt-6">
                <div className="w-12 h-12 rounded-lg border-2 border-white bg-slate-800 text-white flex items-center justify-center text-sm font-bold shadow-sm">
                  {selectedCustomer?.name.split(' ').map((part) => part[0]).join('').slice(0, 2) ?? 'NA'}
                </div>
                <p className="mt-3 text-lg font-bold text-gray-800">{selectedCustomer?.name ?? 'No customer selected'}</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-gray-500">Premium Client</p>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold uppercase tracking-wider">
                    Stage: {selectedCustomerQuotations.length > 0 ? 'In Production' : 'New'}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 mt-1">since 2023</p>

                <div className="mt-4 space-y-3 text-xs text-gray-600">
                  <p className="flex items-center gap-2"><Phone size={12} className="text-emerald-600" /> {selectedCustomer?.phone ?? 'Not available'}</p>
                  <p className="flex items-start gap-2"><MapPin size={12} className="text-gray-500 mt-0.5" /> {selectedCustomer?.address ?? 'No address'}</p>
                  <p className="flex items-center gap-2"><Crown size={12} className="text-amber-500" /> Owner: Salesperson One</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="font-bold text-gray-800 flex items-center gap-2"><Clock3 size={16} className="text-emerald-600" /> Interaction Timeline</p>
              <button className="text-xs text-emerald-700 font-semibold">Filter Activity</button>
            </div>

            <div className="space-y-4">
              {selectedCustomerQuotations.length === 0 ? (
                <div className="border border-gray-200 rounded-xl p-4 text-sm text-gray-500">
                  No activity yet for this customer. Create a quotation to start timeline tracking.
                </div>
              ) : (
                selectedCustomerQuotations.slice(0, 4).map((quotation) => (
                  <div key={`timeline-${quotation.id}`} className="relative border border-gray-200 rounded-xl p-4 pl-8 bg-gray-50/40">
                    <div className="absolute left-3 top-4 text-emerald-500"><CircleDot size={12} /></div>
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Invoice Revision</p>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold uppercase">Paid Advance</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(quotation.createdAt).toLocaleString()}</p>
                    <p className="text-sm text-gray-700 mt-2">
                      {quotation.id} created for {quotation.customerName}. Final amount Rs. {quotation.finalAmount.toLocaleString()}.
                    </p>
                    {quotation.note && <p className="text-sm text-gray-600 mt-2 italic">"{quotation.note}"</p>}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
