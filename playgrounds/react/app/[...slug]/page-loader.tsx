'use client'

import dynamic from 'next/dynamic'
import { notFound } from 'next/navigation'

export function PageLoader({ slug }: { slug: string }) {
  let Component = dynamic(() => import(`../../page-examples/${slug}`))

  if (!Component) {
    notFound()
  }

  return <Component />
}
