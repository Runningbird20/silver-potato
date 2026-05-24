import {
  Bell,
  CalendarDays,
  ChartNoAxesColumn,
  Check,
  Home,
  Plus,
  Search,
  Settings,
  Sparkles,
  Timer,
  WalletCards,
} from 'lucide-react'
import './App.css'

function App() {
  const tasks = [
    { title: 'Morning review', time: '8:30 AM', tone: 'mint' },
    { title: 'Design sync', time: '11:00 AM', tone: 'blue' },
    { title: 'Ship mobile build', time: '3:45 PM', tone: 'coral' },
  ]

  const stats = [
    { label: 'Focus', value: '3h 20m', icon: Timer },
    { label: 'Budget', value: '$420', icon: WalletCards },
    { label: 'Streak', value: '12 days', icon: ChartNoAxesColumn },
  ]

  return (
    <main className="app-shell">
      <header className="top-bar">
        <div>
          <span className="eyebrow">Today</span>
          <h1>Silver Potato</h1>
        </div>
        <div className="icon-actions" aria-label="App actions">
          <button type="button" aria-label="Search">
            <Search size={20} />
          </button>
          <button type="button" aria-label="Notifications">
            <Bell size={20} />
          </button>
        </div>
      </header>

      <section className="hero-panel" aria-labelledby="daily-focus-title">
        <div>
          <span className="panel-kicker">
            <Sparkles size={16} />
            Daily focus
          </span>
          <h2 id="daily-focus-title">Keep the important stuff moving.</h2>
        </div>
        <button type="button" className="primary-action">
          <Plus size={18} />
          Add task
        </button>
      </section>

      <section className="stats-grid" aria-label="Daily stats">
        {stats.map((stat) => {
          const Icon = stat.icon

          return (
            <article className="stat-card" key={stat.label}>
              <Icon size={18} />
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
            </article>
          )
        })}
      </section>

      <section className="task-list" aria-labelledby="task-list-title">
        <div className="section-heading">
          <h2 id="task-list-title">Next up</h2>
          <button type="button">
            <CalendarDays size={18} />
            View all
          </button>
        </div>

        {tasks.map((task) => (
          <article className="task-card" data-tone={task.tone} key={task.title}>
            <span className="task-check" aria-hidden="true">
              <Check size={16} />
            </span>
            <div>
              <h3>{task.title}</h3>
              <p>{task.time}</p>
            </div>
          </article>
        ))}
      </section>

      <nav className="bottom-tabs" aria-label="Primary">
        <a href="/" aria-current="page">
          <Home size={20} />
          Home
        </a>
        <a href="/calendar">
          <CalendarDays size={20} />
          Plan
        </a>
        <a href="/settings">
          <Settings size={20} />
          Settings
        </a>
      </nav>
    </main>
  )
}

export default App
