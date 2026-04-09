import { useState, type FormEvent } from 'react';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Phone, 
  MapPin, 
  User,
  Filter,
  PhoneCall,
  Clock,
  NotebookPen
} from 'lucide-react';
import { motion } from 'motion/react';
import { Lead, LeadStatus } from '../types';

const mockLeads: Lead[] = [
  {
    id: '1',
    name: 'Sarah Jenkins',
    phone: '0771234567',
    address: '123 Main St, Colombo',
    salesperson: 'Alex Smith',
    status: 'In Progress',
    createdAt: '2024-03-20T10:00:00Z',
    history: [],
    callLogs: [
      {
        id: 'call-1',
        timestamp: '2024-03-20T11:00:00Z',
        agent: 'Alex Smith',
        summary: 'Discussed kitchen layout and booked site visit.',
        durationMinutes: 12
      },
      {
        id: 'call-2',
        timestamp: '2024-03-21T16:30:00Z',
        agent: 'Alex Smith',
        summary: 'Shared quotation draft and answered material questions.',
        durationMinutes: 9
      }
    ]
  },
  {
    id: '2',
    name: 'Michael Chen',
    phone: '0779876543',
    address: '45 Park Ave, Kandy',
    salesperson: 'Sarah Connor',
    status: 'New',
    createdAt: '2024-03-21T14:30:00Z',
    history: [],
    callLogs: [
      {
        id: 'call-3',
        timestamp: '2024-03-21T15:10:00Z',
        agent: 'Sarah Connor',
        summary: 'Initial inquiry call and collected room measurements.',
        durationMinutes: 7
      }
    ]
  },
  {
    id: '3',
    name: 'Robert Wilson',
    phone: '0775556667',
    address: '78 Lake View, Negombo',
    salesperson: 'Alex Smith',
    status: 'Completed',
    createdAt: '2024-02-15T09:00:00Z',
    history: [],
    callLogs: [
      {
        id: 'call-4',
        timestamp: '2024-02-16T13:00:00Z',
        agent: 'Alex Smith',
        summary: 'Confirmed installation date and payment milestone.',
        durationMinutes: 10
      },
      {
        id: 'call-5',
        timestamp: '2024-03-01T10:40:00Z',
        agent: 'Alex Smith',
        summary: 'Post-installation follow-up and service feedback.',
        durationMinutes: 6
      }
    ]
  }
];

