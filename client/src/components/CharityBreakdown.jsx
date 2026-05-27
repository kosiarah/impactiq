import { Heart, TrendingUp, ShoppingCart, Award, ArrowUpRight } from 'lucide-react'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts'

const charities = [
  {
    id: 1,
    name: 'Toronto Food Bank',
    category: 'Food Security',
    emoji: '🥫',
    color: '#34d399',
    glow: 'rgba(52,211,153,0.15)',
    selectionRate: 34.2,
    aovWithCharity: 118.40,
    aovBaseline: 72.40,
    aovLift: 63.5,
    totalDonations: 4820,
    completedOrders: 289,
    conversionRate: 68.4,
    rank: 1,
    topCategory: 'Kitchenware',
  },
  {
    id: 2,
    name: 'Ocean Wise',
    category: 'Environment',
    emoji: '🌊',
    color: '#60a5fa',
    glow: 'rgba(96,165,250,0.15)',
    selectionRate: 22.1,
    aovWithCharity: 134.20,
    aovBaseline: 72.40,
    aovLift: 85.4,
    totalDonations: 3140,
    completedOrders: 187,
    conversionRate: 64.2,
    rank: 2,
    topCategory: 'Outdoor',
  },
  {
    id: 3,
    name: 'SickKids Foundation',
    category: 'Health',
    emoji: '🏥',
    color: '#f472b6',
    glow: 'rgba(244,114,182,0.15)',
    selectionRate: 18.7,
    aovWithCharity: 97.80,
    aovBaseline: 72.40,
    aovLift: 35.1,
    totalDonations: 2380,
    completedOrders: 158,
    conversionRate: 59.8,
    rank: 3,
    topCategory: 'Gifts',
  },
  {
    id: 4,
    name: 'Tree Canada',
    category: 'Environment',
    emoji: '🌲',
    color: '#a3e635',
    glow: 'rgba(163,230,53,0.15)',
    selectionRate: 14.3,
    aovWithCharity: 88.60,
    aovBaseline: 72.40,
    aovLift: 22.4,
    totalDonations: 1620,
    completedOrders: 121,
    conversionRate: 55.1,
    rank: 4,
    topCategory: 'Home Goods',
  },
  {
    id: 5,
    name: 'Centre for Addiction & Mental Health',
    category: 'Health',
    emoji: '🧠',
    color: '#c084fc',
    glow: 'rgba(192,132,252,0.15)',
    selectionRate: 10.7,
    aovWithCharity: 103.10,
    aovBaseline: 72.40,
    aovLift: 42.4,
    totalDonations: 887,
    completedOrders: 92,
    conversionRate: 52.3,
    rank: 5,
    topCategory: 'Wellness',
  },
]

const radarData = charities.map(c => ({
  subject: c.name.split(' ')[0],
  selectionRate: c.selectionRate,
  aovLift: Math.min(c.aovLift / 1.2, 100),
  conversionRate: c.conversionRate,
  donations: (c.totalDonations / 4820) * 100,
}))

function StatPill({ label, value, accent }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-800/60 last:border-0">
      <span className="text-xs text-slate-500 font-body">{label}</span>
      <span className="text-sm font-body font-500" style={{ color: accent }}>{value}</span>
    </div>
  )
}

export default function CharityBreakdown() {
  return (
    <div className="space-y-6">
      {/* Hero metric */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Top Charity by Revenue', value: 'Toronto Food Bank', icon: Award, color: '#34d399' },
          { label: 'Highest AOV Lift', value: 'Ocean Wise +85%', icon: TrendingUp, color: '#60a5fa' },
          { label: 'Most Selections', value: '289 checkouts', icon: ShoppingCart, color: '#f472b6' },
          { label: 'Total Charities Active', value: '5 partners', icon: Heart, color: '#a78bfa' },
        ].map((item, i) => (
          <div key={i} className="rounded-xl bg-slate-900/60 border border-slate-800/60 px-5 py-4 fade-up" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="flex items-center gap-2 mb-2">
              <item.icon size={13} style={{ color: item.color }} />
              <span className="text-xs text-slate-500 font-body">{item.label}</span>
            </div>
            <div className="font-display font-600 text-white text-sm">{item.value}</div>
          </div>
        ))}
      </div>

      {/* Main charity cards */}
      <div className="space-y-3">
        {charities.map((c, i) => (
          <div
            key={c.id}
            className="rounded-2xl bg-slate-900/60 border border-slate-800/60 p-5 hover:border-slate-700/50 transition-all duration-300 fade-up group"
            style={{ animationDelay: `${240 + i * 80}ms`, '--glow': c.glow }}
          >
            <div className="grid grid-cols-12 gap-6 items-center">
              {/* Charity identity */}
              <div className="col-span-3 flex items-center gap-3.5">
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border border-slate-700/40"
                    style={{ background: `${c.color}10` }}>
                    {c.emoji}
                  </div>
                  {c.rank === 1 && (
                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center text-[10px] font-display font-700 text-slate-900">1</div>
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
                  <span className="font-display font-700 text-xl" style={{ color: c.color }}>{c.selectionRate}%</span>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-slate-800">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${c.selectionRate / 40 * 100}%`, background: c.color }} />
                </div>
              </div>

              {/* AOV comparison */}
              <div className="col-span-3">
                <div className="text-xs text-slate-500 font-body mb-2">Avg Order Value</div>
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <div className="font-display font-600 text-white text-sm">${c.aovWithCharity}</div>
                    <div className="text-[10px] text-slate-500 font-body mt-0.5">with charity</div>
                  </div>
                  <div className="text-slate-700">vs</div>
                  <div className="text-center">
                    <div className="font-display font-600 text-slate-500 text-sm">${c.aovBaseline}</div>
                    <div className="text-[10px] text-slate-600 font-body mt-0.5">baseline</div>
                  </div>
                  <div className="ml-auto flex items-center gap-1 text-xs font-body font-500 px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400">
                    <ArrowUpRight size={11} />
                    +{c.aovLift}%
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="col-span-2">
                <StatPill label="Completed orders" value={c.completedOrders} accent={c.color} />
                <StatPill label="Conversion rate" value={`${c.conversionRate}%`} accent={c.color} />
                <StatPill label="Donations raised" value={`$${c.totalDonations.toLocaleString()}`} accent={c.color} />
              </div>

              {/* Top category */}
              <div className="col-span-2 text-right">
                <div className="text-xs text-slate-500 font-body mb-1.5">Top product category</div>
                <span className="inline-block text-xs font-body px-2.5 py-1 rounded-lg border"
                  style={{ borderColor: `${c.color}30`, color: c.color, background: `${c.color}08` }}>
                  {c.topCategory}
                </span>
                <div className="text-xs text-slate-600 font-body mt-2">
                  #{c.rank} by revenue impact
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Radar chart */}
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
                    <span className="text-xs font-body font-500" style={{ color: c.color }}>${c.totalDonations.toLocaleString()}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800">
                    <div className="h-full rounded-full" style={{ width: `${(c.totalDonations / 4820) * 100}%`, background: c.color }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
