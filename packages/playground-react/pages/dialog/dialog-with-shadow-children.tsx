import { Dialog } from '@headlessui/react'
import { useEffect, useRef, useState } from 'react'
import { Button } from '../../components/button'

if (typeof document !== 'undefined') {
  class MyCustomElement extends HTMLElement {
    shadow: ShadowRoot

    constructor() {
      super()
      this.shadow = this.attachShadow({ mode: 'closed' })
    }

    connectedCallback() {
      let button = document.createElement('button')
      button.textContent = 'Inside shadow root (closed)'
      this.shadow.appendChild(button)
    }
  }

  customElements.define('my-custom-element', MyCustomElement)
}

function ShadowChildren({ id }: { id: string }) {
  let container = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!container.current || container.current.shadowRoot) {
      return
    }

    let shadowRoot = container.current.attachShadow({ mode: 'open' })
    let button = document.createElement('button')
    button.id = id
    button.style.display = 'block'
    button.textContent = 'Inside shadow root (open)'

    let mce = document.createElement('my-custom-element')

    shadowRoot.appendChild(button)
    shadowRoot.appendChild(mce)
  }, [])

  return <div ref={container}></div>
}

export default function App() {
  const [open, setOpen] = useState(false)

  return (
    <div>
      <Button onClick={() => setOpen(true)}>open</Button>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <div className="fixed inset-0 z-50 bg-gray-900/75 backdrop-blur-lg">
          <div>
            <button
              className="m-4 rounded border-0 bg-gray-500 px-3 py-1 font-medium text-white hover:bg-gray-600"
              id="btn_outside_light"
            >
              Outside shadow root
            </button>
            <ShadowChildren id="btn_outside_shadow" />
          </div>
        </div>
        <Dialog.Panel className="fixed left-16 top-16 z-50 h-64 w-64 rounded-lg border border-black/10 bg-white bg-clip-padding p-12 shadow-lg">
          <div>
            <button
              className="m-4 rounded border-0 bg-gray-500 px-3 py-1 font-medium text-white hover:bg-gray-600"
              id="btn_inside_light"
            >
              Outside shadow root
            </button>
            <ShadowChildren id="btn_inside_shadow" />
          </div>
        </Dialog.Panel>
      </Dialog>
    </div>
  )
}
