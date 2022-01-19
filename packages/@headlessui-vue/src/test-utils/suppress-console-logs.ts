type FunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never
}[keyof T] &
  string

export function suppressConsoleLogs<T extends unknown[]>(
  cb: (...args: T) => void,
  type: FunctionPropertyNames<typeof globalThis.console> = 'warn'
) {
  return (...args: T) => {
    let spy = jest.spyOn(globalThis.console, type).mockImplementation(jest.fn())

    return new Promise<void>((resolve, reject) => {
      Promise.resolve(cb(...args)).then(resolve, reject)
    }).finally(() => spy.mockRestore())
  }
}
