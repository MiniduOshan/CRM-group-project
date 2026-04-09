import { 
  LayoutDashboard, 
  Users, 
  UserCog,
  FileText, 
  Package, 
  MapPin, 
  BarChart3,
  Settings,
  ChevronRight
} from 'lucide-react';
import { motion } from 'motion/react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'leads', label: 'Leads', icon: Users },
  { id: 'quotations', label: 'Quotations', icon: FileText },
  { id: 'site-visits', label: 'Site Visits', icon: MapPin },
  { id: 'inventory', label: 'Inventory', icon: Package },
  { id: 'user-management', label: 'User Management', icon: UserCog },
  { id: 'analyze', label: 'Analyze', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  return (
    <div className="w-64 h-screen bg-white border-r border-brand-line flex flex-col">
      <div className="p-6 border-b border-brand-line">
        <h1 className="text-xl font-bold tracking-tighter flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-accent rounded-lg flex items-center justify-center text-white text-[11px] font-black tracking-tight">
            CS
          </div>
          CRM SOLUTIONS
        </h1>
        <p className="text-[10px] text-gray-400 font-mono mt-1 uppercase tracking-widest">CRM v1</p>
      </div>
      
      <nav className="flex-1 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-6 py-3 transition-colors group ${
                isActive 
                  ? 'bg-brand-accent/5 text-brand-accent border-r-2 border-brand-accent' 
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} className={isActive ? 'text-brand-accent' : 'text-gray-400 group-hover:text-gray-600'} />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              {isActive && (
                <motion.div layoutId="active-indicator">
                  <ChevronRight size={14} />
                </motion.div>
              )}
            </button>
          );
        })}
      </nav>
      
      <div className="p-6 border-t border-brand-line">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">
            CS
          </div>
          <div>
            <p className="text-xs font-bold">Admin User</p>
            <p className="text-[10px] text-gray-400 uppercase">Staff</p>
          </div>
        </div>
      </div>
    </div>
  );
}
