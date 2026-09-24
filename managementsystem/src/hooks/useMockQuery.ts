import { useSyncExternalStore } from 'react'
import { useQuery, type QueryKey, type UseQueryResult } from '@tanstack/react-query'
import { getScenario, subscribeScenario, type MockScenario } from '../mocks/runtime'

/** Subscribes to the demo scenario switch so the topbar control can force states. */
export function useMockScenario(): MockScenario {
  return useSyncExternalStore(subscribeScenario, getScenario, getScenario)
}

/**
 * Thin react-query wrapper for the mock layer. The active scenario is part of
 * the query key so switching Live / Loading / Empty / Error refetches instantly.
 */
export function useMockQuery<T>(key: QueryKey, load: () => Promise<T>): UseQueryResult<T, Error> {
  const scenario = useMockScenario()
  return useQuery({ queryKey: [...key, scenario], queryFn: load, staleTime: 30_000 })
}
