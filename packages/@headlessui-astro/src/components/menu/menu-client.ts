/**
 * Client-side functionality for the Menu component
 */

import { createKeyboardHandler } from '../../core/keyboard/keyboard-handler';
import { createState } from '../../core/state/state';

interface MenuState {
  open: boolean;
  activeIndex: number;
  items: HTMLElement[];
  sections: HTMLElement[];
}

export function createMenuContext(element: HTMLElement) {
  // Create state management
  const state = createState<MenuState>({
    open: false,
    activeIndex: -1,
    items: [],
    sections: [],
  });

  // Get related elements
  const buttonElement = element.querySelector('[data-headlessui-menu-button]');
  const itemsElement = element.querySelector('[data-headlessui-menu-items]');
  
  // Setup event handlers
  if (buttonElement) {
    buttonElement.addEventListener('click', () => {
      toggleMenu(!state.getState().open);
    });
  }
  
  // Setup keyboard handler for the button
  if (buttonElement) {
    const keyboardHandler = createKeyboardHandler({
      ArrowDown: (event) => {
        event.preventDefault();
        if (!state.getState().open) {
          toggleMenu(true);
        }
      },
      ArrowUp: (event) => {
        event.preventDefault();
        if (!state.getState().open) {
          toggleMenu(true);
          // Focus on last item
          const items = state.getState().items;
          if (items.length > 0) {
            state.setState({ activeIndex: items.length - 1 });
            items[items.length - 1].focus();
          }
        }
      },
      Enter: (event) => {
        if (!state.getState().open) {
          event.preventDefault();
          toggleMenu(true);
        }
      },
      ' ': (event) => {
        if (!state.getState().open) {
          event.preventDefault();
          toggleMenu(true);
        }
      },
      Escape: (event) => {
        if (state.getState().open) {
          event.preventDefault();
          toggleMenu(false);
        }
      },
    });
    keyboardHandler.attach(buttonElement as HTMLElement);
  }
  
  // Handle menu state
  function toggleMenu(open: boolean) {
    state.setState({ open });
    
    // Update ARIA attributes
    element.dataset.headlessuiState = open ? 'open' : '';
    
    if (buttonElement) {
      buttonElement.setAttribute('aria-expanded', String(open));
    }
    
    if (itemsElement) {
      itemsElement.dataset.headlessuiState = open ? 'open' : '';
      
      if (open) {
        // Make menu visible
        itemsElement.style.display = 'block';
        
        // Update items list and focus first item
        updateItems();
        
        // Set up keyboard navigation for menu items
        setupItemsKeyboardNavigation();
      } else {
        // Hide menu
        itemsElement.style.display = 'none';
        
        // Return focus to button
        if (buttonElement instanceof HTMLElement) {
          buttonElement.focus();
        }
        
        // Reset active index
        state.setState({ activeIndex: -1 });
      }
    }
  }
  
  // Update the list of menu items
  function updateItems() {
    if (!itemsElement) return;
    
    const items = Array.from(
      itemsElement.querySelectorAll('[data-headlessui-menu-item]:not([data-disabled])')
    ) as HTMLElement[];
    
    state.setState({ items });
    
    // Focus first item if menu is open
    if (state.getState().open && items.length > 0) {
      state.setState({ activeIndex: 0 });
      items[0].focus();
    }
  }
  
  // Setup keyboard navigation for menu items
  function setupItemsKeyboardNavigation() {
    if (!itemsElement) return;
    
    const keyboardHandler = createKeyboardHandler({
      ArrowDown: (event) => {
        event.preventDefault();
        const { items, activeIndex } = state.getState();
        if (items.length === 0) return;
        
        const newIndex = (activeIndex + 1) % items.length;
        state.setState({ activeIndex: newIndex });
        items[newIndex].focus();
      },
      ArrowUp: (event) => {
        event.preventDefault();
        const { items, activeIndex } = state.getState();
        if (items.length === 0) return;
        
        const newIndex = (activeIndex - 1 + items.length) % items.length;
        state.setState({ activeIndex: newIndex });
        items[newIndex].focus();
      },
      Home: (event) => {
        event.preventDefault();
        const { items } = state.getState();
        if (items.length === 0) return;
        
        state.setState({ activeIndex: 0 });
        items[0].focus();
      },
      End: (event) => {
        event.preventDefault();
        const { items } = state.getState();
        if (items.length === 0) return;
        
        state.setState({ activeIndex: items.length - 1 });
        items[items.length - 1].focus();
      },
      Escape: (event) => {
        event.preventDefault();
        toggleMenu(false);
      },
      Tab: () => {
        // Let tab behavior work normally
        toggleMenu(false);
      },
      Enter: (event) => {
        event.preventDefault();
        const { items, activeIndex } = state.getState();
        if (activeIndex >= 0 && activeIndex < items.length) {
          items[activeIndex].click();
        }
      },
      ' ': (event) => {
        event.preventDefault();
        const { items, activeIndex } = state.getState();
        if (activeIndex >= 0 && activeIndex < items.length) {
          items[activeIndex].click();
        }
      },
    });
    
    keyboardHandler.attach(itemsElement as HTMLElement);
  }
  
  // Handle item click events via event delegation
  if (itemsElement) {
    itemsElement.addEventListener('click', (event) => {
      const item = (event.target as Element).closest('[data-headlessui-menu-item]');
      if (item && !item.hasAttribute('data-disabled')) {
        // Close menu when item is clicked
        toggleMenu(false);
        
        // Dispatch selection event
        element.dispatchEvent(new CustomEvent('headlessui:select', {
          detail: {
            item,
            value: item.getAttribute('data-value') || undefined,
          },
          bubbles: true,
        }));
      }
    });
  }
  
  // Setup click outside to close menu
  document.addEventListener('click', (event) => {
    if (
      state.getState().open && 
      !element.contains(event.target as Node)
    ) {
      toggleMenu(false);
    }
  });
  
  // Initialize ARIA attributes
  if (buttonElement) {
    buttonElement.setAttribute('aria-haspopup', 'true');
    buttonElement.setAttribute('aria-expanded', 'false');
    
    // Connect button to menu using ARIA
    if (itemsElement) {
      const menuId = itemsElement.id || `headlessui-menu-items-${Math.random().toString(36).substring(2, 9)}`;
      itemsElement.id = menuId;
      buttonElement.setAttribute('aria-controls', menuId);
    }
  }
  
  // Initialize items with correct roles
  if (itemsElement) {
    itemsElement.setAttribute('role', 'menu');
    
    // Set roles for menu items
    const items = itemsElement.querySelectorAll('[data-headlessui-menu-item]');
    items.forEach(item => {
      item.setAttribute('role', 'menuitem');
      item.setAttribute('tabindex', '-1');
    });
    
    // Find and initialize sections
    const sections = itemsElement.querySelectorAll('[data-headlessui-menu-section]');
    if (sections.length > 0) {
      state.setState({ sections: Array.from(sections) as HTMLElement[] });
    }
    
    // Ensure headings have proper presentation role
    const headings = itemsElement.querySelectorAll('[data-headlessui-menu-heading]');
    headings.forEach(heading => {
      heading.setAttribute('role', 'presentation');
    });
    
    // Ensure separators have correct role and orientation
    const separators = itemsElement.querySelectorAll('[data-headlessui-menu-separator]');
    separators.forEach(separator => {
      separator.setAttribute('role', 'separator');
      separator.setAttribute('aria-orientation', 'horizontal');
    });
  }
  
  // Subscribe to state changes to update DOM
  state.subscribe(newState => {
    if (itemsElement) {
      // Update active/inactive classes on items
      const items = itemsElement.querySelectorAll('[data-headlessui-menu-item]');
      items.forEach((item, index) => {
        item.dataset.active = (index === newState.activeIndex).toString();
        
        // Add/remove active classes for styling
        if (index === newState.activeIndex) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });
    }
  });
  
  return {
    toggleMenu,
    isOpen: () => state.getState().open,
    getActiveIndex: () => state.getState().activeIndex,
  };
}