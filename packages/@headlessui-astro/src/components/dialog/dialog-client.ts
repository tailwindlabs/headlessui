/**
 * Client-side functionality for the Dialog component
 */

import { createFocusTrap } from '../../core/focus/focus-trap';
import { createKeyboardHandler } from '../../core/keyboard/keyboard-handler';
import { createState } from '../../core/state/state';

interface DialogState {
  open: boolean;
  previouslyFocusedElement: HTMLElement | null;
}

export function createDialogContext(element: HTMLElement) {
  // Create state management
  const state = createState<DialogState>({
    open: false,
    previouslyFocusedElement: null,
  });

  // Handle body scroll locking
  let originalBodyOverflow: string;
  let originalPaddingRight: string;

  // Tracking scroll position
  let scrollY: number;

  // Initialize focus trap
  const focusTrap = createFocusTrap(element, {
    returnFocus: true,
    escapeDeactivates: false, // We'll handle escape ourselves
  });

  // Check if we're on iOS
  const isIOS = typeof window !== 'undefined' && 
    /iPad|iPhone|iPod/.test(navigator.userAgent) && 
    !window.MSStream;

  // Setup event handlers
  const setupKeyboardHandler = () => {
    const keyboardHandler = createKeyboardHandler({
      Escape: (event) => {
        event.preventDefault();
        if (state.getState().open) {
          closeDialog();
        }
      },
    });
    keyboardHandler.attach(element);
  };

  // Get the panel element
  const getPanel = (): HTMLElement | null => {
    return element.querySelector('[data-headlessui-dialog-panel]');
  };

  // Get all dialog elements (for focus management)
  const getAllDialogs = (): HTMLElement[] => {
    return Array.from(document.querySelectorAll('[data-headlessui-dialog]'));
  };

  // Lock body scroll to prevent background scrolling
  const lockBodyScroll = () => {
    if (typeof window === 'undefined') return;

    // Save current body style
    originalBodyOverflow = document.body.style.overflow;
    originalPaddingRight = document.body.style.paddingRight;

    // Calculate scrollbar width
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    // Save current scroll position for iOS
    if (isIOS) {
      scrollY = window.scrollY;
    }

    // Add padding to prevent layout shift when scrollbar disappears
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    // Lock scroll
    document.body.style.overflow = 'hidden';

    // Fix iOS position
    if (isIOS) {
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = `-${scrollY}px`;
    }
  };

  // Unlock body scroll
  const unlockBodyScroll = () => {
    if (typeof window === 'undefined') return;

    // Restore original styles
    document.body.style.overflow = originalBodyOverflow;
    document.body.style.paddingRight = originalPaddingRight;

    // Restore iOS position
    if (isIOS) {
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      window.scrollTo(0, scrollY);
    }
  };

  // Open dialog
  const openDialog = () => {
    // Store previously focused element
    state.setState({ 
      open: true,
      previouslyFocusedElement: document.activeElement as HTMLElement
    });

    // Update ARIA attributes
    element.dataset.headlessuiState = 'open';

    // Lock body scroll
    lockBodyScroll();

    // Activate focus trap
    focusTrap.activate();

    // Set aria-hidden on all other elements in the app
    const dialogs = getAllDialogs();
    const otherDialogs = dialogs.filter(dialog => dialog !== element);
    
    document.querySelectorAll('body > *').forEach(node => {
      if (
        node instanceof HTMLElement && 
        !element.contains(node) &&
        !otherDialogs.some(dialog => dialog.contains(node))
      ) {
        node.setAttribute('aria-hidden', 'true');
        node.dataset.dialogHidden = 'true';
      }
    });

    // Dispatch open event
    element.dispatchEvent(new CustomEvent('dialog:open', {
      bubbles: true,
      cancelable: true,
    }));
  };

  // Close dialog
  const closeDialog = () => {
    if (!state.getState().open) return;

    // Update state
    state.setState({ open: false });

    // Update ARIA attributes
    element.dataset.headlessuiState = '';

    // Unlock body scroll
    unlockBodyScroll();

    // Deactivate focus trap
    focusTrap.deactivate();

    // Restore aria-hidden
    document.querySelectorAll('[data-dialog-hidden="true"]').forEach(node => {
      if (node instanceof HTMLElement) {
        node.removeAttribute('aria-hidden');
        delete node.dataset.dialogHidden;
      }
    });

    // Dispatch close event
    element.dispatchEvent(new CustomEvent('dialog:close', {
      bubbles: true,
      cancelable: true,
    }));
  };

  // Toggle dialog state
  const toggleDialog = (open: boolean) => {
    if (open) {
      openDialog();
    } else {
      closeDialog();
    }
  };

  // Initialize ARIA attributes
  const initializeAriaAttributes = () => {
    element.setAttribute('role', 'dialog');
    element.setAttribute('aria-modal', 'true');
    
    // Connect title and description if they exist
    const title = element.querySelector('[data-headlessui-dialog-title]');
    const description = element.querySelector('[data-headlessui-dialog-description]');
    
    if (title) {
      const titleId = title.id || `headlessui-dialog-title-${Math.random().toString(36).substring(2, 9)}`;
      title.id = titleId;
      element.setAttribute('aria-labelledby', titleId);
    }
    
    if (description) {
      const descriptionId = description.id || `headlessui-dialog-description-${Math.random().toString(36).substring(2, 9)}`;
      description.id = descriptionId;
      element.setAttribute('aria-describedby', descriptionId);
    }

    // Add click handlers to close buttons
    element.querySelectorAll('[data-headlessui-dialog-close]').forEach(closeButton => {
      closeButton.addEventListener('click', () => closeDialog());
    });
  };

  // Setup click outside handler
  const setupClickOutsideHandler = () => {
    const panel = getPanel();
    if (!panel) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!state.getState().open) return;
      
      const target = event.target as HTMLElement;
      if (panel.contains(target)) return;
      
      // Check if click was inside the dialog but outside the panel
      if (element.contains(target) && !panel.contains(target)) {
        closeDialog();
      }
    };

    element.addEventListener('click', handleClickOutside);
  };

  // Check for initial state in the DOM
  const checkInitialState = () => {
    if (element.dataset.headlessuiState === 'open') {
      openDialog();
    }
  };

  // Setup observer to watch for attribute changes
  const setupAttributeObserver = () => {
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (
          mutation.type === 'attributes' && 
          mutation.attributeName === 'data-headlessui-state'
        ) {
          const isOpen = element.dataset.headlessuiState === 'open';
          if (isOpen !== state.getState().open) {
            toggleDialog(isOpen);
          }
        }
      });
    });
    
    observer.observe(element, { attributes: true });
    
    // Keep reference for cleanup
    return observer;
  };

  // Initialize
  initializeAriaAttributes();
  setupKeyboardHandler();
  setupClickOutsideHandler();
  checkInitialState();
  const observer = setupAttributeObserver();

  // API for external control
  return {
    openDialog,
    closeDialog,
    toggleDialog,
    isOpen: () => state.getState().open,
    updateFocusableElements: focusTrap.updateFocusableElements,
  };
}