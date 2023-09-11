import { fireEvent, logDOM, screen } from '@testing-library/dom'
import { mount } from '@vue/test-utils'
import { defineComponent, type ComponentOptionsWithoutProps } from 'vue'

let mountedWrappers = new Set()

function resolveContainer(): HTMLElement {
  let div = document.createElement('div')
  let baseElement = document.body
  let container = baseElement.appendChild(div)

  let attachTo = document.createElement('div')
  container.appendChild(attachTo)
  return attachTo
}

// It's not the most elegant type
// but Props and Emits need to be typed as any and not `{}`
type AnyComponent = ReturnType<typeof defineComponent>

export function createRenderTemplate(defaultComponents: Record<string, AnyComponent>) {
  return (input: string | ComponentOptionsWithoutProps) => {
    if (typeof input === 'string') {
      input = { template: input }
    }

    let component: ComponentOptionsWithoutProps = Object.assign({}, input, {
      components: { ...defaultComponents, ...input.components },
    })

    return render(defineComponent(component))
  }
}

export function render(TestComponent: any, options?: Parameters<typeof mount>[1] | undefined) {
  let wrapper = mount(TestComponent, {
    ...options,
    attachTo: options?.attachTo ?? resolveContainer(),
  })

  mountedWrappers.add(wrapper)

  return {
    unmount() {
      wrapper.unmount()
    },
    get container() {
      return wrapper.element.parentElement!
    },
    debug(element = wrapper.element.parentElement!) {
      logDOM(element)
    },
    asFragment() {
      let template = document.createElement('template')
      template.innerHTML = wrapper.element.parentElement!.innerHTML
      return template.content
    },
  }
}

function cleanup() {
  mountedWrappers.forEach(cleanupAtWrapper)
  document.body.innerHTML = ''
}

function cleanupAtWrapper(wrapper: any) {
  if (wrapper.element.parentNode && wrapper.element.parentNode.parentNode === document.body) {
    document.body.removeChild(wrapper.element.parentNode)
  }

  try {
    wrapper.unmount()
  } catch {
  } finally {
    mountedWrappers.delete(wrapper)
  }
}

if (typeof afterEach === 'function') {
  afterEach(() => cleanup())
}

export { fireEvent, screen }
