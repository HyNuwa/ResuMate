/**
 * Resumate Resume Feature
 *
 * Feature-sliced module for the CV editing experience.
 * Contains: components, stores, hooks, services, types.
 *
 * Components in this feature still use legacy Resume types from @/shared/types/resume.
 * Migration to @resumate/schema types is incremental.
 */

export * from './components/index.js';
export * from './stores/index.js';
export * from './hooks/index.js';
export * from './services/index.js';
export * from './types/legacyAdapter.js';
