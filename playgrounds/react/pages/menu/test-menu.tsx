// TODO: delete this file

import { ComponentPropsWithRef, ElementType, Fragment, forwardRef, useRef } from 'react'

// Example components that `Menu` will be used `as`

const MenuWithRef = ({}: { ref: React.RefObject<HTMLButtonElement> }) => null
const MenuWithoutRef = ({}: {}) => null
const MenuWithCustomRef = ({}: { ref: React.RefObject<{ onOpen?: () => void }> }) => null
const MenuWithForwardRef = forwardRef<HTMLButtonElement, {}>((props, ref) => null)
const MenuWithForwardRefWithCustomRef = forwardRef<{ onOpen: () => void }, {}>((props, ref) => null)

/**
 * The `as` prop can be a few things:
 * - A regular HTML tag
 * - Another component
 * - A React fragment
 *
 * So, the ref can also point to different things:
 * - A reference to an HTML tag
 * - A ForwardRef, which could be for an HTML tag or a custom one
 * - A component with a `ref` prop (React v19+), pointing to either an HTML tag or a custom ref
 */

type RefProp<T extends ElementType> = unknown extends ComponentPropsWithRef<T>['ref']
  ? {}
  : { ref?: ComponentPropsWithRef<T>['ref'] }

type Menu = {
  <TTag extends ElementType = 'div'>(
    props: {
      as?: TTag
    } & RefProp<TTag>
  ): JSX.Element
}

const MenuAs = forwardRef(({ as }: any, ref) => {
  const Component = as || 'div'

  return <Component ref={ref} />
}) as Menu

export default function MenuExample() {
  const divRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const customRef = useRef<{ onOpen: () => void }>(null)

  return (
    <Fragment>
      <MenuAs ref={divRef} /> {/* Default `as` is a div */}
      <MenuAs as="button" ref={buttonRef} />
      <MenuAs as={Fragment} /> {/* ref is `never` */}
      <MenuAs as={MenuWithRef} ref={buttonRef} />
      <MenuAs as={MenuWithoutRef} /> {/* ref is `never` */}
      <MenuAs as={MenuWithCustomRef} ref={customRef} />
      <MenuAs as={MenuWithForwardRef} ref={buttonRef} />
      <MenuAs as={MenuWithForwardRefWithCustomRef} ref={customRef} />
    </Fragment>
  )
}
