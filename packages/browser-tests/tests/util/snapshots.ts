import { ElementHandle, Locator } from '@playwright/test'
import prettyFormat from 'pretty-format'
import { PlaywrightPlugin } from './printing'
import { type TreeNode } from './scripts/convertToTreeNode'
import { diffSnapshots } from './snapshot-diff'

export type { TreeNode }

export class Snapshot {
  public readonly root: TreeNode
  public readonly trigger: string
  public readonly recordedAt: bigint

  private _preview: string

  constructor(root: TreeNode, trigger: string) {
    this.root = root
    this.trigger = trigger
    this.recordedAt = process.hrtime.bigint()

    Object.defineProperty(this, '_preview', {
      value: undefined,
      enumerable: false,
    })
  }

  static async log(root: Element) {
    const snapshot = await Snapshot.take(root)

    console.log(snapshot.toString(true))
  }

  static fromTree(node: TreeNode, trigger: string = 'none') {
    return new Snapshot(node, trigger)
  }

  static async take(el: Element, trigger: string = 'none'): Promise<Snapshot> {
    const handle = 'elementHandle' in el ? await el.elementHandle() : el
    const root = await handle.evaluate((el) => window.__to_tree_node__(el))

    return new Snapshot(root, trigger)
  }

  toString(highlight = false) {
    if (!this._preview) {
      this._preview = prettyFormat(this.root, {
        plugins: [new PlaywrightPlugin()],
        highlight,
      })
    }

    return this._preview
  }

  diffWithPrevious(prev: Snapshot): string {
    return diffSnapshots(prev, this)
  }
}

export type Element = ElementHandle | Locator
