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
      // TODO: Once `:has()` is properly supported, then we can switch to this version:
      // addVariant(`${prefix}-${state}`, [
      //   `&[data-headlessui-state~="${state}"]`,
      //   `:where([data-headlessui-state~="${state}"]):not(:has([data-headlessui-state])) &`,
      // ])

      // But for now, this will do:
      addVariant(`${prefix}-${state}`, [
        `&[data-headlessui-state~="${state}"]`,
        `:where([data-headlessui-state~="${state}"]) &`,
      ])

      addVariant(`${prefix}-not-${state}`, [
        `&[data-headlessui-state]:not([data-headlessui-state~="${state}"])`,
        `:where([data-headlessui-state]:not([data-headlessui-state~="${state}"])) &:not([data-headlessui-state])`,
      ])
    }

    addVariant(`${prefix}-focus-visible`, ':where([data-headlessui-focus-visible]) &:focus')
    addVariant(
      `${prefix}-not-focus-visible`,
      '&:focus:where(:not([data-headlessui-focus-visible] &))'
    )
  }
})
