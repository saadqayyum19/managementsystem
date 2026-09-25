import { PageHeader } from '../../components/ui/primitives'
import { SkeletonCards } from '../../components/ui/Skeleton'
import { ErrorState } from '../../components/ui/ErrorState'
import { useMockQuery } from '../../hooks/useMockQuery'
import { mockApi } from '../../services/mockApi'
import { useAppSelector } from '../../store'
import { PrincipalDashboard } from './PrincipalDashboard'
import { StudentDashboard } from './StudentDashboard'
import { SuperAdminDashboard } from './SuperAdminDashboard'
import { TeacherDashboard } from './TeacherDashboard'
import { ParentDashboard } from './ParentDashboard'

/** Single entry point at "/" — renders the dashboard that matches the active demo role. */
export function DashboardPage() {
  const user = useAppSelector((state) => state.auth.user)
  const query = useMockQuery(['dashboard'], mockApi.dashboardStats)
  if (query.isLoading) return <div className="ec-page"><PageHeader eyebrow="Workspace · dashboard" title="Loading dashboard" subtitle="Aggregating the mock dataset…" /><SkeletonCards count={4} /><div style={{ height: 16 }} /><SkeletonCards count={2} height={300} /></div>
  if (query.isError || !query.data) return <div className="ec-page"><PageHeader eyebrow="Workspace · dashboard" title="Dashboard" subtitle="The mock aggregation failed for the active scenario." /><ErrorState onRetry={() => query.refetch()} /></div>
  const role = user?.role ?? 'student'
  if (role === 'super_admin') return <SuperAdminDashboard data={query.data} />
  if (role === 'principal') return <PrincipalDashboard data={query.data} />
  if (role === 'teacher') return <TeacherDashboard data={query.data} />
  if (role === 'parent') return <ParentDashboard data={query.data} />
  return <StudentDashboard data={query.data} />
}
