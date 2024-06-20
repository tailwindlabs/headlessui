import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react'
import { useState } from 'react'
import { Button } from '../../components/button'
import { classNames } from '../../utils/class-names'

export default function Home() {
  let [isOpen, setIsOpen] = useState(false)
  let [transition, setTransition] = useState(true)

  return (
    <>
      <div className="flex gap-4 p-12">
        <Button onClick={() => setIsOpen((v) => !v)}>Toggle!</Button>
        <Button onClick={() => setTransition((v) => !v)}>
          <span>Toggle transition</span>
          <span
            className={classNames(
              'ml-2 inline-flex size-4 rounded-md',
              transition ? 'bg-green-500' : 'bg-red-500'
            )}
          ></span>
        </Button>
      </div>

      <Dialog
        open={isOpen}
        transition={transition}
        onClose={() => setIsOpen(false)}
        className="relative z-50"
      >
        <DialogBackdrop className="fixed inset-0 bg-black/30 duration-500 ease-out data-[closed]:opacity-0" />
        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
          <DialogPanel className="w-full max-w-lg space-y-4 bg-white p-12 duration-500 ease-out data-[closed]:scale-95 data-[closed]:opacity-0">
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
