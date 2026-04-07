import fs from 'fs'
import path from 'path'
import { notFound } from 'next/navigation'
import { PageLoader } from './page-loader'

export default async function CatchAllPage({ params }: { params: Promise<{ slug: string[] }> }) {
  let { slug } = await params
  let pagePath = slug.join('/')

  let file = path.resolve(process.cwd(), 'page-examples', `${pagePath}.tsx`)
  if (!fs.existsSync(file)) {
    notFound()
  }

  return <PageLoader slug={pagePath} />
}
