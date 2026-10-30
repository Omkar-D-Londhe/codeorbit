/**
 * Analysis provider registry.
 * Conforms to STAGE_20 specification §1, §6, §12.
 *
 * Truthfulness rule: Production never registers a provider at Stage 20.
 * getProvider(language) returns undefined when no provider is registered,
 * and the UI shows truthful 'not available' states with NO numbers.
 */

import type { AnalysisProvider } from './types'

const providers = new Map<string, AnalysisProvider>()

export function registerProvider(provider: AnalysisProvider): void {
  if (!provider || typeof provider.language !== 'string') {
    throw new Error('Invalid AnalysisProvider: language is required')
  }
  providers.set(provider.language.toLowerCase().trim(), provider)
}

export function unregisterProvider(language: string): void {
  if (!language) return
  providers.delete(language.toLowerCase().trim())
}

export function getProvider(language: string): AnalysisProvider | undefined {
  if (!language) return undefined
  return providers.get(language.toLowerCase().trim())
}

export function hasProvider(language: string): boolean {
  if (!language) return false
  return providers.has(language.toLowerCase().trim())
}

export function getRegisteredLanguages(): string[] {
  return Array.from(providers.keys())
}

/**
 * Resets the registry. Used strictly in tests to ensure test providers
 * never leak into other tests or production builds.
 */
export function clearProviders(): void {
  providers.clear()
}

export const analysisRegistry = {
  register: registerProvider,
  unregister: unregisterProvider,
  get: getProvider,
  has: hasProvider,
  list: getRegisteredLanguages,
  clear: clearProviders,
}
