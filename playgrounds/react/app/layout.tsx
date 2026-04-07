import { Suspense } from 'react'
import '../page-examples/styles.css'
import { LayoutChrome } from './layout-chrome'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head>
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />

        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="https://headlessui.dev/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="https://headlessui.dev/favicon-16x16.png"
        />
      </head>
      <body>
        <Suspense>
          <LayoutChrome>{children}</LayoutChrome>
        </Suspense>
      </body>
    </html>
  )
}
