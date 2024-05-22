export function assert(
  condition: boolean,
  messageOrMessageGetter: string | (() => string),
  functionToSkipStackFrames: Function = assert
): asserts condition {
  if (condition) {
    return
  }

  const message = getMessage(messageOrMessageGetter)
  const error = new Error(message)

  if (Error.captureStackTrace) {
    Error.captureStackTrace(error, functionToSkipStackFrames)
  }

  throw error
}

function getMessage(messageOrMessageGetter: string | (() => string)) {
  return typeof messageOrMessageGetter === 'string'
    ? messageOrMessageGetter
    : messageOrMessageGetter()
}
