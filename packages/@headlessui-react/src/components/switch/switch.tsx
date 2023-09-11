import React, {
  createContext,
  ElementType,
  Fragment,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  Ref,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { useControllable } from '../../hooks/use-controllable'
import { useDisposables } from '../../hooks/use-disposables'
import { useEvent } from '../../hooks/use-event'
import { useId } from '../../hooks/use-id'
import { useResolveButtonType } from '../../hooks/use-resolve-button-type'
import { useSyncRefs } from '../../hooks/use-sync-refs'
import { Features as HiddenFeatures, Hidden } from '../../internal/hidden'
import { Props } from '../../types'
import { isDisabledReactIssue7711 } from '../../utils/bugs'
import { attemptSubmit } from '../../utils/form'
import { compact, forwardRefWithAs, HasDisplayName, RefProp, render } from '../../utils/render'
import {
  Description,
  useDescriptions,
  _internal_ComponentDescription,
} from '../description/description'
import { Keys } from '../keyboard'
import { Label, useLabels, _internal_ComponentLabel } from '../label/label'

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

export type SwitchGroupProps<TTag extends ElementType> = Props<TTag>

function GroupFn<TTag extends ElementType = typeof DEFAULT_GROUP_TAG>(
  props: SwitchGroupProps<TTag>
) {
  let [switchElement, setSwitchElement] = useState<HTMLButtonElement | null>(null)
  let [labelledby, LabelProvider] = useLabels()
  let [describedby, DescriptionProvider] = useDescriptions()

  let context = useMemo<StateDefinition>(
    () => ({ switch: switchElement, setSwitch: setSwitchElement, labelledby, describedby }),
    [switchElement, setSwitchElement, labelledby, describedby]
  )

  let ourProps = {}
  let theirProps = props

  return (
    <DescriptionProvider name="Switch.Description">
      <LabelProvider
        name="Switch.Label"
        props={{
          htmlFor: context.switch?.id,
          onClick(event: React.MouseEvent<HTMLLabelElement>) {
            if (!switchElement) return
            if (event.currentTarget.tagName === 'LABEL') {
              event.preventDefault()
            }
            switchElement.click()
            switchElement.focus({ preventScroll: true })
          },
        }}
      >
        <GroupContext.Provider value={context}>
          {render({
            ourProps,
            theirProps,
            defaultTag: DEFAULT_GROUP_TAG,
            name: 'Switch.Group',
          })}
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
  | 'aria-checked'
  | 'aria-describedby'
  | 'aria-labelledby'
  | 'role'
  | 'tabIndex'

export type SwitchProps<TTag extends ElementType> = Props<
  TTag,
  SwitchRenderPropArg,
  SwitchPropsWeControl,
  {
    checked?: boolean
    defaultChecked?: boolean
    onChange?(checked: boolean): void
    name?: string
    value?: string
    form?: string
  }
>

function SwitchFn<TTag extends ElementType = typeof DEFAULT_SWITCH_TAG>(
  props: SwitchProps<TTag>,
  ref: Ref<HTMLButtonElement>
) {
  let internalId = useId()
  let {
    id = `headlessui-switch-${internalId}`,
    checked: controlledChecked,
    defaultChecked = false,
    onChange: controlledOnChange,
    name,
    value,
    form,
    ...theirProps
  } = props
  let groupContext = useContext(GroupContext)
  let internalSwitchRef = useRef<HTMLButtonElement | null>(null)
  let switchRef = useSyncRefs(
    internalSwitchRef,
    ref,
    groupContext === null ? null : groupContext.setSwitch
  )

  let [checked, onChange] = useControllable(controlledChecked, controlledOnChange, defaultChecked)

  let toggle = useEvent(() => onChange?.(!checked))
  let handleClick = useEvent((event: ReactMouseEvent) => {
    if (isDisabledReactIssue7711(event.currentTarget)) return event.preventDefault()
    event.preventDefault()
    toggle()
  })
  let handleKeyUp = useEvent((event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === Keys.Space) {
      event.preventDefault()
      toggle()
    } else if (event.key === Keys.Enter) {
      attemptSubmit(event.currentTarget)
    }
  })

  // This is needed so that we can "cancel" the click event when we use the `Enter` key on a button.
  let handleKeyPress = useEvent((event: ReactKeyboardEvent<HTMLElement>) => event.preventDefault())

  let slot = useMemo<SwitchRenderPropArg>(() => ({ checked }), [checked])
  let ourProps = {
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

  let d = useDisposables()
  useEffect(() => {
    let form = internalSwitchRef.current?.closest('form')
    if (!form) return
    if (defaultChecked === undefined) return

    d.addEventListener(form, 'reset', () => {
      onChange(defaultChecked)
    })
  }, [internalSwitchRef, onChange /* Explicitly ignoring `defaultValue` */])

  return (
    <>
      {name != null && checked && (
        <Hidden
          features={HiddenFeatures.Hidden}
          {...compact({
            as: 'input',
            type: 'checkbox',
            hidden: true,
            readOnly: true,
            form,
            checked,
            name,
            value,
          })}
        />
      )}
      {render({ ourProps, theirProps, slot, defaultTag: DEFAULT_SWITCH_TAG, name: 'Switch' })}
    </>
  )
}

// ---

export interface _internal_ComponentSwitch extends HasDisplayName {
  <TTag extends ElementType = typeof DEFAULT_SWITCH_TAG>(
    props: SwitchProps<TTag> & RefProp<typeof SwitchFn>
  ): JSX.Element
}

export interface _internal_ComponentSwitchGroup extends HasDisplayName {
  <TTag extends ElementType = typeof DEFAULT_GROUP_TAG>(
    props: SwitchGroupProps<TTag> & RefProp<typeof GroupFn>
  ): JSX.Element
}

export interface _internal_ComponentSwitchLabel extends _internal_ComponentLabel {}
export interface _internal_ComponentSwitchDescription extends _internal_ComponentDescription {}

let SwitchRoot = forwardRefWithAs(SwitchFn) as unknown as _internal_ComponentSwitch
let Group = GroupFn as unknown as _internal_ComponentSwitchGroup

export let Switch = Object.assign(SwitchRoot, {
  Group,
  Label: Label as _internal_ComponentSwitchLabel,
  Description: Description as _internal_ComponentSwitchDescription,
})
