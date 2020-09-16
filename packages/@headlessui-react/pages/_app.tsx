import React from 'react'
import Link from 'next/link'
import Head from 'next/head'
import { useRouter } from 'next/router'

import 'tailwindcss/tailwind.css'
import { ExamplesType } from '../playground-utils/resolve-all-examples'
import { useDisposables } from '../src/hooks/use-disposables'
import { PropsOf } from '../src/types'

function NextLink(props: PropsOf<'a'>) {
  const { href, children, ...rest } = props
  return (
    <Link href={href}>
      <a {...rest}>{children}</a>
    </Link>
  )
}

enum KeyDisplayMac {
  ArrowUp = '↑',
  ArrowDown = '↓',
  ArrowLeft = '←',
  ArrowRight = '→',
  Home = '↖',
  End = '↘',
  Alt = '⌥',
  CapsLock = '⇪',
  Meta = '⌘',
  Shift = '⇧',
  Control = '⌃',
  Backspace = '⌫',
  Delete = '⌦',
  Enter = '↵',
  Escape = '⎋',
  Tab = '↹',
  PageUp = '⇞',
  PageDown = '⇟',
  ' ' = '␣',
}

enum KeyDisplayWindows {
  ArrowUp = '↑',
  ArrowDown = '↓',
  ArrowLeft = '←',
  ArrowRight = '→',
  Meta = 'Win',
  Control = 'Ctrl',
  Backspace = '⌫',
  Delete = 'Del',
  Escape = 'Esc',
  PageUp = 'PgUp',
  PageDown = 'PgDn',
  ' ' = '␣',
}

function tap<T>(value: T, cb: (value: T) => void) {
  cb(value)
  return value
}

function useKeyDisplay() {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return {}
  const isMac = navigator.userAgent.indexOf('Mac OS X') !== -1
  return isMac ? KeyDisplayMac : KeyDisplayWindows
}

function KeyCaster() {
  const [keys, setKeys] = React.useState<string[]>([])
  const d = useDisposables()
  const KeyDisplay = useKeyDisplay()

  React.useEffect(() => {
    function handler(event: KeyboardEvent) {
      setKeys(current => [
        event.shiftKey && event.key !== 'Shift'
          ? KeyDisplay[`Shift${event.key}`] ?? event.key
          : KeyDisplay[event.key] ?? event.key,
        ...current,
      ])
      d.setTimeout(() => setKeys(current => tap(current.slice(), clone => clone.pop())), 2000)
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [d, KeyDisplay])

  if (keys.length <= 0) return null

  return (
    <div className="fixed z-50 px-4 py-2 overflow-hidden text-2xl tracking-wide text-blue-100 bg-blue-800 rounded-md shadow cursor-default pointer-events-none select-none right-4 bottom-4">
      {keys
        .slice()
        .reverse()
        .join(' ')}
    </div>
  )
}

function MyApp({ Component, pageProps }) {
  const router = useRouter()
  const { allExamples = [] } = pageProps

  return (
    <>
      <Head>
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />

        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="https://tailwindui.com/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="https://tailwindui.com//favicon-16x16.png"
        />
      </Head>

      <div className="flex flex-col h-screen overflow-hidden font-sans antialiased text-gray-900 bg-white">
        <header className="relative z-10 flex items-center justify-between flex-shrink-0 px-4 py-4 bg-white border-b border-gray-200 sm:px-6 lg:px-8">
          <NextLink href="/">
            <img
              className="w-auto h-6"
              src="https://tailwindui.com/img/tailwindui-logo.svg"
              alt="Tailwind UI"
            />
          </NextLink>
          {allExamples.length > 0 && (
            <div>
              <select
                value={router.asPath}
                onChange={event => {
                  router.push(event.target.value)
                }}
                className="block w-full py-2 pl-3 pr-10 text-base leading-6 border-gray-300 form-select focus:outline-none focus:shadow-outline-blue focus:border-blue-300 sm:text-sm sm:leading-5"
              >
                <RecursiveExamplesSelectOptions examples={allExamples} />
              </select>
            </div>
          )}
        </header>

        <KeyCaster />

        <main className="flex-1 overflow-auto">
          <Component {...pageProps} />
        </main>
      </div>
    </>
  )
}

// Ideally you would use <optgroup></optgroup>... However, when you do that, React yells at you:
// <optgroup> cannot appear as a child of <optgroup>
function RecursiveExamplesSelectOptions(props: { examples: ExamplesType[]; level?: number }) {
  const { examples = [], level = 0 } = props

  return (
    <>
      {examples.map(example => {
        if (example.children) {
          return (
            <React.Fragment key={example.name + example.path}>
              <option value={example.path}>
                {'   '.repeat(level)}
                {example.name
                  .split(' ')
                  .map(v => {
                    const [first, ...rest] = v.split('')
                    return `${first.toUpperCase()}${rest.join('')}`
                  })
                  .join(' ')}
              </option>
              <RecursiveExamplesSelectOptions level={level + 1} examples={example.children} />
            </React.Fragment>
          )
        }

        return (
          <option key={example.path} value={example.path}>
            {'   '.repeat(level)}
            {example.name
              .split(' ')
              .map(v => {
                const [first, ...rest] = v.split('')
                return `${first.toUpperCase()}${rest.join('')}`
              })
              .join(' ')}
          </option>
        )
      })}
    </>
  )
}

export default MyApp
