import plugin from 'tailwindcss/plugin'

export default plugin.withOptions<{ prefix?: string }>(({ prefix = 'ui' } = {}) => {
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
