import { useMemo, useState, type FormEvent } from 'react';
import {
  Users,
  UserPlus,
  FileText,
  Phone,
  ClipboardList,
  NotebookPen,
  Plus,
  Pencil,
  MapPin,
  Clock3,
  Crown,
  Search,
  X,
  ReceiptText,
  History,
  PlaySquare,
  PhoneCall,
  AlertTriangle,
  Trash2
} from 'lucide-react';
import type { CallLog, CustomerProfile, Quotation } from '../types';

interface DashboardProps {
  customers: CustomerProfile[];
  quotations: Quotation[];
  selectedCustomerId: string;
  selectedCustomer?: CustomerProfile;
  currentSalesperson: string;
  onSelectCustomer: (customerId: string) => void;
  onRegisterCustomer: (customer: { name: string; phone: string; address: string }, actor: string) => CustomerProfile;
  onUpdateCustomer: (customerId: string, customer: { name: string; phone: string; address: string }, actor: string) => void;
  onAddCallLog: (customerId: string, callLog: Omit<CallLog, 'id' | 'customerId' | 'timestamp'> & { callTime?: string }) => void;
  onDeleteCallLog: (customerId: string, callLogId: string) => void;
  onDeleteCustomer: (customerId: string) => void;
  onOpenQuotationComposer: (customerId: string) => void;
}

const emptyCustomer = { name: '', phone: '', address: '' };

