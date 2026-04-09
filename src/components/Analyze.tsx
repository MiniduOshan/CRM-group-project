import { Activity, BarChart3, RefreshCw, TrendingUp, UserRound, Users } from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

const monthlyGrowthData = [
  { month: 'Sep', customers: 1, quotations: 1 },
  { month: 'Oct', customers: 1, quotations: 1 },
  { month: 'Nov', customers: 2, quotations: 1 },
  { month: 'Dec', customers: 2, quotations: 2 },
  { month: 'Jan', customers: 3, quotations: 2 },
  { month: 'Feb', customers: 3, quotations: 3 }
];

const leadStageData = [
  { stage: 'New', count: 1 },
  { stage: 'In Progress', count: 1 },
  { stage: 'Completed', count: 1 },
  { stage: 'Payment Pending', count: 0 }
];

const weeklyActivityData = [
  { day: 'Mon', calls: 1, visits: 0 },
  { day: 'Tue', calls: 0, visits: 1 },
  { day: 'Wed', calls: 1, visits: 0 },
  { day: 'Thu', calls: 1, visits: 0 },
  { day: 'Fri', calls: 1, visits: 1 },
  { day: 'Sat', calls: 1, visits: 0 },
  { day: 'Sun', calls: 0, visits: 0 }
];

const teamRadarData = [
  { metric: 'Lead Handling', score: 78 },
  { metric: 'Quote Speed', score: 64 },
  { metric: 'Call Follow-up', score: 82 },
  { metric: 'Closure Rate', score: 56 },
  { metric: 'Visit Quality', score: 74 }
];

const systemDetails = [
  { label: 'Registered Customers', value: 3, tone: 'bg-indigo-50 border-indigo-100' },
  { label: 'Calls Logged', value: 5, tone: 'bg-emerald-50 border-emerald-100' },
  { label: 'Quotations Created', value: 2, tone: 'bg-blue-50 border-blue-100' },
  { label: 'Site Visits', value: 2, tone: 'bg-violet-50 border-violet-100' },
  { label: 'Inventory Alerts', value: 3, tone: 'bg-amber-50 border-amber-100' },
  { label: 'Active Staff Users', value: 2, tone: 'bg-slate-100 border-slate-200' }
];

const BRAND_ACCENT = '#4f46e5'; // indigo-600
const BRAND_SECONDARY = '#818cf8'; // indigo-400
const TEXT_MUTED = '#64748b'; // slate-500
const GRID_LINE = '#e2e8f0'; // slate-200

