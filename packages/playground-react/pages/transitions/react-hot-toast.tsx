import { Transition } from '@headlessui/react'
import { resolveValue, toast, Toaster, ToastIcon } from 'react-hot-toast'

const TailwindToaster = () => {
  return (
    <Toaster position="top-right">
      {(t) => (
        <Transition
          appear
          show={t.visible}
          className="flex transform rounded bg-white p-4 shadow-lg"
          enter="transition-all duration-500"
          enterFrom="opacity-0 scale-50"
          enterTo="opacity-100 scale-100"
          leave="transition-all duration-150"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-75"
        >
          <ToastIcon toast={t} />
          <p className="px-2">{resolveValue(t.message, t)}</p>
        </Transition>
      )}
    </Toaster>
  )
}

export default function App() {
  return (
    <div className="m-8">
      <button
        className="rounded bg-blue-500 p-4 text-white"
        onClick={() => toast.success('This is Tailwind CSS')}
      >
        Create TailwindCSS Toast
      </button>
      <TailwindToaster />
    </div>
  )
}
