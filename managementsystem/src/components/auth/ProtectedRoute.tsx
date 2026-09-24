import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAppSelector } from '../../store'
import type { UserRole } from '../../store/authSlice'

type ProtectedRouteProps = { children: ReactNode; allowedRoles?: UserRole[] }

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const location = useLocation()
  const { user, isAuthenticated } = useAppSelector((state) => state.auth)
  if (!isAuthenticated || !user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

export function RoleGuard({ children, roles }: { children: ReactNode; roles: UserRole[] }) {
  return <ProtectedRoute allowedRoles={roles}>{children}</ProtectedRoute>
}
