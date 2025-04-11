import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react'
import { useState } from 'react'
import { Button } from '../../components/button'
import { classNames } from '../../utils/class-names'

export default function Home() {
  let [isOpen, setIsOpen] = useState(false)
  let [transitionBackdrop, setTransitionBackdrop] = useState(true)
  let [transitionPanel, setTransitionPanel] = useState(true)

  return (
    <>
      <div className="flex gap-4 p-12">
        <Button onClick={() => setIsOpen((v) => !v)}>Toggle!</Button>
        <Button onClick={() => setTransitionBackdrop((v) => !v)}>
          <span>Toggle transition backdrop</span>
          <span
            className={classNames(
              'ml-2 inline-flex size-4 rounded-md',
              transitionBackdrop ? 'bg-green-500' : 'bg-red-500'
            )}
          ></span>
        </Button>
        <Button onClick={() => setTransitionPanel((v) => !v)}>
          <span>Toggle transition panel</span>
          <span
            className={classNames(
              'ml-2 inline-flex size-4 rounded-md',
              transitionPanel ? 'bg-green-500' : 'bg-red-500'
            )}
          ></span>
        </Button>
      </div>

      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="data-closed:opacity-0 relative z-50 duration-500"
      >
        <DialogBackdrop
          transition={transitionBackdrop}
          className="data-closed:opacity-0 fixed inset-0 bg-black/30 duration-500 ease-out"
        />
        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
          <DialogPanel
            transition={transitionPanel}
            className="data-closed:scale-95 data-closed:opacity-0 w-full max-w-lg space-y-4 bg-white p-12 duration-500 ease-out"
          >
            <h1 className="text-2xl font-bold">Dialog</h1>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed pulvinar, nunc nec
              vehicula fermentum, nunc sapien tristique ipsum, nec facilisis dolor sapien non dui.
              Nullam vel sapien ultrices, lacinia felis sit amet, fermentum odio. Nullam vel sapien
              ultrices, lacinia felis sit amet, fermentum odio.
            </p>
            <Button onClick={() => setIsOpen(false)}>Close</Button>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  )
}
