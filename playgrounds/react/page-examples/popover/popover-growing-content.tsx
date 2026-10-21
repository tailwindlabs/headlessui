import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import { useEffect, useState } from 'react'

// Stands in for a fetch: the panel opens with a short loading state, then the results arrive and
// the panel grows.
function Results() {
  let [items, setItems] = useState<string[] | null>(null)

  useEffect(() => {
    let timeout = setTimeout(
      () => setItems(Array.from({ length: 20 }, (_, i) => `Result ${i + 1}`)),
      500
    )
    return () => clearTimeout(timeout)
  }, [])

  if (!items) return <p className="p-3 text-sm text-gray-500">Loading…</p>

  // Like a combobox's options, the results scroll on their own past a fixed height.
  return (
    <ul className="max-h-72 overflow-y-auto p-1">
      {items.map((item) => (
        <li key={item} className="rounded-sm px-2 py-1.5 text-sm hover:bg-gray-100">
          {item}
        </li>
      ))}
    </ul>
  )
}

export default function Home() {
  return (
    // The button sits 200px above the bottom of the viewport: room below for the loading state,
    // but not for the results. There's plenty of room above.
    <div className="flex h-screen flex-col justify-end px-12 pb-[200px]">
      <p className="mb-4 max-w-prose text-sm text-gray-600">
        Open the popover. Once the results load, the panel should flip above the button, where it
        fits and only the results list scrolls.
      </p>
      <Popover>
        <PopoverButton className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white">
          Search
        </PopoverButton>
        <PopoverPanel
          anchor={{ to: 'bottom start', gap: 4, padding: 8 }}
          className="w-64 rounded-md bg-white shadow-lg ring-1 ring-black/5"
        >
          <div className="border-b border-gray-200 p-2">
            <input
              aria-label="Search"
              placeholder="Search…"
              className="w-full rounded-sm border border-gray-300 px-2 py-1 text-sm"
            />
          </div>
          <Results />
        </PopoverPanel>
      </Popover>
    </div>
  )
}
