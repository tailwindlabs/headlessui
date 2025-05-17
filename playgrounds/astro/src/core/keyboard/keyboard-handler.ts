/**
 * Keyboard handler utility for managing keyboard interactions
 */

type KeyHandler = (event: KeyboardEvent) => void;

export interface KeyboardHandlerOptions {
  [key: string]: KeyHandler;
}

export function createKeyboardHandler(options: KeyboardHandlerOptions = {}) {
  function handleKeyDown(event: KeyboardEvent) {
    const handler = options[event.key];
    if (handler) {
      handler(event);
    }
  }

  return {
    attach(element: HTMLElement) {
      element.addEventListener('keydown', handleKeyDown);
    },
    
    detach(element: HTMLElement) {
      element.removeEventListener('keydown', handleKeyDown);
    },
    
    handleKeyDown,
  };
}