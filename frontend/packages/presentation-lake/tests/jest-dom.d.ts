/**
 * jest-dom matchers for Vitest's `expect`, declared from this package.
 *
 * `@testing-library/jest-dom/vitest` augments whichever `vitest` copy its own
 * location resolves to; with more than one Vitest variant in the pnpm store
 * (e.g. the web app's happy-dom peer) that can be a different copy than ours.
 * Declaring the augmentation here pins it to the lake's Vitest.
 */
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

declare module 'vitest' {
  interface Assertion<T = any> extends TestingLibraryMatchers<any, T> {}
  interface AsymmetricMatchersContaining extends TestingLibraryMatchers<any, any> {}
}
