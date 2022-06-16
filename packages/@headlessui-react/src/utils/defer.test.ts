import { DeferredNode } from './defer'

test('I can resolve top-level deferred nodes', () => {
  let events: string[] = []

  let d0 = new DeferredNode(() => events.push('d0'))
  let d01 = new DeferredNode(() => events.push('d01'))

  d0.resolve()
  d01.resolve()

  expect(events).toEqual(['d0', 'd01'])
})

test('I can resolve deferred nodes with children in top-down order', () => {
  let events: string[] = []

  let d0 = new DeferredNode(() => events.push('d0'))
  let d01 = new DeferredNode(() => events.push('d01'))
  d0.add(d01)

  d0.resolve()
  d01.resolve()

  expect(events).toEqual(['d01', 'd0'])
})

test('I can resolve deferred nodes with children in bottom-up order', () => {
  let events: string[] = []

  let d0 = new DeferredNode(() => events.push('d0'))
  let d01 = new DeferredNode(() => events.push('d01'))
  d0.add(d01)

  d01.resolve()
  d0.resolve()

  expect(events).toEqual(['d01', 'd0'])
})

test('I can resolve deferred nodes with multiple children', () => {
  let events: string[] = []

  let root = new DeferredNode(() => events.push('root'))
  let c1 = new DeferredNode(() => events.push('c1'))
  let c11 = new DeferredNode(() => events.push('c11'))
  let c12 = new DeferredNode(() => events.push('c12'))
  let c2 = new DeferredNode(() => events.push('c2'))
  let c21 = new DeferredNode(() => events.push('c21'))
  let c22 = new DeferredNode(() => events.push('c22'))

  root.add(c1)
  root.add(c2)
  c1.add(c11)
  c1.add(c12)
  c2.add(c21)
  c2.add(c22)

  root.resolve()
  c12.resolve()
  c22.resolve()
  c1.resolve()
  c2.resolve()
  c21.resolve()
  c11.resolve()

  expect(events).toEqual(['c12', 'c22', 'c21', 'c2', 'c11', 'c1', 'root'])
})

test('I can reset deferred nodes', () => {
  let events: string[] = []

  let root = new DeferredNode(() => events.push('root'))
  let c1 = new DeferredNode(() => events.push('c1'))
  let c11 = new DeferredNode(() => events.push('c11'))
  let c12 = new DeferredNode(() => events.push('c12'))
  let c2 = new DeferredNode(() => events.push('c2'))
  let c21 = new DeferredNode(() => events.push('c21'))
  let c22 = new DeferredNode(() => events.push('c22'))

  root.add(c1)
  root.add(c2)
  c1.add(c11)
  c1.add(c12)
  c2.add(c21)
  c2.add(c22)

  root.resolve()
  c12.resolve()
  c22.resolve()
  c1.resolve()
  c22.reset()
  c2.resolve()
  c21.resolve()
  c11.resolve()

  expect(events).toEqual(['c12', 'c22', 'c21', 'c11', 'c1'])

  c22.resolve()

  expect(events).toEqual(['c12', 'c22', 'c21', 'c11', 'c1', 'c22', 'c2', 'root'])
})

test('I can debug deferred nodes', () => {
  let events: string[] = []

  let root = new DeferredNode(() => events.push('root'))
  let c1 = new DeferredNode(() => events.push('c1'))
  let c11 = new DeferredNode(() => events.push('c11'))
  let c12 = new DeferredNode(() => events.push('c12'))
  let c2 = new DeferredNode(() => events.push('c2'))
  let c21 = new DeferredNode(() => events.push('c21'))
  let c22 = new DeferredNode(() => events.push('c22'))

  root.add(c1)
  root.add(c2)
  c1.add(c11)
  c1.add(c12)
  c2.add(c21)
  c2.add(c22)

  root.resolve()
  c12.resolve()
  c22.resolve()
  c1.resolve()
  c22.reset()
  c2.resolve()
  c21.resolve()
  c11.resolve()

  expect(events).toEqual(['c12', 'c22', 'c21', 'c11', 'c1'])

  expect(root.debugDescription('  ')).toEqual(
    `<Node> [settled] (2 still waiting)
  <Node> [settled] (2 done)
    <Node> [settled]
    <Node> [settled]
  <Node> [settled] (2 still waiting)
    <Node> [settled]
    <Node> [pending]`
  )

  c22.resolve()

  expect(events).toEqual(['c12', 'c22', 'c21', 'c11', 'c1', 'c22', 'c2', 'root'])

  expect(root.debugDescription('  ')).toEqual(
    `<Node> [settled] (2 done)
  <Node> [settled] (2 done)
    <Node> [settled]
    <Node> [settled]
  <Node> [settled] (2 done)
    <Node> [settled]
    <Node> [settled]`
  )
})
