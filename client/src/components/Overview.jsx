import { useState, useEffect, memo } from 'react'
import { TrendingUp, TrendingDown, ShoppingBag, Heart, DollarSign, Users, RefreshCw } from 'lucide-react'
import { apiFetch } from '../api'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts'

const CustomTooltip = memo(({ active, payload, label }) => {
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
               entry.name === 'donations' ? `$${entry.value.toFixed(0)}` : entry.value}
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
})

function KPICard({ label, value, sub, delta, icon: Icon, accent, delay }) {
  const positive = delta === null || delta > 0
  return (
    <div
      className="relative overflow-hidden rounded-2xl bg-slate-900/60 border border-slate-800/60 p-6 hover:border-slate-700/60 transition-all duration-300 card-glow fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-10`}
        style={{ background: accent }} />
      <div className="flex items-start justify-between mb-4">
        <div className="p-2.5 rounded-xl" style={{ background: `${accent}18`, border: `1px solid ${accent}22` }}>
          <Icon size={17} style={{ color: accent }} />
        </div>
        {delta !== null && (
          <div className={`flex items-center gap-1 text-xs font-body font-500 px-2 py-1 rounded-full ${
            positive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
          }`}>
            {positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {positive ? '+' : ''}{delta}%
          </div>
        )}
      </div>
      <div className="font-display font-700 text-2xl text-white mt-1">{value}</div>
      <div className="text-sm text-slate-400 font-body mt-1">{label}</div>
      {sub && <div className="text-xs text-slate-600 font-body mt-2 border-t border-slate-800 pt-2">{sub}</div>}
    </div>
  )
}

function KPISkeleton({ delay }) {
  return (
    <div
      className="rounded-2xl bg-slate-900/60 border border-slate-800/60 p-6 fade-up animate-pulse"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-slate-800" />
        <div className="w-14 h-6 rounded-full bg-slate-800" />
      </div>
      <div className="w-28 h-8 rounded-lg bg-slate-800 mb-2" />
      <div className="w-40 h-3 rounded bg-slate-800/60 mb-3 mt-3" />
      <div className="w-52 h-3 rounded bg-slate-800/40 mt-2 pt-2 border-t border-slate-800" />
    </div>
  )
}

function formatWeekLabel(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function Overview({ days = 90, onSync }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)
    apiFetch(`/api/analytics/overview?days=${days}`, { signal: controller.signal })
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })
      .then(d => { setData(d); onSync?.(); setLoading(false) })
      .catch(e => {
        if (e.name !== 'AbortError') { setError(e.message); setLoading(false) }
      })
    return () => controller.abort()
  }, [days, retryCount]) // eslint-disable-line react-hooks/exhaustive-deps

  const chartData = (data?.timeSeries || []).map(w => ({
    date: formatWeekLabel(w.week_start),
    donations: Math.round(w.donations),
    revenue: Math.round(w.revenue),
    orders: w.charity_orders,
  }))

  const aovLift = data && data.baselineAOV > 0
    ? (((data.charityAOV - data.baselineAOV) / data.baselineAOV) * 100).toFixed(1)
    : null

  const conversionLift = data
    ? (data.charityConversionRate - data.baselineConversionRate).toFixed(1)
    : null

  const conversionData = data ? [
    { label: 'With Charity', value: parseFloat(data.charityConversionRate.toFixed(1)), fill: '#34d399' },
    { label: 'Baseline', value: parseFloat(data.baselineConversionRate.toFixed(1)), fill: '#475569' },
  ] : []

  const noCharityOrders = data ? data.totalOrders - data.charityOrders : 0

  return (
    <div className="space-y-8">
      {/* KPI Grid */}
      <div className="grid grid-cols-4 gap-5">
        {loading ? (
          <>
            <KPISkeleton delay={0} />
            <KPISkeleton delay={80} />
            <KPISkeleton delay={160} />
            <KPISkeleton delay={240} />
          </>
        ) : error ? (
          <div className="col-span-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 p-6 flex items-center justify-between">
            <span className="text-rose-400 text-sm font-body">Unable to load overview data. Check your connection and try again.</span>
            <button
              onClick={() => setRetryCount(c => c + 1)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-body font-500 hover:bg-rose-500/20 transition-all flex-shrink-0 ml-4"
            >
              <RefreshCw size={12} />
              Try again
            </button>
          </div>
        ) : (
          <>
            <KPICard
              label="Total Donations Generated"
              value={`$${data.totalDonations.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
              sub={`Across ${data.charityOrders.toLocaleString()} charity-assisted orders`}
              delta={null}
              icon={Heart}
              accent="#34d399"
              delay={0}
            />
            <KPICard
              label="Charity Conversion Rate"
              value={`${data.charityConversionRate.toFixed(1)}%`}
              sub={`vs ${data.baselineConversionRate.toFixed(1)}% baseline · +${conversionLift}pp lift`}
              delta={parseFloat(conversionLift)}
              icon={Users}
              accent="#60a5fa"
              delay={80}
            />
            <KPICard
              label="Charity-Attributed Revenue"
              value={`$${data.charityRevenue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
              sub="Orders where a charity was selected"
              delta={null}
              icon={DollarSign}
              accent="#a78bfa"
              delay={160}
            />
            <KPICard
              label="Avg Order Value (Charity)"
              value={`$${data.charityAOV.toFixed(2)}`}
              sub={`vs $${data.baselineAOV.toFixed(2)} baseline · ${aovLift !== null ? `${aovLift}% higher` : 'N/A'}`}
              delta={aovLift !== null ? parseFloat(aovLift) : null}
              icon={ShoppingBag}
              accent="#f59e0b"
              delay={240}
            />
          </>
        )}
      </div>

      {/* Empty state — hidden on error or loading */}
      {!error && !loading && data && data.timeSeries.length === 0 && (
        <div className="rounded-2xl bg-slate-900/40 border border-slate-800/40 p-10 flex flex-col items-center justify-center gap-3 fade-up">
          <div className="text-3xl">📭</div>
          <p className="text-slate-400 text-sm font-body">No orders found in this period.</p>
          <p className="text-slate-600 text-xs font-body">Try selecting a wider date range.</p>
        </div>
      )}

      {/* Charts row — hidden on error or empty data */}
      {!error && !(data && data.timeSeries.length === 0) && (
        <div className="grid grid-cols-3 gap-5">
          {/* Main area chart */}
          <div className="col-span-2 rounded-2xl bg-slate-900/60 border border-slate-800/60 p-6 fade-up" style={{ animationDelay: '320ms' }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-display font-600 text-white text-sm">Donation Activity</h3>
                <p className="text-xs text-slate-500 font-body mt-0.5">{days}-day rolling — weekly buckets</p>
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
            {loading ? (
              <div className="animate-pulse h-60 rounded-xl bg-slate-800/50" />
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
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
            )}
          </div>

          {/* Conversion rate comparison */}
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800/60 p-6 fade-up" style={{ animationDelay: '400ms' }}>
            <div className="mb-6">
              <h3 className="font-display font-600 text-white text-sm">Conversion Rate</h3>
              <p className="text-xs text-slate-500 font-body mt-0.5">Charity orders vs baseline</p>
            </div>
            {loading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-16 rounded-xl bg-slate-800/50" />
                <div className="h-16 rounded-xl bg-slate-800/50" />
              </div>
            ) : (
              <div className="space-y-4">
                {conversionData.map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs font-body mb-1.5">
                      <span className="text-slate-400">{item.label}</span>
                      <span className="font-500" style={{ color: item.fill }}>{item.value}%</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${item.value}%`, background: item.fill }}
                      />
                    </div>
                  </div>
                ))}
                {data && (
                  <div className="mt-4 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-xs font-body text-slate-400">
                    <span className="text-emerald-400 font-500">+{conversionLift}pp lift</span> when a charity is selected at checkout
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Summary metrics row — hidden on error or empty data */}
      {!error && !(data && data.timeSeries.length === 0) && (
        <div className="grid grid-cols-3 gap-5 fade-up" style={{ animationDelay: '480ms' }}>
          {loading ? (
            <>
              {[0, 1, 2].map(i => (
                <div key={i} className="rounded-2xl bg-slate-900/40 border border-slate-800/40 p-5 animate-pulse">
                  <div className="w-16 h-8 bg-slate-800 rounded mb-2" />
                  <div className="w-40 h-3 bg-slate-800 rounded mb-1" />
                  <div className="w-28 h-3 bg-slate-800/60 rounded mb-3" />
                  <div className="h-1.5 rounded-full bg-slate-800" />
                </div>
              ))}
            </>
          ) : data && (
            <>
              {[
                {
                  label: 'Orders with charity selected',
                  value: data.charityOrders.toLocaleString(),
                  sub: `of ${data.totalOrders.toLocaleString()} total orders`,
                  pct: Math.round((data.charityOrders / data.totalOrders) * 100),
                },
                {
                  label: 'Orders without charity selected',
                  value: noCharityOrders.toLocaleString(),
                  sub: 'baseline group',
                  pct: Math.round((noCharityOrders / data.totalOrders) * 100),
                },
                {
                  label: 'AOV lift from charity',
                  value: aovLift !== null ? `${aovLift}%` : 'N/A',
                  sub: `$${data.charityAOV.toFixed(2)} vs $${data.baselineAOV.toFixed(2)} baseline`,
                  pct: aovLift !== null ? Math.min(100, Math.round(parseFloat(aovLift))) : 0,
                },
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
            </>
          )}
        </div>
      )}
    </div>
  )
}
