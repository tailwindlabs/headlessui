/**
 * Client-side functionality for the Switch component
 */

import { createState } from '../../core/state/state';

interface SwitchState {
  checked: boolean;
  disabled: boolean;
  labels: HTMLElement[];
  descriptions: HTMLElement[];
}

export function createSwitchContext(element: HTMLElement) {
  // Get component configuration from data attributes
  const disabled = element.dataset.disabled === 'true';
  const defaultChecked = element.dataset.defaultChecked === 'true';
  
  // Create state management
  const state = createState<SwitchState>({
    checked: defaultChecked,
    disabled,
    labels: [],
    descriptions: [],
  });

  // Update switch related elements
  function updateElements() {
    // Find related elements
    const labels = Array.from(
      element.closest('[data-headlessui-switch-group]')?.querySelectorAll('[data-headlessui-switch-label]') || []
    ) as HTMLElement[];
    
    const descriptions = Array.from(
      element.closest('[data-headlessui-switch-group]')?.querySelectorAll('[data-headlessui-switch-description]') || []
    ) as HTMLElement[];
    
    state.setState({ labels, descriptions });
    
    // Initialize labels with proper attributes
    labels.forEach(setupLabel);
    
    // Initialize descriptions with proper attributes
    descriptions.forEach(setupDescription);
  }
  
  // Setup label
  function setupLabel(label: HTMLElement) {
    const isPassive = label.dataset.passive === 'true';
    const labelId = ensureId(label, `headlessui-switch-label-${Math.random().toString(36).substring(2, 9)}`);
    
    // Connect label to switch
    element.setAttribute('aria-labelledby', labelId);
    
    // Set up click handler for non-passive labels
    if (!isPassive) {
      label.addEventListener('click', () => {
        if (!state.getState().disabled) {
          toggleChecked();
        }
      });
    }
    
    return labelId;
  }
  
  // Setup description
  function setupDescription(description: HTMLElement) {
    const descriptionId = ensureId(description, `headlessui-switch-description-${Math.random().toString(36).substring(2, 9)}`);
    
    // Connect description to switch
    const currentLabelledBy = element.getAttribute('aria-labelledby') || '';
    element.setAttribute('aria-describedby', descriptionId);
    
    return descriptionId;
  }
  
  // Ensure element has an ID
  function ensureId(element: HTMLElement, fallbackId: string): string {
    if (!element.id) {
      element.id = fallbackId;
    }
    return element.id;
  }
  
  // Toggle the checked state
  function toggleChecked() {
    if (state.getState().disabled) return;
    
    const newChecked = !state.getState().checked;
    setState(newChecked);
  }
  
  // Set the checked state
  function setState(checked: boolean) {
    // Update state
    state.setState({ checked });
    
    // Update element attributes
    element.setAttribute('aria-checked', String(checked));
    element.dataset.checked = String(checked);
    
    // Update classes if specified
    updateCheckedClasses(checked);
    
    // Dispatch change event
    element.dispatchEvent(new CustomEvent('switch:change', {
      detail: { checked },
      bubbles: true,
    }));
  }
  
  // Update classes based on checked state
  function updateCheckedClasses(checked: boolean) {
    const checkedClass = element.dataset.checkedClass;
    const uncheckedClass = element.dataset.uncheckedClass;
    
    if (checkedClass) {
      if (checked) {
        element.classList.add(...checkedClass.split(' '));
      } else {
        element.classList.remove(...checkedClass.split(' '));
      }
    }
    
    if (uncheckedClass) {
      if (!checked) {
        element.classList.add(...uncheckedClass.split(' '));
      } else {
        element.classList.remove(...uncheckedClass.split(' '));
      }
    }
  }
  
  // Initialize component
  function initialize() {
    // Set role and attributes
    element.setAttribute('role', 'switch');
    element.setAttribute('tabindex', disabled ? '-1' : '0');
    element.setAttribute('aria-checked', String(state.getState().checked));
    element.dataset.checked = String(state.getState().checked);
    
    // Add click handler
    element.addEventListener('click', () => {
      if (!state.getState().disabled) {
        toggleChecked();
      }
    });
    
    // Add keyboard handler
    element.addEventListener('keydown', (event) => {
      if (state.getState().disabled) return;
      
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        toggleChecked();
      }
    });
    
    // Update elements and set initial state
    updateElements();
    
    // Set initial classes
    updateCheckedClasses(state.getState().checked);
    
    // Handle controlled mode via data attribute
    const controlledChecked = element.dataset.checked;
    if (controlledChecked !== undefined) {
      setState(controlledChecked === 'true');
    }
  }
  
  // Initialize the component
  initialize();
  
  // Handle external value setting
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'data-checked') {
        const newCheckedValue = element.dataset.checked;
        if (newCheckedValue !== undefined) {
          setState(newCheckedValue === 'true');
        }
      }
      
      if (mutation.type === 'attributes' && mutation.attributeName === 'data-disabled') {
        const newDisabledValue = element.dataset.disabled;
        if (newDisabledValue !== undefined) {
          state.setState({ disabled: newDisabledValue === 'true' });
          element.setAttribute('tabindex', newDisabledValue === 'true' ? '-1' : '0');
        }
      }
    }
  });
  
  observer.observe(element, { attributes: true });
  
  return {
    toggle: toggleChecked,
    setChecked: setState,
    getChecked: () => state.getState().checked,
    isDisabled: () => state.getState().disabled,
  };
}