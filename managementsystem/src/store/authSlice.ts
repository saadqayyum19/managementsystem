import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { tokenStorage } from '../services/api'

export type UserRole = 'super_admin' | 'principal' | 'teacher' | 'student' | 'parent'
export type AuthUser = { id: string; institutionId: string; firstName: string; lastName: string; email: string; role: UserRole; avatarUrl?: string | null }
type AuthState = { user: AuthUser | null; accessToken: string | null; isAuthenticated: boolean }

const initialToken = tokenStorage.get()
const initialState: AuthState = { user: null, accessToken: initialToken, isAuthenticated: Boolean(initialToken) }

const authSlice = createSlice({ name: 'auth', initialState, reducers: {
  setCredentials: (state, action: PayloadAction<{ user: AuthUser; accessToken: string }>) => { state.user = action.payload.user; state.accessToken = action.payload.accessToken; state.isAuthenticated = true; tokenStorage.set(action.payload.accessToken) },
  setUser: (state, action: PayloadAction<AuthUser>) => { state.user = action.payload; state.isAuthenticated = true },
  clearCredentials: (state) => { state.user = null; state.accessToken = null; state.isAuthenticated = false; tokenStorage.clear() },
} })
export const { setCredentials, setUser, clearCredentials } = authSlice.actions
export default authSlice.reducer
