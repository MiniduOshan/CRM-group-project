import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  Plus,
  Search,
  Phone,
  MapPin,
  User,
  Filter,
  PhoneCall,
  Clock,
  NotebookPen,
  AlertTriangle,
  Trash2,
  Pencil
} from 'lucide-react';
import { CustomerProfile, LeadStatus } from '../types';

interface LeadsProps {
  customers: CustomerProfile[];
  selectedCustomerId: string;
  currentSalesperson: string;
  salespersonOptions: string[];
  onSelectCustomer: (customerId: string) => void;
  onSetCurrentSalesperson: (salesperson: string) => void;
  onRegisterCustomer: (customer: { name: string; phone: string; address: string }, actor: string) => CustomerProfile;
  // වෙනස් කළා: දැන් යවන්නේ ownerName සහ status එක විතරයි
  onEditCustomer: (customerId: string, updatedData: { ownerName: string; status: LeadStatus }) => void;
  onAddCallLog: (customerId: string, callLog: { agent: string; summary: string; durationMinutes: number; callTime?: string; direction: 'Incoming' | 'Outgoing' }) => void;
  onDeleteCallLog: (customerId: string, callLogId: string) => void;
  onDeleteCustomer: (customerId: string) => void;
}

// වෙනස් කළා: Database එකේ manual status එකක් සේව් කරලා තියෙනවා නම් මුලින්ම ඒක අරන්, නැත්නම් auto calculate කරනවා
const getLeadStatus = (customer: CustomerProfile & { status?: LeadStatus }): LeadStatus => {
  if (customer.status) {
    return customer.status;
  }
  if (customer.invoiceIds?.length > 0) {
    return 'Completed';
  }
  if (customer.quotationIds?.length > 0) {
    return 'In Progress';
  }
  return 'New';
};