const formatRelativeTime = (timestamp: string) => {
  const eventTime = new Date(timestamp).getTime();
  const diffMs = Date.now() - eventTime;
  const minutes = Math.floor(diffMs / 60000);

  if (minutes < 1) {
    return 'Just now';
  }
  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hr ago`;
  }

  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
};

export default function Dashboard({
  customers,
  quotations,
  selectedCustomerId,
  selectedCustomer,
  currentSalesperson,
  onSelectCustomer,
  onRegisterCustomer,
  onUpdateCustomer,
  onAddCallLog,
  onDeleteCallLog,
  onDeleteCustomer,
  onOpenQuotationComposer
}: DashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState(emptyCustomer);
  const [editCustomer, setEditCustomer] = useState(emptyCustomer);
  const [callForm, setCallForm] = useState({
    callTime: new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
    summary: '',
    durationMinutes: '5',
    direction: 'Outgoing' as 'Incoming' | 'Outgoing'
  });

  const activeCustomer = selectedCustomer ?? customers.find((customer) => customer.id === selectedCustomerId);

  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) {
      return [];
    }

    const query = searchQuery.toLowerCase();
    return customers.filter(
      (customer) => customer.name.toLowerCase().includes(query) || customer.phone.includes(query)
    );
  }, [customers, searchQuery]);

  const customerQuotations = useMemo(
    () => quotations.filter((quotation) => quotation.customerId === activeCustomer?.id),
    [quotations, activeCustomer?.id]
  );

  const recentHistory = useMemo(
    () => (activeCustomer ? [...activeCustomer.history] : []),
    [activeCustomer]
  );

  const callLogById = useMemo(
    () => new Map(activeCustomer?.callLogs.map((log) => [log.id, log]) ?? []),
    [activeCustomer]
  );

  const customerDuplicatePhone = customers.some((customer) => customer.phone === newCustomer.phone.trim());
  const editDuplicatePhone = activeCustomer
    ? customers.some(
        (customer) => customer.id !== activeCustomer.id && customer.phone === editCustomer.phone.trim()
      )
    : false;

  const inputStyles = 'input-field';

  const handleRegisterCustomer = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (customerDuplicatePhone) {
      return;
    }

    const createdCustomer = onRegisterCustomer(newCustomer, currentSalesperson);
    setNewCustomer(emptyCustomer);
    setIsRegistering(false);
    setSearchQuery('');
    setIsEditingCustomer(false);
    onSelectCustomer(createdCustomer.id);
  };

  const handleSaveCustomer = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!activeCustomer || editDuplicatePhone) {
      return;
    }

    onUpdateCustomer(activeCustomer.id, editCustomer, currentSalesperson);
    setIsEditingCustomer(false);
  };

  const startEditCustomer = () => {
    if (!activeCustomer) {
      return;
    }

    setEditCustomer({
      name: activeCustomer.name,
      phone: activeCustomer.phone,
      address: activeCustomer.address
    });
    setIsEditingCustomer(true);
  };

  const handleAddCallLog = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!activeCustomer || callForm.summary.trim() === '') {
      return;
    }

    onAddCallLog(activeCustomer.id, {
      agent: currentSalesperson,
      summary: callForm.summary.trim(),
      durationMinutes: Number(callForm.durationMinutes) || 0,
      callTime: callForm.callTime,
      direction: callForm.direction
    });

    setCallForm({
      callTime: new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
      summary: '',
      durationMinutes: '5',
      direction: 'Outgoing'
    });
  };

  return (
    <div className="p-4 md:p-8 w-full max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="space-y-8">
        <header className="space-y-1">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-brand-ink">Dashboard</h2>
          <p className="text-brand-text text-sm font-medium mt-1">
            Register customers, log calls by phone number, then jump into quotations and invoices.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          <div className="card flex items-center justify-between group hover:border-brand-accent/30 hover:shadow-elevated">
            <div>
              <p className="text-xs uppercase tracking-widest text-brand-text font-bold mb-1">Total Customers</p>
              <p className="text-2xl font-black text-brand-ink">{customers.length}</p>
            </div>
            <div className="p-3 bg-indigo-50 text-brand-accent rounded-xl group-hover:scale-110 transition-transform"><Users size={24} /></div>
          </div>
          <div className="card flex items-center justify-between group hover:border-amber-500/30 hover:shadow-elevated">
            <div className="truncate pr-4">
              <p className="text-xs uppercase tracking-widest text-brand-text font-bold mb-1">Active Customer</p>
              <p className="text-lg font-bold text-brand-ink truncate">{activeCustomer?.name ?? 'None selected'}</p>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl group-hover:scale-110 transition-transform"><Crown size={24} /></div>
          </div>
          <div className="card flex items-center justify-between group hover:border-emerald-500/30 hover:shadow-elevated">
            <div>
              <p className="text-xs uppercase tracking-widest text-brand-text font-bold mb-1">Quotations</p>
              <p className="text-2xl font-black text-brand-ink">{quotations.length}</p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform"><ClipboardList size={24} /></div>
          </div>
          <div className="card flex items-center justify-between group hover:border-sky-500/30 hover:shadow-elevated">
            <div>
              <p className="text-xs uppercase tracking-widest text-brand-text font-bold mb-1">Call Logs</p>
              <p className="text-2xl font-black text-brand-ink">{customers.reduce((sum, customer) => sum + customer.callLogs.length, 0)}</p>
            </div>
            <div className="p-3 bg-sky-50 text-sky-600 rounded-xl group-hover:scale-110 transition-transform"><PhoneCall size={24} /></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <section className="card flex flex-col h-[520px] md:h-[560px]">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-brand-ink flex items-center gap-2">
                <span className="bg-brand-accent text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shadow-sm">1</span>
                {activeCustomer ? 'Active Customer' : 'Find or Register'}
              </h3>

              {activeCustomer && !isEditingCustomer ? (
                <button
                  onClick={() => {
                    onSelectCustomer('');
                    setSearchQuery('');
                  }}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1"
                >
                  <X size={14} /> Clear Selection
                </button>
              ) : isRegistering ? (
                <button
                  onClick={() => {
                    setIsRegistering(false);
                    setNewCustomer(emptyCustomer);
                  }}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1"
                >
                  <X size={14} /> Cancel
                </button>
              ) : null}
            </div>

            {activeCustomer ? (
              <div className="flex-1 flex flex-col animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                {isEditingCustomer ? (
                  <form onSubmit={handleSaveCustomer} className="space-y-3">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-2 text-sm">
                      <Pencil size={14} className="text-amber-500" /> Edit Information
                    </h3>
                    <input
                      required
                      value={editCustomer.name}
                      onChange={(event) => setEditCustomer((prev) => ({ ...prev, name: event.target.value }))}
                      className={inputStyles}
                    />
                    <div>
                      <input
                        required
                        value={editCustomer.phone}
                        onChange={(event) => setEditCustomer((prev) => ({ ...prev, phone: event.target.value }))}
                        className={`${inputStyles} ${editDuplicatePhone ? 'border-red-300 bg-red-50 focus:border-red-500' : ''}`}
                      />
                      {editDuplicatePhone && (
                        <p className="text-xs text-red-500 font-medium mt-1.5 ml-1">Phone number already registered.</p>
                      )}
                    </div>
                    <textarea
                      value={editCustomer.address}
                      onChange={(event) => setEditCustomer((prev) => ({ ...prev, address: event.target.value }))}
                      placeholder="Address (optional)"
                      className={`${inputStyles} h-20 resize-none`}
                    />
                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsEditingCustomer(false)}
                        className="flex-1 btn-secondary"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 btn-primary"
                      >
                        Save
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="bg-brand-subtle border border-brand-line rounded-xl overflow-hidden relative flex-1 flex flex-col h-full shadow-inner">
                    <div className="h-20 bg-gradient-to-br from-brand-gradient-start via-purple-500 to-brand-gradient-end" />
                    <div className="px-5 pb-5 -mt-10 relative z-10 flex-1 flex flex-col overflow-hidden">
                      <div className="w-20 h-20 rounded-2xl border-4 border-white bg-brand-ink text-white flex items-center justify-center text-xl font-black shadow-lg">
                        {activeCustomer.name
                          .split(' ')
                          .map((part) => part[0])
                          .join('')
                          .slice(0, 2)}
                      </div>
                      
                      <p className="mt-3 text-xl font-black text-brand-ink">{activeCustomer.name}</p>

                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold uppercase tracking-wider flex items-center gap-1">
                          <Crown size={10} /> Premium
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold uppercase tracking-wider">
                          {customerQuotations.length > 0 ? 'Customer has quotations' : 'New lead'}
                        </span>
                      </div>

                      <div className="mt-4 space-y-2 text-xs text-brand-text font-medium">
                        <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-brand-line shadow-sm hover:shadow-md transition-shadow">
                          <Phone size={16} className="text-brand-accent" />
                          <p>{activeCustomer.phone}</p>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-brand-line shadow-sm hover:shadow-md transition-shadow">
                          <MapPin size={16} className="text-slate-400 mt-0.5" />
                          <p className="leading-relaxed line-clamp-2">{activeCustomer.address || 'No address provided'}</p>
                        </div>
                      </div>

                      <div className="mt-3 p-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-600">
                        <p className="font-bold text-slate-700">Customer Owner: {activeCustomer.ownerName}</p>
                        {activeCustomer.ownerName !== currentSalesperson && (
                          <p className="mt-1 inline-flex items-center gap-1 text-amber-700 font-semibold">
                            <AlertTriangle size={12} /> This customer belongs to {activeCustomer.ownerName}. Your update will still be recorded under your name.
                          </p>
                        )}
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 text-[11px] text-brand-text">
                        <div className="bg-white border border-brand-line rounded-xl p-3 shadow-sm hover:shadow-md transition-all">
                          <p className="text-slate-400 uppercase tracking-wider font-bold mb-1">Quotations</p>
                          <p className="font-black text-lg text-brand-ink">{customerQuotations.length}</p>
                        </div>
                        <div className="bg-white border border-brand-line rounded-xl p-3 shadow-sm hover:shadow-md transition-all">
                          <p className="text-slate-400 uppercase tracking-wider font-bold mb-1">Calls</p>
                          <p className="font-black text-lg text-brand-ink">{activeCustomer.callLogs.length}</p>
                        </div>
                      </div>

                      <div className="mt-auto pt-4 flex gap-2">
                        <button
                          onClick={startEditCustomer}
                          className="flex-1 btn-secondary !py-2 !text-xs"
                        >
                          <Pencil size={12} /> Edit
                        </button>

                        <button
                          onClick={() => onOpenQuotationComposer(activeCustomer.id)}
                          className="flex-1 btn-primary !py-2 !text-xs"
                        >
                          <FileText size={12} /> Quote
                        </button>

                        <button
                          onClick={() => {
                            if (window.confirm(`Delete customer ${activeCustomer.name}?`)) {
                              onDeleteCustomer(activeCustomer.id);
                            }
                          }}
                          className="flex-1 btn-danger !py-2 !text-xs"
                        >
                          <Trash2 size={12} /> Delete
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
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search by name or telephone number..."
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
                        <p className="text-brand-ink font-extrabold text-lg">Search Customer</p>
                        <p className="text-sm text-brand-text mt-1 mb-5">Enter a name or phone number to find an existing customer.</p>
                        <button
                          onClick={() => setIsRegistering(true)}
                          className="btn-primary mx-auto"
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
                            onSelectCustomer(customer.id);
                            setIsEditingCustomer(false);
                            setIsRegistering(false);
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
                        <p className="text-brand-ink font-extrabold text-lg">No customer found</p>
                        <p className="text-sm text-brand-text mt-1 mb-5">Try a different search or register a new one.</p>
                        <button
                          onClick={() => setIsRegistering(true)}
                          className="btn-primary mx-auto"
                        >
                          Register Customer
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <form onSubmit={handleRegisterCustomer} className="space-y-4 flex-1 flex flex-col justify-center animate-in fade-in slide-in-from-bottom-4 duration-300">
                <input
                  required
                  value={newCustomer.name}
                  onChange={(event) => setNewCustomer((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder="Full Name"
                  className={inputStyles}
                />
                <div>
                  <input
                    required
                    value={newCustomer.phone}
                    onChange={(event) => setNewCustomer((prev) => ({ ...prev, phone: event.target.value }))}
                    placeholder="Telephone Number"
                    className={`${inputStyles} ${customerDuplicatePhone ? 'border-red-300 bg-red-50 focus:border-red-500' : ''}`}
                  />
                  {customerDuplicatePhone && <p className="text-xs text-red-500 font-medium mt-1.5 ml-1">Phone number already registered.</p>}
                </div>
                <textarea
                  value={newCustomer.address}
                  onChange={(event) => setNewCustomer((prev) => ({ ...prev, address: event.target.value }))}
                  placeholder="Full Address (optional)"
                  className={`${inputStyles} h-24 resize-none`}
                />
                <button
                  type="submit"
                  disabled={customerDuplicatePhone}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed mt-auto"
                >
                  Save & Continue
                </button>
              </form>
            )}
          </section>

          <section className={`bg-white rounded-2xl border border-slate-100 p-4 md:p-6 shadow-sm h-[520px] md:h-[560px] transition-opacity duration-300 relative ${!activeCustomer ? 'opacity-50' : 'opacity-100'}`}>
            {!activeCustomer && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-2xl">
                <p className="bg-brand-ink text-white px-4 py-2 rounded-xl text-sm font-bold shadow-xl">Select a customer first</p>
              </div>
            )}

            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-brand-ink flex items-center gap-2">
                <span className="bg-brand-accent text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shadow-sm">2</span>
                Call Logs & History
              </h3>
              {activeCustomer && (
                <span className="text-[10px] px-2 py-1 rounded-full bg-slate-100 text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1">
                  <History size={10} /> Timeline
                </span>
              )}
            </div>

            {activeCustomer ? (
              <div className="flex flex-col h-[calc(100%-2.5rem)] gap-4 overflow-hidden">
                <form onSubmit={handleAddCallLog} className="space-y-3 bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <NotebookPen size={14} /> Add Call Log
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      required
                      type="datetime-local"
                      value={callForm.callTime}
                      onChange={(event) => setCallForm((prev) => ({ ...prev, callTime: event.target.value }))}
                      className={inputStyles}
                    />
                    <input
                      type="number"
                      min="1"
                      value={callForm.durationMinutes}
                      onChange={(event) => setCallForm((prev) => ({ ...prev, durationMinutes: event.target.value }))}
                      placeholder="Duration (min)"
                      className={inputStyles}
                    />
                  </div>
                  <select
                    value={callForm.direction}
                    onChange={(event) => setCallForm((prev) => ({ ...prev, direction: event.target.value as 'Incoming' | 'Outgoing' }))}
                    className={inputStyles}
                  >
                    <option value="Outgoing">Outgoing Call</option>
                    <option value="Incoming">Incoming Call</option>
                  </select>
                  <textarea
                    required
                    value={callForm.summary}
                    onChange={(event) => setCallForm((prev) => ({ ...prev, summary: event.target.value }))}
                    placeholder="Remark: what was discussed"
                    className={`${inputStyles} h-24 resize-none`}
                  />
                  <button
                    type="submit"
                    className="w-full btn-primary"
                  >
                    <Plus size={14} /> Save Call Log
                  </button>
                </form>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex-1 overflow-hidden flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1">
                      <Clock3 size={12} /> Interaction Timeline
                    </p>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Ongoing</span>
                  </div>
                  <div className="space-y-0 overflow-y-auto pr-1">
                    {recentHistory.length === 0 ? (
                      <p className="text-sm text-slate-500">No activity history yet.</p>
                    ) : (
                      recentHistory.map((entry) => {
                        const linkedCall = entry.refId ? callLogById.get(entry.refId) : undefined;
                        const isIncomingCall = linkedCall?.direction === 'Incoming';

                        return (
                          <div key={entry.id} className="relative pl-7 pb-5 last:pb-0">
                            <div className="absolute left-2 top-2 bottom-0 w-px bg-slate-200" />
                            <span className={`absolute left-0 top-2 h-4 w-4 rounded-full border-2 ${isIncomingCall ? 'bg-emerald-100 border-emerald-500' : 'bg-indigo-100 border-indigo-500'}`} />

                            <div className="bg-white border border-slate-100 rounded-lg p-3 shadow-sm">
                              <div className="flex items-center justify-between gap-2 text-[11px] font-semibold">
                                <span className="uppercase tracking-wider text-slate-500">{entry.action}</span>
                                <span className="text-slate-400">{formatRelativeTime(entry.timestamp)}</span>
                              </div>
                              <p className="text-sm text-slate-800 mt-1">{entry.note}</p>
                              <div className="mt-2 flex items-center gap-2 text-[11px]">
                                <span className={`px-2 py-0.5 rounded-full font-bold border ${isIncomingCall ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-indigo-50 text-indigo-700 border-indigo-200'}`}>
                                  {linkedCall ? linkedCall.direction : entry.type}
                                </span>
                                <span className="text-slate-500">{entry.user}</span>
                                {linkedCall && <span className="text-slate-400">{linkedCall.durationMinutes} min</span>}
                                {linkedCall && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (window.confirm('Delete this call log?')) {
                                        onDeleteCallLog(activeCustomer.id, linkedCall.id);
                                      }
                                    }}
                                    className="ml-auto p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                                    title="Delete call log"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-[calc(100%-2.5rem)] flex flex-col items-center justify-center text-center space-y-4 pt-8">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                  <NotebookPen size={32} />
                </div>
                <div>
                  <p className="text-brand-ink font-extrabold text-lg">Call log workspace</p>
                  <p className="text-sm text-brand-text mt-1 max-w-sm">Search by telephone number, open a customer, and capture every call in their profile history.</p>
                </div>
              </div>
            )}
          </section>

          <aside className="bg-slate-100/50 rounded-2xl border border-slate-200 p-4 md:p-6 shadow-inner h-[520px] md:h-[560px] flex flex-col gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Quick Tools</p>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => activeCustomer && onOpenQuotationComposer(activeCustomer.id)}
                  disabled={!activeCustomer}
                  className="group w-full flex items-center justify-between rounded-xl bg-white border border-brand-line px-4 py-4 text-sm font-bold text-brand-text hover:border-brand-accent/50 hover:shadow-md transition-all disabled:opacity-50 disabled:pointer-events-none"
                >
                  <span className="flex items-center gap-3">
                    <FileText size={18} className="text-brand-accent group-hover:scale-110 transition-transform" />
                    <span className="text-brand-ink group-hover:text-brand-accent transition-colors">Create Quotation</span>
                  </span>
                  <Plus size={16} className="text-slate-300 group-hover:text-brand-accent transition-colors" />
                </button>
                <button
                  type="button"
                  onClick={() => onSelectCustomer('')}
                  className="group w-full flex items-center justify-between rounded-xl bg-white border border-brand-line px-4 py-4 text-sm font-bold text-brand-text hover:border-brand-accent/50 hover:shadow-md transition-all"
                >
                  <span className="flex items-center gap-3">
                    <PlaySquare size={18} className="text-amber-500 group-hover:scale-110 transition-transform" />
                    <span className="text-brand-ink group-hover:text-brand-accent transition-colors">Customer Search</span>
                  </span>
                  <Search size={16} className="text-slate-300 group-hover:text-brand-accent transition-colors" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (activeCustomer) {
                      onSelectCustomer(activeCustomer.id);
                    }
                  }}
                  disabled={!activeCustomer}
                  className="group w-full flex items-center justify-between rounded-xl bg-white border border-brand-line px-4 py-4 text-sm font-bold text-brand-text hover:border-brand-accent/50 hover:shadow-md transition-all disabled:opacity-50 disabled:pointer-events-none"
                >
                  <span className="flex items-center gap-3">
                    <ReceiptText size={18} className="text-emerald-500 group-hover:scale-110 transition-transform" />
                    <span className="text-brand-ink group-hover:text-brand-accent transition-colors">Customer Documents</span>
                  </span>
                  <History size={16} className="text-slate-300 group-hover:text-brand-accent transition-colors" />
                </button>
              </div>
            </div>

            <div className="mt-auto pt-2">
              <div className="text-xs text-slate-500 bg-white/60 border border-slate-200 rounded-xl p-4 text-center">
                Active Context:
                <br />
                <span className="font-bold text-slate-800 text-sm mt-1 block truncate">{activeCustomer?.name ?? '—'}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
