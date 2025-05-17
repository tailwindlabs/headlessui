/**
 * Utility for creating and managing component context through data attributes
 */

export function createContext(element: HTMLElement, initialData: Record<string, any> = {}) {
  // Store data on the element
  Object.entries(initialData).forEach(([key, value]) => {
    element.dataset[`context${key.charAt(0).toUpperCase() + key.slice(1)}`] = 
      typeof value === 'object' ? JSON.stringify(value) : String(value);
  });

  // Create a proxy for accessing context
  const contextProxy = new Proxy({}, {
    get(_target, prop: string) {
      const dataKey = `context${prop.charAt(0).toUpperCase() + prop.slice(1)}`;
      const value = element.dataset[dataKey];
      if (value === undefined) return undefined;
      
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    },
    set(_target, prop: string, value) {
      const dataKey = `context${prop.charAt(0).toUpperCase() + prop.slice(1)}`;
      element.dataset[dataKey] = 
        typeof value === 'object' ? JSON.stringify(value) : String(value);
      
      // Dispatch a custom event for state changes
      element.dispatchEvent(new CustomEvent('context-change', {
        detail: { prop, value },
        bubbles: true,
      }));
      
      return true;
    }
  });

  return contextProxy;
}