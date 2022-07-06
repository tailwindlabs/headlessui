import { createTransitionMachine, TransitionMachine } from './state2'

it('entering', () => {
  let root = createTestMachine('root')

  expect(root.description).toEqual('container:idle, self:idle')

  root.send('enter')

  expect(root.description).toEqual('container:entering, self:ready')

  root.send('start')

  expect(root.description).toEqual('container:entering, self:running')

  root.send('stop')

  expect(root.description).toEqual('container:done, self:idle')

  expect(actions).toEqual(['root: start', 'root: stop'])

  expect(logs).toEqual([
    'root event: enter',
    'root state: idle,idle -> entering,pending',
    'root state: entering,pending -> entering,ready',
    'root action: start',
    'root event: start',
    'root state: entering,ready -> entering,running',
    'root event: stop',
    'root state: entering,running -> entering,finished',
    'root state: entering,finished -> done,idle',
    'root action: stop',
  ])
})

it('leaving', () => {
  let root = createTestMachine('root')

  expect(root.description).toEqual('container:idle, self:idle')

  root.send('leave')

  expect(root.description).toEqual('container:leaving, self:ready')

  root.send('start')

  expect(root.description).toEqual('container:leaving, self:running')

  root.send('stop')

  expect(root.description).toEqual('container:done, self:idle')

  expect(actions).toEqual(['root: start', 'root: stop'])

  // expect(logs).toEqual([
  //   'root event: leave',
  //   'root state: idle,idle -> leaving,pending',
  //   'root state: leaving,pending -> leaving,ready',
  //   'root action: start',
  //   'root event: start',
  //   'root state: leaving,ready -> leaving,running',
  //   'root event: stop',
  //   'root state: leaving,running -> leaving,finished',
  //   'root state: leaving,finished -> done,idle',
  //   'root action: stop',
  // ])
})

it('entering with children', () => {
  let root = createTestMachine('root')
  let child1 = createTestMachine('child1')
  let child2 = createTestMachine('child2')

  root.add(child1)
  root.add(child2)

  expect(root.description).toEqual('container:idle, self:idle')
  expect(child1.description).toEqual('container:idle, self:idle')
  expect(child2.description).toEqual('container:idle, self:idle')

  root.send('enter')

  expect(root.description).toEqual('container:entering, self:pending')
  expect(child1.description).toEqual('container:idle, self:idle')
  expect(child2.description).toEqual('container:idle, self:idle')

  child1.send('enter')

  expect(root.description).toEqual('container:entering, self:pending')
  expect(child1.description).toEqual('container:entering, self:pending')
  expect(child2.description).toEqual('container:idle, self:idle')

  child2.send('enter')

  expect(root.description).toEqual('container:entering, self:ready')
  expect(child1.description).toEqual('container:entering, self:ready')
  expect(child1.description).toEqual('container:entering, self:ready')

  child1.send('start') // Does nothing
  child2.send('start') // Does nothing

  expect(root.description).toEqual('container:entering, self:ready')
  expect(child1.description).toEqual('container:entering, self:ready')
  expect(child1.description).toEqual('container:entering, self:ready')

  root.send('start') // Transitions everything to running

  expect(root.description).toEqual('container:entering, self:running')
  expect(child1.description).toEqual('container:entering, self:running')
  expect(child2.description).toEqual('container:entering, self:running')

  child2.send('stop')
  root.send('stop')

  expect(root.description).toEqual('container:entering, self:finished')
  expect(child1.description).toEqual('container:entering, self:running')
  expect(child2.description).toEqual('container:entering, self:finished')

  child1.send('stop') // Everything moves to done

  expect(root.description).toEqual('container:done, self:idle')
  expect(child1.description).toEqual('container:done, self:idle')
  expect(child2.description).toEqual('container:done, self:idle')

  expect(actions).toEqual([
    'root: start',
    'child1: start',
    'child2: start',
    'child1: stop',
    'child2: stop',
    'root: stop',
  ])

  // expect(logs).toEqual([
  //   'root event: enter',
  //   'root state: idle,idle -> entering,pending',
  //   'child1 event: enter',
  //   'root event: #descendant.pending',
  //   'child1 state: idle,idle -> entering,pending',
  //   'child2 event: enter',
  //   'root event: #descendant.pending',
  //   'root event: #descendant.ready',
  //   'root state: entering,pending -> entering,ready',
  //   'root action: start',
  //   'child1 event: #descendant.ready',
  //   'child1 state: entering,pending -> entering,ready',
  //   'child1 action: start',
  //   'child2 event: #descendant.ready',
  //   'child2 state: entering,pending -> entering,ready',
  //   'child2 action: start',
  //   'child2 state: idle,idle -> entering,pending',
  //   'child1 event: start',
  //   'child2 event: start',
  //   'root event: start',
  //   'child1 event: #moveTo [object Object]',
  //   'child1 state: entering,ready -> entering,running',
  //   'child2 event: #moveTo [object Object]',
  //   'child2 state: entering,ready -> entering,running',
  //   'root state: entering,ready -> entering,running',
  //   'child2 event: stop',
  //   'root event: #descendant.stop',
  //   'child2 state: entering,running -> entering,finished',
  //   'root event: stop',
  //   'root state: entering,running -> entering,finished',
  //   'child1 event: stop',
  //   'root event: #descendant.stop',
  //   'child1 event: #moveTo [object Object]',
  //   'child1 state: entering,finished -> done,idle',
  //   'child1 action: stop',
  //   'child2 event: #moveTo [object Object]',
  //   'child2 state: entering,finished -> done,idle',
  //   'child2 action: stop',
  //   'root state: entering,finished -> done,idle',
  //   'root action: stop',

  //   // This is sus
  //   'child1 state: entering,running -> entering,finished',
  // ])
})

