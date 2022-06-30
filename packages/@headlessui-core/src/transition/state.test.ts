import { createTransitionMachine, TransitionMachine } from './state'

it('entering', () => {
  let root = createTestMachine('root')

  expect(root.description).toEqual('container:idle, self:idle, children:idle')

  root.send('enter')

  expect(root.description).toEqual('container:entering, self:idle, children:idle')

  root.send('start')

  expect(root.description).toEqual('container:entering, self:running, children:idle')

  root.send('stop')

  expect(root.description).toEqual('container:done, self:idle, children:idle')
})

it('leaving', () => {
  let root = createTestMachine('root')

  expect(root.description).toEqual('container:idle, self:idle, children:idle')

  root.send('leave')

  expect(root.description).toEqual('container:leaving, self:idle, children:idle')

  root.send('start')

  expect(root.description).toEqual('container:leaving, self:running, children:idle')

  root.send('stop')

  expect(root.description).toEqual('container:done, self:idle, children:idle')
})

it('entering with children', () => {
  let root = createTestMachine('root')
  let child1 = createTestMachine('child-1')

  root.add(child1)

  expect(root.description).toEqual('container:idle, self:idle, children:idle')

  root.send('enter')
  child1.send('enter')

  expect(root.description).toEqual('container:entering, self:idle, children:running')

  root.send('start')

  expect(root.description).toEqual('container:entering, self:running, children:running')

  root.send('stop')

  expect(root.description).toEqual('container:entering, self:waiting_for_children, children:running')

  child1.send('start')

  expect(root.description).toEqual('container:entering, self:waiting_for_children, children:running')

  child1.send('stop')

  expect(root.description).toEqual('container:done, self:idle, children:idle')
})

it('leaving with children', () => {
  let root = createTestMachine('root')
  let child1 = createTestMachine('child-1')

  root.add(child1)

  expect(root.description).toEqual('container:idle, self:idle, children:idle')

  root.send('leave')
  child1.send('leave')

  expect(root.description).toEqual('container:leaving, self:idle, children:running')

  root.send('start')

  expect(root.description).toEqual('container:leaving, self:running, children:running')

  child1.send('start')

  expect(root.description).toEqual('container:leaving, self:running, children:running')

  child1.send('stop')

  expect(root.description).toEqual('container:leaving, self:running, children:waiting_for_self')

  root.send('stop')

  expect(root.description).toEqual('container:done, self:idle, children:idle')
})

it('leaving with children added while waiting for other children', () => {
  let root = createTestMachine('root')
  let child1 = createTestMachine('child-1')
  let child2 = createTestMachine('child-2')

  root.add(child1)

  expect(root.description).toEqual('container:idle, self:idle, children:idle')

  root.send('leave')
  child1.send('leave')
  child2.send('leave')

  expect(root.description).toEqual('container:leaving, self:idle, children:running')

  root.send('start')

  expect(root.description).toEqual('container:leaving, self:running, children:running')

  child1.send('start')

  root.add(child2)

  child1.send('stop')

  expect(root.description).toEqual('container:leaving, self:running, children:running')

  child2.send('start')
  child2.send('stop')

  expect(root.description).toEqual('container:leaving, self:running, children:waiting_for_self')

  root.send('stop')

  expect(root.description).toEqual('container:done, self:idle, children:idle')
})

it('waiting on nested children', () => {
  let root = createTestMachine('root')
  let child1 = createTestMachine('child-1')
  let child11 = createTestMachine('child-1-1')

  root.add(child1)
  child1.add(child11)

  expect(root.description).toEqual('container:idle, self:idle, children:idle')

  root.send('leave')
  child1.send('leave')
  child11.send('leave')

  expect(root.description).toEqual('container:leaving, self:idle, children:running')

  root.send('start')

  expect(root.description).toEqual('container:leaving, self:running, children:running')

  child1.send('start')

  expect(root.description).toEqual('container:leaving, self:running, children:running')

  child11.send('start')
  child11.send('stop')

  expect(root.description).toEqual('container:leaving, self:running, children:running')

  child1.send('stop')

  expect(root.description).toEqual('container:leaving, self:running, children:waiting_for_self')

  root.send('stop')

  expect(root.description).toEqual('container:done, self:idle, children:idle')
})

//
// Helpers
//

let logs: string[] = []

beforeEach(() => {
  logs = []
})

function createTestMachine(id: string) {
  let machine = createTransitionMachine(id, {
    onStart: () => logs.push(`onStart ${id}`),
    onStop: () => logs.push(`onStop ${id}`),
    onCancel: () => logs.push(`onCancel ${id}`),

    onChange: (previous, current) =>
      logs.push(`onChange ${id}: ${previous.toString()} -> ${current.toString()}`),

    onEvent: (event, payload) =>
      logs.push(`onEvent ${id}: ${event} ${payload?.id ?? payload ?? ''}`),
  })

  Object.defineProperties(machine, {
    id: { get: () => id },
    logs: { get: () => [...logs] },
    description: {
      get: () =>
        `container:${machine.state[0]}, self:${machine.state[1]}, children:${machine.state[2]}`,
    },
  })

  interface TestMachine extends TransitionMachine {
    readonly id: string
    readonly logs: readonly string[]
    readonly description: string
  }

  return machine as TestMachine
}
