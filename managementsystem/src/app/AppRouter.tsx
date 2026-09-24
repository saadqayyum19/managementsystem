import { Suspense, useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { RoleGate } from '../components/ui/RoleGate'
import { SkeletonCards } from '../components/ui/Skeleton'
import { ToastProvider } from '../components/ui/Toast'
import { ForgotPasswordPage, type ForgotValues } from '../features/auth/ForgotPasswordPage'
import { LoginPage, type LoginValues } from '../features/auth/LoginPage'
import { OtpPage, type OtpValues } from '../features/auth/OtpPage'
import { RegisterPage, type RegisterValues } from '../features/auth/RegisterPage'
import { authenticate, demoCredentials, mockUsers, type MockUser } from '../mocks'
import { setScenario } from '../mocks/runtime'
import { useAppDispatch, useAppSelector } from '../store'
import { setCredentials, type AuthUser } from '../store/authSlice'
import { appRoutes } from './routes'

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 0, refetchOnWindowFocus: false } } })

function toAuthUser(user: MockUser): AuthUser {
  return { id: user.id, institutionId: user.institutionId, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role, avatarUrl: null }
}

function PageFallback() {
  return <div className="ec-page"><div className="ec-grid ec-grid--4"><SkeletonCards count={4} /><SkeletonCards count={2} height={220} /></div></div>
}

function AuthRoutes() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const signIn = (user: MockUser) => { dispatch(setCredentials({ user: toAuthUser(user), accessToken: `mock-token-${user.role}-${Date.now()}` })); navigate('/', { replace: true }) }
  const studentAccount = mockUsers.find((user) => user.role === 'student')!

  return <Routes>
    <Route path="/login" element={<LoginPage
      demoAccounts={demoCredentials.map((account) => ({ label: account.role.replace('_', ' '), email: account.email, password: account.password }))}
      onForgotPassword={() => navigate('/forgot-password')}
      onRegister={() => navigate('/register')}
      onSubmit={async (values: LoginValues) => {
        const user = authenticate(values.email, values.password)
        if (!user) throw new Error('Invalid credentials')
        signIn(user)
      }}
    />} />
    <Route path="/register" element={<RegisterPage onLogin={() => navigate('/login')} onSubmit={async (_values: RegisterValues) => { signIn(studentAccount) }} />} />
    <Route path="/forgot-password" element={<ForgotPasswordPage onBack={() => navigate('/login')} onSubmit={async (_values: ForgotValues) => { await new Promise((resolve) => setTimeout(resolve, 250)) }} />} />
    <Route path="/verify-otp" element={<OtpPage email={demoCredentials[0].email} onBack={() => navigate('/login')} onResend={async () => { await new Promise((resolve) => setTimeout(resolve, 250)) }} onSubmit={async (_values: OtpValues) => { signIn(mockUsers[0]) }} />} />
    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
}

function AuthenticatedRoutes() {
  return <Routes>
    <Route element={<AppShell />}>
      {appRoutes.map((route) => <Route key={route.path} path={route.path} element={<RoleGate roles={route.roles}><Suspense fallback={<PageFallback />}>{route.element}</Suspense></RoleGate>} />)}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>
  </Routes>
}

export function AppRouter() {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth)
  const mockScenario = useAppSelector((state) => state.ui.mockScenario)

  // Keep the mock data layer in sync with the topbar demo-state switch.
  useEffect(() => { setScenario(mockScenario) }, [mockScenario])

  return <ToastProvider>
    <QueryClientProvider client={queryClient}>
      {isAuthenticated && user ? <AuthenticatedRoutes /> : <AuthRoutes />}
    </QueryClientProvider>
  </ToastProvider>
}
