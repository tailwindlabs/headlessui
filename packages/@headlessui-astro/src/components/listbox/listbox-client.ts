/**
 * Client-side functionality for the Listbox component
 */

import { createKeyboardHandler } from '../../core/keyboard/keyboard-handler';
import { createState } from '../../core/state/state';

interface ListboxState {
  open: boolean;
  selectedValue: any;
  activeIndex: number;
  optionCount: number;
  multiple: boolean;
  options: Option[];
}

interface Option {
  value: any;
  text: string;
  disabled: boolean;
  element: HTMLElement;
}

export function createListboxContext(element: HTMLElement) {
  // Create state management
  const state = createState<ListboxState>({
    open: false,
    selectedValue: undefined,
    activeIndex: -1,
    optionCount: 0,
    multiple: false,
    options: [],
  });

  // Helpers to get elements
  const getButton = (): HTMLElement | null => {
    return element.querySelector('[data-headlessui-listbox-button]');
  };

  const getOptions = (): HTMLElement | null => {
    return element.querySelector('[data-headlessui-listbox-options]');
  };

  const getOptionElements = (): HTMLElement[] => {
    return Array.from(element.querySelectorAll('[data-headlessui-listbox-option]'));
  };

  const getLabel = (): HTMLElement | null => {
    return element.querySelector('[data-headlessui-listbox-label]');
  };

  // Initialize options
  const initializeOptions = () => {
    const optionElements = getOptionElements();
    const options: Option[] = optionElements.map((optionElement, index) => {
      const value = optionElement.dataset.value;
      const text = optionElement.textContent || '';
      const disabled = optionElement.hasAttribute('disabled') || optionElement.dataset.disabled === 'true';
      
      return {
        value,
        text,
        disabled,
        element: optionElement,
      };
    });
    
    state.setState({ options, optionCount: options.length });
    
    // Set up initial selection
    const initialValue = element.dataset.value;
    if (initialValue) {
      try {
        const parsedValue = JSON.parse(initialValue);
        state.setState({ selectedValue: parsedValue });
        
        // Mark the corresponding option as selected
        updateSelectedOptions(parsedValue);
      } catch (e) {
        console.error('Failed to parse initial value:', e);
      }
    }
  };

  // Update selected options based on current value
  const updateSelectedOptions = (value: any) => {
    const { options, multiple } = state.getState();
    
    options.forEach((option, index) => {
      const isSelected = multiple 
        ? Array.isArray(value) && value.includes(option.value)
        : option.value === value;
      
      if (isSelected) {
        option.element.dataset.selected = 'true';
        option.element.setAttribute('aria-selected', 'true');
      } else {
        delete option.element.dataset.selected;
        option.element.setAttribute('aria-selected', 'false');
      }
    });
  };

  // Open listbox
  const openListbox = () => {
    if (state.getState().open) return;

    state.setState({ open: true });
    element.dataset.headlessuiState = 'open';

    const optionsElement = getOptions();
    if (optionsElement) {
      optionsElement.removeAttribute('hidden');
    }

    const buttonElement = getButton();
    if (buttonElement) {
      buttonElement.setAttribute('aria-expanded', 'true');
    }

    // Set active index based on selected value
    const { options, selectedValue, multiple } = state.getState();
    if (!multiple && selectedValue !== undefined) {
      const selectedIndex = options.findIndex(option => option.value === selectedValue);
      if (selectedIndex !== -1) {
        setActiveIndex(selectedIndex);
      }
    }
  };

  // Close listbox
  const closeListbox = () => {
    if (!state.getState().open) return;

    state.setState({ open: false, activeIndex: -1 });
    element.dataset.headlessuiState = '';

    const optionsElement = getOptions();
    if (optionsElement) {
      optionsElement.setAttribute('hidden', '');
    }

    const buttonElement = getButton();
    if (buttonElement) {
      buttonElement.setAttribute('aria-expanded', 'false');
    }
  };

  // Toggle listbox
  const toggleListbox = () => {
    const { open } = state.getState();
    if (open) {
      closeListbox();
    } else {
      openListbox();
    }
  };

  // Select option
  const selectOption = (index: number) => {
    const { options, multiple, selectedValue } = state.getState();
    if (index < 0 || index >= options.length) return;
    
    const option = options[index];
    if (option.disabled) return;
    
    let newValue: any;
    
    if (multiple) {
      newValue = Array.isArray(selectedValue) ? [...selectedValue] : [];
      const valueIndex = newValue.indexOf(option.value);
      
      if (valueIndex === -1) {
        newValue.push(option.value);
      } else {
        newValue.splice(valueIndex, 1);
      }
    } else {
      newValue = option.value;
      closeListbox();
    }
    
    state.setState({ selectedValue: newValue });
    updateSelectedOptions(newValue);
    
    // Dispatch custom event
    element.dispatchEvent(new CustomEvent('listbox:change', {
      bubbles: true,
      detail: { value: newValue }
    }));
  };

  // Set active index (for keyboard navigation)
  const setActiveIndex = (index: number) => {
    const { optionCount, options } = state.getState();
    
    if (index < 0) index = optionCount - 1;
    if (index >= optionCount) index = 0;
    
    // Skip disabled options
    let adjustedIndex = index;
    const maxIterations = optionCount;
    let iterationCount = 0;
    
    while (iterationCount < maxIterations) {
      if (!options[adjustedIndex].disabled) break;
      adjustedIndex = (adjustedIndex + 1) % optionCount;
      iterationCount++;
    }
    
    if (iterationCount === maxIterations) {
      // All options are disabled
      return;
    }
    
    state.setState({ activeIndex: adjustedIndex });
    
    // Update UI for active option
    options.forEach((option, i) => {
      if (i === adjustedIndex) {
        option.element.dataset.active = 'true';
        option.element.setAttribute('aria-selected', 'true');
        // Scroll into view if needed
        option.element.scrollIntoView({ block: 'nearest' });
      } else {
        delete option.element.dataset.active;
        const isSelected = option.element.dataset.selected === 'true';
        option.element.setAttribute('aria-selected', isSelected ? 'true' : 'false');
      }
    });
  };

  // Move active option up or down
  const moveActiveOption = (offset: number) => {
    const { activeIndex, optionCount } = state.getState();
    if (optionCount === 0) return;
    
    const newIndex = activeIndex === -1
      ? offset > 0 ? 0 : optionCount - 1
      : activeIndex + offset;
      
    setActiveIndex(newIndex);
  };

  // Set up keyboard handling
  const setupKeyboardHandler = () => {
    const keyboardHandler = createKeyboardHandler({
      ArrowDown: (event) => {
        if (state.getState().open) {
          event.preventDefault();
          moveActiveOption(1);
        }
      },
      ArrowUp: (event) => {
        if (state.getState().open) {
          event.preventDefault();
          moveActiveOption(-1);
        }
      },
      Home: (event) => {
        if (state.getState().open) {
          event.preventDefault();
          setActiveIndex(0);
        }
      },
      End: (event) => {
        if (state.getState().open) {
          event.preventDefault();
          setActiveIndex(state.getState().optionCount - 1);
        }
      },
      Enter: (event) => {
        const { open, activeIndex } = state.getState();
        if (open && activeIndex !== -1) {
          event.preventDefault();
          selectOption(activeIndex);
        }
      },
      Escape: (event) => {
        if (state.getState().open) {
          event.preventDefault();
          closeListbox();
        }
      },
      Tab: (event) => {
        if (state.getState().open) {
          closeListbox();
        }
      },
      Space: (event) => {
        const target = event.target as HTMLElement;
        const { open, activeIndex } = state.getState();
        
        if (target.dataset.headlessuiListboxButton) {
          event.preventDefault();
          toggleListbox();
        } else if (open && activeIndex !== -1) {
          event.preventDefault();
          selectOption(activeIndex);
        }
      },
    });

    keyboardHandler.attach(element);
    
    // Allow for type ahead search
    const handleTypeAhead = (event: KeyboardEvent) => {
      if (!state.getState().open) return;
      
      // Only process printable characters
      if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
        const { options } = state.getState();
        const query = event.key.toLowerCase();
        
        // Find the first non-disabled option that starts with the typed character
        const optionIndex = options.findIndex(option => 
          !option.disabled && 
          option.text.toLowerCase().startsWith(query)
        );
        
        if (optionIndex !== -1) {
          setActiveIndex(optionIndex);
        }
      }
    };
    
    element.addEventListener('keydown', handleTypeAhead);
  };

  // Set up button click handler
  const setupButtonHandler = () => {
    const button = getButton();
    if (!button) return;
    
    button.addEventListener('click', (event) => {
      event.preventDefault();
      toggleListbox();
    });
  };

  // Set up option click handlers
  const setupOptionHandlers = () => {
    getOptionElements().forEach((option, index) => {
      option.addEventListener('click', (event) => {
        event.preventDefault();
        selectOption(index);
      });
      
      option.addEventListener('mouseenter', () => {
        if (!option.dataset.disabled || option.dataset.disabled !== 'true') {
          setActiveIndex(index);
        }
      });
    });
  };

  // Initialize ARIA attributes
  const initializeAriaAttributes = () => {
    const button = getButton();
    const options = getOptions();
    const label = getLabel();
    
    // Generate IDs if needed
    const listboxId = element.id || `headlessui-listbox-${Math.random().toString(36).substring(2, 9)}`;
    element.id = listboxId;
    
    if (button) {
      const buttonId = button.id || `${listboxId}-button`;
      button.id = buttonId;
      button.setAttribute('aria-haspopup', 'listbox');
      button.setAttribute('aria-expanded', 'false');
      
      if (label) {
        const labelId = label.id || `${listboxId}-label`;
        label.id = labelId;
        button.setAttribute('aria-labelledby', labelId);
      }
    }
    
    if (options) {
      const optionsId = options.id || `${listboxId}-options`;
      options.id = optionsId;
      options.setAttribute('role', 'listbox');
      options.setAttribute('tabindex', '-1');
      
      if (button) {
        button.setAttribute('aria-controls', optionsId);
      }
      
      // Check if multiple selection is enabled
      const multiple = element.dataset.multiple === 'true';
      if (multiple) {
        options.setAttribute('aria-multiselectable', 'true');
        state.setState({ multiple: true });
      }
      
      // Set up initial hidden state for options
      if (!state.getState().open) {
        options.setAttribute('hidden', '');
      }
    }
    
    // Set up option attributes
    getOptionElements().forEach((option) => {
      option.setAttribute('role', 'option');
      option.setAttribute('tabindex', '-1');
      
      if (option.dataset.disabled === 'true') {
        option.setAttribute('aria-disabled', 'true');
      }
    });
  };

  // Check if we start in open state
  const checkInitialState = () => {
    if (element.dataset.headlessuiState === 'open') {
      openListbox();
    }
  };

  // Set up observer to watch for attribute changes
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
              openListbox();
            } else {
              closeListbox();
            }
          }
        }
      });
    });
    
    observer.observe(element, { attributes: true });
    
    // Keep reference for cleanup
    return observer;
  };

  // Initialize component
  const init = () => {
    initializeAriaAttributes();
    initializeOptions();
    setupKeyboardHandler();
    setupButtonHandler();
    setupOptionHandlers();
    checkInitialState();
    return setupAttributeObserver();
  };

  // Initialize
  const observer = init();

  // API for external control
  return {
    openListbox,
    closeListbox,
    toggleListbox,
    selectOption,
    isOpen: () => state.getState().open,
    getSelectedValue: () => state.getState().selectedValue,
    refreshOptions: initializeOptions,
  };
}