it('entering with children firing events in a different order', () => {
  let root = createTestMachine('root')
  let child1 = createTestMachine('child1')
  let child2 = createTestMachine('child2')

  root.add(child1)
  root.add(child2)

  expect(root.description).toEqual('container:idle, self:idle')
  expect(child1.description).toEqual('container:idle, self:idle')
  expect(child2.description).toEqual('container:idle, self:idle')

  child1.send('enter')

  expect(root.description).toEqual('container:idle, self:idle')
  expect(child1.description).toEqual('container:entering, self:pending')
  expect(child2.description).toEqual('container:idle, self:idle')

  root.send('enter')

  expect(root.description).toEqual('container:entering, self:pending')
  expect(child1.description).toEqual('container:entering, self:pending')
  expect(child2.description).toEqual('container:idle, self:idle')

  child2.send('enter')

  expect(root.description).toEqual('container:entering, self:ready')
  expect(child1.description).toEqual('container:entering, self:ready')
  expect(child1.description).toEqual('container:entering, self:ready')

  root.send('start') // Sends everything to running
  child2.send('start') // Does nothing
  child1.send('start') // Does nothing

  expect(root.description).toEqual('container:entering, self:running')
  expect(child1.description).toEqual('container:entering, self:running')
  expect(child2.description).toEqual('container:entering, self:running')

  child2.send('stop')
  root.send('stop')

  expect(root.description).toEqual('container:entering, self:finished')
  expect(child1.description).toEqual('container:entering, self:running')
  expect(child2.description).toEqual('container:entering, self:finished')

  child1.send('stop') // Everything moves to done

  expect(root.description).toEqual('container:done, self:idle')
  expect(child1.description).toEqual('container:done, self:idle')
  expect(child2.description).toEqual('container:done, self:idle')

  expect(actions).toEqual([
    'root: start',
    'child1: start',
    'child2: start',
    'child1: stop',
    'child2: stop',
    'root: stop',
  ])

  // expect(logs).toEqual([
  //   'child1 event: enter',
  //   'root event: #descendant.pending',
  //   'child1 state: idle,idle -> entering,pending',
  //   'root event: enter',
  //   'root state: idle,idle -> entering,pending',
  //   'child2 event: enter',
  //   'root event: #descendant.pending',
  //   'root event: #descendant.ready',
  //   'root state: entering,pending -> entering,ready',
  //   'root action: start',
  //   'child1 event: #descendant.ready',
  //   'child1 state: entering,pending -> entering,ready',
  //   'child1 action: start',
  //   'child2 event: #descendant.ready',
  //   'child2 state: entering,pending -> entering,ready',
  //   'child2 action: start',
  //   'child2 state: idle,idle -> entering,pending',
  //   'root event: start',
  //   'child1 event: #moveTo [object Object]',
  //   'child1 state: entering,ready -> entering,running',
  //   'child2 event: #moveTo [object Object]',
  //   'child2 state: entering,ready -> entering,running',
  //   'root state: entering,ready -> entering,running',
  //   'child2 event: start',
  //   'child1 event: start',
  //   'child2 event: stop',
  //   'root event: #descendant.stop',
  //   'child2 state: entering,running -> entering,finished',
  //   'root event: stop',
  //   'root state: entering,running -> entering,finished',
  //   'child1 event: stop',
  //   'root event: #descendant.stop',
  //   'child1 event: #moveTo [object Object]',
  //   'child1 state: entering,finished -> done,idle',
  //   'child1 action: stop',
  //   'child2 event: #moveTo [object Object]',
  //   'child2 state: entering,finished -> done,idle',
  //   'child2 action: stop',
  //   'root state: entering,finished -> done,idle',
  //   'root action: stop',

  //   // This is sus
  //   'child1 state: entering,running -> entering,finished',
  // ])
})

