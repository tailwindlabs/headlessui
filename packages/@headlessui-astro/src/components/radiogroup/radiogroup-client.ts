/**
 * Client-side functionality for the RadioGroup component
 */

import { createKeyboardHandler } from '../../core/keyboard/keyboard-handler';
import { createState } from '../../core/state/state';

interface RadioGroupState {
  value: any;
  options: HTMLElement[];
  labels: HTMLElement[];
  descriptions: HTMLElement[];
  disabled: boolean;
}

export function createRadioGroupContext(element: HTMLElement) {
  // Get component configuration from data attributes
  const disabled = element.dataset.disabled === 'true';
  const defaultValue = element.dataset.defaultValue;
  const name = element.dataset.name || '';
  
  // Create state management
  const state = createState<RadioGroupState>({
    value: defaultValue || null,
    options: [],
    labels: [],
    descriptions: [],
    disabled,
  });

  // Update radio options and related elements
  function updateElements() {
    const options = Array.from(
      element.querySelectorAll('[data-headlessui-radiogroup-option]')
    ) as HTMLElement[];
    
    const labels = Array.from(
      element.querySelectorAll('[data-headlessui-radiogroup-label]')
    ) as HTMLElement[];
    
    const descriptions = Array.from(
      element.querySelectorAll('[data-headlessui-radiogroup-description]')
    ) as HTMLElement[];
    
    state.setState({ options, labels, descriptions });
    
    // Initialize options with ARIA attributes
    options.forEach((option) => {
      setupOption(option);
    });
    
    // Initialize labels with ARIA attributes
    labels.forEach(setupLabel);
    
    // Initialize descriptions with ARIA attributes
    descriptions.forEach(setupDescription);
    
    // Select default value if available
    if (defaultValue) {
      selectValue(defaultValue);
    }
  }
  
  // Setup individual option
  function setupOption(option: HTMLElement) {
    // Set role
    option.setAttribute('role', 'radio');
    
    // Setup option id
    const optionId = ensureId(option, `headlessui-radiogroup-option-${Math.random().toString(36).substring(2, 9)}`);
    
    // Setup disabled state
    const isDisabled = option.dataset.disabled === 'true' || state.getState().disabled;
    option.setAttribute('aria-disabled', String(isDisabled));
    
    // Set initial checked state
    const value = option.dataset.value;
    const isChecked = value !== undefined && value === state.getState().value;
    option.setAttribute('aria-checked', String(isChecked));
    option.dataset.checked = String(isChecked);
    option.tabIndex = isChecked ? 0 : -1;
    
    // Setup click handler
    option.addEventListener('click', () => {
      if (!isDisabled && value !== undefined) {
        selectValue(value);
      }
    });
    
    return optionId;
  }
  
  // Setup label
  function setupLabel(label: HTMLElement) {
    const labelId = ensureId(label, `headlessui-radiogroup-label-${Math.random().toString(36).substring(2, 9)}`);
    element.setAttribute('aria-labelledby', labelId);
    
    return labelId;
  }
  
  // Setup description
  function setupDescription(description: HTMLElement) {
    description.id = ensureId(description, `headlessui-radiogroup-description-${Math.random().toString(36).substring(2, 9)}`);
    return description.id;
  }
  
  // Ensure element has an ID
  function ensureId(element: HTMLElement, fallbackId: string): string {
    if (!element.id) {
      element.id = fallbackId;
    }
    return element.id;
  }
  
  // Select a value
  function selectValue(value: any) {
    const { options } = state.getState();
    
    // Don't re-select the same value
    if (state.getState().value === value) {
      return;
    }
    
    // Update state
    state.setState({ value });
    
    // Update option attributes
    options.forEach((option) => {
      const optionValue = option.dataset.value;
      const isChecked = optionValue === value;
      
      option.setAttribute('aria-checked', String(isChecked));
      option.dataset.checked = String(isChecked);
      option.tabIndex = isChecked ? 0 : -1;
      
      updateOptionActiveState(option, isChecked);
    });
    
    // Dispatch change event
    element.dispatchEvent(new CustomEvent('radiogroup:change', {
      detail: { value },
      bubbles: true,
    }));
  }
  
  // Update option active state and classes
  function updateOptionActiveState(option: HTMLElement, isChecked: boolean) {
    // Toggle checked/unchecked classes if they exist
    const checkedClass = option.dataset.checkedClass;
    const uncheckedClass = option.dataset.uncheckedClass;
    
    if (checkedClass) {
      if (isChecked) {
        option.classList.add(...checkedClass.split(' '));
      } else {
        option.classList.remove(...checkedClass.split(' '));
      }
    }
    
    if (uncheckedClass) {
      if (!isChecked) {
        option.classList.add(...uncheckedClass.split(' '));
      } else {
        option.classList.remove(...uncheckedClass.split(' '));
      }
    }
  }
  
  // Setup keyboard navigation
  function setupKeyboardNavigation() {
    const keyboardHandler = createKeyboardHandler({
      ArrowDown: (event) => {
        event.preventDefault();
        focusNextOption();
      },
      ArrowRight: (event) => {
        event.preventDefault();
        focusNextOption();
      },
      ArrowUp: (event) => {
        event.preventDefault();
        focusPreviousOption();
      },
      ArrowLeft: (event) => {
        event.preventDefault();
        focusPreviousOption();
      },
      Space: (event) => {
        const { options } = state.getState();
        const target = event.target as HTMLElement;
        const index = options.indexOf(target);
        
        if (index !== -1) {
          event.preventDefault();
          const value = options[index].dataset.value;
          if (value !== undefined) {
            selectValue(value);
          }
        }
      },
    });
    
    keyboardHandler.attach(element);
  }
  
  // Focus next option
  function focusNextOption() {
    const { options } = state.getState();
    const currentValue = state.getState().value;
    
    // Find current index
    let currentIndex = -1;
    for (let i = 0; i < options.length; i++) {
      if (options[i].dataset.value === currentValue) {
        currentIndex = i;
        break;
      }
    }
    
    // Find next enabled option
    let nextIndex = currentIndex;
    do {
      nextIndex = (nextIndex + 1) % options.length;
      if (options[nextIndex].dataset.disabled !== 'true' && !state.getState().disabled) {
        break;
      }
    } while (nextIndex !== currentIndex && options.length > 1);
    
    // Select and focus next option
    const nextValue = options[nextIndex].dataset.value;
    if (nextValue !== undefined) {
      selectValue(nextValue);
      options[nextIndex].focus();
    }
  }
  
  // Focus previous option
  function focusPreviousOption() {
    const { options } = state.getState();
    const currentValue = state.getState().value;
    
    // Find current index
    let currentIndex = -1;
    for (let i = 0; i < options.length; i++) {
      if (options[i].dataset.value === currentValue) {
        currentIndex = i;
        break;
      }
    }
    
    // Find previous enabled option
    let prevIndex = currentIndex;
    do {
      prevIndex = (prevIndex - 1 + options.length) % options.length;
      if (options[prevIndex].dataset.disabled !== 'true' && !state.getState().disabled) {
        break;
      }
    } while (prevIndex !== currentIndex && options.length > 1);
    
    // Select and focus previous option
    const prevValue = options[prevIndex].dataset.value;
    if (prevValue !== undefined) {
      selectValue(prevValue);
      options[prevIndex].focus();
    }
  }
  
  // Initialize component
  updateElements();
  setupKeyboardNavigation();
  
  // Set up role and name for the radiogroup
  element.setAttribute('role', 'radiogroup');
  if (name) {
    element.setAttribute('name', name);
  }
  
  // Initialize with specified value if available
  const controlledValue = element.dataset.value;
  if (controlledValue !== undefined) {
    selectValue(controlledValue);
  }
  
  // Handle external value setting
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'data-value') {
        const newValue = element.dataset.value;
        if (newValue !== undefined) {
          selectValue(newValue);
        }
      }
    }
  });
  
  observer.observe(element, { attributes: true });
  
  return {
    selectValue,
    getValue: () => state.getState().value,
    getOptions: () => state.getState().options,
  };
}