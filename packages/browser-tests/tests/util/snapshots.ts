import { ElementHandle, Locator } from '@playwright/test'
import { convertToTreeNode, TreeNode } from './scripts/convertToTreeNode'

export type { TreeNode }

export interface Snapshot {
  roots: TreeNode[]
  trigger: string
  recordedAt: bigint
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

  const roots = await Promise.all(handles.map((handle) => handle.evaluate(convertToTreeNode)))

  return {
    roots,
    trigger,
    recordedAt: process.hrtime.bigint(),
  }
}
