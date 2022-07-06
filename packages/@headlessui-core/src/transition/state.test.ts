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

  expect(logs).toEqual([
    'root event: enter',
    'root action: start',
    'root state: idle,idle,idle -> entering,idle,idle',
    'root event: start',
    'root state: entering,idle,idle -> entering,running,idle',
    'root event: stop',
    'root action: stop',
    'root state: entering,running,idle -> done,idle,idle',
  ])
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

  expect(logs).toEqual([
    'root event: leave',
    'root action: start',
    'root state: idle,idle,idle -> leaving,idle,idle',
    'root event: start',
    'root state: leaving,idle,idle -> leaving,running,idle',
    'root event: stop',
    'root action: stop',
    'root state: leaving,running,idle -> done,idle,idle',
  ])
})

it('entering with children', () => {
  let root = createTestMachine('root')
  let child1 = createTestMachine('child-1')

  root.add(child1)

  expect(root.description).toEqual('container:idle, self:idle, children:idle')

  root.send('enter')
  child1.send('enter')

  expect(root.description).toEqual('container:entering, self:idle, children:idle')

  root.send('start')

  expect(root.description).toEqual('container:entering, self:running, children:idle')

  root.send('stop')

  expect(root.description).toEqual('container:entering, self:waiting_for_children, children:idle')

  child1.send('start')

  expect(root.description).toEqual(
    'container:entering, self:waiting_for_children, children:all_running'
  )

  child1.send('stop')

  expect(root.description).toEqual('container:done, self:idle, children:idle')

  expect(logs).toEqual([
    'root event: #child.add child-1',
    'child-1 event: #child.become root',
    'root event: enter',
    'root action: start',
    'root state: idle,idle,idle -> entering,idle,idle',
    'child-1 event: enter',
    'child-1 action: start',
    'child-1 state: idle,idle,idle -> entering,idle,idle',
    'root event: start',
    'root state: entering,idle,idle -> entering,running,idle',
    'root event: stop',
    'root state: entering,running,idle -> entering,waiting_for_children,idle',
    'child-1 event: start',
    'root event: #child.start',
    'root state: entering,waiting_for_children,idle -> entering,waiting_for_children,all_running',
    'child-1 state: entering,idle,idle -> entering,running,idle',
    'child-1 event: stop',
    'child-1 action: stop',
    'root event: #child.stop',
    'root action: stop',
    'root state: entering,waiting_for_children,all_running -> done,idle,idle',
    'root action: stop',
    'child-1 state: entering,running,idle -> done,idle,idle',
  ])
})

it('leaving with children', () => {
  let root = createTestMachine('root')
  let child1 = createTestMachine('child-1')

  root.add(child1)

  expect(root.description).toEqual('container:idle, self:idle, children:idle')

  root.send('leave')
  child1.send('leave')

  expect(root.description).toEqual('container:leaving, self:idle, children:idle')

  root.send('start')

  expect(root.description).toEqual('container:leaving, self:running, children:idle')

  child1.send('start')

  expect(root.description).toEqual('container:leaving, self:running, children:all_running')

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

  expect(root.description).toEqual('container:leaving, self:idle, children:idle')

  root.send('start')

  expect(root.description).toEqual('container:leaving, self:running, children:idle')

  child1.send('start')

  root.add(child2)

  child1.send('stop')

  expect(root.description).toEqual('container:leaving, self:running, children:all_running')

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

  expect(root.description).toEqual('container:leaving, self:idle, children:idle')

  root.send('start')

  expect(root.description).toEqual('container:leaving, self:running, children:idle')

  child1.send('start')

  expect(root.description).toEqual('container:leaving, self:running, children:all_running')

  child11.send('start')
  child11.send('stop')

  expect(root.description).toEqual('container:leaving, self:running, children:all_running')

  child1.send('stop')

  expect(root.description).toEqual('container:leaving, self:running, children:waiting_for_self')

  root.send('stop')

  expect(root.description).toEqual('container:done, self:idle, children:idle')
})

// Really we want to delay the sending of events right?
// Or do we want to delay when the actions run…

it('start events run in parent -> child order', () => {
  let root = createTestMachine('root')
  let child1 = createTestMachine('child-1')
  let child2 = createTestMachine('child-2')

  root.add(child1)
  root.add(child2)

  child1.send('enter')
  child2.send('enter')
  root.send('enter')

  child1.send('start')
  child1.send('stop')

  root.send('start')
  root.send('stop')

  child2.send('start')
  child2.send('stop')

  expect(actions).toEqual([
    'child-1: start',
    'child-2: start',
    'root: start',
    'child-1: stop',
    'child-2: stop',
    'root: stop',
  ])
})

it('cancellation weirdness', () => {
  let root = createTestMachine('root')
  let child1 = createTestMachine('child-1')

  root.add(child1)
  child1.send('enter')
  child1.send('start')
  child1.send('leave')
  child1.send('start')
  child1.send('cancel')
  root.send('reset')
  child1.send('reset')
  child1.send('stop')

  expect(actions).toEqual([
    'child-1: start',
    'child-2: start',
    'root: start',
    'child-1: stop',
    'child-2: stop',
    'root: stop',
  ])
})

//
// Helpers
//

let logs: string[] = []
let actions: string[] = []

beforeEach(() => {
  logs = []
  actions = []
})

function createTestMachine(id: string) {
  function log(message: string) {
    logs.push(`${id} ${message}`)

    if (message.includes('action:')) {
      actions.push(`${id} ${message}`.replace(' action:', ':'))
    }
  }

  let machine = createTransitionMachine(id, {
    onStart: () => log(`action: start`),
    onStop: () => log(`action: stop`),
    onCancel: () => log(`action: cancel`),

    onChange: (previous, current) =>
      log(`state: ${previous.toString()} -> ${current.toString()}`.trim()),

    onEvent: (event, payload) => log(`event: ${event} ${payload?.id ?? payload ?? ''}`.trim()),
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
