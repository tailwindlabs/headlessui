'use client'

import { Portal } from '@headlessui/react'
import { lazy, Suspense } from 'react'

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
      <h1 className="p-8 text-3xl font-bold">Suspense + Portals</h1>

      <Portal>
        <div className="absolute right-48 top-24 z-10 flex h-32 w-32 flex-col items-center justify-center rounded border border-black/5 bg-white bg-clip-padding p-px shadow">
          <div className="w-full rounded-t-sm bg-gray-100 p-1 text-center text-gray-700">
            Instant
          </div>
          <div className="flex w-full flex-1 items-center justify-center text-3xl font-bold text-gray-400">
            1
          </div>
        </div>
      </Portal>
      <Portal>
        <div className="absolute right-8 top-24 z-10 flex h-32 w-32 flex-col items-center justify-center rounded border border-black/5 bg-white bg-clip-padding p-px shadow">
          <div className="w-full rounded-t-sm bg-gray-100 p-1 text-center text-gray-700">
            Instant
          </div>
          <div className="flex w-full flex-1 items-center justify-center text-3xl font-bold text-gray-400">
            2
          </div>
        </div>
      </Portal>

      <Suspense fallback={<span>Loading ...</span>}>
        <MyComponentLazy>
          {(env) => (
            <div>
              <Portal>
                <div className="absolute right-48 top-64 z-10 flex h-32 w-32 flex-col items-center justify-center rounded border border-black/5 bg-white bg-clip-padding p-px shadow">
                  <div className="w-full rounded-t-sm bg-gray-100 p-1 text-center text-gray-700">
                    Suspense
                  </div>
                  <div className="flex w-full flex-1 items-center justify-center text-3xl font-bold text-gray-400">
                    {env} 1
                  </div>
                </div>
              </Portal>
              <Portal>
                <div className="absolute right-8 top-64 z-10 flex h-32 w-32 flex-col items-center justify-center rounded border border-black/5 bg-white bg-clip-padding p-px shadow">
                  <div className="w-full rounded-t-sm bg-gray-100 p-1 text-center text-gray-700">
                    Suspense
                  </div>
                  <div className="flex w-full flex-1 items-center justify-center text-3xl font-bold text-gray-400">
                    {env} 2
                  </div>
                </div>
              </Portal>
            </div>
          )}
        </MyComponentLazy>
      </Suspense>
    </div>
  )
}
