import { useMemo } from 'react'
import { getOwnerDocument, getRootNode } from '../utils/owner'

export function useOwnerDocument(...args: Parameters<typeof getOwnerDocument>) {
  return useMemo(() => getOwnerDocument(...args), [...args])
}

export function useRootDocument(...args: Parameters<typeof getRootNode>) {
  return useMemo(() => getRootNode(...args), [...args])
}
