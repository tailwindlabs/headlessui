/**
 * Simple state management utility for components
 */

type Listener<T> = (state: T) => void;

export function createState<T extends object>(initialState: T) {
  let state = { ...initialState };
  const listeners: Set<Listener<T>> = new Set();

  function setState(newState: Partial<T>) {
    state = { ...state, ...newState };
    notify();
  }

  function getState(): T {
    return state;
  }

  function subscribe(listener: Listener<T>) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }

  function notify() {
    listeners.forEach(listener => listener(state));
  }

  return {
    setState,
    getState,
    subscribe,
  };
}