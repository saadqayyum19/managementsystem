import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate, useOutlet } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell, ChevronDown, ChevronRight, GraduationCap, LogOut, Menu, PanelLeftClose, Search, Wifi, X } from 'lucide-react'
import { visibleGroups } from '../../app/navigation'
import { mockApi } from '../../services/mockApi'
import { useMockQuery } from '../../hooks/useMockQuery'
import { useAppDispatch, useAppSelector } from '../../store'
import { clearCredentials, setCredentials, type UserRole } from '../../store/authSlice'
import { setMockScenario, toggleGroup, toggleSidebar } from '../../store/uiSlice'
import { institution, mockUsers } from '../../mocks'
import type { MockScenario } from '../../mocks/runtime'
import './shell.css'

const roleLabels: Record<UserRole, string> = { super_admin: 'Super Admin', principal: 'Principal', teacher: 'Teacher', student: 'Student', parent: 'Parent' }
const roleOrder: UserRole[] = ['super_admin', 'principal', 'teacher', 'student', 'parent']
const scenarios: Array<{ value: MockScenario; label: string }> = [
  { value: 'happy', label: 'Live mock data' },
  { value: 'loading', label: 'Force loading' },
  { value: 'empty', label: 'Force empty' },
  { value: 'error', label: 'Force error' },
]

function pathForRole(role: UserRole): string {
  if (role === 'student') return '/analytics/performance'
  if (role === 'parent') return '/communication/chat'
  if (role === 'teacher') return '/operations/teachers'
  return '/system/profiles'
}

