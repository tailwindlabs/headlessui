// WAI-ARIA: https://www.w3.org/WAI/ARIA/apg/patterns/modalmodal/
import React, {
  useCallback,
  useMemo,
  useRef,
  type ElementType,
  type MutableRefObject,
  type Ref,
  type RefObject,
} from 'react'
import { FocusTrap, FocusTrapFeatures } from '../components/focus-trap/focus-trap'
import { Portal, useNestedPortals } from '../components/portal/portal'
import { useDocumentOverflowLockedEffect } from '../hooks/document-overflow/use-document-overflow'
import { useId } from '../hooks/use-id'
import { useInert } from '../hooks/use-inert'
import { useOwnerDocument } from '../hooks/use-owner'
import { useRootContainers } from '../hooks/use-root-containers'
import { useSyncRefs } from '../hooks/use-sync-refs'
import { HoistFormFields } from '../internal/form-fields'
import type { Props } from '../types'
import {
  RenderFeatures,
  forwardRefWithAs,
  render,
  type HasDisplayName,
  type PropsForFeatures,
  type RefProp,
} from '../utils/render'
import { ForcePortalRoot } from './portal-force-root'

function useScrollLock(
  ownerDocument: Document | null,
  enabled: boolean,
  resolveAllowedContainers: () => HTMLElement[] = () => [document.body]
) {
  useDocumentOverflowLockedEffect(ownerDocument, enabled, (meta) => ({
    containers: [...(meta.containers ?? []), resolveAllowedContainers],
  }))
}

export enum ModalFeatures {
  /** No modal features */
  None = 0,

  /** Make the whole page but the Modal `inert` */
  Inert = 1 << 0,

  /** Enable scroll locking to prevent scrolling the rest off the page (the body) */
  ScrollLock = 1 << 1,

  /**
   * Enable focus trapping, focus trapping features can be configured via the `focusTrapFeatures`
   * prop
   */
  FocusTrap = 1 << 2,

  All = Inert | ScrollLock | FocusTrap,
}

// ---

let DEFAULT_MODAL_TAG = 'div' as const
type ModalRenderPropArg = {}
type ModalPropsWeControl = 'aria-dialog'

let ModalRenderFeatures = RenderFeatures.RenderStrategy | RenderFeatures.Static

export type ModalProps<TTag extends ElementType = typeof DEFAULT_MODAL_TAG> = Props<
  TTag,
  ModalRenderPropArg,
  ModalPropsWeControl,
  PropsForFeatures<typeof ModalRenderFeatures> & {
    enabled?: boolean
    features?: ModalFeatures
    focusTrapFeatures?: FocusTrapFeatures
    initialFocus?: MutableRefObject<HTMLElement | null>
    role?: 'dialog' | 'alertdialog'
  }
>

function ModalFn<TTag extends ElementType = typeof DEFAULT_MODAL_TAG>(
  props: ModalProps<TTag>,
  ref: Ref<HTMLDivElement>
) {
  let internalId = useId()
  let {
    id = `headlessui-modal-${internalId}`,
    initialFocus,
    role = 'dialog',
    features = ModalFeatures.All,
    enabled = true,
    focusTrapFeatures = FocusTrapFeatures.All,
    ...theirProps
  } = props

  if (!enabled) {
    features = ModalFeatures.None
  }

  let didWarnOnRole = useRef(false)

  role = (function () {
    if (role === 'dialog' || role === 'alertdialog') {
      return role
    }

    if (!didWarnOnRole.current) {
      didWarnOnRole.current = true
      console.warn(
        `Invalid role [${role}] passed to <Modal />. Only \`dialog\` and and \`alertdialog\` are supported. Using \`dialog\` instead.`
      )
    }

    return 'dialog'
  })()

  let internalModalRef = useRef<HTMLDivElement | null>(null)
  let modalRef = useSyncRefs(internalModalRef, ref)

  let ownerDocument = useOwnerDocument(internalModalRef)

  let [portals, PortalWrapper] = useNestedPortals()

  // We use this because reading these values during iniital render(s)
  // can result in `null` rather then the actual elements
  let defaultContainer: RefObject<HTMLElement> = {
    get current() {
      return internalModalRef.current
    },
  }

  let {
    resolveContainers: resolveRootContainers,
    mainTreeNodeRef,
    MainTreeNode,
  } = useRootContainers({
    portals,
    defaultContainers: [defaultContainer],
  })

  // Ensure other elements can't be interacted with
  let resolveRootOfMainTreeNode = useCallback(() => {
    return (Array.from(ownerDocument?.querySelectorAll('body > *') ?? []).find((root) => {
      // Skip the portal root, we don't want to make that one inert
      if (root.id === 'headlessui-portal-root') return false

      // Find the root of the main tree node
      return root.contains(mainTreeNodeRef.current) && root instanceof HTMLElement
    }) ?? null) as HTMLElement | null
  }, [mainTreeNodeRef])
  useInert(resolveRootOfMainTreeNode, Boolean(features & ModalFeatures.Inert))

  // This would mark the parent modals as inert
  let resolveRootOfParentModal = useCallback(() => {
    return (Array.from(ownerDocument?.querySelectorAll('[data-headlessui-portal]') ?? []).find(
      (root) => root.contains(mainTreeNodeRef.current) && root instanceof HTMLElement
    ) ?? null) as HTMLElement | null
  }, [mainTreeNodeRef])
  useInert(resolveRootOfParentModal, Boolean(features & ModalFeatures.Inert))

  // Scroll lock
  useScrollLock(ownerDocument, Boolean(features & ModalFeatures.ScrollLock), resolveRootContainers)

  let slot = useMemo(() => ({}) satisfies ModalRenderPropArg, [])

  let ourProps = {
    ref: modalRef,
    id,
    role,
    'aria-modal': enabled || undefined,
  }

  return (
    <>
      <ForcePortalRoot force={true}>
        <Portal>
          <FocusTrap
            initialFocus={initialFocus}
            containers={resolveRootContainers}
            features={
              Boolean(features & ModalFeatures.FocusTrap)
                ? focusTrapFeatures
                : FocusTrapFeatures.None
            }
          >
            <ForcePortalRoot force={false}>
              <PortalWrapper>
                {render({
                  ourProps,
                  theirProps,
                  slot,
                  defaultTag: DEFAULT_MODAL_TAG,
                  features: ModalRenderFeatures,
                  name: 'Modal',
                })}
              </PortalWrapper>
            </ForcePortalRoot>
          </FocusTrap>
        </Portal>
      </ForcePortalRoot>
      <HoistFormFields>
        <MainTreeNode />
      </HoistFormFields>
    </>
  )
}

// ---

export interface _internal_ComponentModal extends HasDisplayName {
  <TTag extends ElementType = typeof DEFAULT_MODAL_TAG>(
    props: ModalProps<TTag> & RefProp<typeof ModalFn>
  ): JSX.Element
}

let ModalRoot = forwardRefWithAs(ModalFn) as unknown as _internal_ComponentModal

export let Modal = Object.assign(ModalRoot, {})
