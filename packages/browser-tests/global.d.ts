import { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers'

declare global {
  namespace PlaywrightTest {
    interface Matchers<R, T> extends TestingLibraryMatchers<R, T> {
      //
    }
  }
}
