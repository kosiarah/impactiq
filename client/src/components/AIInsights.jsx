import { useState } from 'react'
import { Sparkles, RefreshCw, TrendingUp, Smartphone, Calendar, ShoppingBag, Users, ChevronRight, Zap, AlertCircle } from 'lucide-react'

const MERCHANT_CONTEXT = {
  storeName: 'Maple + Thread Co.',
  period: '90 days',
  totalOrders: 1380,
  charityOrders: 847,
  charityConversionRate: 61.4,
  baselineConversionRate: 43.2,
  aovWithCharity: 111.23,
  aovBaseline: 72.40,
  totalDonations: 12847,
  totalRevenueAttributed: 94210,
  mobileConversionRate: 38.1,
  desktopConversionRate: 67.4,
  weekendCharityRate: 79.2,
  weekdayCharityRate: 56.8,
  topCharity: 'Toronto Food Bank',
  topCharityAOV: 118.40,
  topCharityLift: 63.5,
  highestAOVCharity: 'Ocean Wise',
  highestAOVLift: 85.4,
  abandonedWithCharityShown: 214,
}

const categoryIcons = {
  revenue: TrendingUp,
  mobile: Smartphone,
  timing: Calendar,
  product: ShoppingBag,
  audience: Users,
  conversion: Zap,
}

const categoryColors = {
  revenue: '#34d399',
  mobile: '#f472b6',
  timing: '#f59e0b',
  product: '#60a5fa',
  audience: '#a78bfa',
  conversion: '#34d399',
}

const STATIC_INSIGHTS = [
  {
    id: 1,
    category: 'revenue',
    priority: 'high',
    title: 'Feature Ocean Wise more prominently at checkout',
    insight: 'Customers who selected Ocean Wise spent 85.4% more on average ($134.20 vs $72.40 baseline). Despite the highest AOV lift of any charity, it only captures 22.1% of selections. Moving it above the fold or leading with it on your charity carousel could meaningfully increase your average order value.',
    action: 'Reorder charity display to lead with Ocean Wise, or A/B test it as a default pre-selected option for new visitors.',
    impact: 'High',
    effort: 'Low',
    metric: '+85.4% AOV',
  },
  {
    id: 2,
    category: 'mobile',
    priority: 'urgent',
    title: 'Your charity selector is underperforming on mobile',
    insight: 'Desktop visitors select a charity 67.4% of the time. Mobile visitors only 38.1% — a 29.3 percentage point gap. Given that charity selection correlates with a 53.6% higher AOV, this mobile gap is costing you significant revenue per order. The most likely cause is a rendering or UX issue with the charity selector on small screens.',
    action: 'Audit your checkout on iPhone Safari and Android Chrome. Check if the charity selector is above the fold, loads correctly, and isn\'t hidden behind other elements.',
    impact: 'Very High',
    effort: 'Medium',
    metric: '−29pp mobile gap',
  },
  {
    id: 3,
    category: 'timing',
    priority: 'medium',
    title: 'Run a weekend donation campaign to capture peak intent',
    insight: 'Weekend orders show a 79.2% charity selection rate vs 56.8% on weekdays — a 40% relative increase. Your audience is significantly more cause-motivated on weekends. A weekend-specific email campaign or on-site promotion ("This weekend, every order supports Toronto Food Bank") could amplify this organic behavior into a conversion driver.',
    action: 'Launch a Friday–Sunday email campaign tying a specific charity to the weekend. Track conversion rate and AOV compared to your standard weekend baseline.',
    impact: 'Medium',
    effort: 'Low',
    metric: '+40% weekend selection',
  },
  {
    id: 4,
    category: 'product',
    priority: 'medium',
    title: 'Match charity to product category for higher resonance',
    insight: 'Toronto Food Bank performs strongest with Kitchenware purchases; Ocean Wise peaks with Outdoor products. There\'s an alignment opportunity here — when a customer is browsing camping gear, surfacing Ocean Wise feels contextually relevant, not transactional. Shopify metafields can store per-collection charity preferences.',
    action: 'Implement collection-level charity defaults. Map product collections to thematically aligned charities and set them as pre-selected options in your Conscious Cart configuration.',
    impact: 'Medium',
    effort: 'Medium',
    metric: 'Context-matched AOV',
  },
  {
    id: 5,
    category: 'conversion',
    priority: 'medium',
    title: 'Re-engage the 214 abandoned charity-shown sessions',
    insight: '214 sessions reached checkout with a charity visible but didn\'t convert. These are warm, cause-motivated shoppers — the highest-intent segment in your funnel. A targeted abandoned cart email that leads with the charitable impact ("Your cart was going to support the Toronto Food Bank") may outperform a standard discount-first recovery email.',
    action: 'Create a charity-specific abandoned cart flow in Klaviyo or your ESP. A/B test a cause-first subject line ("Your donation was almost made") against your current recovery template.',
    impact: 'High',
    effort: 'Low',
    metric: '214 recoverable sessions',
  },
]

