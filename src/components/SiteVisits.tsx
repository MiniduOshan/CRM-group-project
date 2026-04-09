import { useState } from 'react';
import { 
  MapPin, 
  Calendar, 
  User, 
  FileUp, 
  Star,
  MessageSquare,
  ChevronRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { SiteVisit } from '../types';

const mockVisits: SiteVisit[] = [
  {
    id: 'SV-001',
    leadId: '1',
    designer: 'Mark Designer',
    visitDate: '2024-03-25T10:00:00Z',
    notes: 'Narrow staircase, needs modular assembly. Second floor installation. Vehicle access limited to small vans.',
    difficultyRating: 4
  },
  {
    id: 'SV-002',
    leadId: '2',
    designer: 'Mark Designer',
    visitDate: '2024-03-26T14:00:00Z',
    notes: 'Standard ground floor installation. Plenty of space. Customer wants granite top upgrade.',
    difficultyRating: 1
  }
];

export default function SiteVisits() {
  const [visits] = useState<SiteVisit[]>(mockVisits);

  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">Site Visits & Design</h2>
          <p className="text-gray-500 text-sm">Coordinate measurements and technical site notes.</p>
        </div>
        <button className="bg-brand-accent text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors w-full sm:w-auto justify-center">
          <Calendar size={18} />
          Schedule Visit
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {visits.map((visit) => (
          <motion.div 
            key={visit.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl border border-brand-line shadow-sm overflow-hidden flex flex-col"
          >
            <div className="p-6 border-b border-brand-line bg-gray-50/50">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white border border-brand-line flex items-center justify-center text-brand-accent">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Visit #{visit.id}</h3>
                    <p className="text-[10px] text-gray-400 font-mono uppercase tracking-wider">Lead ID: {visit.leadId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      size={12} 
                      className={star <= visit.difficultyRating ? 'text-orange-400 fill-orange-400' : 'text-gray-200'} 
                    />
                  ))}
                  <span className="text-[10px] font-bold text-gray-400 ml-1">DIFFICULTY</span>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <User size={14} className="text-gray-400" />
                  <span className="text-xs font-medium text-gray-600">{visit.designer}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-gray-400" />
                  <span className="text-xs font-medium text-gray-600">
                    {new Date(visit.visitDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4 flex-1">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <MessageSquare size={12} />
                  Technical Notes
                </div>
                <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100 italic">
                  "{visit.notes}"
                </p>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button className="flex items-center gap-2 text-xs font-bold text-brand-accent hover:underline">
                  <FileUp size={16} />
                  Upload Design PDF
                </button>
                <button className="flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-gray-600">
                  View Details
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