export function AppShell() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const outlet = useOutlet()
  const { user } = useAppSelector((state) => state.auth)
  const { featureFlags, mockScenario, sidebarCollapsed, openGroups } = useAppSelector((state) => state.ui)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [term, setTerm] = useState('')
  const [openPopover, setOpenPopover] = useState<'notifications' | 'profile' | null>(null)
  const [notificationsRead, setNotificationsRead] = useState(false)
  const topbarRef = useRef<HTMLDivElement>(null)

  const role = user?.role ?? 'student'
  const groups = useMemo(() => visibleGroups(role, featureFlags), [role, featureFlags])
  const searchIndex = useMockQuery(['search-index'], mockApi.searchIndex)
  const notices = useMockQuery(['topbar-notifications'], mockApi.topbarNotifications)

  useEffect(() => { setMobileNavOpen(false); setOpenPopover(null); setTerm('') }, [location.pathname])

  useEffect(() => {
    const onClick = (event: MouseEvent) => { if (topbarRef.current && !topbarRef.current.contains(event.target as Node)) setOpenPopover(null) }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const searchResults = useMemo(() => {
    const query = term.trim().toLowerCase()
    if (!query) return []
    return (searchIndex.data ?? []).filter((entry) => `${entry.name} ${entry.subtitle} ${entry.role}`.toLowerCase().includes(query)).slice(0, 6)
  }, [term, searchIndex.data])

  const switchRole = (next: UserRole) => {
    const match = mockUsers.find((candidate) => candidate.role === next)
    if (!match) return
    dispatch(setCredentials({
      user: { id: match.id, institutionId: match.institutionId, firstName: match.firstName, lastName: match.lastName, email: match.email, role: match.role, avatarUrl: null },
      accessToken: `mock-token-${match.role}`,
    }))
    dispatch(setMockScenario('happy'))
    setOpenPopover(null)
    navigate('/')
  }

  const signOut = () => { dispatch(clearCredentials()); setOpenPopover(null); navigate('/login') }
  const notificationCount = notificationsRead ? 0 : (notices.data ?? []).length
  return <div className="shell">
    <div className="shell__backdrop" data-open={mobileNavOpen} onClick={() => setMobileNavOpen(false)} />
    <aside className={`shell__sidebar ${sidebarCollapsed ? 'shell__sidebar--collapsed' : ''}`} data-open={mobileNavOpen} aria-label="Primary navigation">
      <div className="shell__brand">
        <span className="shell__brand-mark"><GraduationCap size={18} /></span>
        {!sidebarCollapsed && <div><div className="shell__brand-name">EduCore <span>OS</span></div><div className="shell__brand-sub">{institution.name}</div></div>}
      </div>
      <nav className="shell__nav">
        {groups.map((group) => {
          const isOpen = openGroups.includes(group.id)
          const GroupIcon = group.icon
          return <div className="shell__group" key={group.id}>
            <button type="button" className="shell__group-btn" aria-expanded={isOpen} onClick={() => dispatch(toggleGroup(group.id))}>
              <GroupIcon size={13} />
              {!sidebarCollapsed && <><span style={{ flex: 1, textAlign: 'left' }}>{group.label}</span>{isOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}</>}
            </button>
            {(isOpen || sidebarCollapsed) && <div className="shell__group-items">
              {group.items.map((item) => {
                const ItemIcon = item.icon
                return <NavLink key={item.id} to={item.path} end={item.path === '/'} className="shell__link" data-active={item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path)} title={item.label}>
                  <ItemIcon size={16} />{!sidebarCollapsed && <span>{item.label}</span>}
                </NavLink>
              })}
            </div>}
          </div>
        })}
      </nav>
      <div className="ec-row" style={{ borderTop: '1px solid var(--ec-border)', padding: 'var(--ec-space-3)', justifyContent: 'space-between' }}>
        <button type="button" className="ec-btn ec-btn--icon" onClick={() => dispatch(toggleSidebar())} aria-label="Collapse sidebar"><PanelLeftClose size={15} /></button>
        {!sidebarCollapsed && <span className="ec-small ec-muted">v1.0 · mock</span>}
      </div>
    </aside>
    <div className="shell__main">
      <header className="shell__topbar" ref={topbarRef}>
        <button type="button" className="ec-btn ec-btn--icon shell__hamburger" onClick={() => setMobileNavOpen(true)} aria-label="Open navigation"><Menu size={16} /></button>
        <div className="shell__search">
          <label className="ec-search" style={{ width: '100%' }}>
            <Search size={15} />
            <input value={term} onChange={(event) => setTerm(event.target.value)} placeholder="Search students, teachers, guardians…" aria-label="Global search" />
            {term && <button type="button" className="ec-btn ec-btn--icon ec-btn--sm" onClick={() => setTerm('')} aria-label="Clear search"><X size={12} /></button>}
          </label>
          {term && <div className="ec-popover shell__search-results">
            {searchResults.length === 0
              ? <div className="ec-small ec-muted" style={{ padding: 'var(--ec-space-3)' }}>No matches for {term}.</div>
              : searchResults.map((entry) => <button key={entry.id} type="button" className="shell__popover-item" onClick={() => { navigate(pathForRole(entry.role)); setTerm('') }}>
                <strong>{entry.name}</strong><span>{roleLabels[entry.role]} · {entry.subtitle}</span>
              </button>)}
          </div>}
        </div>
        <span className="ec-spacer" />
        <span className="shell__scenario">
          <Wifi size={14} className="ec-muted" />
          <select className="ec-select" aria-label="Demo data state" value={mockScenario} onChange={(event) => dispatch(setMockScenario(event.target.value as MockScenario))}>
            {scenarios.map((scenario) => <option key={scenario.value} value={scenario.value}>{scenario.label}</option>)}
          </select>
        </span>
        <div style={{ position: 'relative' }}>
          <button type="button" className="ec-btn ec-btn--icon shell__topbar-btn" aria-label="Notifications" onClick={() => setOpenPopover(openPopover === 'notifications' ? null : 'notifications')}>
            <Bell size={16} />{notificationCount > 0 && <span className="shell__dot">{notificationCount}</span>}
          </button>
          {openPopover === 'notifications' && <div className="ec-popover shell__popover">
            <div className="ec-row ec-row--between" style={{ padding: 'var(--ec-space-2) var(--ec-space-3)' }}>
              <strong className="ec-small">Notifications</strong>
              <button type="button" className="ec-btn ec-btn--sm ec-btn--ghost" onClick={() => setNotificationsRead(true)}>Mark all read</button>
            </div>
            {(notices.data ?? []).map((notice) => <div key={notice.id} className="shell__popover-item">
              <strong>{notice.title}</strong><span>{notice.body}</span><span className="ec-small">{notice.createdAt} · {notice.channel}</span>
            </div>)}
            {(notices.data ?? []).length === 0 && <div className="ec-small ec-muted" style={{ padding: 'var(--ec-space-3)' }}>You are all caught up.</div>}
          </div>}
        </div>
        <div style={{ position: 'relative' }}>
          <button type="button" className="shell__profile" onClick={() => setOpenPopover(openPopover === 'profile' ? null : 'profile')} aria-haspopup="menu">
            <span className="ec-avatar">{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
            <span className="shell__profile-copy"><strong>{user?.firstName} {user?.lastName}</strong><span>{roleLabels[role]}</span></span>
            <ChevronDown size={14} className="ec-muted" />
          </button>
          {openPopover === 'profile' && <div className="ec-popover shell__popover" role="menu">
            <div className="shell__popover-item" style={{ cursor: 'default' }}><strong>Switch demo role</strong><span>Every screen re-scopes instantly — no re-login.</span></div>
            {roleOrder.map((candidate) => <button key={candidate} type="button" className="ec-menu-item" data-active={candidate === role} onClick={() => switchRole(candidate)}>
              {roleLabels[candidate]}{candidate === role && <span className="ec-small ec-muted" style={{ marginLeft: 'auto' }}>active</span>}
            </button>)}
            <div className="ec-divider" style={{ margin: 'var(--ec-space-2) 0' }} />
            <Link className="ec-menu-item" to="/system/profiles" onClick={() => setOpenPopover(null)}>View my profile</Link>
            <button type="button" className="ec-menu-item" onClick={signOut}><LogOut size={14} /> Sign out</button>
          </div>}
        </div>
      </header>
      <main className="shell__content">
        <AnimatePresence mode="wait">
          <motion.div key={location.pathname} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.16, ease: 'easeOut' }}>
            {outlet}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  </div>
}
