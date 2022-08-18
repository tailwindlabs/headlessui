import * as React from 'react'
import { RefObject, useCallback, useEffect, useState, useDebugValue, useLayoutEffect } from 'react'
import { Machine } from '@headlessui/core'
import { useIsoMorphicEffect } from 'hooks/use-iso-morphic-effect'

export function useConstant<T>(initialValue: () => T): T {
  const [value] = useState<T>(initialValue)

  return value
}

let machines: Set<Machine> = new Set()

export function useMachine<M extends Machine>(factory: () => M): M {
  const machine = useConstant<M>(() => {
    let machine = factory()
    machines.add(machine)
    return machine
  })

  const getSnapshot = useCallback(() => machine.state, [machine])

  useSyncExternalStore((callback) => machine.subscribe(callback), getSnapshot)

  return machine
}

export function useActiveMachines(): RefObject<Machine[]> {
  return {
    get current() {
      return Array.from(machines).filter((m) => {
        if ('parent' in m) {
          // @ts-ignore
          return m.parent === undefined
        }

        return true
      })
    }
  }
}

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'useActiveMachines', { value: useActiveMachines })
}

function useSyncExternalStore<T>(
  subscribe: (_: () => void) => void,
  getSnapshot: () => T,
): T {
  if ('useSyncExternalStore' in React) {
    return React.useSyncExternalStore(subscribe, getSnapshot)
  }

  return useSyncExternalStoreShim(subscribe, getSnapshot)
}

type SnapshotDetail<T> = { inst: { value: T, getSnapshot: () => T } };

function useSyncExternalStoreShim<T>(
  subscribe: (_: () => void) => void,
  getSnapshot: () => T,
): T {
  const value = getSnapshot();
  const [{inst}, forceUpdate] = useState<SnapshotDetail<T>>({inst: {value, getSnapshot}});

  useLayoutEffect(() => {
    inst.value = value;
    inst.getSnapshot = getSnapshot;

    checkIfSnapshotChanged(inst) && forceUpdate({inst})
  }, [subscribe, value, getSnapshot]);

  useEffect(() => {
    checkIfSnapshotChanged(inst) && forceUpdate({inst})

    const handleStoreChange = () => {
      checkIfSnapshotChanged(inst) && forceUpdate({inst})
    };

    // Subscribe to the store and return a clean-up function.
    return subscribe(handleStoreChange);
  }, [subscribe]);

  useDebugValue(value);
  return value;
}

function checkIfSnapshotChanged<T>(inst: SnapshotDetail<T>["inst"]) {
  const latestGetSnapshot = inst.getSnapshot;
  const prevValue = inst.value;
  try {
    return prevValue !== latestGetSnapshot();
  } catch (error) {
    return true;
  }
}