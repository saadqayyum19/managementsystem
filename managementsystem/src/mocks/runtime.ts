export type MockScenario = 'happy' | 'loading' | 'empty' | 'error'

const listeners = new Set<() => void>()
let scenario: MockScenario = 'happy'
let latencyMs = 420

export function getScenario(): MockScenario { return scenario }
export function getLatency(): number { return latencyMs }
export function setScenario(next: MockScenario): void { scenario = next; listeners.forEach((listener) => listener()) }
export function setLatency(next: number): void { latencyMs = next }
export function subscribeScenario(listener: () => void): () => void { listeners.add(listener); return () => { listeners.delete(listener) } }
