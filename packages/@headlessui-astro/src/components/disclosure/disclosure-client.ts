/**
 * Client-side functionality for the Disclosure component
 */

import { createKeyboardHandler } from '../../core/keyboard/keyboard-handler';
import { createState } from '../../core/state/state';

interface DisclosureState {
  open: boolean;
}

export function createDisclosureContext(element: HTMLElement) {
  // Create state management
  const state = createState<DisclosureState>({
    open: false,
  });

  // Setup event handlers
  const setupKeyboardHandler = () => {
    const keyboardHandler = createKeyboardHandler({
      Space: (event) => {
        // Only trigger for button elements
        const target = event.target as HTMLElement;
        if (target.getAttribute('data-headlessui-disclosure-button')) {
          event.preventDefault();
          toggleDisclosure();
        }
      },
      Enter: (event) => {
        // Only trigger for button elements
        const target = event.target as HTMLElement;
        if (target.getAttribute('data-headlessui-disclosure-button')) {
          event.preventDefault();
          toggleDisclosure();
        }
      },
    });
    
    keyboardHandler.attach(element);
  };

  // Get the button element
  const getButton = (): HTMLElement | null => {
    return element.querySelector('[data-headlessui-disclosure-button]');
  };

  // Get the panel element
  const getPanel = (): HTMLElement | null => {
    return element.querySelector('[data-headlessui-disclosure-panel]');
  };

  // Open disclosure
  const openDisclosure = () => {
    if (state.getState().open) return;

    // Update state
    state.setState({ open: true });

    // Update ARIA attributes
    element.dataset.headlessuiState = 'open';

    // Update panel visibility
    const panel = getPanel();
    if (panel) {
      panel.dataset.headlessuiState = 'open';
      panel.removeAttribute('hidden');
    }

    // Update button state
    const button = getButton();
    if (button) {
      button.setAttribute('aria-expanded', 'true');
    }

    // Dispatch open event
    element.dispatchEvent(new CustomEvent('disclosure:open', {
      bubbles: true,
      cancelable: true,
    }));
  };

  // Close disclosure
  const closeDisclosure = () => {
    if (!state.getState().open) return;

    // Update state
    state.setState({ open: false });

    // Update ARIA attributes
    element.dataset.headlessuiState = '';

    // Update panel visibility
    const panel = getPanel();
    if (panel) {
      panel.dataset.headlessuiState = '';
      panel.setAttribute('hidden', '');
    }

    // Update button state
    const button = getButton();
    if (button) {
      button.setAttribute('aria-expanded', 'false');
    }

    // Dispatch close event
    element.dispatchEvent(new CustomEvent('disclosure:close', {
      bubbles: true,
      cancelable: true,
    }));
  };

  // Toggle disclosure state
  const toggleDisclosure = () => {
    if (state.getState().open) {
      closeDisclosure();
    } else {
      openDisclosure();
    }
  };

  // Initialize ARIA attributes
  const initializeAriaAttributes = () => {
    // Find necessary elements
    const button = getButton();
    const panel = getPanel();
    
    // Generate IDs if needed
    const disclosureId = element.id || `headlessui-disclosure-${Math.random().toString(36).substring(2, 9)}`;
    element.id = disclosureId;
    
    if (button) {
      const buttonId = button.id || `${disclosureId}-button`;
      button.id = buttonId;
      button.setAttribute('aria-controls', `${disclosureId}-panel`);
      button.setAttribute('aria-expanded', state.getState().open ? 'true' : 'false');
    }
    
    if (panel) {
      const panelId = panel.id || `${disclosureId}-panel`;
      panel.id = panelId;
      
      if (button) {
        button.setAttribute('aria-controls', panelId);
      }
      
      if (!state.getState().open) {
        panel.setAttribute('hidden', '');
      }
    }

    // Add click handler to button
    if (button) {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        toggleDisclosure();
      });
    }
  };

  // Check for initial state in the DOM
  const checkInitialState = () => {
    if (element.dataset.headlessuiState === 'open') {
      state.setState({ open: true });
      
      const panel = getPanel();
      if (panel) {
        panel.dataset.headlessuiState = 'open';
        panel.removeAttribute('hidden');
      }
      
      const button = getButton();
      if (button) {
        button.setAttribute('aria-expanded', 'true');
      }
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
            if (isOpen) {
              openDisclosure();
            } else {
              closeDisclosure();
            }
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
  checkInitialState();
  const observer = setupAttributeObserver();

  // API for external control
  return {
    openDisclosure,
    closeDisclosure,
    toggleDisclosure,
    isOpen: () => state.getState().open,
  };
}