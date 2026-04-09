import { useMemo, useState, type FormEvent } from 'react';
import {
  MapPin,
  Calendar,
  User,
  FileUp,
  Star,
  MessageSquare,
  Search
} from 'lucide-react';
import { motion } from 'motion/react';
import type { CustomerProfile, SiteVisit } from '../types';

interface SiteVisitsProps {
  customers: CustomerProfile[];
  visits: SiteVisit[];
  onCreateVisit: (visit: {
    customerId: string;
    designer: string;
    visitDate: string;
    notes: string;
    difficultyRating: 1 | 2 | 3 | 4 | 5;
    attachments: string[];
  }) => void;
}

export default function SiteVisits({ customers, visits, onCreateVisit }: SiteVisitsProps) {
  const [search, setSearch] = useState('');
  const [visitForm, setVisitForm] = useState({
    customerId: '',
    designer: 'Field Officer',
    visitDate: new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
    difficultyRating: '3',
    notes: '',
    attachments: ''
  });

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return customers;
    }
    return customers.filter(
      (customer) => customer.name.toLowerCase().includes(query) || customer.phone.includes(search.trim())
    );
  }, [customers, search]);

  const handleCreateVisit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!visitForm.customerId || !visitForm.notes.trim()) {
      return;
    }
    onCreateVisit({
      customerId: visitForm.customerId,
      designer: visitForm.designer,
      visitDate: visitForm.visitDate,
      notes: visitForm.notes,
      difficultyRating: Number(visitForm.difficultyRating) as 1 | 2 | 3 | 4 | 5,
      attachments: visitForm.attachments
        .split(',')
        .map((entry) => entry.trim())
        .filter((entry) => entry.length > 0)
    });

    setVisitForm((prev) => ({
      ...prev,
      customerId: '',
      notes: '',
      attachments: ''
    }));
  };

  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black tracking-tight text-brand-ink">Site Visits & Design</h2>
          <p className="text-brand-text font-medium text-sm mt-1">Search customer by name/phone and keep site observations in history.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <form onSubmit={handleCreateVisit} className="xl:col-span-1 card !p-5 space-y-4">
          <p className="text-xs font-black uppercase tracking-[0.1em] text-brand-text">Add Field Visit</p>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search customer"
              className="input-field pl-9 !py-2.5"
            />
          </div>

          <select
            required
            value={visitForm.customerId}
            onChange={(event) => setVisitForm((prev) => ({ ...prev, customerId: event.target.value }))}
            className="input-field !py-2.5"
          >
            <option value="">Select customer</option>
            {filteredCustomers.map((customer) => (
              <option key={customer.id} value={customer.id}>{customer.name} - {customer.phone}</option>
            ))}
          </select>

          <input
            required
            value={visitForm.designer}
            onChange={(event) => setVisitForm((prev) => ({ ...prev, designer: event.target.value }))}
            placeholder="Officer"
            className="input-field !py-2.5"
          />

          <input
            type="datetime-local"
            required
            value={visitForm.visitDate}
            onChange={(event) => setVisitForm((prev) => ({ ...prev, visitDate: event.target.value }))}
            className="input-field !py-2.5"
          />

          <select
            value={visitForm.difficultyRating}
            onChange={(event) => setVisitForm((prev) => ({ ...prev, difficultyRating: event.target.value }))}
            className="input-field !py-2.5"
          >
            <option value="1">Difficulty 1</option>
            <option value="2">Difficulty 2</option>
            <option value="3">Difficulty 3</option>
            <option value="4">Difficulty 4</option>
            <option value="5">Difficulty 5</option>
          </select>

          <textarea
            required
            value={visitForm.notes}
            onChange={(event) => setVisitForm((prev) => ({ ...prev, notes: event.target.value }))}
            placeholder="Site condition, accessibility, risks..."
            className="input-field !py-2.5 h-24 resize-none"
          />

          <input
            value={visitForm.attachments}
            onChange={(event) => setVisitForm((prev) => ({ ...prev, attachments: event.target.value }))}
            placeholder="Attachments (comma separated)"
            className="input-field !py-2.5"
          />

          <button className="btn-primary w-full flex justify-center items-center gap-2">
            <Calendar size={18} /> Save Visit Note
          </button>
        </form>

        <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {visits.map((visit) => (
          <motion.div 
            key={visit.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card !p-0 overflow-hidden flex flex-col hover:shadow-elevated transition-shadow"
          >
            <div className="p-6 border-b border-brand-line bg-brand-subtle">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-brand-line flex items-center justify-center text-brand-accent shadow-sm">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-brand-ink text-sm">Visit #{visit.id}</h3>
                    <p className="text-[10px] text-brand-text font-black font-mono uppercase tracking-[0.1em] mt-0.5">Customer: {visit.customerName ?? visit.leadId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      size={14} 
                      className={star <= visit.difficultyRating ? 'text-amber-500 fill-amber-500' : 'text-slate-200'} 
                    />
                  ))}
                  <span className="text-[10px] font-black text-brand-text ml-1 mt-0.5 tracking-[0.1em]">DIFFICULTY</span>
                </div>
              </div>
              
              <div className="flex items-center gap-6 mt-1">
                <div className="flex items-center gap-2">
                  <User size={14} className="text-brand-accent" />
                  <span className="text-xs font-bold text-slate-600">{visit.designer}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-brand-accent" />
                  <span className="text-xs font-bold text-slate-600">
                    {new Date(visit.visitDate).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4 flex-1">
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-[10px] font-black text-brand-text uppercase tracking-[0.1em]">
                  <MessageSquare size={14} className="text-slate-400" />
                  Technical Notes
                </div>
                <p className="text-sm text-slate-600 font-medium leading-relaxed bg-brand-subtle p-4 rounded-xl border border-brand-line italic">
                  "{visit.notes}"
                </p>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button className="flex items-center gap-2 text-xs font-bold text-brand-accent hover:text-blue-700 transition-colors">
                  <FileUp size={16} />
                  {visit.attachments?.length ? `${visit.attachments.length} attachment(s)` : 'No attachments'}
                </button>
                <span className="text-xs font-bold text-slate-400">{visit.customerPhone ?? 'No phone'}</span>
              </div>
            </div>
          </motion.div>
        ))}
        </div>
      </div>
    </div>
  );
}
