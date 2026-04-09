import {
  LayoutDashboard,
  Users,
  UserCog,
  FileText,
  Package,
  MapPin,
  BarChart3,
  ReceiptText,
  Settings,
  ChevronRight
} from 'lucide-react';
import { motion } from 'motion/react';
import type { StaffUser } from '../types';

interface SidebarProps {
  activeTab: string;
  activeUser?: StaffUser;
  setActiveTab: (tab: string) => void;
}

const navGroups = [
  {
    title: 'WORKSPACE',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'leads', label: 'Leads', icon: Users },
      { id: 'quotations', label: 'Quotations', icon: FileText },
      { id: 'invoices', label: 'Invoices', icon: ReceiptText },
      { id: 'site-visits', label: 'Site Visits', icon: MapPin },
      { id: 'inventory', label: 'Inventory', icon: Package },
    ]
  },
  {
    title: 'MONITORING',
    items: [
      { id: 'analyze', label: 'Analyze', icon: BarChart3 },
    ]
  },
  {
    title: 'ADMINISTRATION',
    items: [
      { id: 'user-management', label: 'User Management', icon: UserCog },
      { id: 'settings', label: 'Settings', icon: Settings },
    ]
  }
];

const formatDate = (value: string) => {
  const date = new Date(value);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export default function Sidebar({ activeTab, activeUser, setActiveTab }: SidebarProps) {
  return (
    <div className="w-64 h-screen bg-brand-ink border-r border-slate-800 flex flex-col shadow-xl lg:shadow-none relative z-10 transition-all duration-300">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-brand-accent to-indigo-500 shadow-lg shadow-brand-accent/30 rounded-xl flex items-center justify-center text-white text-xs font-black tracking-tight transform hover:scale-105 transition-transform">
            CS
          </div>
          <div>
            CRM SOLUTIONS
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest leading-none mt-0.5">Workspace v1</p>
          </div>
        </h1>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto px-4">
        {navGroups.map((group, index) => (
          <div key={group.title} className={index > 0 ? "mt-6" : ""}>
            <h3 className="px-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
              {group.title}
            </h3>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                      ? 'bg-brand-accent text-white shadow-md shadow-brand-accent/20'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={18} className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-brand-accent transition-colors'} />
                      <span className="text-sm font-semibold">{item.label}</span>
                    </div>
                    {isActive && (
                      <motion.div layoutId="active-indicator">
                        <ChevronRight size={16} className="opacity-80" />
                      </motion.div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800 bg-brand-ink">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-3 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-600 text-white flex items-center justify-center text-sm font-black border border-slate-500/50 shadow-inner">
            {activeUser?.name
              .split(' ')
              .map((part) => part[0])
              .join('')
              .slice(0, 2)
              .toUpperCase() || 'NA'}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-bold text-white truncate">{activeUser?.name ?? 'No Active User'}</p>
            <p className="text-[11px] font-medium text-slate-400 truncate uppercase mt-0.5">{activeUser?.role ?? 'Staff'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}