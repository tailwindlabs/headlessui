import fs from 'fs'
import path from 'path'
import prettier from 'prettier'
import * as HUI from '../packages/@headlessui-react/src/index.ts'

let customRemaps = {
  tab: 'tabs',
  radio: 'radio-group',
  data: 'data-interactive',
  focus: 'focus-trap',
}

let components = Object.keys(HUI)

async function run() {
  for (let component of components) {
    let name = component.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
    let module = name.split('-')[0]
    module = customRemaps[module] ?? module

    let filePath = path.resolve(
      __dirname,
      '..',
      'packages',
      '@headlessui-react',
      'src',
      'components',
      name,
      `${name}.tsx`
    )

    // Main module path already exists
    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true })
      fs.writeFileSync(filePath, await template(component, module))
    }
  }
}

async function template(name, module) {
  return await prettier.format(
    [
      '// Next.js barrel file improvements (GENERATED FILE)',
      `export type * from '../${module}/${module}';`,
      `export { ${name} } from '../${module}/${module}';`,
    ].join('\n'),
    { parser: 'typescript' }
  )
}

run()
