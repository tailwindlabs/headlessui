export class DefaultMap<T = string, V = any> extends Map<T, V> {
  constructor(private factory: (key: T) => V) {
    super()
  }

  get(key: T): V {
    let value = super.get(key)

    if (value === undefined) {
      value = this.factory(key)
      this.set(key, value)
    }

    return value
  }
}