export default function Leads() {
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [isAdding, setIsAdding] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedLeadId, setSelectedLeadId] = useState(mockLeads[0]?.id ?? '');
  const [newLeadForm, setNewLeadForm] = useState({
    name: '',
    phone: '',
    address: '',
    salesperson: 'Alex Smith'
  });
  const [newCall, setNewCall] = useState({
    agent: 'Alex Smith',
    durationMinutes: '5',
    summary: ''
  });

  const filteredLeads = leads.filter(lead => 
    lead.name.toLowerCase().includes(search.toLowerCase()) ||
    lead.phone.includes(search)
  );

  const selectedLead = leads.find((lead) => lead.id === selectedLeadId);

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

    const phoneExists = leads.some((lead) => lead.phone === newLeadForm.phone.trim());
    if (phoneExists) {
      return;
    }

    const lead: Lead = {
      id: String(Date.now()),
      name: newLeadForm.name.trim(),
      phone: newLeadForm.phone.trim(),
      address: newLeadForm.address.trim(),
      salesperson: newLeadForm.salesperson,
      status: 'New',
      createdAt: new Date().toISOString(),
      history: [],
      callLogs: []
    };

    setLeads((prev) => [lead, ...prev]);
    setSelectedLeadId(lead.id);
    setNewLeadForm({ name: '', phone: '', address: '', salesperson: 'Alex Smith' });
    setIsAdding(false);
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

    const callLog = {
      id: `call-${Date.now()}`,
      timestamp: new Date().toISOString(),
      agent: newCall.agent,
      summary: newCall.summary.trim(),
      durationMinutes: duration
    };

    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === selectedLead.id ? { ...lead, callLogs: [callLog, ...lead.callLogs] } : lead
      )
    );

    setNewCall({ agent: newCall.agent, durationMinutes: '5', summary: '' });
  };

  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">Customer Registration & Call Tracking</h2>
          <p className="text-gray-500 text-sm">Register by phone number and view every call made with each customer.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-brand-accent text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors w-full sm:w-auto justify-center"
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
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500">
          <Filter size={18} />
        </button>
      </div>

      <div className="bg-white rounded-xl border border-brand-line shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-gray-50 border-b border-brand-line">
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Salesperson</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Created</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredLeads.map((lead) => (
              <tr
                key={lead.id}
                className={`hover:bg-gray-50/50 transition-colors group cursor-pointer ${selectedLeadId === lead.id ? 'bg-brand-accent/5' : ''}`}
                onClick={() => setSelectedLeadId(lead.id)}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-[10px]">
                      {lead.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{lead.name}</p>
                      <p className="text-[10px] text-gray-400 flex items-center gap-1">
                        <MapPin size={10} /> {lead.address}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-xs font-mono text-gray-600 flex items-center gap-1">
                    <Phone size={12} className="text-gray-400" /> {lead.phone}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <User size={12} className="text-gray-400" />
                    <span className="text-xs font-medium text-gray-600">{lead.salesperson}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold border ${getStatusColor(lead.status)}`}>
                    {lead.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <p className="text-[10px] font-mono text-gray-400">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </p>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                    <MoreVertical size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-brand-line shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-brand-line flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm">Call History By Telephone</h3>
              <p className="text-xs text-gray-500 mt-1">
                {selectedLead ? `Customer: ${selectedLead.name} (${selectedLead.phone})` : 'Select a customer to view calls'}
              </p>
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              {selectedLead ? `${selectedLead.callLogs.length} calls` : '0 calls'}
            </span>
          </div>

          <div className="p-6 space-y-4 max-h-[360px] overflow-y-auto">
            {selectedLead && selectedLead.callLogs.length > 0 ? (
              selectedLead.callLogs.map((log) => (
                <div key={log.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50/40">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                    <span className="inline-flex items-center gap-1"><PhoneCall size={12} /> {new Date(log.timestamp).toLocaleString()}</span>
                    <span className="inline-flex items-center gap-1"><Clock size={12} /> {log.durationMinutes} min</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-700">{log.agent}</p>
                  <p className="text-sm text-gray-600 mt-1">{log.summary}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No calls recorded for this customer yet.</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-brand-line shadow-sm p-5">
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
            <NotebookPen size={16} className="text-brand-accent" /> Log New Call
          </h3>
          <form className="space-y-3" onSubmit={handleAddCall}>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Staff</label>
              <select
                value={newCall.agent}
                onChange={(e) => setNewCall((prev) => ({ ...prev, agent: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
              >
                <option>Alex Smith</option>
                <option>Sarah Connor</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Duration (minutes)</label>
              <input
                type="number"
                min="1"
                value={newCall.durationMinutes}
                onChange={(e) => setNewCall((prev) => ({ ...prev, durationMinutes: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Call Summary</label>
              <textarea
                required
                value={newCall.summary}
                onChange={(e) => setNewCall((prev) => ({ ...prev, summary: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm h-24"
                placeholder="What was discussed in this call?"
              />
            </div>
            <button
              type="submit"
              disabled={!selectedLead}
              className="w-full px-4 py-2 bg-brand-accent text-white rounded-lg text-sm font-bold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Save Call Log
            </button>
          </form>
        </div>
      </section>

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
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Full Name</label>
                    <input
                      type="text"
                      required
                      value={newLeadForm.name}
                      onChange={(e) => setNewLeadForm((prev) => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-accent/20 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Telephone Number</label>
                    <input
                      type="tel"
                      required
                      value={newLeadForm.phone}
                      onChange={(e) => setNewLeadForm((prev) => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-accent/20 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Address</label>
                  <textarea
                    required
                    value={newLeadForm.address}
                    onChange={(e) => setNewLeadForm((prev) => ({ ...prev, address: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-accent/20 focus:outline-none h-20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Salesperson</label>
                  <select
                    value={newLeadForm.salesperson}
                    onChange={(e) => setNewLeadForm((prev) => ({ ...prev, salesperson: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-accent/20 focus:outline-none"
                  >
                    <option>Alex Smith</option>
                    <option>Sarah Connor</option>
                  </select>
                </div>
                {leads.some((lead) => lead.phone === newLeadForm.phone.trim()) && (
                  <p className="text-xs text-red-600">This telephone number is already registered to another customer.</p>
                )}
                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={leads.some((lead) => lead.phone === newLeadForm.phone.trim())}
                    className="flex-1 px-4 py-2 bg-brand-accent text-white rounded-lg text-sm font-bold hover:bg-blue-700"
                  >
                    Register Customer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </div>
  );
}