it('entering with nested children', () => {
  let root = createTestMachine('root')
  let child1 = createTestMachine('child1')
  let child2 = createTestMachine('child2')

  root.add(child1)
  child1.add(child2)

  expect(root.description).toEqual('container:idle, self:idle')
  expect(child1.description).toEqual('container:idle, self:idle')
  expect(child2.description).toEqual('container:idle, self:idle')

  root.send('enter')

  expect(root.description).toEqual('container:entering, self:pending')
  expect(child1.description).toEqual('container:idle, self:idle')
  expect(child2.description).toEqual('container:idle, self:idle')

  child1.send('enter')

  expect(root.description).toEqual('container:entering, self:pending')
  expect(child1.description).toEqual('container:entering, self:pending')
  expect(child2.description).toEqual('container:idle, self:idle')

  child2.send('enter')

  expect(root.description).toEqual('container:entering, self:ready')
  expect(child1.description).toEqual('container:entering, self:ready')
  expect(child1.description).toEqual('container:entering, self:ready')

  child1.send('start') // Does nothing
  child2.send('start') // Does nothing

  expect(root.description).toEqual('container:entering, self:ready')
  expect(child1.description).toEqual('container:entering, self:ready')
  expect(child1.description).toEqual('container:entering, self:ready')

  root.send('start') // Transitions everything to running

  expect(root.description).toEqual('container:entering, self:running')
  expect(child1.description).toEqual('container:entering, self:running')
  expect(child2.description).toEqual('container:entering, self:running')

  child2.send('stop')
  root.send('stop')

  expect(root.description).toEqual('container:entering, self:finished')
  expect(child1.description).toEqual('container:entering, self:running')
  expect(child2.description).toEqual('container:entering, self:finished')

  child1.send('stop') // Everything moves to done

  expect(root.description).toEqual('container:done, self:idle')
  expect(child1.description).toEqual('container:done, self:idle')
  expect(child2.description).toEqual('container:done, self:idle')

  expect(actions).toEqual([
    'root: start',
    'child1: start',
    'child2: start',
    'child2: stop',
    'child1: stop',
    'root: stop',
  ])

  // expect(logs).toEqual([
  //   'root event: enter',
  //   'root state: idle,idle -> entering,pending',
  //   'child1 event: enter',
  //   'root event: #descendant.pending',
  //   'child1 state: idle,idle -> entering,pending',
  //   'child2 event: enter',
  //   'root event: #descendant.pending',
  //   'root event: #descendant.ready',
  //   'root state: entering,pending -> entering,ready',
  //   'root action: start',
  //   'child1 event: #descendant.ready',
  //   'child1 state: entering,pending -> entering,ready',
  //   'child1 action: start',
  //   'child2 event: #descendant.ready',
  //   'child2 state: entering,pending -> entering,ready',
  //   'child2 action: start',
  //   'child2 state: idle,idle -> entering,pending',
  //   'child1 event: start',
  //   'child2 event: start',
  //   'root event: start',
  //   'child1 event: #moveTo [object Object]',
  //   'child1 state: entering,ready -> entering,running',
  //   'child2 event: #moveTo [object Object]',
  //   'child2 state: entering,ready -> entering,running',
  //   'root state: entering,ready -> entering,running',
  //   'child2 event: stop',
  //   'root event: #descendant.stop',
  //   'child2 state: entering,running -> entering,finished',
  //   'root event: stop',
  //   'root state: entering,running -> entering,finished',
  //   'child1 event: stop',
  //   'root event: #descendant.stop',
  //   'child1 event: #moveTo [object Object]',
  //   'child1 state: entering,finished -> done,idle',
  //   'child1 action: stop',
  //   'child2 event: #moveTo [object Object]',
  //   'child2 state: entering,finished -> done,idle',
  //   'child2 action: stop',
  //   'root state: entering,finished -> done,idle',
  //   'root action: stop',

  //   // This is sus
  //   'child1 state: entering,running -> entering,finished',
  // ])
})

