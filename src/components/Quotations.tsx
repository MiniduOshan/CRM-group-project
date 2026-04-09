import { useState } from 'react';
import { 
  Plus, 
  Search, 
  FileText, 
  Download, 
  Send,
  Trash2,
  Edit3,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'motion/react';
import { Quotation } from '../types';

const mockQuotations: Quotation[] = [
  {
    id: 'QT-2024-001',
    leadId: '1',
    items: [],
    totalAmount: 1250.00,
    discount: 50.00,
    status: 'Sent',
    createdAt: '2024-03-22T11:00:00Z'
  },
  {
    id: 'QT-2024-002',
    leadId: '2',
    items: [],
    totalAmount: 3400.00,
    discount: 0,
    status: 'Draft',
    createdAt: '2024-03-23T15:30:00Z'
  }
];

export default function Quotations() {
  const [quotations] = useState<Quotation[]>(mockQuotations);
  const [search, setSearch] = useState('');

  return (
    <div className="p-8 space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Quotations & Invoices</h2>
          <p className="text-gray-500 text-sm">Generate and manage professional pricing documents.</p>
        </div>
        <button className="bg-brand-accent text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-brand-accent/20">
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
        {quotations.map((qt) => (
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
                  <p className="text-xs text-gray-400 mt-0.5">Customer: <span className="text-gray-600 font-medium">Lead #{qt.leadId}</span></p>
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
                  <button title="Send to Customer" className="p-2 text-gray-400 hover:text-brand-accent hover:bg-brand-accent/5 rounded-lg transition-colors">
                    <Send size={18} />
                  </button>
                  <div className="w-px h-6 bg-gray-100 mx-1" />
                  <button title="Delete" className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
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
    </div>
  );
}
