import { Focus } from '../../utils/calculate-active-index'
import { ComboboxMachine, ValueMode } from './combobox-machine'

it('keeps option registration work bounded while preserving selection and navigation', async () => {
  let changes: string[] = []
  let machine = ComboboxMachine.new<string, false>({ id: 'many-options' })
  Object.assign(machine.state.dataRef.current, {
    value: 'Item 31',
    mode: ValueMode.Single,
    virtual: null,
    onChange: (value: string) => changes.push(value),
    compare: (a: unknown, b: unknown) => a === b,
    isSelected: (value: string) => value === 'Item 31',
    calculateIndex: (value: string) =>
      machine.state.options.findIndex((option) => option.dataRef.current.value === value),
    optionsPropsRef: { current: { static: false, hold: false } },
  })

  let reads = 0
  for (let index = 0; index < 64; index++) {
    machine.subscribe(
      (state) => {
        reads++
        return state.options.length
      },
      () => {}
    )
  }

  let container = document.createElement('div')
  document.body.append(container)
  let unregister: (() => void)[] = []
  try {
    reads = 0
    for (let index = 0; index < 64; index++) {
      let element = document.createElement('div')
      element.textContent = `Item ${index}`
      container.append(element)
      unregister.push(
        machine.actions.registerOption(`item-${index}`, {
          current: {
            disabled: false,
            value: `Item ${index}`,
            domRef: { current: element },
            order: null,
          },
        })
      )
    }
    await Promise.resolve()

    expect(machine.state.options).toHaveLength(64)
    expect(machine.selectors.activeOption(machine.state)).toBe('Item 31')
    let registrationReads = reads

    machine.actions.openCombobox()
    machine.actions.goToOption({ focus: Focus.Last })
    machine.actions.selectActiveOption()
    expect(changes).toEqual(['Item 63'])

    reads = 0
    for (let index = 0; index < 32; index++) unregister[index]()
    await Promise.resolve()

    expect(machine.state.options).toHaveLength(32)
    expect(machine.state.options[0].dataRef.current.value).toBe('Item 32')
    expect(machine.selectors.activeOption(machine.state)).toBe('Item 63')
    let unregistrationReads = reads

    machine.actions.goToOption({ focus: Focus.Previous })
    machine.actions.selectActiveOption()
    expect(changes).toEqual(['Item 63', 'Item 62'])

    // A group of options must not repeatedly recompute every subscription for
    // each individual item. Allow several passes without timing the machine.
    expect(registrationReads).toBeLessThanOrEqual(64 * 4)
    expect(unregistrationReads).toBeLessThanOrEqual(64 * 4)
  } finally {
    machine.dispose()
    container.remove()
  }
})

it('flushes registrations before immediate navigation and selection', () => {
  let changes: string[] = []
  let machine = ComboboxMachine.new<string, false>({ id: 'immediate-options' })
  Object.assign(machine.state.dataRef.current, {
    mode: ValueMode.Single,
    virtual: null,
    onChange: (value: string) => changes.push(value),
    optionsPropsRef: { current: { static: true, hold: false } },
  })
  for (let value of ['a', 'b', 'c']) {
    machine.actions.registerOption(value, {
      current: { disabled: false, value, domRef: { current: null }, order: value.charCodeAt(0) },
    })
  }
  machine.actions.openCombobox()
  machine.actions.goToOption({ focus: Focus.Last })
  machine.actions.selectActiveOption()
  expect(changes).toEqual(['c'])
  machine.dispose()
})

it('keeps only the final registration when options mount, unmount and remount in one commit', async () => {
  let machine = ComboboxMachine.new<string, false>({ id: 'replaced-options' })
  let changes: string[] = []
  Object.assign(machine.state.dataRef.current, {
    mode: ValueMode.Single,
    virtual: null,
    onChange: (value: string) => changes.push(value),
  })
  let register = (id: string, value: string, order: number) =>
    machine.actions.registerOption(id, {
      current: { disabled: false, value, domRef: { current: null }, order },
    })
  register('discarded', 'discarded', 0)()
  register('retained', 'old', 1)()
  register('retained', 'new', 1)
  register('last', 'last', 2)
  await Promise.resolve()

  expect(machine.state.options.map((option) => option.dataRef.current.value)).toEqual([
    'new',
    'last',
  ])
  machine.actions.openCombobox()
  machine.actions.goToOption({ focus: Focus.First })
  machine.actions.selectActiveOption()
  expect(changes).toEqual(['new'])
  machine.dispose()
})

it('falls back past disabled options after removing the active option', async () => {
  let machine = ComboboxMachine.new<string, false>({ id: 'removed-active-option' })
  let changes: string[] = []
  Object.assign(machine.state.dataRef.current, {
    mode: ValueMode.Single,
    virtual: null,
    onChange: (value: string) => changes.push(value),
  })
  let cleanups = ['a', 'b', 'c'].map((value, order) =>
    machine.actions.registerOption(value, {
      current: { disabled: value === 'a', value, domRef: { current: null }, order },
    })
  )
  machine.actions.openCombobox()
  machine.actions.goToOption({ focus: Focus.Last })
  cleanups[2]()
  await Promise.resolve()
  expect(machine.selectors.activeOption(machine.state)).toBe('b')
  machine.actions.selectActiveOption()
  expect(changes).toEqual(['b'])
  machine.dispose()
})
