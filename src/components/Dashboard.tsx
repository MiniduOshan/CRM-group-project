import { 
  TrendingUp, 
  Users, 
  Clock, 
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { motion } from 'motion/react';

const stats = [
  { label: 'Total Leads', value: '124', change: '+12%', trend: 'up', icon: Users },
  { label: 'Active Projects', value: '42', change: '+5%', trend: 'up', icon: Clock },
  { label: 'Monthly Revenue', value: '$12,450', change: '-2%', trend: 'down', icon: TrendingUp },
  { label: 'Completed', value: '18', change: '+8%', trend: 'up', icon: CheckCircle2 },
];

export default function Dashboard() {
  return (
    <div className="p-8 space-y-8">
      <header>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard Overview</h2>
        <p className="text-gray-500 text-sm">Welcome back, here's what's happening today.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={stat.label}
              className="bg-white p-6 rounded-xl border border-brand-line shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <Icon size={20} className="text-gray-600" />
                </div>
                <div className={`flex items-center text-xs font-medium ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                  {stat.trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                <p className="text-2xl font-bold tracking-tight mt-1">{stat.value}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-brand-line p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold">Recent Leads</h3>
            <button className="text-xs font-bold text-brand-accent hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-brand-accent font-bold text-xs">
                    JD
                  </div>
                  <div>
                    <p className="text-sm font-bold">John Doe</p>
                    <p className="text-xs text-gray-400 font-mono">#LD-2024-00{item}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-1 bg-yellow-50 text-yellow-700 text-[10px] font-bold rounded uppercase tracking-wider">
                    In Progress
                  </span>
                  <p className="text-[10px] text-gray-400 mt-1">2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-brand-line p-6">
          <h3 className="font-bold mb-6">Inventory Alerts</h3>
          <div className="space-y-4">
            {[
              { name: 'Aluminum Profile A', stock: 12, min: 20 },
              { name: 'Granite Top - Black', stock: 2, min: 5 },
              { name: 'Hinge Soft-Close', stock: 45, min: 100 },
            ].map((item) => (
              <div key={item.name} className="p-4 bg-red-50/50 rounded-lg border border-red-100">
                <div className="flex justify-between items-start">
                  <p className="text-sm font-bold text-red-900">{item.name}</p>
                  <span className="text-[10px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded">LOW STOCK</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-red-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-500" 
                      style={{ width: `${(item.stock / item.min) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-red-700">{item.stock}/{item.min}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
