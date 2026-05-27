import { useState, useEffect } from 'react'
import { Heart, TrendingUp, ShoppingCart, Award, ArrowUpRight } from 'lucide-react'
import { apiFetch } from '../api'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts'

// Fixed color palette — assigned by selection rank (API returns charities sorted by total_selections DESC)
const PALETTE = [
  { color: '#34d399', glow: 'rgba(52,211,153,0.15)' },
  { color: '#60a5fa', glow: 'rgba(96,165,250,0.15)' },
  { color: '#f472b6', glow: 'rgba(244,114,182,0.15)' },
  { color: '#a3e635', glow: 'rgba(163,230,53,0.15)' },
  { color: '#c084fc', glow: 'rgba(192,132,252,0.15)' },
]

function StatPill({ label, value, accent }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-800/60 last:border-0">
      <span className="text-xs text-slate-500 font-body">{label}</span>
      <span className="text-sm font-body font-500" style={{ color: accent }}>{value}</span>
    </div>
  )
}

function CharitySkeleton({ delay }) {
  return (
    <div
      className="rounded-2xl bg-slate-900/60 border border-slate-800/60 p-5 animate-pulse fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="grid grid-cols-12 gap-6 items-center">
        <div className="col-span-3 flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-slate-800" />
          <div>
            <div className="w-28 h-4 bg-slate-800 rounded mb-1.5" />
            <div className="w-16 h-3 bg-slate-800/60 rounded" />
          </div>
        </div>
        <div className="col-span-2">
          <div className="w-16 h-3 bg-slate-800/60 rounded mb-2" />
          <div className="w-12 h-7 bg-slate-800 rounded mb-2" />
          <div className="h-1.5 rounded-full bg-slate-800 w-full" />
        </div>
        <div className="col-span-3">
          <div className="w-24 h-3 bg-slate-800/60 rounded mb-2" />
          <div className="flex gap-3">
            <div className="w-16 h-8 bg-slate-800 rounded" />
            <div className="w-16 h-8 bg-slate-800 rounded" />
            <div className="w-12 h-6 bg-slate-800 rounded-full ml-auto" />
          </div>
        </div>
        <div className="col-span-2 space-y-2">
          {[0,1,2].map(i => <div key={i} className="h-4 bg-slate-800/60 rounded" />)}
        </div>
        <div className="col-span-2 text-right space-y-2">
          <div className="w-20 h-3 bg-slate-800/60 rounded ml-auto" />
          <div className="w-16 h-6 bg-slate-800 rounded ml-auto" />
        </div>
      </div>
    </div>
  )
}

