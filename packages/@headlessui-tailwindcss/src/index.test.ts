import path from 'path'
import postcss from 'postcss'
import tailwind from 'tailwindcss'
import hui from './index'

let html = String.raw

function run(input: string, config: any, plugin = tailwind) {
  let { currentTestName } = expect.getState()

  // @ts-ignore
  return postcss(plugin(config)).process(input, {
    from: `${path.resolve(__filename)}?test=${currentTestName}`,
  })
}

it('should generate css for an exposed state', async () => {
  let config = {
    content: [{ raw: html`<div class="ui-open:underline"></div>` }],
    plugins: [hui],
  }

  return run('@tailwind utilities', config).then((result) => {
    expect(result.css).toMatchSnapshot()
  })
})

it('should generate the inverse "not" css for an exposed state', async () => {
  let config = {
    content: [{ raw: html`<div class="ui-not-open:underline"></div>` }],
    plugins: [hui],
  }

  return run('@tailwind utilities', config).then((result) => {
    expect(result.css).toMatchSnapshot()
  })
})

it('should generate the ui-focus-visible variant', async () => {
  let config = {
    content: [{ raw: html`<div class="ui-focus-visible:underline"></div>` }],
    plugins: [hui],
  }

  return run('@tailwind utilities', config).then((result) => {
    expect(result.css).toMatchSnapshot()
  })
})

it('should generate the ui-not-focus-visible variant', async () => {
  let config = {
    content: [{ raw: html`<div class="ui-not-focus-visible:underline"></div>` }],
    plugins: [hui],
  }

  return run('@tailwind utilities', config).then((result) => {
    expect(result.css).toMatchSnapshot()
  })
})

describe('custom prefix', () => {
  it('should generate css for an exposed state', async () => {
    let config = {
      content: [{ raw: html`<div class="hui-open:underline"></div>` }],
      plugins: [hui({ prefix: 'hui' })],
    }

    return run('@tailwind utilities', config).then((result) => {
      expect(result.css).toMatchSnapshot()
    })
  })

  it('should generate the inverse "not" css for an exposed state', async () => {
    let config = {
      content: [{ raw: html`<div class="hui-not-open:underline"></div>` }],
      plugins: [hui({ prefix: 'hui' })],
    }

    return run('@tailwind utilities', config).then((result) => {
      expect(result.css).toMatchSnapshot()
    })
  })
})
