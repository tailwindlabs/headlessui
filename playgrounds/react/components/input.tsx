import { ComponentProps, forwardRef, ReactNode } from 'react'

function classNames(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(' ')
}

export let Input = forwardRef<HTMLInputElement, ComponentProps<'input'> & { children?: ReactNode }>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      type="text"
      className={classNames(
        'focus:outline-hidden ui-focus-visible:ring-2 ui-focus-visible:ring-offset-2 flex items-center rounded-md border border-gray-300 bg-white px-2 py-1 ring-gray-500 ring-offset-gray-100',
        className
      )}
      {...props}
    />
  )
)