it('leaving with children', () => {
  let root = createTestMachine('root')
  let child1 = createTestMachine('child1')
  let child2 = createTestMachine('child2')

  root.add(child1)
  root.add(child2)

  expect(root.description).toEqual('container:idle, self:idle')
  expect(child1.description).toEqual('container:idle, self:idle')
  expect(child2.description).toEqual('container:idle, self:idle')

  root.send('leave')

  expect(root.description).toEqual('container:leaving, self:pending')
  expect(child1.description).toEqual('container:idle, self:idle')
  expect(child2.description).toEqual('container:idle, self:idle')

  child1.send('leave')

  expect(root.description).toEqual('container:leaving, self:pending')
  expect(child1.description).toEqual('container:leaving, self:pending')
  expect(child2.description).toEqual('container:idle, self:idle')

  child2.send('leave')

  expect(root.description).toEqual('container:leaving, self:ready')
  expect(child1.description).toEqual('container:leaving, self:ready')
  expect(child1.description).toEqual('container:leaving, self:ready')

  child1.send('start') // Does nothing
  child2.send('start') // Does nothing

  expect(root.description).toEqual('container:leaving, self:ready')
  expect(child1.description).toEqual('container:leaving, self:ready')
  expect(child1.description).toEqual('container:leaving, self:ready')

  root.send('start') // Transitions everything to running

  expect(root.description).toEqual('container:leaving, self:running')
  expect(child1.description).toEqual('container:leaving, self:running')
  expect(child2.description).toEqual('container:leaving, self:running')

  child2.send('stop')
  root.send('stop')

  expect(root.description).toEqual('container:leaving, self:finished')
  expect(child1.description).toEqual('container:leaving, self:running')
  expect(child2.description).toEqual('container:leaving, self:finished')

  child1.send('stop') // Everything moves to done

  expect(root.description).toEqual('container:done, self:idle')
  expect(child1.description).toEqual('container:done, self:idle')
  expect(child2.description).toEqual('container:done, self:idle')

  expect(actions).toEqual([
    'root: start',
    'child1: start',
    'child2: start',
    'child1: stop',
    'child2: stop',
    'root: stop',
  ])

  expect(logs).toEqual([
    'root event: leave',
    'root state: idle,idle -> leaving,pending',
    'child1 event: leave',
    'root event: #descendant.pending',
    'child1 state: idle,idle -> leaving,pending',
    'child2 event: leave',
    'root event: #descendant.pending',
    'root event: #descendant.ready',
    'root state: leaving,pending -> leaving,ready',
    'root action: start',
    'child1 event: #descendant.ready',
    'child1 state: leaving,pending -> leaving,ready',
    'child1 action: start',
    'child2 event: #descendant.ready',
    'child2 state: leaving,pending -> leaving,ready',
    'child2 action: start',
    'child2 state: idle,idle -> leaving,pending',
    'child1 event: start',
    'child2 event: start',
    'root event: start',
    'child1 event: #moveTo [object Object]',
    'child1 state: leaving,ready -> leaving,running',
    'child2 event: #moveTo [object Object]',
    'child2 state: leaving,ready -> leaving,running',
    'root state: leaving,ready -> leaving,running',
    'child2 event: stop',
    'root event: #descendant.stop',
    'child2 state: leaving,running -> leaving,finished',
    'root event: stop',
    'root state: leaving,running -> leaving,finished',
    'child1 event: stop',
    'root event: #descendant.stop',
    'child1 event: #moveTo [object Object]',
    'child1 state: leaving,finished -> done,idle',
    'child1 action: stop',
    'child2 event: #moveTo [object Object]',
    'child2 state: leaving,finished -> done,idle',
    'child2 action: stop',
    'root state: leaving,finished -> done,idle',
    'root action: stop',

    // This is sus
    'child1 state: leaving,running -> leaving,finished',
  ])
})

/*
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
*/

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
      get: () => `container:${machine.state[0]}, self:${machine.state[1]}`,
    },
  })

  interface TestMachine extends TransitionMachine {
    readonly id: string
    readonly logs: readonly string[]
    readonly description: string
  }

  return machine as TestMachine
}