export default function Analyze() {
  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-6 bg-brand-bg min-h-full">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black tracking-tight text-brand-ink">CRM Analytics Overview</h2>
          <p className="text-brand-text font-medium text-sm mt-1">System-level customer, lead, quotation, and activity insights</p>
        </div>
        <button className="btn-secondary w-full sm:w-auto flex justify-center items-center gap-2">
          <RefreshCw size={18} /> Refresh
        </button>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="xl:col-span-2 card !p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.1em] text-brand-text">Customer & Quotation Growth</p>
              <p className="text-2xl font-black text-brand-ink leading-tight mt-1">3 Customers <span className="text-sm font-bold text-slate-400">/ 3 Quotations</span></p>
            </div>
            <p className="text-[11px] font-black text-brand-text inline-flex items-center gap-2 uppercase tracking-[0.1em]">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: BRAND_ACCENT }} /> MRR
            </p>
          </div>

          <div className="h-72 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyGrowthData}>
                <CartesianGrid strokeDasharray="4 4" stroke={GRID_LINE} vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: TEXT_MUTED, fontWeight: 700 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: TEXT_MUTED, fontWeight: 700 }} axisLine={false} tickLine={false} domain={[0, 4]} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} />
                <Area type="monotone" dataKey="customers" stroke={BRAND_ACCENT} fill={BRAND_ACCENT} fillOpacity={0.1} strokeWidth={3} />
                <Area type="monotone" dataKey="quotations" stroke={BRAND_SECONDARY} fill={BRAND_SECONDARY} fillOpacity={0.1} strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
          <div className="rounded-2xl border p-5 shadow-sm border-indigo-100 bg-indigo-50">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center mb-3 text-indigo-600 shadow-sm"><Users size={18} /></div>
            <p className="text-3xl font-black text-brand-ink">3</p>
            <p className="text-indigo-800 font-bold text-xs mt-1 uppercase tracking-[0.05em]">Total Customers</p>
          </div>
          <div className="rounded-2xl border p-5 shadow-sm border-blue-100 bg-blue-50">
            <div className="w-10 h-10 rounded-xl bg-white text-blue-600 flex items-center justify-center mb-3 shadow-sm"><BarChart3 size={18} /></div>
            <p className="text-3xl font-black text-brand-ink">2</p>
            <p className="text-blue-800 font-bold text-xs mt-1 uppercase tracking-[0.05em]">Quotations</p>
          </div>
          <div className="rounded-2xl border p-5 shadow-sm border-emerald-100 bg-emerald-50">
            <div className="w-10 h-10 rounded-xl bg-white text-emerald-600 flex items-center justify-center mb-3 shadow-sm"><Activity size={18} /></div>
            <p className="text-3xl font-black text-brand-ink">5</p>
            <p className="text-emerald-800 font-bold text-xs mt-1 uppercase tracking-[0.05em]">Calls Logged</p>
          </div>
          <div className="rounded-2xl border p-5 shadow-sm border-amber-100 bg-amber-50">
            <div className="w-10 h-10 rounded-xl bg-white text-amber-600 flex items-center justify-center mb-3 shadow-sm"><UserRound size={18} /></div>
            <p className="text-3xl font-black text-brand-ink">2</p>
            <p className="text-amber-800 font-bold text-xs mt-1 uppercase tracking-[0.05em]">Staff Active</p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="card !p-6 shadow-sm">
          <h3 className="text-sm font-black uppercase tracking-[0.1em] text-brand-ink mb-6">Lead Stage Distribution</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leadStageData}>
                <CartesianGrid strokeDasharray="4 4" stroke={GRID_LINE} vertical={false} />
                <XAxis dataKey="stage" tick={{ fontSize: 11, fill: TEXT_MUTED, fontWeight: 700 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: TEXT_MUTED, fontWeight: 700 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} />
                <Bar dataKey="count" fill={BRAND_ACCENT} radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card !p-6 shadow-sm">
          <h3 className="text-sm font-black uppercase tracking-[0.1em] text-brand-ink mb-6">Weekly Activity Trend</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyActivityData}>
                <CartesianGrid strokeDasharray="4 4" stroke={GRID_LINE} vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: TEXT_MUTED, fontWeight: 700 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: TEXT_MUTED, fontWeight: 700 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} />
                <Line type="monotone" dataKey="calls" stroke={BRAND_ACCENT} strokeWidth={3} dot={{ r: 4, fill: BRAND_ACCENT }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="visits" stroke={BRAND_SECONDARY} strokeWidth={3} dot={{ r: 4, fill: BRAND_SECONDARY }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="card !p-6 shadow-sm">
          <h3 className="text-sm font-black uppercase tracking-[0.1em] text-brand-ink mb-6">Team Performance Radar</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={teamRadarData} outerRadius="70%">
                <PolarGrid stroke={GRID_LINE} />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: TEXT_MUTED, fontWeight: 700 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} />
                <Radar dataKey="score" stroke={BRAND_ACCENT} fill={BRAND_ACCENT} fillOpacity={0.4} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card !p-6 shadow-sm">
          <h3 className="text-sm font-black uppercase tracking-[0.1em] text-brand-ink mb-6">System Details Snapshot</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {systemDetails.map((item) => (
              <div key={item.label} className={`rounded-xl border p-4 ${item.tone} shadow-sm`}>
                <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-[0.05em]">{item.label}</p>
                <p className="text-2xl font-black text-brand-ink mt-1.5">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
