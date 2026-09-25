import type { mockApi } from '../../services/mockApi'

/** Whole-school aggregate returned by mockApi.dashboardStats — every role dashboard reads from this one payload. */
export type DashboardData = Awaited<ReturnType<typeof mockApi.dashboardStats>>
