import { mount } from '@vue/test-utils'
import { logDOM, fireEvent } from '@testing-library/dom'

let mountedWrappers = new Set()

function resolveContainer(): HTMLElement {
  let div = document.createElement('div')
  let baseElement = document.body
  let container = baseElement.appendChild(div)

  let attachTo = document.createElement('div')
  container.appendChild(attachTo)
  return attachTo
}

export function render(TestComponent: any, options?: Parameters<typeof mount>[1] | undefined) {
  let wrapper = mount(TestComponent, {
    ...options,
    attachTo: options?.attachTo ?? resolveContainer(),
  })

  mountedWrappers.add(wrapper)

  return {
    get container() {
      return wrapper.element
    },
    debug(element = wrapper.element) {
      logDOM(element)
    },
  }
}

function cleanup() {
  mountedWrappers.forEach(cleanupAtWrapper)
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

export { fireEvent }
