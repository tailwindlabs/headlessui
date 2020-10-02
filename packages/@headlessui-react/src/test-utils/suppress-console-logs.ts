type FunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never
}[keyof T] &
  string

export function suppressConsoleLogs<T extends unknown[]>(
  cb: (...args: T) => unknown,
  type: FunctionPropertyNames<typeof global.console> = 'error'
) {
  return (...args: T) => {
    const spy = jest.spyOn(global.console, type).mockImplementation(jest.fn())

    return new Promise<unknown>((resolve, reject) => {
      Promise.resolve(cb(...args)).then(resolve, reject)
    }).finally(() => spy.mockRestore())
  }
}
