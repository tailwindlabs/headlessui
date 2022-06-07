import {
  printChildren,
  printComment,
  printElement,
  printElementAsLeaf,
  printProps,
  printText,
} from 'pretty-format/build/plugins/lib/markup'
import prettyFormat from 'pretty-format'
import { Locator } from '@playwright/test'
import type { Config, NewPlugin, Refs } from 'pretty-format'
import type { Printer } from 'pretty-format/build/types'
import { Element, Snapshot, takeSnapshot, TreeNode } from './snapshots'

function* dropWhile<T>(arr: Iterable<T>, shouldDrop: (val: T) => boolean): Iterable<T> {
  let predicateHasFailed = false

  for (const item of arr) {
    if (shouldDrop(item) && !predicateHasFailed) {
      continue
    }

    predicateHasFailed = true
    yield item
  }
}

const isText = (node: TreeNode) => node.type === 3
const isComment = (node: TreeNode) => node.type === 8
const isEmptyText = (node: TreeNode) => isText(node) && (node.value === '' || node.value === ' ')

export class PlaywrightPlugin implements NewPlugin {
  serialize(
    node: TreeNode,
    config: Config,
    indentation: string,
    depth: number,
    refs: Refs,
    printer: Printer
  ): string {
    if (isText(node)) {
      return printText(node.value, config)
    }

    if (isComment(node)) {
      return printComment(node.value, config)
    }

    if (++depth > config.maxDepth) {
      return printElementAsLeaf(node.tag, config)
    }

    // Remove leading/trailing empty text nodes
    let children = node.children.slice()
    children = Array.from(dropWhile(children, isEmptyText))
    children = Array.from(dropWhile(children.reverse(), isEmptyText)).reverse()

    return printElement(
      node.tag,
      printProps(
        Object.keys(node.attributes).sort(),
        node.attributes,
        config,
        indentation + config.indent,
        depth,
        refs,
        printer
      ),
      printChildren(children, config, indentation + config.indent, depth, refs, printer),
      config,
      indentation
    )
  }

  test(val: any): val is Locator {
    return typeof val === 'object' && 'tag' in val
  }
}

export async function prettyPrint(el: Element | Snapshot) {
  const tree = 'roots' in el ? el : await takeSnapshot(el)

  for (const root of tree.roots) {
    console.log(
      prettyFormat(root, {
        plugins: [new PlaywrightPlugin()],
        highlight: true,
      })
    )
  }
}