export default function Leads({
  customers,
  selectedCustomerId,
  currentSalesperson,
  salespersonOptions,
  onSelectCustomer,
  onSetCurrentSalesperson,
  onRegisterCustomer,
  onEditCustomer,
  onAddCallLog,
  onDeleteCallLog,
  onDeleteCustomer
}: LeadsProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [newLeadForm, setNewLeadForm] = useState({
    name: '',
    phone: '',
    address: ''
  });

  // වෙනස් කළා: Salesperson සහ Status විතරක් store කරගන්න state එකක්
  const [editLeadForm, setEditLeadForm] = useState<{ id: string; ownerName: string; status: LeadStatus }>({
    id: '',
    ownerName: '',
    status: 'New'
  });

  const [newCall, setNewCall] = useState({
    callTime: new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
    durationMinutes: '5',
    summary: '',
    direction: 'Outgoing' as 'Incoming' | 'Outgoing'
  });

  const filteredLeads = useMemo(() => {
    const query = search.trim().toLowerCase();
    const base = query
      ? customers.filter(
        (lead) => lead.name.toLowerCase().includes(query) || lead.phone.includes(search.trim())
      )
      : customers;

    return [...base].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [customers, search]);

  const totalPages = Math.max(1, Math.ceil(filteredLeads.length / pageSize));

  useEffect(() => {
    setCurrentPage(1);
  }, [search, pageSize]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLeads.slice(start, start + pageSize);
  }, [currentPage, filteredLeads, pageSize]);

  const pageStart = filteredLeads.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const pageEnd = Math.min(currentPage * pageSize, filteredLeads.length);

  const selectedLead = customers.find((lead) => lead.id === selectedCustomerId) ?? filteredLeads[0];

  const getStatusColor = (status: LeadStatus) => {
    switch (status) {
      case 'New': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'In Progress': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
      case 'Completed': return 'bg-green-50 text-green-700 border-green-100';
      case 'Payment Pending': return 'bg-red-50 text-red-700 border-red-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  const handleCreateLead = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const phoneExists = customers.some((lead) => lead.phone === newLeadForm.phone.trim());
    if (phoneExists) {
      return;
    }

    const customer = onRegisterCustomer({
      name: newLeadForm.name,
      phone: newLeadForm.phone,
      address: newLeadForm.address
    }, currentSalesperson);

    onSelectCustomer(customer.id);
    setNewLeadForm({ name: '', phone: '', address: '' });
    setIsAdding(false);
  };

  // වෙනස් කළා: Update වෙන්නේ ownerName එකයි status එකයි විතරයි
  const handleUpdateLead = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onEditCustomer(editLeadForm.id, {
      ownerName: editLeadForm.ownerName,
      status: editLeadForm.status
    });
    setIsEditing(false);
  };

  const handleAddCall = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedLead) {
      return;
    }

    const duration = Number(newCall.durationMinutes);
    if (!Number.isFinite(duration) || duration <= 0) {
      return;
    }

    onAddCallLog(selectedLead.id, {
      agent: currentSalesperson,
      summary: newCall.summary.trim(),
      durationMinutes: duration,
      callTime: newCall.callTime,
      direction: newCall.direction
    });

    setNewCall({
      callTime: new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
      durationMinutes: '5',
      summary: '',
      direction: 'Outgoing'
    });
  };

  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black tracking-tight text-brand-ink">Customer Registration & Call Tracking</h2>
          <p className="text-brand-text font-medium text-sm mt-1">Register by phone number and view every call made with each customer.</p>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="text-xs font-semibold text-gray-500">Assign Salesperson</span>
            <select
              value={currentSalesperson}
              onChange={(e) => {
                onSetCurrentSalesperson(e.target.value);
              }}
              className="px-3 py-1.5 rounded-lg border border-brand-line bg-white text-sm font-semibold text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-accent/40"
            >
              {salespersonOptions.map((salesperson) => (
                <option key={salesperson} value={salesperson}>{salesperson}</option>
              ))}
            </select>
          </div>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="btn-primary w-full sm:w-auto"
        >
          <Plus size={18} />
          Add New Lead
        </button>
      </header>

      <div className="flex gap-4 items-center bg-white p-4 rounded-xl border border-brand-line shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name or phone..."
            className="input-field pl-10 !py-2.5"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500">
          <Filter size={18} />
        </button>
      </div>

      <div className="data-grid w-full">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr>
                <th className="data-header">Customer</th>
                <th className="data-header">Contact</th>
                <th className="data-header">Salesperson</th>
                <th className="data-header">Status</th>
                <th className="data-header">Created</th>
                <th className="data-header"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-line">
              {paginatedLeads.map((lead) => (
                <tr
                  key={lead.id}
                  className={`data-row cursor-pointer ${selectedLead?.id === lead.id ? 'bg-brand-accent/5' : ''}`}
                  onClick={() => onSelectCustomer(lead.id)}
                >
                  <td className="data-cell">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-subtle flex items-center justify-center text-brand-ink font-black text-xs shadow-inner">
                        {lead.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-brand-ink">{lead.name}</p>
                        <p className="text-[11px] text-brand-text flex items-center gap-1 font-medium mt-0.5">
                          <MapPin size={12} className="text-slate-400" /> {lead.address || 'No address provided'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="data-cell">
                    <p className="mono-data flex items-center gap-1.5">
                      <Phone size={12} className="text-slate-400" /> {lead.phone}
                    </p>
                  </td>
                  <td className="data-cell">
                    <div className="flex items-center gap-2">
                      <User size={12} className="text-slate-400" />
                      <span className="text-xs font-semibold text-brand-text">{lead.ownerName}</span>
                    </div>
                  </td>
                  <td className="data-cell">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-black tracking-wide border ${getStatusColor(getLeadStatus(lead))}`}>
                      {getLeadStatus(lead).toUpperCase()}
                    </span>
                  </td>
                  <td className="data-cell">
                    <p className="mono-data text-slate-400">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="data-cell text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          // Edit button එක click කරද්දි තියෙන current status එකයි owner එකයි form එකට දාගන්නවා
                          setEditLeadForm({
                            id: lead.id,
                            ownerName: lead.ownerName || currentSalesperson,
                            status: getLeadStatus(lead)
                          });
                          setIsEditing(true);
                        }}
                        className="p-1 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                        title="Edit salesperson and status"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          if (window.confirm(`Delete customer ${lead.name}?`)) {
                            onDeleteCustomer(lead.id);
                          }
                        }}
                        className="p-1 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                        title="Delete customer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 md:px-6 py-3 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-gray-50/40">
          <p className="text-xs text-gray-500">
            Showing {pageStart}-{pageEnd} of {filteredLeads.length} customers
          </p>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500">Rows</label>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="px-2 py-1.5 border border-gray-200 rounded-md bg-white text-xs"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 border border-gray-200 rounded-md text-xs bg-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Prev
            </button>
            <span className="text-xs text-gray-500">Page {currentPage} / {totalPages}</span>
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 border border-gray-200 rounded-md text-xs bg-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Call History / Log Call Sections (No changes here) */}
        <div className="lg:col-span-2 card p-0">
          <div className="px-6 py-5 border-b border-brand-line bg-brand-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-sm text-brand-ink">Call History By Telephone</h3>
              <p className="text-xs text-gray-500 mt-1">
                {selectedLead ? `Customer: ${selectedLead.name} (${selectedLead.phone})` : 'Select a customer to view calls'}
              </p>
              {selectedLead && selectedLead.ownerName !== currentSalesperson && (
                <p className="text-xs text-amber-700 mt-1 inline-flex items-center gap-1 font-semibold">
                  <AlertTriangle size={12} /> This customer belongs to {selectedLead.ownerName}. Your updates will be saved under your name.
                </p>
              )}
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              {selectedLead ? `${selectedLead.callLogs?.length || 0} calls` : '0 calls'}
            </span>
          </div>

          <div className="p-6 space-y-4 max-h-[360px] overflow-y-auto">
            {selectedLead && selectedLead.callLogs?.length > 0 ? (
              selectedLead.callLogs.map((log) => (
                <div key={log.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50/40">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                    <span className="inline-flex items-center gap-1"><PhoneCall size={12} /> {new Date(log.timestamp).toLocaleString()}</span>
                    <span className="inline-flex items-center gap-1"><Clock size={12} /> {log.durationMinutes} min</span>
                  </div>
                  <span className={`inline-flex px-2 py-1 rounded-full text-[10px] font-bold border ${log.direction === 'Incoming' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-indigo-50 text-indigo-700 border-indigo-200'}`}>
                    {log.direction}
                  </span>
                  <p className="text-sm font-semibold text-gray-700">{log.agent}</p>
                  <p className="text-sm text-gray-600 mt-1">{log.summary}</p>
                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        if (!selectedLead) {
                          return;
                        }
                        if (window.confirm('Delete this call log?')) {
                          onDeleteCallLog(selectedLead.id, log.id);
                        }
                      }}
                      className="p-1 text-gray-400 hover:text-red-600 rounded hover:bg-red-50"
                      title="Delete call log"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No calls recorded for this customer yet.</p>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="text-sm font-extrabold mb-5 flex items-center gap-2 text-brand-ink">
            <NotebookPen size={18} className="text-brand-accent p-0.5 bg-brand-subtle rounded" /> Log New Call
          </h3>
          <form className="space-y-3" onSubmit={handleAddCall}>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-brand-text uppercase tracking-wider">Call Time</label>
              <input
                required
                type="datetime-local"
                value={newCall.callTime}
                onChange={(e) => setNewCall((prev) => ({ ...prev, callTime: e.target.value }))}
                className="input-field !py-2.5"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-brand-text uppercase tracking-wider">Call Direction</label>
              <select
                value={newCall.direction}
                onChange={(e) => setNewCall((prev) => ({ ...prev, direction: e.target.value as 'Incoming' | 'Outgoing' }))}
                className="input-field !py-2.5 cursor-pointer"
              >
                <option value="Outgoing">Outgoing</option>
                <option value="Incoming">Incoming</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-brand-text uppercase tracking-wider">Duration (minutes)</label>
              <input
                type="number"
                min="1"
                value={newCall.durationMinutes}
                onChange={(e) => setNewCall((prev) => ({ ...prev, durationMinutes: e.target.value }))}
                className="input-field !py-2.5"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-brand-text uppercase tracking-wider">Remark</label>
              <textarea
                required
                value={newCall.summary}
                onChange={(e) => setNewCall((prev) => ({ ...prev, summary: e.target.value }))}
                className="input-field h-24 resize-none"
                placeholder="What was discussed in this call?"
              />
            </div>
            <button
              type="submit"
              disabled={!selectedLead}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              Save Call Log
            </button>
          </form>
        </div>
      </section>

      {/* Add Customer Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-brand-line w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-brand-line flex justify-between items-center">
              <h3 className="font-bold text-lg">Register New Customer</h3>
              <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-gray-600">
                <Plus size={24} className="rotate-45" />
              </button>
            </div>
            <form className="p-6 space-y-4" onSubmit={handleCreateLead}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-brand-text uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newLeadForm.name}
                    onChange={(e) => setNewLeadForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="input-field !py-2.5"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-brand-text uppercase tracking-wider">Telephone Number</label>
                  <input
                    type="tel"
                    required
                    value={newLeadForm.phone}
                    onChange={(e) => setNewLeadForm((prev) => ({ ...prev, phone: e.target.value }))}
                    className="input-field !py-2.5"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-brand-text uppercase tracking-wider">Address (Optional)</label>
                <textarea
                  value={newLeadForm.address}
                  onChange={(e) => setNewLeadForm((prev) => ({ ...prev, address: e.target.value }))}
                  placeholder="Enter address if available"
                  className="input-field h-20 resize-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-brand-text uppercase tracking-wider">Salesperson</label>
                <input
                  value={currentSalesperson}
                  readOnly
                  className="input-field !py-2.5 bg-slate-50 cursor-not-allowed text-slate-500"
                />
              </div>
              {customers.some((lead) => lead.phone === newLeadForm.phone.trim()) && (
                <p className="text-xs text-red-600">This telephone number is already registered to another customer.</p>
              )}
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={customers.some((lead) => lead.phone === newLeadForm.phone.trim())}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Register Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* වෙනස් කළා: Edit Salesperson and Status Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-brand-line w-full max-w-sm overflow-hidden">
            <div className="p-6 border-b border-brand-line flex justify-between items-center">
              <h3 className="font-bold text-lg">Update Lead Status</h3>
              <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600">
                <Plus size={24} className="rotate-45" />
              </button>
            </div>
            <form className="p-6 space-y-4" onSubmit={handleUpdateLead}>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-brand-text uppercase tracking-wider">Assigned Salesperson</label>
                <select
                  required
                  value={editLeadForm.ownerName}
                  onChange={(e) => setEditLeadForm((prev) => ({ ...prev, ownerName: e.target.value }))}
                  className="input-field !py-2.5 cursor-pointer"
                >
                  {salespersonOptions.map((salesperson) => (
                    <option key={salesperson} value={salesperson}>{salesperson}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-brand-text uppercase tracking-wider">Lead Status</label>
                <select
                  required
                  value={editLeadForm.status}
                  onChange={(e) => setEditLeadForm((prev) => ({ ...prev, status: e.target.value as LeadStatus }))}
                  className="input-field !py-2.5 cursor-pointer"
                >
                  <option value="New">New</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Payment Pending">Payment Pending</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}