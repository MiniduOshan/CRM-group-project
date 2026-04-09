import { useMemo, useRef, useState, type FormEvent } from 'react';
import {
  Users,
  UserPlus,
  FileText,
  Calculator,
  Phone,
  ClipboardList,
  NotebookPen,
  Upload,
  Plus,
  Pencil,
  MapPin,
  Clock3,
  Crown,
  CircleDot,
  Search,
  X
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
  const [activeCustomerId, setActiveCustomerId] = useState<string>('');

  // State for the Activity Pop-up Modal
  const [showActivity, setShowActivity] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', address: '' });
  const [quoteForm, setQuoteForm] = useState({ amount: '0', discount: '0', note: '' });

  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  const [editCustomer, setEditCustomer] = useState({ name: '', phone: '', address: '' });
  const amountInputRef = useRef<HTMLInputElement | null>(null);

  const selectedCustomer = customers.find((customer) => customer.id === activeCustomerId);

  // Filtered customers: Return empty array if search is empty
  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return customers.filter(
      (c) => c.name.toLowerCase().includes(query) || c.phone.includes(query)
    );
  }, [customers, searchQuery]);

  const quoteAmount = Number(quoteForm.amount) || 0;
  const quoteDiscount = Number(quoteForm.discount) || 0;
  const quoteFinal = Math.max(0, quoteAmount - quoteDiscount);

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
    setIsRegistering(false);
    setSearchQuery('');
    setShowActivity(false);

    setTimeout(() => amountInputRef.current?.focus(), 100);
  };

  const beginEditSelectedCustomer = () => {
    if (!selectedCustomer) return;
    setEditCustomer({
      name: selectedCustomer.name,
      phone: selectedCustomer.phone,
      address: selectedCustomer.address
    });
    setIsEditingCustomer(true);
  };

  const saveSelectedCustomer = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    const duplicatePhone = customers.some(
      (customer) => customer.id !== selectedCustomer.id && customer.phone === editCustomer.phone.trim()
    );

    if (duplicatePhone) return;

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
    if (!selectedCustomer || quoteAmount <= 0) return;

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
    setShowActivity(true); // Pop up the timeline automatically when a quote is created
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

  const inputStyles = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all duration-200 placeholder:text-slate-400";

  return (
    <div className="min-h-screen bg-slate-50/50 p-8 font-sans text-slate-800">

      <div className="space-y-8 max-w-7xl mx-auto">
        <header className="space-y-1">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Workspace</h2>
          <p className="text-slate-500 text-sm font-medium">Search or register a customer, then generate a quotation.</p>
        </header>

        {/* Top Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-1">Total Customers</p>
              <p className="text-2xl font-black text-slate-800">{customers.length}</p>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><Users size={24} /></div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center justify-between">
            <div className="truncate pr-4">
              <p className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-1">Active Customer</p>
              <p className="text-lg font-bold text-slate-800 truncate">
                {selectedCustomer?.name ?? 'None selected'}
              </p>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Crown size={24} /></div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-1">Quotations</p>
              <p className="text-2xl font-black text-slate-800">{quotations.length}</p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><ClipboardList size={24} /></div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* STEP 1: Find or Register Customer OR Active Profile */}
          <section className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col h-[450px]">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <span className="bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-black">1</span>
                {selectedCustomer ? 'Active Customer' : 'Find or Register'}
              </h3>

              {selectedCustomer && !isEditingCustomer ? (
                <button
                  onClick={() => {
                    setActiveCustomerId('');
                    setSearchQuery('');
                    setShowActivity(false);
                  }}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1"
                >
                  <X size={14} /> Clear Selection
                </button>
              ) : isRegistering ? (
                <button onClick={() => setIsRegistering(false)} className="text-xs font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1">
                  <X size={14} /> Cancel
                </button>
              ) : null}
            </div>

            {selectedCustomer ? (
              <div className="flex-1 flex flex-col animate-in fade-in zoom-in-95 duration-200">
                {isEditingCustomer ? (
                  <div className="flex-1 flex flex-col justify-center">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4 text-sm">
                      <Pencil size={14} className="text-amber-500" /> Edit Information
                    </h3>
                    <form onSubmit={saveSelectedCustomer} className="space-y-3">
                      <input
                        required
                        value={editCustomer.name}
                        onChange={(e) => setEditCustomer((prev) => ({ ...prev, name: e.target.value }))}
                        className={inputStyles}
                      />
                      <input
                        required
                        value={editCustomer.phone}
                        onChange={(e) => setEditCustomer((prev) => ({ ...prev, phone: e.target.value }))}
                        className={inputStyles}
                      />
                      <textarea
                        required
                        value={editCustomer.address}
                        onChange={(e) => setEditCustomer((prev) => ({ ...prev, address: e.target.value }))}
                        className={`${inputStyles} h-20 resize-none`}
                      />
                      <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setIsEditingCustomer(false)} className="flex-1 px-4 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl text-sm font-bold text-slate-600 transition-colors">
                          Cancel
                        </button>
                        <button type="submit" className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-sm active:scale-[0.98] transition-all">
                          Save
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden relative flex-1 flex flex-col h-full">
                    <div className="h-16 bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-700 opacity-90" />
                    <div className="px-5 pb-5 -mt-8 relative z-10 flex-1 flex flex-col">
                      <div className="w-16 h-16 rounded-xl border-4 border-white bg-slate-900 text-white flex items-center justify-center text-lg font-black shadow-md">
                        {selectedCustomer.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}
                      </div>

                      <p className="mt-3 text-lg font-black text-slate-900">{selectedCustomer.name}</p>

                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold uppercase tracking-wider flex items-center gap-1">
                          <Crown size={10} /> Premium
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold uppercase tracking-wider">
                          Stage: {selectedCustomerQuotations.length > 0 ? 'Active' : 'Lead'}
                        </span>
                      </div>

                      <div className="mt-4 space-y-2 text-xs text-slate-600 font-medium">
                        <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-100 shadow-sm">
                          <Phone size={14} className="text-indigo-500" />
                          <p>{selectedCustomer.phone}</p>
                        </div>
                        <div className="flex items-start gap-2 p-2 bg-white rounded-lg border border-slate-100 shadow-sm">
                          <MapPin size={14} className="text-slate-400 mt-0.5" />
                          <p className="leading-relaxed line-clamp-2">{selectedCustomer.address}</p>
                        </div>
                      </div>

                      <div className="mt-auto pt-3 flex gap-2">
                        <button onClick={beginEditSelectedCustomer} className="flex-1 flex justify-center items-center gap-1.5 bg-white border border-slate-200 px-3 py-2 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
                          <Pencil size={12} /> Edit
                        </button>

                        {/* Check Activity Button */}
                        <button
                          onClick={() => setShowActivity(true)}
                          className="flex-1 flex justify-center items-center gap-1.5 bg-slate-900 text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-slate-800 shadow-sm transition-colors active:scale-[0.98]"
                        >
                          <Clock3 size={12} /> Activity
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : !isRegistering ? (
              <>
                <div className="relative mb-4">
                  <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name or phone..."
                    className={`${inputStyles} pl-10`}
                  />
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-2">
                  {!searchQuery.trim() ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 pt-10">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                        <Search size={32} />
                      </div>
                      <div>
                        <p className="text-slate-800 font-bold">Search Customer</p>
                        <p className="text-sm text-slate-500 mt-1 mb-4">Enter a name or phone number to find an existing customer.</p>
                        <button
                          onClick={() => setIsRegistering(true)}
                          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-sm"
                        >
                          Register New Customer
                        </button>
                      </div>
                    </div>
                  ) : filteredCustomers.length > 0 ? (
                    <>
                      {filteredCustomers.map((customer) => (
                        <button
                          key={customer.id}
                          onClick={() => {
                            setActiveCustomerId(customer.id);
                            setIsEditingCustomer(false);
                            setShowActivity(false);
                            amountInputRef.current?.focus();
                          }}
                          className="w-full text-left rounded-xl px-4 py-3 transition-all duration-200 border border-slate-100 bg-slate-50 hover:bg-slate-100 hover:border-slate-200"
                        >
                          <p className="text-sm font-bold text-slate-700">{customer.name}</p>
                          <p className="text-xs mt-1 text-slate-500">{customer.phone}</p>
                        </button>
                      ))}
                    </>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 pt-10">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                        <Users size={32} />
                      </div>
                      <div>
                        <p className="text-slate-800 font-bold">No customer found</p>
                        <p className="text-sm text-slate-500 mt-1 mb-4">Try a different search or register a new one.</p>
                        <button
                          onClick={() => setIsRegistering(true)}
                          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-sm"
                        >
                          Register Customer
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <form onSubmit={addCustomer} className="space-y-4 flex-1 flex flex-col justify-center animate-in fade-in slide-in-from-bottom-4 duration-300">
                <input
                  required
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Full Name"
                  className={inputStyles}
                />
                <div>
                  <input
                    required
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="Telephone Number"
                    className={`${inputStyles} ${customerDuplicatePhone ? 'border-red-300 bg-red-50 focus:border-red-500' : ''}`}
                  />
                  {customerDuplicatePhone && <p className="text-xs text-red-500 font-medium mt-1.5 ml-1">Phone number already registered.</p>}
                </div>
                <textarea
                  required
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer((prev) => ({ ...prev, address: e.target.value }))}
                  placeholder="Full Address"
                  className={`${inputStyles} h-24 resize-none`}
                />
                <button
                  type="submit"
                  disabled={customerDuplicatePhone}
                  className="w-full bg-slate-900 text-white px-4 py-3 rounded-xl text-sm font-bold hover:bg-slate-800 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm mt-auto"
                >
                  Save & Continue
                </button>
              </form>
            )}
          </section>

          {/* STEP 2: Make Quotation */}
          <section className={`bg-white rounded-2xl border border-slate-100 p-6 shadow-sm h-[450px] transition-opacity duration-300 relative ${!selectedCustomer ? 'opacity-50' : 'opacity-100'}`}>
            {!selectedCustomer && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/40 backdrop-blur-[1px] rounded-2xl">
                <p className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg">Select a customer first</p>
              </div>
            )}

            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-5">
              <span className="bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-black">2</span>
              Create Quotation
            </h3>

            <form onSubmit={createQuotation} className="space-y-4 flex flex-col h-[calc(100%-2.5rem)]">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <span className="absolute left-4 top-3 text-slate-400 font-semibold">$</span>
                  <input
                    ref={amountInputRef}
                    type="number"
                    min="0"
                    value={quoteForm.amount}
                    onChange={(e) => setQuoteForm((prev) => ({ ...prev, amount: e.target.value }))}
                    placeholder="Amount"
                    className={`${inputStyles} pl-8`}
                    disabled={!selectedCustomer}
                  />
                </div>

                <div className="relative flex-1">
                  <span className="absolute left-4 top-3 text-slate-400 font-semibold">$</span>
                  <input
                    type="number"
                    min="0"
                    value={quoteForm.discount}
                    onChange={(e) => setQuoteForm((prev) => ({ ...prev, discount: e.target.value }))}
                    placeholder="Discount"
                    className={`${inputStyles} pl-8`}
                    disabled={!selectedCustomer}
                  />
                </div>
              </div>

              <textarea
                value={quoteForm.note}
                onChange={(e) => setQuoteForm((prev) => ({ ...prev, note: e.target.value }))}
                placeholder="Optional notes or terms..."
                className={`${inputStyles} h-24 resize-none`}
                disabled={!selectedCustomer}
              />

              <div className="bg-slate-900 rounded-xl p-4 text-white shadow-md mt-auto mb-4">
                <p className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  <Calculator size={14} /> Final Total
                </p>
                <p className="text-3xl font-black">${quoteFinal.toFixed(2)}</p>
              </div>

              <button
                type="submit"
                disabled={!selectedCustomer || quoteAmount <= 0}
                className="w-full bg-indigo-600 text-white px-4 py-3 rounded-xl text-sm font-bold hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                Generate Document
              </button>
            </form>
          </section>

          {/* Quick Actions */}
          <aside className="bg-slate-100/50 rounded-2xl border border-slate-200 p-6 shadow-inner h-[450px] flex flex-col">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-5">Quick Tools</p>

            <div className="space-y-3">
              {[
                { id: 'call-note', icon: NotebookPen, label: 'Log a Call/Note' },
                { id: 'generate-quote', icon: FileText, label: 'Prepare Quote' },
                { id: 'upload-design', icon: Upload, label: 'Upload Design Doc' }
              ].map((action) => (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => handleQuickAction(action.id as any)}
                  disabled={!selectedCustomer}
                  className="group w-full flex items-center justify-between rounded-xl bg-white border border-slate-200 px-4 py-4 text-sm font-bold text-slate-700 hover:border-indigo-300 hover:shadow-sm transition-all disabled:opacity-50 disabled:pointer-events-none"
                >
                  <span className="flex items-center gap-3">
                    <action.icon size={18} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
                    {action.label}
                  </span>
                  <Plus size={16} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                </button>
              ))}
            </div>

            <div className="mt-auto pt-4">
              <div className="text-xs text-slate-500 bg-white/60 border border-slate-200 rounded-xl p-4 text-center">
                Active Context:<br />
                <span className="font-bold text-slate-800 text-sm mt-1 block truncate">
                  {selectedCustomer?.name ?? '—'}
                </span>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Activity Pop-up Modal */}
      {selectedCustomer && showActivity && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowActivity(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()} // Prevent clicks inside the modal from closing it
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-white z-10">
              <div className="flex flex-col">
                <h3 className="font-bold text-slate-900 flex items-center gap-2 text-xl">
                  <Clock3 size={22} className="text-indigo-500" /> Activity Timeline
                </h3>
                <p className="text-sm text-slate-500 font-medium ml-8">
                  History for <span className="text-slate-700 font-bold">{selectedCustomer.name}</span>
                </p>
              </div>
              <button
                onClick={() => setShowActivity(false)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                aria-label="Close activity modal"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content (Scrollable) */}
            <div className="overflow-y-auto p-6 flex-1 bg-slate-50/30">
              <div className="space-y-5 max-w-2xl mx-auto">
                {selectedCustomerQuotations.length === 0 ? (
                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center text-sm text-slate-500 font-medium bg-slate-50/50">
                    No activity tracked yet. Generate a quotation to start the timeline.
                  </div>
                ) : (
                  selectedCustomerQuotations.map((quotation, index) => (
                    <div key={`timeline-${quotation.id}`} className="relative border border-slate-100 rounded-2xl p-6 pl-12 bg-white shadow-sm hover:shadow-md transition-shadow">
                      <div className="absolute left-5 top-7 text-indigo-500"><CircleDot size={16} /></div>
                      {index !== selectedCustomerQuotations.length - 1 && (
                        <div className="absolute left-[1.65rem] top-12 bottom-[-1.5rem] w-px bg-slate-200" />
                      )}

                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-black text-indigo-600 uppercase tracking-widest">Quotation Created</p>
                        <span className="text-[11px] px-3 py-1 rounded-md bg-slate-100 text-slate-600 font-bold">
                          {new Date(quotation.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <p className="text-slate-800 mt-2 font-medium">
                        Generated <strong className="text-slate-900">{quotation.id}</strong>. Final amount finalized at <strong className="text-emerald-600">${quotation.finalAmount.toFixed(2)}</strong>.
                      </p>

                      {quotation.note && (
                        <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm text-slate-600 italic">
                          "{quotation.note}"
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}