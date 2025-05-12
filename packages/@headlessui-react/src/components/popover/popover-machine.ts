import { type MouseEventHandler } from 'react'
import { Machine } from '../../machine'
import { stackMachines } from '../../machines/stack-machine'
import * as DOM from '../../utils/dom'
import { getFocusableElements } from '../../utils/focus-management'
import { match } from '../../utils/match'

type MouseEvent<T> = Parameters<MouseEventHandler<T>>[0]

export enum PopoverStates {
  Open,
  Closed,
}

interface State {
  id: string

  popoverState: PopoverStates

  buttons: { current: Symbol[] }

  button: HTMLElement | null
  buttonId: string | null
  panel: HTMLElement | null
  panelId: string | null

  beforePanelSentinel: { current: HTMLButtonElement | null }
  afterPanelSentinel: { current: HTMLButtonElement | null }
  afterButtonSentinel: { current: HTMLButtonElement | null }

  __demoMode: boolean
}

export enum ActionTypes {
  OpenPopover,
  ClosePopover,

  SetButton,
  SetButtonId,
  SetPanel,
  SetPanelId,
}

export type Actions =
  | { type: ActionTypes.OpenPopover }
  | { type: ActionTypes.ClosePopover }
  | { type: ActionTypes.SetButton; button: HTMLElement | null }
  | { type: ActionTypes.SetButtonId; buttonId: string | null }
  | { type: ActionTypes.SetPanel; panel: HTMLElement | null }
  | { type: ActionTypes.SetPanelId; panelId: string | null }

let reducers: {
  [P in ActionTypes]: (state: State, action: Extract<Actions, { type: P }>) => State
} = {
  [ActionTypes.OpenPopover]: (state) => {
    if (state.popoverState === PopoverStates.Open) return state
    return { ...state, popoverState: PopoverStates.Open, __demoMode: false }
  },
  [ActionTypes.ClosePopover](state) {
    if (state.popoverState === PopoverStates.Closed) return state
    return { ...state, popoverState: PopoverStates.Closed, __demoMode: false }
  },
  [ActionTypes.SetButton](state, action) {
    if (state.button === action.button) return state
    return { ...state, button: action.button }
  },
  [ActionTypes.SetButtonId](state, action) {
    if (state.buttonId === action.buttonId) return state
    return { ...state, buttonId: action.buttonId }
  },
  [ActionTypes.SetPanel](state, action) {
    if (state.panel === action.panel) return state
    return { ...state, panel: action.panel }
  },
  [ActionTypes.SetPanelId](state, action) {
    if (state.panelId === action.panelId) return state
    return { ...state, panelId: action.panelId }
  },
}

export class PopoverMachine extends Machine<State, Actions> {
  static new({ id, __demoMode = false }: { id: string; __demoMode?: boolean }) {
    return new PopoverMachine({
      id,
      __demoMode,
      popoverState: __demoMode ? PopoverStates.Open : PopoverStates.Closed,
      buttons: { current: [] },
      button: null,
      buttonId: null,
      panel: null,
      panelId: null,
      beforePanelSentinel: { current: null },
      afterPanelSentinel: { current: null },
      afterButtonSentinel: { current: null },
    })
  }

  constructor(initialState: State) {
    super(initialState)

    {
      let id = this.state.id
      let stackMachine = stackMachines.get(null)

      this.on(ActionTypes.OpenPopover, () => stackMachine.actions.push(id))
      this.on(ActionTypes.ClosePopover, () => stackMachine.actions.pop(id))
    }
  }

  reduce(state: Readonly<State>, action: Actions): State {
    return match(action.type, reducers, state, action)
  }

  actions = {
    close: () => this.send({ type: ActionTypes.ClosePopover }),
    refocusableClose: (
      focusableElement?: HTMLElement | { current: HTMLElement | null } | MouseEvent<HTMLElement>
    ) => {
      this.actions.close()

      let restoreElement = (() => {
        if (!focusableElement) return this.state.button
        if (DOM.isHTMLElement(focusableElement)) return focusableElement
        if ('current' in focusableElement && DOM.isHTMLElement(focusableElement.current)) {
          return focusableElement.current
        }

        return this.state.button
      })()

      restoreElement?.focus()
    },
    open: () => this.send({ type: ActionTypes.OpenPopover }),
    setButtonId: (id: string | null) => this.send({ type: ActionTypes.SetButtonId, buttonId: id }),
    setButton: (button: HTMLElement | null) => this.send({ type: ActionTypes.SetButton, button }),
    setPanelId: (id: string | null) => this.send({ type: ActionTypes.SetPanelId, panelId: id }),
    setPanel: (panel: HTMLElement | null) => this.send({ type: ActionTypes.SetPanel, panel }),
  }

  selectors = {
    isPortalled: (state: State) => {
      if (!state.button) return false
      if (!state.panel) return false

      // We are part of a different "root" tree, so therefore we can consider it portalled. This is a
      // heuristic because 3rd party tools could use some form of portal, typically rendered at the
      // end of the body but we don't have an actual reference to that.
      for (let root of document.querySelectorAll('body > *')) {
        if (Number(root?.contains(state.button)) ^ Number(root?.contains(state.panel))) {
          return true
        }
      }

      // Use another heuristic to try and calculate whether or not the focusable
      // elements are near each other (aka, following the default focus/tab order
      // from the browser). If they are then it doesn't really matter if they are
      // portalled or not because we can follow the default tab order. But if they
      // are not, then we can consider it being portalled so that we can ensure
      // that tab and shift+tab (hopefully) go to the correct spot.
      let elements = getFocusableElements()
      let buttonIdx = elements.indexOf(state.button)

      let beforeIdx = (buttonIdx + elements.length - 1) % elements.length
      let afterIdx = (buttonIdx + 1) % elements.length

      let beforeElement = elements[beforeIdx]
      let afterElement = elements[afterIdx]

      if (!state.panel.contains(beforeElement) && !state.panel.contains(afterElement)) {
        return true
      }

      // It may or may not be portalled, but we don't really know.
      return false
    },
  }
}
