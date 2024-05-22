import { AssertionError } from './AssertionError'
import { getMessage } from './getMessage'

export function assert(
  condition: boolean,
  messageOrMessageGetter?: undefined | string | (() => string),
  functionToSkipStackFrames: Function = assert
): asserts condition {
  if (condition) {
    return
  }

  const message = getMessage(messageOrMessageGetter)
  const error = new AssertionError(message)

  if (Error.captureStackTrace) {
    Error.captureStackTrace(error, functionToSkipStackFrames)
  }

  throw error
}
