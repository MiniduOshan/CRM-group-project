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
  { label: 'Registered Customers', value: 3, tone: 'bg-[#fff9ee] border-[#f8e7c2]' },
  { label: 'Calls Logged', value: 5, tone: 'bg-[#edf8f2] border-[#d7efdf]' },
  { label: 'Quotations Created', value: 2, tone: 'bg-[#f1f7ff] border-[#dbeafe]' },
  { label: 'Site Visits', value: 2, tone: 'bg-[#f8f1fb] border-[#eedcf8]' },
  { label: 'Inventory Alerts', value: 3, tone: 'bg-[#fff5ef] border-[#fde4d3]' },
  { label: 'Active Staff Users', value: 2, tone: 'bg-[#f3f4f6] border-[#e5e7eb]' }
];

const ORANGE = '#f59e0b';
const PANEL_BORDER = '#e5e7eb';

export default function Analyze() {
  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-6 bg-brand-bg min-h-full">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900">CRM Analytics Overview</h2>
          <p className="text-gray-500 text-sm mt-1">System-level customer, lead, quotation, and activity insights</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-white border rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 w-full sm:w-auto justify-center" style={{ borderColor: PANEL_BORDER }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="xl:col-span-2 bg-white border rounded-2xl p-6 shadow-sm" style={{ borderColor: PANEL_BORDER }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Customer & Quotation Growth</p>
              <p className="text-2xl font-bold text-gray-900 leading-tight">3 Customers <span className="text-sm font-medium text-gray-400">/ 3 Quotations</span></p>
            </div>
            <p className="text-sm font-semibold text-gray-500 inline-flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ORANGE }} /> MRR
            </p>
          </div>

          <div className="h-72 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyGrowthData}>
                <CartesianGrid strokeDasharray="4 4" stroke="#edf2f7" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[0, 4]} />
                <Tooltip />
                <Area type="monotone" dataKey="customers" stroke="#2563eb" fill="#dbeafe" strokeWidth={2.5} />
                <Area type="monotone" dataKey="quotations" stroke={ORANGE} fill="#ffedd5" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
          <div className="rounded-2xl border p-4" style={{ borderColor: '#f8e7c2', backgroundColor: '#fff9ee' }}>
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center mb-3" style={{ color: ORANGE }}><Users size={15} /></div>
            <p className="text-3xl font-bold text-gray-900">3</p>
            <p className="text-gray-600 text-sm">Total Customers</p>
          </div>
          <div className="rounded-2xl border p-4" style={{ borderColor: '#f0e5f5', backgroundColor: '#f8f1fb' }}>
            <div className="w-8 h-8 rounded-lg bg-white text-[#d16fc8] flex items-center justify-center mb-3"><BarChart3 size={15} /></div>
            <p className="text-3xl font-bold text-gray-900">2</p>
            <p className="text-gray-600 text-sm">Quotations</p>
          </div>
          <div className="rounded-2xl border border-[#e7f2ee] bg-[#edf8f2] p-4">
            <div className="w-8 h-8 rounded-lg bg-white text-[#3ebd7a] flex items-center justify-center mb-3"><Activity size={15} /></div>
            <p className="text-3xl font-bold text-gray-900">5</p>
            <p className="text-gray-600 text-sm">Calls Logged</p>
          </div>
          <div className="rounded-2xl border border-[#f5f0df] bg-[#f8f4e8] p-4">
            <div className="w-8 h-8 rounded-lg bg-white text-[#e2b84f] flex items-center justify-center mb-3"><UserRound size={15} /></div>
            <p className="text-3xl font-bold text-gray-900">2</p>
            <p className="text-gray-600 text-sm">Staff Active</p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white border rounded-2xl p-6 shadow-sm" style={{ borderColor: PANEL_BORDER }}>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Lead Stage Distribution</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leadStageData}>
                <CartesianGrid strokeDasharray="4 4" stroke="#edf2f7" vertical={false} />
                <XAxis dataKey="stage" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill={ORANGE} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border rounded-2xl p-6 shadow-sm" style={{ borderColor: PANEL_BORDER }}>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Weekly Activity Trend</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyActivityData}>
                <CartesianGrid strokeDasharray="4 4" stroke="#edf2f7" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="calls" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="visits" stroke={ORANGE} strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white border rounded-2xl p-6 shadow-sm" style={{ borderColor: PANEL_BORDER }}>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Team Performance Radar</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={teamRadarData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip />
                <Radar dataKey="score" stroke="#2563eb" fill="#93c5fd" fillOpacity={0.45} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border rounded-2xl p-6 shadow-sm" style={{ borderColor: PANEL_BORDER }}>
          <h3 className="text-xl font-bold text-gray-900 mb-4">System Details Snapshot</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {systemDetails.map((item) => (
              <div key={item.label} className={`rounded-xl border p-3 ${item.tone}`}>
                <p className="text-[11px] font-medium text-gray-500">{item.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
