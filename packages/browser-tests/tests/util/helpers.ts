type ValueOf<T> = T[keyof T]
type KeyedFactory = { [key: string]: () => any }

type ReturnTypesOf<Type extends KeyedFactory> = {
  [Property in keyof Type]: ReturnType<Type[Property]>
}

export type TestSuite = 'vue' | 'react'

export function suite(): TestSuite {
  if (process.env.SUITE === 'vue' || process.env.SUITE === 'react') {
    return process.env.SUITE
  }

  throw new Error(`Unknown test suite ${process.env.SUITE}`)
}

export function pick<T extends KeyedFactory>(map: T): ValueOf<ReturnTypesOf<T>> {
  return map[suite()]()
}
