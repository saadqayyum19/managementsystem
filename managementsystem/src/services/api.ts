import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'

const accessTokenKey = 'educore_access_token'
export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api/v1', withCredentials: true, headers: { 'Content-Type': 'application/json' } })
export const tokenStorage = { get: () => localStorage.getItem(accessTokenKey), set: (token: string) => localStorage.setItem(accessTokenKey, token), clear: () => localStorage.removeItem(accessTokenKey) }

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean }
let refreshRequest: Promise<string> | null = null

api.interceptors.request.use((config) => { const token = tokenStorage.get(); if (token) config.headers.Authorization = `Bearer ${token}`; return config })
api.interceptors.response.use((response) => response, async (error: AxiosError) => {
  const config = error.config as RetriableConfig | undefined
  if (error.response?.status !== 401 || !config || config._retry || config.url?.includes('/auth/refresh')) return Promise.reject(error)
  config._retry = true
  refreshRequest ??= api.post<{ success: boolean; data: { accessToken: string } }>('/auth/refresh').then(({ data }) => { tokenStorage.set(data.data.accessToken); return data.data.accessToken }).finally(() => { refreshRequest = null })
  try { const token = await refreshRequest; config.headers.Authorization = `Bearer ${token}`; return api(config) } catch (refreshError) { tokenStorage.clear(); return Promise.reject(refreshError) }
})
