import {
  Dialog,
  DialogPanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
  TransitionChild,
} from '@headlessui/react'
import { useState } from 'react'
import { Button } from '../../components/button'

export default function App() {
  let [openEdit, setOpenEdit] = useState(false)
  let [openDelete, setOpenDelete] = useState(false)
  let [openConfirm, setOpenConfirm] = useState(false)
  let [openDeleted, setOpenDeleted] = useState(false)

  return (
    <div className="p-12">
      <Button onClick={() => setOpenEdit((v) => !v)}>Toggle Dialog</Button>

      <MyDialog level={0} open={openEdit} onClose={setOpenEdit}>
        <div>My Edit dialog</div>
        <div className="flex-1 py-8">
          <Menu>
            <MenuButton data-autofocus as={Button}>
              Menu button
            </MenuButton>
            <MenuItems
              anchor="bottom start"
              className="outline-hidden z-50 flex w-[calc(var(--button-width)*2)] flex-col rounded-sm bg-white p-1 shadow-sm"
            >
              <MenuItem
                as="button"
                className="data-active:bg-gray-100 rounded-sm px-2 py-1 text-left"
              >
                Item A
              </MenuItem>
              <MenuItem
                as="button"
                className="data-active:bg-gray-100 rounded-sm px-2 py-1 text-left"
              >
                Item B
              </MenuItem>
              <MenuItem
                as="button"
                className="data-active:bg-gray-100 rounded-sm px-2 py-1 text-left"
                onClick={() => setOpenDelete(true)}
              >
                Delete
              </MenuItem>
            </MenuItems>
          </Menu>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setOpenDelete(true)}>Delete</Button>
          <Button onClick={() => setOpenEdit(false)}>Close</Button>
        </div>
      </MyDialog>

      <MyDialog level={1} open={openDelete} onClose={setOpenDelete}>
        <div>My Delete Dialog</div>
        <div className="flex-1 py-8">...</div>
        <div className="flex gap-2">
          <Button data-autofocus onClick={() => setOpenConfirm(true)}>
            Confirm
          </Button>
          <Button onClick={() => setOpenDelete(false)}>Close</Button>
        </div>
      </MyDialog>

      <MyDialog level={2} open={openConfirm} onClose={setOpenConfirm}>
        <div>Are you sure??</div>
        <div className="flex-1 py-8">If confirmed, this dialog will close.</div>
        <div className="flex gap-2">
          <Button
            data-autofocus
            onClick={() => {
              setOpenDeleted(true)
              setOpenConfirm(false)
            }}
          >
            CONFIRM
          </Button>
          <Button onClick={() => setOpenConfirm(false)}>Close</Button>
        </div>
      </MyDialog>

      <MyDialog level={3} open={openDeleted} onClose={setOpenDeleted}>
        <div>SUCCESSFULLY DELETED</div>
        <div className="flex gap-2">
          <Button data-autofocus onClick={() => setOpenDeleted(false)}>
            Close
          </Button>
        </div>
      </MyDialog>
    </div>
  )
}

function MyDialog({ level = 0, open, onClose, children }: any) {
  return (
    <Transition
      show={open}
      enter="transition duration-300"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition duration-100"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <Dialog onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="fixed inset-0 bg-gray-500/25" />
        <TransitionChild
          enter="transition duration-300"
          enterFrom="scale-95"
          enterTo="scale-100"
          leave="transition duration-100"
          leaveFrom="scale-100"
          leaveTo="scale-95"
        >
          <DialogPanel
            style={{
              transform: `translate(calc(50px * ${level}), calc(50px * ${level}))`,
            }}
            className="relative z-10 flex w-96 -translate-y-24 flex-col rounded-sm bg-white p-4 shadow-xl"
          >
            {children}
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </Transition>
  )
}
