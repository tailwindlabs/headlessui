export function convertToTreeNode(el: Node) {
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
}

export interface TreeNode {
  type: any
  tag: string | undefined
  attributes: Record<string, string>
  children: TreeNode[]
  value: string | null
}
