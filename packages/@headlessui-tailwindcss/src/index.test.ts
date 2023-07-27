import path from 'path'
import postcss from 'postcss'
import tailwind from 'tailwindcss'
import hui from './index'

let html = String.raw
let css = String.raw

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
    expect(result.css).toMatchFormattedCss(css`
      .ui-open\:underline[data-headlessui-state~='open'] {
        text-decoration-line: underline;
      }
      :where([data-headlessui-state~='open']) .ui-open\:underline {
        text-decoration-line: underline;
      }
    `)
  })
})

it('should generate the inverse "not" css for an exposed state', async () => {
  let config = {
    content: [{ raw: html`<div class="ui-not-open:underline"></div>` }],
    plugins: [hui],
  }

  return run('@tailwind utilities', config).then((result) => {
    expect(result.css).toMatchFormattedCss(css`
      .ui-not-open\:underline[data-headlessui-state]:not([data-headlessui-state~='open']) {
        text-decoration-line: underline;
      }

      :where([data-headlessui-state]:not([data-headlessui-state~='open']))
        .ui-not-open\:underline:not([data-headlessui-state]) {
        text-decoration-line: underline;
      }
    `)
  })
})

it('should generate the ui-focus-visible variant', async () => {
  let config = {
    content: [{ raw: html`<div class="ui-focus-visible:underline"></div>` }],
    plugins: [hui],
  }

  return run('@tailwind utilities', config).then((result) => {
    expect(result.css).toMatchFormattedCss(css`
      :where([data-headlessui-focus-visible]) .ui-focus-visible\:underline:focus {
        text-decoration-line: underline;
      }
    `)
  })
})

it('should generate the ui-not-focus-visible variant', async () => {
  let config = {
    content: [{ raw: html`<div class="ui-not-focus-visible:underline"></div>` }],
    plugins: [hui],
  }

  return run('@tailwind utilities', config).then((result) => {
    expect(result.css).toMatchFormattedCss(css`
      .ui-not-focus-visible\:underline:focus:where(:not([data-headlessui-focus-visible]
            .ui-not-focus-visible\:underline)) {
        text-decoration-line: underline;
      }
    `)
  })
})

describe('custom prefix', () => {
  it('should generate css for an exposed state', async () => {
    let config = {
      content: [{ raw: html`<div class="hui-open:underline"></div>` }],
      plugins: [hui({ prefix: 'hui' })],
    }

    return run('@tailwind utilities', config).then((result) => {
      expect(result.css).toMatchFormattedCss(css`
        .hui-open\:underline[data-headlessui-state~='open'] {
          text-decoration-line: underline;
        }
        :where([data-headlessui-state~='open']) .hui-open\:underline {
          text-decoration-line: underline;
        }
      `)
    })
  })

  it('should generate the inverse "not" css for an exposed state', async () => {
    let config = {
      content: [{ raw: html`<div class="hui-not-open:underline"></div>` }],
      plugins: [hui({ prefix: 'hui' })],
    }

    return run('@tailwind utilities', config).then((result) => {
      expect(result.css).toMatchFormattedCss(css`
        .hui-not-open\:underline[data-headlessui-state]:not([data-headlessui-state~='open']) {
          text-decoration-line: underline;
        }

        :where([data-headlessui-state]:not([data-headlessui-state~='open']))
          .hui-not-open\:underline:not([data-headlessui-state]) {
          text-decoration-line: underline;
        }
      `)
    })
  })
})
