/**
 * Focus trap utility for creating accessible modal components
 * Keeps focus within a specified container element while active
 */

export interface FocusTrapOptions {
  /**
   * Element to focus when trap is activated
   */
  initialFocus?: HTMLElement | null;
  
  /**
   * Whether to return focus to the previously focused element when deactivated
   */
  returnFocus?: boolean;
  
  /**
   * Whether pressing Escape should deactivate the trap
   */
  escapeDeactivates?: boolean;
}

export function createFocusTrap(element: HTMLElement, options: FocusTrapOptions = {}) {
  // Store previous active element
  let previousActiveElement: HTMLElement | null = null;
  
  // Track focusable elements
  let focusableElements: HTMLElement[] = [];
  
  function updateFocusableElements() {
    // Query all focusable elements within container
    focusableElements = Array.from(
      element.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ) as HTMLElement[];
  }

  function activate() {
    // Save current active element
    previousActiveElement = document.activeElement as HTMLElement;
    
    // Update focusable elements list
    updateFocusableElements();
    
    // Set initial focus
    if (options.initialFocus) {
      options.initialFocus.focus();
    } else if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
    
    // Add event listeners
    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('keydown', onKeyDown);
  }
  
  function deactivate() {
    // Remove event listeners
    document.removeEventListener('focusin', onFocusIn);
    document.removeEventListener('keydown', onKeyDown);
    
    // Restore focus if needed
    if (options.returnFocus && previousActiveElement) {
      previousActiveElement.focus();
    }
  }
  
  function onFocusIn(event: FocusEvent) {
    // Keep focus within the trap
    if (element.contains(event.target as Node)) return;
    
    // Redirect focus back inside
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }
  
  function onKeyDown(event: KeyboardEvent) {
    // Handle Tab key to cycle through focusable elements
    if (event.key === 'Tab') {
      if (focusableElements.length === 0) return;
      
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      
      if (event.shiftKey && document.activeElement === firstElement) {
        lastElement.focus();
        event.preventDefault();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        firstElement.focus();
        event.preventDefault();
      }
    }
    
    // Handle Escape key
    if (options.escapeDeactivates && event.key === 'Escape') {
      deactivate();
    }
  }
  
  return {
    activate,
    deactivate,
    updateFocusableElements,
  };
}