'use client'

import { Portal } from '@headlessui/react'
import { Suspense, lazy } from 'react'

function MyComponent({ children }: { children(message: string): JSX.Element }) {
  return <>{children('test')}</>
}

let MyComponentLazy = lazy(async () => {
  await new Promise((resolve) => setTimeout(resolve, 4000))

  return { default: MyComponent }
})

export default function Index() {
  return (
    <div>
      <h1>@headlessui/react & Suspense</h1>

      <Portal>
        <h2>Portal 1</h2>
      </Portal>
      <Portal>
        <h2>Portal 2</h2>
      </Portal>

      <Suspense fallback={<span>Loading ...</span>}>
        <MyComponentLazy>
          {(env) => (
            <div>
              <Portal>Portal, suspense 1: {env}</Portal>
              <Portal>Portal, suspense 2: {env}</Portal>
            </div>
          )}
        </MyComponentLazy>
      </Suspense>
    </div>
  )
}
