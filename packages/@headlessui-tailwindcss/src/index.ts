import plugin from 'tailwindcss/plugin'

interface Options {
  /**
   * The prefix used for the variants. This defaults to `ui`.
   *
   * Usage example:
   * ```html
   *  <div class="ui-open:underline"></div>
   *  ```
   **/
  prefix?: string
}

export default plugin.withOptions<Options>(({ prefix = 'ui' } = {}) => {
  return ({ addVariant }) => {
    for (let state of ['open', 'checked', 'selected', 'active', 'disabled']) {
      addVariant(`${prefix}-${state}`, [
        `&[data-headlessui-state~="${state}"]`,
        `:where([data-headlessui-state~="${state}"]) &`,
      ])

      addVariant(`${prefix}-not-${state}`, [
        `&[data-headlessui-state]:not([data-headlessui-state~="${state}"])`,
        `:where([data-headlessui-state]:not([data-headlessui-state~="${state}"]) &:not([data-headlessui-state]))`,
      ])
    }
  }
})
