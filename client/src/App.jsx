import { useState, useEffect, useRef, Component, lazy, Suspense } from 'react'
import { LayoutDashboard, Heart, Sparkles, TrendingUp, Settings, Bell, ChevronRight, ChevronLeft, Construction } from 'lucide-react'
import Overview from './components/Overview'
const CharityBreakdown = lazy(() => import('./components/CharityBreakdown'))
import AIInsights from './components/AIInsights'
import { getToken, setToken } from './api'

function Toast({ message, onDone }) {
  useEffect(() => {
    const id = setTimeout(onDone, 3000)
    return () => clearTimeout(id)
  }, [onDone])

  return (
    <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900 border border-slate-700/60 shadow-2xl shadow-black/40 fade-up">
      <Construction size={14} className="text-amber-400 flex-shrink-0" />
      <span className="text-sm font-body text-slate-200">{message}</span>
    </div>
  )
}

class ErrorBoundary extends Component {
  state = { hasError: false }
  static getDerivedStateFromError() { return { hasError: true } }
  componentDidCatch(err) { console.error('Screen error:', err) }
  render() {
    if (this.state.hasError) return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-slate-400 text-sm font-body">Something went wrong loading this page.</p>
        <button
          onClick={() => this.setState({ hasError: false })}
          className="text-xs text-emerald-400 hover:text-emerald-300 font-body"
        >Try again</button>
      </div>
    )
    return this.props.children
  }
}

const NAV = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'charities', label: 'Charity Performance', icon: Heart },
  { id: 'insights', label: 'AI Insights', icon: Sparkles },
]

function useRelativeTime(date) {
  const [, setTick] = useState(0)
  useEffect(() => {
    if (!date) return
    const id = setInterval(() => setTick(t => t + 1), 30000)
    return () => clearInterval(id)
  }, [date])
  if (!date) return 'Never'
  const seconds = Math.floor((Date.now() - date) / 1000)
  if (seconds < 10) return 'Just now'
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes === 1) return '1 min ago'
  return `${minutes} min ago`
}

export default function App() {
  const [active, setActive] = useState('overview')
  const [days, setDays] = useState(90)
  const [lastSynced, setLastSynced] = useState(null)
  const [toast, setToast] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const syncedLabel = useRelativeTime(lastSynced)

  const handleSync = () => setLastSynced(new Date())
  const showToast = (msg) => setToast(msg)
  const daysDebounceRef = useRef(null)
  const handleDaysChange = (d) => {
    clearTimeout(daysDebounceRef.current)
    daysDebounceRef.current = setTimeout(() => setDays(d), 250)
  }

  // Show toast when a 401 clears the JWT (session expired)
  useEffect(() => {
    const handler = () => showToast('Session expired — please refresh the page.')
    window.addEventListener('impactiq:unauthorized', handler)
    return () => window.removeEventListener('impactiq:unauthorized', handler)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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
      {toast && (
        <div
          className="fixed bottom-6 z-50 flex justify-center pointer-events-none"
          style={{ left: sidebarOpen ? '15rem' : '0', right: 0, transition: 'left 300ms' }}
        >
          <div className="pointer-events-auto">
            <Toast message={toast} onDone={() => setToast(null)} />
          </div>
        </div>
      )}
      {/* Sidebar */}
      <div className="relative flex-shrink-0">
        <button
          onClick={() => setSidebarOpen(s => !s)}
          className="absolute top-6 right-0 translate-x-full z-20 flex items-center justify-center w-5 h-9 bg-[#0a0f1e] border border-l-0 border-slate-800/60 rounded-r-lg text-slate-500 hover:text-slate-300 transition-colors"
        >
          {sidebarOpen ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
        </button>
      <aside className={`${sidebarOpen ? 'w-60' : 'w-0'} h-full flex-shrink-0 flex flex-col border-r border-slate-800/60 bg-[#0a0f1e] overflow-hidden transition-all duration-300`}>
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
          <button
            onClick={() => showToast('Settings coming soon')}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 transition-all font-body"
          >
            <Settings size={15} />
            <span>Settings</span>
          </button>
          <div className="mt-3 px-3 py-2 rounded-lg bg-gradient-to-r from-emerald-500/5 to-cyan-500/5 border border-emerald-500/10">
            <div className="text-[10px] text-slate-500 font-body">Last synced</div>
            <div className="text-xs text-slate-300 font-body font-500">{syncedLabel}</div>
          </div>
        </div>
      </aside>
      </div>

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
                    onClick={() => handleDaysChange(d)}
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
            <button
              onClick={() => showToast('Notifications coming soon')}
              className="relative p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all"
            >
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
          {active === 'overview' && (
            <ErrorBoundary key="overview">
              <Overview days={days} onSync={handleSync} />
            </ErrorBoundary>
          )}
          {active === 'charities' && (
            <ErrorBoundary key="charities">
              <Suspense fallback={<div className="text-slate-500 text-sm font-body p-4">Loading...</div>}>
                <CharityBreakdown days={days} onSync={handleSync} />
              </Suspense>
            </ErrorBoundary>
          )}
          {active === 'insights' && (
            <ErrorBoundary key="insights">
              <AIInsights days={days} />
            </ErrorBoundary>
          )}
        </div>
      </main>
    </div>
  )
}