export default function CharityBreakdown({ days = 90 }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    apiFetch(`/api/analytics/charities?days=${days}`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [days])

  // Enrich charities with palette colors
  const charities = (data?.charities || []).map((c, i) => ({
    ...c,
    ...PALETTE[i % PALETTE.length],
    rank: i + 1,
    aovWithCharity: c.avg_order_value,
    aovBaseline: c.baselineAOV,
    aovLiftPct: c.aovLift,
    conversionRate: c.total_selections > 0
      ? ((c.completed_orders / c.total_selections) * 100).toFixed(1)
      : '0.0',
  }))

  const maxDonations = charities.length > 0
    ? Math.max(...charities.map(c => c.total_donations))
    : 1

  const highestAOVCharity = charities.length > 0
    ? [...charities].sort((a, b) => b.aovLiftPct - a.aovLiftPct)[0]
    : null

  const radarData = charities.map(c => ({
    subject: c.name.split(' ')[0],
    selectionRate: parseFloat(c.selectionRate.toFixed(1)),
    aovLift: Math.min(c.aovLiftPct / 1.2, 100),
    conversionRate: parseFloat(c.conversionRate),
    donations: maxDonations > 0 ? (c.total_donations / maxDonations) * 100 : 0,
  }))

  return (
    <div className="space-y-6">
      {/* Hero metric row */}
      <div className="grid grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-slate-900/60 border border-slate-800/60 px-5 py-4 animate-pulse">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded bg-slate-800" />
                <div className="w-28 h-3 rounded bg-slate-800" />
              </div>
              <div className="w-32 h-4 bg-slate-800 rounded" />
            </div>
          ))
        ) : error ? (
          <div className="col-span-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 p-6 text-rose-400 text-sm font-body">
            Could not load charity data: {error}
          </div>
        ) : (
          [
            {
              label: 'Top Charity by Selections',
              value: charities[0]?.name ?? '—',
              icon: Award,
              color: '#34d399',
            },
            {
              label: 'Highest AOV Lift',
              value: highestAOVCharity
                ? `${highestAOVCharity.name.split(' ')[0]} +${highestAOVCharity.aovLiftPct.toFixed(0)}%`
                : '—',
              icon: TrendingUp,
              color: '#60a5fa',
            },
            {
              label: 'Most Selections',
              value: charities[0]
                ? `${charities[0].total_selections.toLocaleString()} checkouts`
                : '—',
              icon: ShoppingCart,
              color: '#f472b6',
            },
            {
              label: 'Total Charities Active',
              value: `${charities.length} partners`,
              icon: Heart,
              color: '#a78bfa',
            },
          ].map((item, i) => (
            <div key={i} className="rounded-xl bg-slate-900/60 border border-slate-800/60 px-5 py-4 fade-up" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex items-center gap-2 mb-2">
                <item.icon size={13} style={{ color: item.color }} />
                <span className="text-xs text-slate-500 font-body">{item.label}</span>
              </div>
              <div className="font-display font-600 text-white text-sm">{item.value}</div>
            </div>
          ))
        )}
      </div>

      {/* Charity cards */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <CharitySkeleton key={i} delay={240 + i * 80} />
          ))
        ) : charities.map((c, i) => (
          <div
            key={c.id}
            className="rounded-2xl bg-slate-900/60 border border-slate-800/60 p-5 hover:border-slate-700/50 transition-all duration-300 fade-up group"
            style={{ animationDelay: `${240 + i * 80}ms` }}
          >
            <div className="grid grid-cols-12 gap-6 items-center">
              {/* Charity identity */}
              <div className="col-span-3 flex items-center gap-3.5">
                <div className="relative">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border border-slate-700/40"
                    style={{ background: `${c.color}10` }}
                  >
                    {c.emoji}
                  </div>
                  {c.rank === 1 && (
                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center text-[10px] font-display font-700 text-slate-900">
                      1
                    </div>
                  )}
                </div>
                <div>
                  <div className="font-display font-600 text-white text-sm leading-tight">{c.name}</div>
                  <div className="text-xs mt-0.5 font-body" style={{ color: `${c.color}99` }}>
                    {c.category}
                  </div>
                </div>
              </div>

              {/* Selection rate */}
              <div className="col-span-2">
                <div className="text-xs text-slate-500 font-body mb-2">Selection Rate</div>
                <div className="flex items-end gap-2">
                  <span className="font-display font-700 text-xl" style={{ color: c.color }}>
                    {c.selectionRate.toFixed(1)}%
                  </span>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(c.selectionRate / 40 * 100, 100)}%`, background: c.color }}
                  />
                </div>
              </div>

              {/* AOV comparison */}
              <div className="col-span-3">
                <div className="text-xs text-slate-500 font-body mb-2">Avg Order Value</div>
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <div className="font-display font-600 text-white text-sm">
                      ${c.aovWithCharity.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-slate-500 font-body mt-0.5">with charity</div>
                  </div>
                  <div className="text-slate-700">vs</div>
                  <div className="text-center">
                    <div className="font-display font-600 text-slate-500 text-sm">
                      ${c.aovBaseline.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-slate-600 font-body mt-0.5">baseline</div>
                  </div>
                  <div className="ml-auto flex items-center gap-1 text-xs font-body font-500 px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400">
                    <ArrowUpRight size={11} />
                    +{c.aovLiftPct.toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="col-span-2">
                <StatPill label="Completed orders" value={c.completed_orders.toLocaleString()} accent={c.color} />
                <StatPill label="Conversion rate" value={`${c.conversionRate}%`} accent={c.color} />
                <StatPill label="Donations raised" value={`$${c.total_donations.toLocaleString()}`} accent={c.color} />
              </div>

              {/* Rank */}
              <div className="col-span-2 text-right">
                <div className="text-xs text-slate-500 font-body mb-1.5">Performance rank</div>
                <div className="text-xs text-slate-600 font-body mt-2">
                  #{c.rank} by selections
                </div>
                <div className="text-xs text-slate-600 font-body mt-1">
                  ${c.total_donations.toLocaleString()} raised
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Radar + Revenue contribution */}
      {!loading && charities.length > 0 && (
        <div className="grid grid-cols-2 gap-5 fade-up" style={{ animationDelay: '700ms' }}>
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800/60 p-6">
            <h3 className="font-display font-600 text-white text-sm mb-1">Multi-Metric Radar</h3>
            <p className="text-xs text-slate-500 font-body mb-4">Normalized score across key performance dimensions</p>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'DM Sans' }} />
                <Radar name="Selection" dataKey="selectionRate" stroke="#34d399" fill="#34d399" fillOpacity={0.15} />
                <Radar name="AOV Lift" dataKey="aovLift" stroke="#60a5fa" fill="#60a5fa" fillOpacity={0.1} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '12px', fontFamily: 'DM Sans', fontSize: 12 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-2xl bg-slate-900/60 border border-slate-800/60 p-6">
            <h3 className="font-display font-600 text-white text-sm mb-1">Revenue Contribution</h3>
            <p className="text-xs text-slate-500 font-body mb-5">Donation-attributed revenue by charity</p>
            <div className="space-y-3">
              {charities.map(c => (
                <div key={c.id} className="flex items-center gap-3">
                  <div className="text-base w-6">{c.emoji}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-400 font-body">{c.name.split(' ')[0]}</span>
                      <span className="text-xs font-body font-500" style={{ color: c.color }}>
                        ${c.total_donations.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${maxDonations > 0 ? (c.total_donations / maxDonations) * 100 : 0}%`,
                          background: c.color,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-2 gap-5">
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800/60 p-6 animate-pulse">
            <div className="w-32 h-4 bg-slate-800 rounded mb-2" />
            <div className="w-48 h-3 bg-slate-800/60 rounded mb-4" />
            <div className="h-56 rounded-xl bg-slate-800/50" />
          </div>
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800/60 p-6 animate-pulse">
            <div className="w-32 h-4 bg-slate-800 rounded mb-2" />
            <div className="w-48 h-3 bg-slate-800/60 rounded mb-5" />
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-3 items-center">
                  <div className="w-6 h-6 bg-slate-800 rounded" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-slate-800/60 rounded" />
                    <div className="h-2 bg-slate-800/40 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
