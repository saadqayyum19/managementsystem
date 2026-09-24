import { getLatency, getScenario } from '../mocks/runtime'

/**
 * Every frontend module in this phase reads its data through fetchMock.
 * No network calls are made: the promise resolves with in-memory mock data
 * after a short delay so loading skeletons behave realistically.
 * The demo scenario switch (topbar) can force loading / empty / error states.
 */
export class MockNetworkError extends Error {
  constructor(message = 'Mock network error') { super(message); this.name = 'MockNetworkError' }
}

export function fetchMock<T>(data: T, emptyValue?: T): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const scenario = getScenario()
    if (scenario === 'loading') return
    const delay = getLatency()
    setTimeout(() => {
      if (scenario === 'error') reject(new MockNetworkError())
      else if (scenario === 'empty') resolve((emptyValue ?? [] as unknown as T))
      else resolve(data)
    }, scenario === 'happy' ? delay : Math.min(delay, 250))
  })
}

/** Deterministic helper for mutations: echoes back the payload after latency. */
export const mutateMock = fetchMock
