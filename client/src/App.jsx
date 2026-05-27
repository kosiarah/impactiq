import { useState, useEffect } from 'react'
import { LayoutDashboard, Heart, Sparkles, TrendingUp, Settings, Bell, ChevronRight } from 'lucide-react'
import Overview from './components/Overview'
import CharityBreakdown from './components/CharityBreakdown'
import AIInsights from './components/AIInsights'
import { getToken, setToken } from './api'

const NAV = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'charities', label: 'Charity Performance', icon: Heart },
  { id: 'insights', label: 'AI Insights', icon: Sparkles },
]

export default function App() {
  const [active, setActive] = useState('overview')
  const [days, setDays] = useState(90)

  // Bootstrap a dev JWT on first load if none is stored
  useEffect(() => {
    if (!getToken()) {
      fetch('/api/auth/token', { method: 'POST', headers: { 'Content-Type': 'application/json' } })
        .then(r => r.json())
        .then(d => { if (d.token) setToken(d.token) })
        .catch(() => {}) // non-fatal — protected routes will show their own error
    }
  }, [])

  return (
    <div className="flex h-screen overflow-hidden bg-[#080d1a]">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 flex flex-col border-r border-slate-800/60 bg-[#0a0f1e]">
        {/* Logo */}
        <div className="px-6 pt-7 pb-8">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <TrendingUp size={15} className="text-white" strokeWidth={2.5} />
            </div>
            <div>
              <span className="font-display font-800 text-lg text-white tracking-tight">Impact<span className="text-emerald-400">IQ</span></span>
            </div>
          </div>
          <div className="mt-1.5 ml-10 text-[10px] font-body text-slate-500 uppercase tracking-widest">Charity Analytics</div>
        </div>

        {/* Store badge */}
        <div className="mx-4 mb-6 px-3 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/40 flex items-center justify-between">
          <div>
            <div className="text-xs font-display font-600 text-slate-200">Maple + Thread Co.</div>
            <div className="text-[10px] text-slate-500 font-body">Shopify · Pro Plan</div>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-1">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActive(id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-body font-500 transition-all duration-200 group ${
                active === id
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Icon size={16} strokeWidth={active === id ? 2.5 : 2} />
              <span className="flex-1 text-left">{label}</span>
              {active === id && <ChevronRight size={12} className="text-emerald-400/60" />}
              {id === 'insights' && active !== id && (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full border border-emerald-500/30">AI</span>
              )}
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-slate-800/60">
          <button className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 transition-all font-body">
            <Settings size={15} />
            <span>Settings</span>
          </button>
          <div className="mt-3 px-3 py-2 rounded-lg bg-gradient-to-r from-emerald-500/5 to-cyan-500/5 border border-emerald-500/10">
            <div className="text-[10px] text-slate-500 font-body">Last synced</div>
            <div className="text-xs text-slate-300 font-body font-500">2 minutes ago</div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <header className="sticky top-0 z-10 px-8 py-4 border-b border-slate-800/40 bg-[#080d1a]/80 backdrop-blur-sm flex items-center justify-between">
          <div>
            <h1 className="font-display font-700 text-white text-lg">
              {NAV.find(n => n.id === active)?.label}
            </h1>
            <p className="text-xs text-slate-500 font-body mt-0.5">
              {active === 'overview' && `Last ${days} days · All channels`}
              {active === 'charities' && `Last ${days} days · Performance breakdown by charity partner`}
              {active === 'insights' && 'AI-generated recommendations for your store'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Days selector — only shown on data tabs */}
            {active !== 'insights' && (
              <div className="flex items-center gap-1 bg-slate-800/60 rounded-xl p-1 border border-slate-700/40">
                {[30, 60, 90].map(d => (
                  <button
                    key={d}
                    onClick={() => setDays(d)}
                    className={`px-3 py-1 rounded-lg text-xs font-body font-500 transition-all duration-200 ${
                      days === d
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    {d}d
                  </button>
                ))}
              </div>
            )}
            <button className="relative p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all">
              <Bell size={17} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-emerald-400 rounded-full" />
            </button>
            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-800">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-xs font-display font-700 text-white">K</div>
              <div className="text-sm font-body text-slate-300 font-500">Kosi</div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="p-8">
          {active === 'overview' && <Overview days={days} />}
          {active === 'charities' && <CharityBreakdown days={days} />}
          {active === 'insights' && <AIInsights days={days} />}
        </div>
      </main>
    </div>
  )
}
