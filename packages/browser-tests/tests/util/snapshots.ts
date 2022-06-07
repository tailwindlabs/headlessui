import { ElementHandle, Locator } from '@playwright/test'

export interface Snapshot {
  roots: TreeNode[]
  trigger: string
  recordedAt: bigint
}

export interface TreeNode {
  type: any
  tag: string | undefined
  attributes: Record<string, string>
  children: TreeNode[]
  value: string | null
}

export type Element = ElementHandle | ElementHandle[] | Locator

async function toHandles(el: Element): Promise<ElementHandle[]> {
  if ('elementHandles' in el) {
    return await el.elementHandles()
  }

  return Array.isArray(el) ? el : [el]
}

export async function takeSnapshot(root: Element, trigger: string = 'none'): Promise<Snapshot> {
  const handles = await toHandles(root)

  const roots = await Promise.all(
    handles.map((handle) => {
      return handle.evaluate((el) => {
        function toNode(node: Node): TreeNode {
          let el = node.nodeType === Node.ELEMENT_NODE ? (node as unknown as HTMLElement) : null

          return {
            type: node.nodeType,
            tag: el?.localName,
            attributes: el
              ? Object.fromEntries(Array.from(el.attributes).map((attr) => [attr.name, attr.value]))
              : {},
            children: Array.from(node.childNodes).map((child) => toNode(child)),
            value: node.nodeValue?.replace(/^\s+|\s$/g, ' '),
          }
        }

        return toNode(el)
      })
    })
  )

  return {
    roots,
    trigger,
    recordedAt: process.hrtime.bigint(),
  }
}