function PriorityBadge({ priority }) {
  const styles = {
    urgent: 'bg-rose-500/15 text-rose-400 border-rose-500/25',
    high: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
    medium: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  }
  return (
    <span className={`text-[10px] uppercase tracking-widest font-body font-500 px-2 py-0.5 rounded-full border ${styles[priority]}`}>
      {priority === 'urgent' ? '⚡ ' : ''}{priority}
    </span>
  )
}

function EffortImpactBadge({ label, value }) {
  const impactColor = { 'Very High': '#34d399', High: '#34d399', Medium: '#f59e0b', Low: '#94a3b8' }
  const effortColor = { High: '#f472b6', Medium: '#f59e0b', Low: '#34d399' }
  const color = label === 'Impact' ? impactColor[value] : effortColor[value]
  return (
    <div className="flex items-center gap-1.5 text-xs font-body">
      <span className="text-slate-500">{label}:</span>
      <span className="font-500" style={{ color }}>{value}</span>
    </div>
  )
}

function InsightCard({ insight, index }) {
  const [expanded, setExpanded] = useState(false)
  const Icon = categoryIcons[insight.category] || Sparkles
  const color = categoryColors[insight.category] || '#34d399'

  return (
    <div
      className="rounded-2xl bg-slate-900/70 border border-slate-800/60 hover:border-slate-700/50 transition-all duration-300 overflow-hidden fade-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div
        className="p-6 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center mt-0.5"
            style={{ background: `${color}12`, border: `1px solid ${color}25` }}>
            <Icon size={17} style={{ color }} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap mb-2">
              <PriorityBadge priority={insight.priority} />
              <span className="text-[10px] font-body uppercase tracking-widest text-slate-600">{insight.category}</span>
            </div>
            <h3 className="font-display font-600 text-white text-sm leading-snug">{insight.title}</h3>
            <p className={`text-sm text-slate-400 font-body leading-relaxed mt-2 ${expanded ? '' : 'line-clamp-2'}`}>
              {insight.insight}
            </p>
          </div>

          {/* Right side */}
          <div className="flex-shrink-0 flex flex-col items-end gap-2">
            <div className="text-xs font-display font-600 px-2.5 py-1 rounded-lg"
              style={{ background: `${color}10`, color }}>
              {insight.metric}
            </div>
            <ChevronRight
              size={15}
              className={`text-slate-600 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}
            />
          </div>
        </div>

        {/* Expanded content */}
        {expanded && (
          <div className="mt-5 ml-14 space-y-4">
            <div className="rounded-xl bg-slate-800/40 border border-slate-700/40 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap size={12} style={{ color }} />
                <span className="text-xs font-display font-600 text-slate-300">Recommended Action</span>
              </div>
              <p className="text-sm text-slate-400 font-body leading-relaxed">{insight.action}</p>
            </div>
            <div className="flex items-center gap-4">
              <EffortImpactBadge label="Impact" value={insight.impact} />
              <div className="w-1 h-1 rounded-full bg-slate-700" />
              <EffortImpactBadge label="Effort" value={insight.effort} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AIInsights() {
  const [loading, setLoading] = useState(false)
  const [insights, setInsights] = useState(STATIC_INSIGHTS)
  const [lastRefreshed, setLastRefreshed] = useState('Just now')
  const [apiError, setApiError] = useState(null)

  const handleRefresh = async () => {
    setLoading(true)
    setApiError(null)
    try {
      const prompt = `You are a Shopify analytics expert. Based on this merchant data, generate 5 actionable business recommendations in JSON format. Each insight must have: id (number), category (one of: revenue/mobile/timing/product/conversion), priority (urgent/high/medium), title (concise headline), insight (2-3 sentences of analysis), action (specific next step), impact (Very High/High/Medium/Low), effort (High/Medium/Low), metric (short stat like "+85% AOV").

Merchant: ${MERCHANT_CONTEXT.storeName}
Period: ${MERCHANT_CONTEXT.period}
Charity conversion rate: ${MERCHANT_CONTEXT.charityConversionRate}% (baseline: ${MERCHANT_CONTEXT.baselineConversionRate}%)
AOV with charity: $${MERCHANT_CONTEXT.aovWithCharity} vs baseline $${MERCHANT_CONTEXT.aovBaseline}
Mobile charity selection: ${MERCHANT_CONTEXT.mobileConversionRate}% vs desktop ${MERCHANT_CONTEXT.desktopConversionRate}%
Weekend charity rate: ${MERCHANT_CONTEXT.weekendCharityRate}% vs weekday ${MERCHANT_CONTEXT.weekdayCharityRate}%
Top charity by revenue: ${MERCHANT_CONTEXT.topCharity} (AOV lift: +${MERCHANT_CONTEXT.topCharityLift}%)
Highest AOV charity: ${MERCHANT_CONTEXT.highestAOVCharity} (+${MERCHANT_CONTEXT.highestAOVLift}%)
Abandoned sessions with charity shown: ${MERCHANT_CONTEXT.abandonedWithCharityShown}

Return ONLY a valid JSON array of 5 insight objects. No preamble, no markdown.`

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }],
        }),
      })

      if (!response.ok) throw new Error(`API error: ${response.status}`)

      const data = await response.json()
      const text = data.content?.find(b => b.type === 'text')?.text || ''
      const cleaned = text.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(cleaned)

      if (Array.isArray(parsed) && parsed.length > 0) {
        setInsights(parsed)
        setLastRefreshed('Just now')
      }
    } catch (err) {
      console.error('Insights refresh failed:', err)
      setApiError('Could not refresh insights from API. Showing cached recommendations.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header panel */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-500/5 via-cyan-500/5 to-blue-500/5 border border-emerald-500/15 p-6 fade-up">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <h2 className="font-display font-700 text-white text-base">AI Business Advisor</h2>
              <p className="text-xs text-slate-400 font-body mt-0.5">
                Powered by Claude · Analyzing {MERCHANT_CONTEXT.totalOrders.toLocaleString()} orders · Last updated: {lastRefreshed}
              </p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-body font-500 hover:bg-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Analyzing...' : 'Refresh Insights'}
          </button>
        </div>

        {/* Context strip */}
        <div className="mt-5 grid grid-cols-4 gap-3">
          {[
            { label: 'Orders analyzed', value: '1,380' },
            { label: 'Charity selection rate', value: '61.4%' },
            { label: 'Revenue attributed', value: '$94,210' },
            { label: 'AOV lift vs baseline', value: '+53.6%' },
          ].map((item, i) => (
            <div key={i} className="rounded-xl bg-slate-900/60 px-4 py-3 border border-slate-800/60">
              <div className="text-xs text-slate-500 font-body">{item.label}</div>
              <div className="font-display font-600 text-white text-sm mt-0.5">{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Error state */}
      {apiError && (
        <div className="rounded-xl bg-rose-500/5 border border-rose-500/20 px-4 py-3 flex items-center gap-3 text-sm font-body text-rose-400">
          <AlertCircle size={15} />
          {apiError}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="rounded-2xl bg-slate-900/60 border border-slate-800/60 p-6 animate-pulse">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-slate-800 rounded w-1/4" />
                  <div className="h-4 bg-slate-800 rounded w-3/4" />
                  <div className="h-3 bg-slate-800 rounded w-full" />
                  <div className="h-3 bg-slate-800 rounded w-5/6" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Insights list */}
      {!loading && (
        <div className="space-y-3">
          {insights.map((insight, i) => (
            <InsightCard key={insight.id} insight={insight} index={i} />
          ))}
        </div>
      )}

      {/* Footer note */}
      {!loading && (
        <p className="text-xs text-slate-600 font-body text-center fade-up" style={{ animationDelay: '600ms' }}>
          Insights are generated by Claude based on your store's aggregated order and charity data.
          Individual results may vary. These are recommendations, not guarantees.
        </p>
      )}
    </div>
  )
}
