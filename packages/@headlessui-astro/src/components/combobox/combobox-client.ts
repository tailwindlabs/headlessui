/**
 * Client-side functionality for the Combobox component.
 */

import { createKeyboardHandler } from '../../utils/keyboard';
import { createState } from '../../utils/state';

/**
 * State interface for the Combobox component.
 */
interface ComboboxState {
  /** Whether the combobox is open. */
  open: boolean;
  /** The selected value(s). */
  value: string | string[];
  /** Options available in the combobox. */
  options: ComboboxOption[];
  /** The query/filter text. */
  query: string;
  /** Whether the combobox allows multiple selections. */
  multiple: boolean;
  /** Whether the combobox is disabled. */
  disabled: boolean;
}

/**
 * Interface for a combobox option.
 */
interface ComboboxOption {
  /** The value of the option. */
  value: string;
  /** The display text of the option. */
  text: string;
  /** Whether the option is disabled. */
  disabled: boolean;
  /** The DOM element representing the option. */
  element: HTMLElement | null;
}

/**
 * Create a Combobox context with state and behaviors.
 */
export function createComboboxContext(element: HTMLElement, options: {
  initialValue?: string | string[];
  defaultOpen?: boolean;
  multiple?: boolean;
  disabled?: boolean;
  filter?: (query: string, option: string) => boolean;
} = {}) {
  // Extract options with defaults
  const {
    initialValue = '',
    defaultOpen = false,
    multiple = false,
    disabled = false,
    filter = (query, optionText) => optionText.toLowerCase().includes(query.toLowerCase()),
  } = options;

  // Generate unique ID for this combobox instance
  const comboboxId = element.id || `headlessui-combobox-${Math.floor(Math.random() * 1000000)}`;
  
  // Initialize state
  const state = createState<ComboboxState>({
    open: defaultOpen,
    value: initialValue,
    options: [],
    query: '',
    multiple,
    disabled,
  });

  // Track currently active option index for keyboard navigation
  let activeOptionIndex = -1;
  
  // Reference elements
  let inputElement: HTMLInputElement | null = null;
  let optionsElement: HTMLElement | null = null;

  const mutationObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'data-headlessui-state') {
        updateAriaAttributes();
      }
    }
  });

  mutationObserver.observe(element, { attributes: true });

  // Helper to get elements by their data attributes
  function getElements() {
    return {
      combobox: element,
      button: element.querySelector('[data-headlessui-combobox-button]'),
      input: element.querySelector('[data-headlessui-combobox-input]') as HTMLInputElement,
      options: element.querySelector('[data-headlessui-combobox-options]'),
      optionElements: Array.from(element.querySelectorAll('[data-headlessui-combobox-option]')),
      labelElement: element.querySelector('[data-headlessui-combobox-label]'),
    };
  }

  // Set up event handlers for input
  function setupInputHandlers() {
    const { input } = getElements();
    if (!input) return;
    
    inputElement = input;

    input.addEventListener('input', (event) => {
      const query = (event.target as HTMLInputElement).value;
      setQuery(query);
      if (!state.getState().open) {
        openCombobox();
      }
    });

    input.addEventListener('focus', () => {
      if (options.defaultOpen) {
        openCombobox();
      }
    });

    input.addEventListener('blur', (event) => {
      // Only close if focus didn't move to another element in the combobox
      setTimeout(() => {
        const activeElement = document.activeElement;
        const { button, options, optionElements } = getElements();
        
        if (
          activeElement !== input &&
          activeElement !== button &&
          activeElement !== options &&
          !optionElements.some(el => el === activeElement)
        ) {
          closeCombobox();
        }
      }, 0);
    });

    // Set up keyboard handler
    createKeyboardHandler(input, {
      Escape: () => {
        if (state.getState().open) {
          closeCombobox();
          input.focus();
          return true;
        }
        return false;
      },
      ArrowDown: (event) => {
        event.preventDefault();
        if (!state.getState().open) {
          openCombobox();
        } else {
          navigateOptions(1);
        }
        return true;
      },
      ArrowUp: (event) => {
        event.preventDefault();
        if (!state.getState().open) {
          openCombobox();
          navigateOptions(-1);
        } else {
          navigateOptions(-1);
        }
        return true;
      },
      Home: (event) => {
        if (state.getState().open) {
          event.preventDefault();
          navigateToFirstOption();
          return true;
        }
        return false;
      },
      End: (event) => {
        if (state.getState().open) {
          event.preventDefault();
          navigateToLastOption();
          return true;
        }
        return false;
      },
      Enter: (event) => {
        if (state.getState().open && activeOptionIndex >= 0) {
          event.preventDefault();
          const { optionElements } = getElements();
          const activeOption = optionElements[activeOptionIndex];
          if (activeOption) {
            const value = activeOption.getAttribute('data-value');
            if (value !== null) {
              selectOption(value);
            }
          }
          return true;
        }
        return false;
      },
      Tab: () => {
        if (state.getState().open) {
          closeCombobox();
        }
        return false; // Let tab do its natural focus movement
      },
    });
  }

  // Set up event handlers for button
  function setupButtonHandlers() {
    const { button } = getElements();
    if (!button) return;

    button.addEventListener('click', () => {
      if (state.getState().disabled) return;
      
      if (state.getState().open) {
        closeCombobox();
        inputElement?.focus();
      } else {
        openCombobox();
        inputElement?.focus();
      }
    });

    createKeyboardHandler(button, {
      ArrowDown: (event) => {
        event.preventDefault();
        openCombobox();
        inputElement?.focus();
        setTimeout(() => navigateOptions(1), 0);
        return true;
      },
      ArrowUp: (event) => {
        event.preventDefault();
        openCombobox();
        inputElement?.focus();
        setTimeout(() => navigateOptions(-1), 0);
        return true;
      },
      Space: (event) => {
        event.preventDefault();
        if (state.getState().open) {
          closeCombobox();
        } else {
          openCombobox();
        }
        inputElement?.focus();
        return true;
      },
      Enter: (event) => {
        event.preventDefault();
        if (state.getState().open) {
          closeCombobox();
        } else {
          openCombobox();
        }
        inputElement?.focus();
        return true;
      },
    });
  }

  // Set up event handlers for options
  function setupOptionsHandlers() {
    const { options, optionElements } = getElements();
    if (!options) return;
    
    optionsElement = options;

    // Add click handlers to each option
    optionElements.forEach((option, index) => {
      option.addEventListener('click', () => {
        const value = option.getAttribute('data-value');
        if (value !== null && !option.hasAttribute('aria-disabled')) {
          selectOption(value);
          inputElement?.focus();
        }
      });

      option.addEventListener('mouseenter', () => {
        if (!option.hasAttribute('aria-disabled')) {
          activeOptionIndex = index;
          updateActiveOption();
        }
      });

      option.addEventListener('mouseleave', () => {
        if (activeOptionIndex === index) {
          activeOptionIndex = -1;
          updateActiveOption();
        }
      });
    });

    // Initialize options in state
    refreshOptions();
  }

  // Refresh the options list in state
  function refreshOptions() {
    const { optionElements } = getElements();
    const options: ComboboxOption[] = optionElements.map(element => ({
      value: element.getAttribute('data-value') || '',
      text: element.textContent || '',
      disabled: element.hasAttribute('aria-disabled'),
      element: element as HTMLElement,
    }));
    
    state.setState(prev => ({ ...prev, options }));
  }

  // Set the query and filter options
  function setQuery(query: string) {
    state.setState(prev => ({ ...prev, query }));
    
    const { optionElements } = getElements();
    const currentState = state.getState();
    
    // Filter the options based on the query
    optionElements.forEach(element => {
      const optionText = element.textContent || '';
      const isVisible = filter(query, optionText);
      
      element.style.display = isVisible ? '' : 'none';
    });
    
    // Update the active option if needed
    if (activeOptionIndex >= 0) {
      const visibleOptions = optionElements.filter(el => el.style.display !== 'none');
      if (visibleOptions.length > 0 && 
          (!optionElements[activeOptionIndex] || 
           optionElements[activeOptionIndex].style.display === 'none')) {
        activeOptionIndex = optionElements.indexOf(visibleOptions[0]);
        updateActiveOption();
      }
    }

    // Show empty state if needed
    const hasVisibleOptions = optionElements.some(el => el.style.display !== 'none');
    const emptyState = element.querySelector('[data-headlessui-combobox-empty]');
    if (emptyState) {
      emptyState.style.display = hasVisibleOptions ? 'none' : '';
    }
    
    element.dispatchEvent(new CustomEvent('combobox:query', { 
      detail: { query, hasVisibleOptions } 
    }));
  }

  // Navigate through options
  function navigateOptions(direction: number) {
    const { optionElements } = getElements();
    const visibleOptions = optionElements.filter(
      el => el.style.display !== 'none' && !el.hasAttribute('aria-disabled')
    );
    
    if (visibleOptions.length === 0) return;
    
    // Find the index of the next option
    let newIndex: number;
    
    if (activeOptionIndex === -1) {
      // Start at first or last option depending on direction
      newIndex = direction > 0 ? 0 : visibleOptions.length - 1;
    } else {
      // Find the current visible option index
      const currentVisibleIndex = visibleOptions.findIndex(
        el => optionElements.indexOf(el) === activeOptionIndex
      );
      
      // Move to next or previous visible option
      if (currentVisibleIndex === -1) {
        newIndex = direction > 0 ? 0 : visibleOptions.length - 1;
      } else {
        newIndex = (currentVisibleIndex + direction + visibleOptions.length) % visibleOptions.length;
      }
    }
    
    // Update active option
    activeOptionIndex = optionElements.indexOf(visibleOptions[newIndex]);
    updateActiveOption();
    
    // Scroll into view if needed
    if (visibleOptions[newIndex]) {
      visibleOptions[newIndex].scrollIntoView({ block: 'nearest' });
    }
  }

  // Navigate to first option
  function navigateToFirstOption() {
    const { optionElements } = getElements();
    const visibleOptions = optionElements.filter(
      el => el.style.display !== 'none' && !el.hasAttribute('aria-disabled')
    );
    
    if (visibleOptions.length > 0) {
      activeOptionIndex = optionElements.indexOf(visibleOptions[0]);
      updateActiveOption();
      visibleOptions[0].scrollIntoView({ block: 'nearest' });
    }
  }

  // Navigate to last option
  function navigateToLastOption() {
    const { optionElements } = getElements();
    const visibleOptions = optionElements.filter(
      el => el.style.display !== 'none' && !el.hasAttribute('aria-disabled')
    );
    
    if (visibleOptions.length > 0) {
      const lastOption = visibleOptions[visibleOptions.length - 1];
      activeOptionIndex = optionElements.indexOf(lastOption);
      updateActiveOption();
      lastOption.scrollIntoView({ block: 'nearest' });
    }
  }

  // Update visual indication of active option
  function updateActiveOption() {
    const { optionElements } = getElements();
    
    optionElements.forEach((option, index) => {
      if (index === activeOptionIndex) {
        option.setAttribute('data-headlessui-active-option', '');
        option.setAttribute('aria-selected', 'true');
      } else {
        option.removeAttribute('data-headlessui-active-option');
        option.setAttribute('aria-selected', 'false');
      }
    });
  }

  // Select an option
  function selectOption(value: string) {
    const currentState = state.getState();
    let newValue: string | string[];
    
    if (currentState.multiple) {
      // For multiple selection
      const currentValues = Array.isArray(currentState.value) 
        ? currentState.value 
        : currentState.value ? [currentState.value] : [];
      
      if (currentValues.includes(value)) {
        // Deselect if already selected
        newValue = currentValues.filter(v => v !== value);
      } else {
        // Add to selection
        newValue = [...currentValues, value];
      }
    } else {
      // For single selection
      newValue = value;
    }
    
    state.setState(prev => ({ ...prev, value: newValue }));
    
    if (!currentState.multiple) {
      closeCombobox();
      
      // Update input value with selected option text
      const { optionElements } = getElements();
      const selectedOption = optionElements.find(
        el => el.getAttribute('data-value') === value
      );
      
      if (selectedOption && inputElement) {
        inputElement.value = selectedOption.textContent || '';
      }
    }
    
    // Update display and ARIA attributes
    updateSelectionAttributes();
    
    // Dispatch change event
    element.dispatchEvent(new CustomEvent('combobox:change', { 
      detail: { value: newValue } 
    }));
  }

  // Open the combobox
  function openCombobox() {
    if (state.getState().disabled) return;
    
    state.setState(prev => ({ ...prev, open: true }));
    element.setAttribute('data-headlessui-state', 'open');
    
    // Update ARIA attributes
    updateAriaAttributes();
    
    const { options } = getElements();
    if (options) {
      options.style.display = '';
    }
    
    // Dispatch open event
    element.dispatchEvent(new CustomEvent('combobox:open'));
    
    // Set up options handlers if not already done
    setupOptionsHandlers();
  }

  // Close the combobox
  function closeCombobox() {
    state.setState(prev => ({ ...prev, open: false }));
    element.setAttribute('data-headlessui-state', 'closed');
    
    // Update ARIA attributes
    updateAriaAttributes();
    
    const { options } = getElements();
    if (options) {
      options.style.display = 'none';
    }
    
    // Reset active option
    activeOptionIndex = -1;
    
    // Dispatch close event
    element.dispatchEvent(new CustomEvent('combobox:close'));
  }

  // Toggle the combobox
  function toggleCombobox() {
    if (state.getState().open) {
      closeCombobox();
    } else {
      openCombobox();
    }
  }

  // Update ARIA attributes based on current state
  function updateAriaAttributes() {
    const { button, input, options, optionElements, labelElement } = getElements();
    const currentState = state.getState();
    
    // Combobox element
    element.setAttribute('role', 'combobox');
    element.setAttribute('aria-haspopup', 'listbox');
    element.setAttribute('aria-expanded', currentState.open ? 'true' : 'false');
    element.setAttribute('aria-disabled', currentState.disabled ? 'true' : 'false');
    
    // Connect label if present
    if (labelElement && input) {
      const labelId = labelElement.id || `${comboboxId}-label`;
      labelElement.id = labelId;
      input.setAttribute('aria-labelledby', labelId);
    }
    
    // Input element
    if (input) {
      input.setAttribute('aria-autocomplete', 'list');
      
      if (options) {
        const optionsId = options.id || `${comboboxId}-options`;
        options.id = optionsId;
        input.setAttribute('aria-controls', optionsId);
      }

      if (activeOptionIndex >= 0 && optionElements[activeOptionIndex]) {
        input.setAttribute('aria-activedescendant', optionElements[activeOptionIndex].id);
      } else {
        input.removeAttribute('aria-activedescendant');
      }
    }
    
    // Options element
    if (options) {
      options.setAttribute('role', 'listbox');
      options.setAttribute('aria-multiselectable', currentState.multiple ? 'true' : 'false');
    }
    
    // Update option elements
    updateSelectionAttributes();
  }

  // Update selection-related attributes on options
  function updateSelectionAttributes() {
    const { optionElements } = getElements();
    const currentState = state.getState();
    const selectedValues = Array.isArray(currentState.value) 
      ? currentState.value 
      : currentState.value ? [currentState.value] : [];
    
    optionElements.forEach(option => {
      const value = option.getAttribute('data-value');
      const isSelected = value !== null && selectedValues.includes(value);
      
      option.setAttribute('role', 'option');
      option.setAttribute('aria-selected', isSelected ? 'true' : 'false');
      
      // Ensure each option has an ID for aria-activedescendant
      if (!option.id) {
        option.id = `${comboboxId}-option-${option.getAttribute('data-value')}`;
      }
      
      // Mark as selected in data attributes as well
      if (isSelected) {
        option.setAttribute('data-headlessui-selected', '');
      } else {
        option.removeAttribute('data-headlessui-selected');
      }
    });
  }

  // Set up all event handlers
  function setupEventHandlers() {
    setupInputHandlers();
    setupButtonHandlers();
    
    // Options handlers are set up when the combobox is opened
    if (state.getState().open) {
      setupOptionsHandlers();
    }
    
    // Initial ARIA setup
    updateAriaAttributes();
  }

  // Initialize
  setupEventHandlers();

  // Return API
  return {
    getState: state.getState,
    subscribe: state.subscribe,
    open: openCombobox,
    close: closeCombobox,
    toggle: toggleCombobox,
    setQuery,
    selectOption,
    navigateOptions,
    navigateToFirstOption,
    navigateToLastOption,
  };
}

/**
 * Initialize Combobox components on the page.
 */
export function initComboboxes() {
  document.querySelectorAll<HTMLElement>('[data-headlessui-combobox]').forEach(element => {
    const initialValue = element.getAttribute('data-initial-value');
    const parsedInitialValue = initialValue ? JSON.parse(initialValue) : '';
    const multiple = element.getAttribute('data-multiple') === 'true';
    const disabled = element.getAttribute('data-disabled') === 'true';
    const defaultOpen = element.getAttribute('data-default-open') === 'true';

    if (!element.hasAttribute('data-headlessui-combobox-initialized')) {
      createComboboxContext(element, {
        initialValue: parsedInitialValue,
        multiple,
        disabled,
        defaultOpen
      });
      element.setAttribute('data-headlessui-combobox-initialized', 'true');
    }
  });
}

// Initialize on page load
if (typeof document !== 'undefined') {
  document.addEventListener('astro:page-load', initComboboxes);
  if (document.readyState !== 'loading') {
    initComboboxes();
  }
}