import React, {
  Fragment,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,

  // Types
  ElementType,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  useRef,
  Ref,
} from 'react'

import { Props } from '../../types'
import { forwardRefWithAs, render } from '../../utils/render'
import { useId } from '../../hooks/use-id'
import { Keys } from '../keyboard'
import { isDisabledReactIssue7711 } from '../../utils/bugs'
import { Label, useLabels } from '../label/label'
import { Description, useDescriptions } from '../description/description'
import { useResolveButtonType } from '../../hooks/use-resolve-button-type'
import { useSyncRefs } from '../../hooks/use-sync-refs'

interface StateDefinition {
  switch: HTMLButtonElement | null
  setSwitch(element: HTMLButtonElement): void
  labelledby: string | undefined
  describedby: string | undefined
}

let GroupContext = createContext<StateDefinition | null>(null)
GroupContext.displayName = 'GroupContext'

// ---

let DEFAULT_GROUP_TAG = Fragment

function Group<TTag extends ElementType = typeof DEFAULT_GROUP_TAG>(props: Props<TTag>) {
  let [switchElement, setSwitchElement] = useState<HTMLButtonElement | null>(null)
  let [labelledby, LabelProvider] = useLabels()
  let [describedby, DescriptionProvider] = useDescriptions()

  let context = useMemo<StateDefinition>(
    () => ({ switch: switchElement, setSwitch: setSwitchElement, labelledby, describedby }),
    [switchElement, setSwitchElement, labelledby, describedby]
  )

  return (
    <DescriptionProvider name="Switch.Description">
      <LabelProvider
        name="Switch.Label"
        props={{
          onClick() {
            if (!switchElement) return
            switchElement.click()
            switchElement.focus({ preventScroll: true })
          },
        }}
      >
        <GroupContext.Provider value={context}>
          {render({ props, defaultTag: DEFAULT_GROUP_TAG, name: 'Switch.Group' })}
        </GroupContext.Provider>
      </LabelProvider>
    </DescriptionProvider>
  )
}

// ---

let DEFAULT_SWITCH_TAG = 'button' as const
interface SwitchRenderPropArg {
  checked: boolean
}
type SwitchPropsWeControl =
  | 'id'
  | 'role'
  | 'tabIndex'
  | 'aria-checked'
  | 'aria-labelledby'
  | 'aria-describedby'
  | 'onClick'
  | 'onKeyUp'
  | 'onKeyPress'

let SwitchRoot = forwardRefWithAs(function Switch<
  TTag extends ElementType = typeof DEFAULT_SWITCH_TAG
>(
  props: Props<TTag, SwitchRenderPropArg, SwitchPropsWeControl | 'checked' | 'onChange'> & {
    checked: boolean
    onChange(checked: boolean): void
  },
  ref: Ref<HTMLElement>
) {
  let { checked, onChange, ...passThroughProps } = props
  let id = `headlessui-switch-${useId()}`
  let groupContext = useContext(GroupContext)
  let internalSwitchRef = useRef<HTMLButtonElement | null>(null)
  let switchRef = useSyncRefs(
    internalSwitchRef,
    ref,
    // @ts-expect-error figure out the correct type here
    groupContext === null ? null : groupContext.setSwitch
  )

  let toggle = useCallback(() => onChange(!checked), [onChange, checked])
  let handleClick = useCallback(
    (event: ReactMouseEvent) => {
      if (isDisabledReactIssue7711(event.currentTarget)) return event.preventDefault()
      event.preventDefault()
      toggle()
    },
    [toggle]
  )
  let handleKeyUp = useCallback(
    (event: ReactKeyboardEvent<HTMLElement>) => {
      if (event.key !== Keys.Tab) event.preventDefault()
      if (event.key === Keys.Space) toggle()
    },
    [toggle]
  )

  // This is needed so that we can "cancel" the click event when we use the `Enter` key on a button.
  let handleKeyPress = useCallback(
    (event: ReactKeyboardEvent<HTMLElement>) => event.preventDefault(),
    []
  )

  let slot = useMemo<SwitchRenderPropArg>(() => ({ checked }), [checked])
  let propsWeControl = {
    id,
    ref: switchRef,
    role: 'switch',
    type: useResolveButtonType(props, internalSwitchRef),
    tabIndex: 0,
    'aria-checked': checked,
    'aria-labelledby': groupContext?.labelledby,
    'aria-describedby': groupContext?.describedby,
    onClick: handleClick,
    onKeyUp: handleKeyUp,
    onKeyPress: handleKeyPress,
  }

  return render({
    props: { ...passThroughProps, ...propsWeControl },
    slot,
    defaultTag: DEFAULT_SWITCH_TAG,
    name: 'Switch',
  })
})

// ---

export let Switch = Object.assign(SwitchRoot, { Group, Label, Description })
