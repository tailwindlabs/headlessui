/**
 * Client-side functionality for the Tabs component
 */

import { createKeyboardHandler } from '../../core/keyboard/keyboard-handler';
import { createState } from '../../core/state/state';

interface TabsState {
  selectedIndex: number;
  tabs: HTMLElement[];
  panels: HTMLElement[];
  manual: boolean;
  orientation: 'horizontal' | 'vertical';
}

export function createTabsContext(element: HTMLElement) {
  // Get component configuration from data attributes
  const manual = element.dataset.manual === 'true';
  const vertical = element.dataset.vertical === 'true';
  const defaultIndex = parseInt(element.dataset.defaultIndex || '0', 10);
  
  // Create state management
  const state = createState<TabsState>({
    selectedIndex: defaultIndex,
    tabs: [],
    panels: [],
    manual,
    orientation: vertical ? 'vertical' : 'horizontal',
  });

  // Get related elements
  const tabListElement = element.querySelector('[data-headlessui-tab-list]');
  const tabPanelsElement = element.querySelector('[data-headlessui-tab-panels]');
  
  // Update tabs and panels lists
  function updateElements() {
    if (!tabListElement) return;
    
    const tabs = Array.from(
      tabListElement.querySelectorAll('[data-headlessui-tab]')
    ) as HTMLElement[];
    
    const panels = (tabPanelsElement 
      ? Array.from(tabPanelsElement.querySelectorAll('[data-headlessui-tab-panel]')) 
      : []) as HTMLElement[];
    
    state.setState({ tabs, panels });
    
    // Initialize tabs with ARIA attributes
    tabs.forEach((tab, index) => {
      setupTab(tab, index);
    });
    
    // Initialize panels with ARIA attributes
    panels.forEach((panel, index) => {
      setupPanel(panel, index);
    });
    
    // Select default tab
    selectTab(state.getState().selectedIndex);
  }
  
  // Setup individual tab
  function setupTab(tab: HTMLElement, index: number) {
    const { panels } = state.getState();
    
    // Set role
    tab.setAttribute('role', 'tab');
    
    // Connect tab to panel
    if (panels[index]) {
      const panelId = ensureId(panels[index], `headlessui-tabpanel-${index}`);
      tab.setAttribute('aria-controls', panelId);
    }
    
    // Set tab id
    const tabId = ensureId(tab, `headlessui-tab-${index}`);
    
    // Setup disabled state
    const isDisabled = tab.dataset.disabled === 'true';
    tab.setAttribute('aria-disabled', String(isDisabled));
    tab.tabIndex = isDisabled ? -1 : -1; // Tabs get proper tabindex during selection
    
    // Setup click handler
    tab.addEventListener('click', () => {
      if (!isDisabled) {
        selectTab(index);
      }
    });
    
    // Setup focus handler
    tab.addEventListener('focus', () => {
      if (!isDisabled && !state.getState().manual) {
        selectTab(index);
      }
    });
    
    return tabId;
  }
  
  // Setup individual panel
  function setupPanel(panel: HTMLElement, index: number) {
    const { tabs } = state.getState();
    
    // Set role
    panel.setAttribute('role', 'tabpanel');
    
    // Connect panel to tab
    if (tabs[index]) {
      const tabId = ensureId(tabs[index], `headlessui-tab-${index}`);
      panel.setAttribute('aria-labelledby', tabId);
    }
    
    // Set panel id
    const panelId = ensureId(panel, `headlessui-tabpanel-${index}`);
    
    // Setup initial visibility
    panel.hidden = index !== state.getState().selectedIndex;
    
    return panelId;
  }
  
  // Ensure element has an ID
  function ensureId(element: HTMLElement, fallbackId: string): string {
    if (!element.id) {
      element.id = fallbackId;
    }
    return element.id;
  }
  
  // Select a tab by index
  function selectTab(index: number) {
    const { tabs, panels, selectedIndex } = state.getState();
    
    // Validate index
    if (index < 0 || index >= tabs.length) {
      return;
    }
    
    // Check if tab is disabled
    if (tabs[index]?.dataset.disabled === 'true') {
      return;
    }
    
    // Don't reselect the same tab
    if (selectedIndex === index) {
      return;
    }
    
    // Update state
    state.setState({ selectedIndex: index });
    
    // Update tab and panel attributes
    tabs.forEach((tab, i) => {
      const isSelected = i === index;
      tab.setAttribute('aria-selected', String(isSelected));
      tab.tabIndex = isSelected ? 0 : -1;
      tab.dataset.selected = String(isSelected);
      updateTabActiveState(tab, isSelected);
    });
    
    // Show/hide panels
    panels.forEach((panel, i) => {
      panel.hidden = i !== index;
    });
    
    // Dispatch change event
    element.dispatchEvent(new CustomEvent('headlessui:change', {
      detail: { index },
      bubbles: true,
    }));
  }
  
  // Update tab active state and classes
  function updateTabActiveState(tab: HTMLElement, isActive: boolean) {
    // Update data attribute for styling
    tab.dataset.selected = String(isActive);
    
    // Toggle active class if it exists
    const activeClass = tab.dataset.activeClass;
    const inactiveClass = tab.dataset.inactiveClass;
    
    if (activeClass) {
      if (isActive) {
        tab.classList.add(...activeClass.split(' '));
      } else {
        tab.classList.remove(...activeClass.split(' '));
      }
    }
    
    if (inactiveClass) {
      if (!isActive) {
        tab.classList.add(...inactiveClass.split(' '));
      } else {
        tab.classList.remove(...inactiveClass.split(' '));
      }
    }
  }
  
  // Setup keyboard navigation
  function setupKeyboardNavigation() {
    if (!tabListElement) return;
    
    const horizontal = state.getState().orientation === 'horizontal';
    
    const keyboardHandler = createKeyboardHandler({
      [horizontal ? 'ArrowRight' : 'ArrowDown']: (event) => {
        if (state.getState().manual) return;
        
        event.preventDefault();
        const { tabs, selectedIndex } = state.getState();
        
        // Find next enabled tab
        let newIndex = selectedIndex;
        do {
          newIndex = (newIndex + 1) % tabs.length;
          if (tabs[newIndex]?.dataset.disabled !== 'true') break;
        } while (newIndex !== selectedIndex);
        
        selectTab(newIndex);
        tabs[newIndex]?.focus();
      },
      [horizontal ? 'ArrowLeft' : 'ArrowUp']: (event) => {
        if (state.getState().manual) return;
        
        event.preventDefault();
        const { tabs, selectedIndex } = state.getState();
        
        // Find previous enabled tab
        let newIndex = selectedIndex;
        do {
          newIndex = (newIndex - 1 + tabs.length) % tabs.length;
          if (tabs[newIndex]?.dataset.disabled !== 'true') break;
        } while (newIndex !== selectedIndex);
        
        selectTab(newIndex);
        tabs[newIndex]?.focus();
      },
      Home: (event) => {
        event.preventDefault();
        const { tabs } = state.getState();
        
        // Find first enabled tab
        for (let i = 0; i < tabs.length; i++) {
          if (tabs[i]?.dataset.disabled !== 'true') {
            selectTab(i);
            tabs[i]?.focus();
            break;
          }
        }
      },
      End: (event) => {
        event.preventDefault();
        const { tabs } = state.getState();
        
        // Find last enabled tab
        for (let i = tabs.length - 1; i >= 0; i--) {
          if (tabs[i]?.dataset.disabled !== 'true') {
            selectTab(i);
            tabs[i]?.focus();
            break;
          }
        }
      },
      // For manual activation
      Enter: (event) => {
        if (!state.getState().manual) return;
        
        const target = event.target as HTMLElement;
        const index = state.getState().tabs.indexOf(target);
        
        if (index !== -1 && target.dataset.disabled !== 'true') {
          event.preventDefault();
          selectTab(index);
        }
      },
      ' ': (event) => {
        if (!state.getState().manual) return;
        
        const target = event.target as HTMLElement;
        const index = state.getState().tabs.indexOf(target);
        
        if (index !== -1 && target.dataset.disabled !== 'true') {
          event.preventDefault();
          selectTab(index);
        }
      },
    });
    
    keyboardHandler.attach(tabListElement as HTMLElement);
  }
  
  // Initialize component
  updateElements();
  setupKeyboardNavigation();
  
  // Initialize selection
  const controlledIndex = element.dataset.selectedIndex;
  if (controlledIndex && !isNaN(parseInt(controlledIndex, 10))) {
    selectTab(parseInt(controlledIndex, 10));
  } else {
    selectTab(defaultIndex);
  }
  
  // Handle external index setting
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'data-selected-index') {
        const newIndex = element.dataset.selectedIndex;
        if (newIndex && !isNaN(parseInt(newIndex, 10))) {
          selectTab(parseInt(newIndex, 10));
        }
      }
    }
  });
  
  observer.observe(element, { attributes: true });
  
  return {
    selectTab,
    getSelectedIndex: () => state.getState().selectedIndex,
    getTabs: () => state.getState().tabs,
    getPanels: () => state.getState().panels,
  };
}