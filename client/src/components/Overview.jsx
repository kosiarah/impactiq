import { TrendingUp, TrendingDown, ShoppingBag, Heart, DollarSign, Users } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from 'recharts'

// 90-day mock time series data
const timeSeriesData = [
  { date: 'Mar 1', donations: 420, orders: 38, revenue: 3210 },
  { date: 'Mar 8', donations: 580, orders: 51, revenue: 4180 },
  { date: 'Mar 15', donations: 490, orders: 44, revenue: 3650 },
  { date: 'Mar 22', donations: 720, orders: 63, revenue: 5420 },
  { date: 'Mar 29', donations: 860, orders: 71, revenue: 6100 },
  { date: 'Apr 5', donations: 640, orders: 57, revenue: 4780 },
  { date: 'Apr 12', donations: 920, orders: 82, revenue: 7100 },
  { date: 'Apr 19', donations: 1050, orders: 91, revenue: 8200 },
  { date: 'Apr 26', donations: 870, orders: 76, revenue: 6430 },
  { date: 'May 3', donations: 1180, orders: 104, revenue: 9100 },
  { date: 'May 10', donations: 1340, orders: 118, revenue: 10200 },
  { date: 'May 17', donations: 1210, orders: 107, revenue: 9400 },
  { date: 'May 24', donations: 1420, orders: 126, revenue: 11800 },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-700/60 rounded-xl px-4 py-3 shadow-2xl">
        <p className="text-xs text-slate-400 font-body mb-2">{label}</p>
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center gap-2 text-sm font-body">
            <div className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
            <span className="text-slate-400">{entry.name}:</span>
            <span className="text-white font-500">
              {entry.name === 'revenue' ? `$${entry.value.toLocaleString()}` : 
               entry.name === 'donations' ? `$${entry.value}` : entry.value}
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

const weeklyBreakdown = [
  { day: 'Mon', withCharity: 62, withoutCharity: 38 },
  { day: 'Tue', withCharity: 58, withoutCharity: 42 },
  { day: 'Wed', withCharity: 65, withoutCharity: 35 },
  { day: 'Thu', withCharity: 71, withoutCharity: 29 },
  { day: 'Fri', withCharity: 68, withoutCharity: 32 },
  { day: 'Sat', withCharity: 84, withoutCharity: 16 },
  { day: 'Sun', withCharity: 79, withoutCharity: 21 },
]

function KPICard({ label, value, sub, delta, deltaLabel, icon: Icon, accent, delay }) {
  const positive = delta > 0
  return (
    <div
      className="relative overflow-hidden rounded-2xl bg-slate-900/60 border border-slate-800/60 p-6 hover:border-slate-700/60 transition-all duration-300 card-glow fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Accent corner */}
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-10`}
        style={{ background: accent }} />

      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-xl`} style={{ background: `${accent}18`, border: `1px solid ${accent}22` }}>
          <Icon size={17} style={{ color: accent }} />
        </div>
        <div className={`flex items-center gap-1 text-xs font-body font-500 px-2 py-1 rounded-full ${
          positive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
        }`}>
          {positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {positive ? '+' : ''}{delta}%
        </div>
      </div>

      <div className="font-display font-700 text-2xl text-white mt-1">{value}</div>
      <div className="text-sm text-slate-400 font-body mt-1">{label}</div>
      {sub && <div className="text-xs text-slate-600 font-body mt-2 border-t border-slate-800 pt-2">{sub}</div>}
    </div>
  )
}

export default function Overview() {
  return (
    <div className="space-y-8">
      {/* KPI Grid */}
      <div className="grid grid-cols-4 gap-5">
        <KPICard
          label="Total Donations Generated"
          value="$12,847"
          sub="Across 847 charity-assisted orders"
          delta={18.4}
          deltaLabel="vs last period"
          icon={Heart}
          accent="#34d399"
          delay={0}
        />
        <KPICard
          label="Charity Conversion Rate"
          value="61.4%"
          sub="vs 43.2% baseline (no charity) · +18.2pp lift"
          delta={18.2}
          icon={Users}
          accent="#60a5fa"
          delay={80}
        />
        <KPICard
          label="Charity-Attributed Revenue"
          value="$94,210"
          sub="Orders where a charity was selected"
          delta={22.7}
          icon={DollarSign}
          accent="#a78bfa"
          delay={160}
        />
        <KPICard
          label="Avg Order Value (Charity)"
          value="$111.23"
          sub="vs $72.40 baseline · 53.6% higher"
          delta={53.6}
          icon={ShoppingBag}
          accent="#f59e0b"
          delay={240}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-3 gap-5">
        {/* Main area chart */}
        <div className="col-span-2 rounded-2xl bg-slate-900/60 border border-slate-800/60 p-6 fade-up" style={{ animationDelay: '320ms' }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display font-600 text-white text-sm">Donation Activity</h3>
              <p className="text-xs text-slate-500 font-body mt-0.5">90-day rolling — weekly buckets</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-body">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-slate-400">Donations ($)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                <span className="text-slate-400">Revenue ($)</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={timeSeriesData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorDonations" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34d399" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 11, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 11, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="donations" stroke="#34d399" strokeWidth={2} fill="url(#colorDonations)" name="donations" dot={false} />
              <Area type="monotone" dataKey="revenue" stroke="#60a5fa" strokeWidth={2} fill="url(#colorRevenue)" name="revenue" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Weekday breakdown */}
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800/60 p-6 fade-up" style={{ animationDelay: '400ms' }}>
          <div className="mb-6">
            <h3 className="font-display font-600 text-white text-sm">Charity Selection by Day</h3>
            <p className="text-xs text-slate-500 font-body mt-0.5">% of orders with charity selected</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyBreakdown} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: '#475569', fontSize: 11, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
              <Tooltip
                content={({ active, payload, label }) => active && payload?.length ? (
                  <div className="bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 shadow-2xl text-xs font-body">
                    <p className="text-slate-400 mb-1">{label}</p>
                    <p className="text-emerald-400">{payload[0]?.value}% with charity</p>
                  </div>
                ) : null}
              />
              <Bar dataKey="withCharity" fill="#34d399" radius={[4, 4, 0, 0]} opacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-xs font-body text-slate-400">
            <span className="text-emerald-400 font-500">+40% higher</span> charity selection on weekends vs weekdays
          </div>
        </div>
      </div>

      {/* Summary metrics row */}
      <div className="grid grid-cols-3 gap-5 fade-up" style={{ animationDelay: '480ms' }}>
        {[
          { label: 'Orders with charity selected', value: '847', sub: 'of 1,380 total orders', pct: 61 },
          { label: 'Orders without charity selected', value: '533', sub: 'baseline group', pct: 39 },
          { label: 'Abandoned with charity shown', value: '214', sub: 'recovery opportunity', pct: 20 },
        ].map((item, i) => (
          <div key={i} className="rounded-2xl bg-slate-900/40 border border-slate-800/40 p-5">
            <div className="text-2xl font-display font-700 text-white">{item.value}</div>
            <div className="text-sm text-slate-400 font-body mt-1">{item.label}</div>
            <div className="text-xs text-slate-600 font-body mt-1">{item.sub}</div>
            <div className="mt-3 h-1.5 rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                style={{ width: `${item.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
