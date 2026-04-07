import fs from 'fs'
import path from 'path'
export type ExamplesType = {
  name: string
  path: string
  children?: ExamplesType[]
}

export async function resolveAllExamples(...paths: string[]) {
  let base = path.resolve(process.cwd(), ...paths)

  if (!fs.existsSync(base)) {
    return false
  }

  let files = await fs.promises.readdir(base, { withFileTypes: true })
  let items: ExamplesType[] = []

  for (let file of files) {
    if (file.name === '.DS_Store') {
      continue
    }

    // Skip reserved/internal files
    if (file.name.startsWith('_')) {
      continue
    }

    // Skip non-page files
    if (file.name === 'styles.css') {
      continue
    }

    let bucket: ExamplesType = {
      name: file.name.replace(/-/g, ' ').replace(/\.tsx?/g, ''),
      path: [...paths, file.name]
        .join('/')
        .replace(/^page-examples/, '')
        .replace(/\.tsx?/g, '')
        .replace(/\/+/g, '/'),
    }

    if (file.isDirectory()) {
      let children = await resolveAllExamples(...paths, file.name)

      if (children) {
        bucket.children = children
      }
    }

    items.push(bucket)
  }

  return items
}
