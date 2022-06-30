export function __to_tree_node__(node: Node): TreeNode {
  let el = node.nodeType === Node.ELEMENT_NODE ? (node as unknown as HTMLElement) : null

  return {
    type: node.nodeType,
    tag: el?.localName,
    attributes: el
      ? Object.fromEntries(Array.from(el.attributes).map((attr) => [attr.name, attr.value]))
      : {},
    children: Array.from(node.childNodes).map((child) => window.__to_tree_node__(child)),
    value: node.nodeValue?.replace(/^\s+|\s$/g, ' ') ?? null,
  }
}

export interface TreeNode {
  type: any
  tag: string | undefined
  attributes: Record<string, string>
  children: TreeNode[]
  value: string | null
}

declare global {
  interface Window {
    __to_tree_node__: (node: Node) => TreeNode
  }
}
