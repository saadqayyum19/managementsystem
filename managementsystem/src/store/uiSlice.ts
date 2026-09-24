import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { featureToggles } from '../mocks/system'
import type { MockScenario } from '../mocks/runtime'

export type UiState = {
  mockScenario: MockScenario
  featureFlags: Record<string, boolean>
  sidebarCollapsed: boolean
  openGroups: string[]
}

const initialState: UiState = {
  mockScenario: 'happy',
  // AI / advanced modules ship disabled — the Feature Toggles page can switch them on live.
  featureFlags: Object.fromEntries(featureToggles.map((toggle) => [toggle.key, toggle.enabled])),
  sidebarCollapsed: false,
  openGroups: ['workspace', 'academics'],
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setMockScenario: (state, action: PayloadAction<MockScenario>) => { state.mockScenario = action.payload },
    setFeatureFlag: (state, action: PayloadAction<{ key: string; enabled: boolean }>) => { state.featureFlags[action.payload.key] = action.payload.enabled },
    setFeatureFlags: (state, action: PayloadAction<Record<string, boolean>>) => { state.featureFlags = { ...state.featureFlags, ...action.payload } },
    toggleSidebar: (state) => { state.sidebarCollapsed = !state.sidebarCollapsed },
    toggleGroup: (state, action: PayloadAction<string>) => {
      state.openGroups = state.openGroups.includes(action.payload) ? state.openGroups.filter((group) => group !== action.payload) : [...state.openGroups, action.payload]
    },
  },
})

export const { setMockScenario, setFeatureFlag, setFeatureFlags, toggleSidebar, toggleGroup } = uiSlice.actions
export default uiSlice.reducer
