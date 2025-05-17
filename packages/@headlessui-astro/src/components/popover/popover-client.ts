/**
 * Client-side functionality for the Popover component
 */

import { createKeyboardHandler } from '../../core/keyboard/keyboard-handler';
import { createState } from '../../core/state/state';
import { createFocusTrap } from '../../core/focus/focus-trap';

interface PopoverState {
  open: boolean;
  activeElement: HTMLElement | null;
  panels: Map<string, HTMLElement>;
  buttons: Map<string, HTMLElement>;
  groups: Map<string, HTMLElement>;
}

export function createPopoverContext(element: HTMLElement) {
  // Create state management
  const state = createState<PopoverState>({
    open: false,
    activeElement: null,
    panels: new Map(),
    buttons: new Map(),
    groups: new Map(),
  });

  // Track panel elements by ID for group management
  const panelIds = new Map<string, string>(); // buttonId -> panelId
  const buttonIds = new Map<string, string>(); // panelId -> buttonId

  // Get button and panel elements
  const buttonElement = element.querySelector('[data-headlessui-popover-button]');
  const panelElement = element.querySelector('[data-headlessui-popover-panel]');
  
  // Generate IDs if not present
  const popoverId = element.id || `headlessui-popover-${Math.random().toString(36).substring(2, 9)}`;
  element.id = popoverId;
  
  // Setup event handlers
  if (buttonElement) {
    buttonElement.addEventListener('click', () => {
      togglePopover(!state.getState().open);
    });
  }
  
  // Setup keyboard handler for the button
  if (buttonElement) {
    const keyboardHandler = createKeyboardHandler({
      Enter: (event) => {
        if (!state.getState().open) {
          event.preventDefault();
          togglePopover(true);
        }
      },
      ' ': (event) => {
        if (!state.getState().open) {
          event.preventDefault();
          togglePopover(true);
        }
      },
      Escape: (event) => {
        if (state.getState().open) {
          event.preventDefault();
          togglePopover(false);
        }
      },
    });
    keyboardHandler.attach(buttonElement as HTMLElement);
  }

  // Create focus trap for panel
  let focusTrap: ReturnType<typeof createFocusTrap> | null = null;
  
  if (panelElement) {
    focusTrap = createFocusTrap(panelElement as HTMLElement, {
      escapeDeactivates: true,
      returnFocus: true,
    });
  }
  
  // Handle popover state
  function togglePopover(open: boolean) {
    state.setState({ open });
    
    // Update ARIA attributes
    element.dataset.headlessuiState = open ? 'open' : '';
    
    if (buttonElement) {
      buttonElement.setAttribute('aria-expanded', String(open));
    }
    
    if (panelElement) {
      panelElement.dataset.headlessuiState = open ? 'open' : '';
      
      if (open) {
        // Make panel visible
        panelElement.style.display = 'block';
        
        // Activate focus trap
        if (focusTrap) {
          focusTrap.activate();
        }
        
        // Dispatch open event
        element.dispatchEvent(new CustomEvent('headlessui:open', {
          bubbles: true,
        }));
      } else {
        // Hide panel
        panelElement.style.display = 'none';
        
        // Deactivate focus trap
        if (focusTrap) {
          focusTrap.deactivate();
        }
        
        // Dispatch close event
        element.dispatchEvent(new CustomEvent('headlessui:close', {
          bubbles: true,
        }));
      }
    }
  }
  
  // Register panel with a group if present
  function registerWithGroup() {
    const group = element.closest('[data-headlessui-popover-group]');
    if (!group) return;
    
    // Add popover to group tracking
    const groupId = group.id || `headlessui-popover-group-${Math.random().toString(36).substring(2, 9)}`;
    group.id = groupId;
    
    // Update state
    const groups = new Map(state.getState().groups);
    groups.set(groupId, group as HTMLElement);
    state.setState({ groups });
    
    // Listen for other popovers opening in this group
    group.addEventListener('headlessui:open', (event) => {
      // Skip if this is the current popover
      if (event.target === element) return;
      
      // Close this popover if another one opens in the same group
      // and autoClose is enabled on the group
      if (group.getAttribute('data-autoclose') !== 'false') {
        togglePopover(false);
      }
    });
  }
  
  // Setup click outside to close popover
  document.addEventListener('click', (event) => {
    if (
      state.getState().open && 
      !element.contains(event.target as Node)
    ) {
      togglePopover(false);
    }
  });
  
  // Initialize ARIA attributes
  if (buttonElement) {
    buttonElement.setAttribute('aria-haspopup', 'dialog');
    buttonElement.setAttribute('aria-expanded', 'false');
    
    // Connect button to panel using ARIA
    if (panelElement) {
      const panelId = panelElement.id || `headlessui-popover-panel-${Math.random().toString(36).substring(2, 9)}`;
      panelElement.id = panelId;
      buttonElement.setAttribute('aria-controls', panelId);
      
      // Store IDs for reference
      panelIds.set(buttonElement.id, panelId);
      buttonIds.set(panelId, buttonElement.id);
    }
  }
  
  // Register with group if present
  registerWithGroup();
  
  // Return API
  return {
    togglePopover,
    isOpen: () => state.getState().open,
    getState: () => state.getState(),
  };
}