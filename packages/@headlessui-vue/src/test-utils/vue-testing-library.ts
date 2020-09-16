import { mount } from '@vue/test-utils'
import { logDOM, fireEvent } from '@testing-library/dom'

const mountedWrappers = new Set()

export function render(
  TestComponent: any,
  options?: Omit<Parameters<typeof mount>[1], 'attachTo'>
) {
  const div = document.createElement('div')
  const baseElement = document.body
  const container = baseElement.appendChild(div)

  const attachTo = document.createElement('div')
  container.appendChild(attachTo)

  const wrapper = mount(TestComponent, {
    ...options,
    attachTo,
  })

  mountedWrappers.add(wrapper)
  container.appendChild(wrapper.element)

  return {
    debug() {
      logDOM(div)
    },
  }
}

function cleanup() {
  mountedWrappers.forEach(cleanupAtWrapper)
}

function cleanupAtWrapper(wrapper) {
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
