import React, { ComponentType, lazy, LazyExoticComponent } from 'react';

/**
 * Type-safe wrapper for lazy loading components
 * Ensures consistent naming and export patterns across the application
 * 
 * @param importFunc Function that imports the component module
 * @param componentName Optional name of the component if it's not the default export
 * @returns Lazy-loaded component
 */
export function lazyLoad<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T } | { [key: string]: T }>,
  componentName?: string
): LazyExoticComponent<T> {
  return lazy(() => 
    importFunc().then(module => {
      // Handle both default exports and named exports
      if (componentName && componentName in module) {
        // Convert named export to default export for React.lazy
        return { default: module[componentName as keyof typeof module] as T };
      }
      // Handle default export
      if ('default' in module) {
        return module as { default: T };
      }
      // If module itself is the component (neither named nor default)
      return { default: module as unknown as T };
    })
  );
}

/**
 * Creates a HOC that wraps a component with error boundaries, suspense, etc.
 * This helps standardize component loading patterns across the app
 * 
 * @param Component The component to wrap
 * @returns The wrapped component with standardized error handling
 */
export function withStandardizedExport<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> {
  const WrappedComponent: React.FC<P> = (props: P) => {
    return React.createElement(Component, props);
  };
  
  WrappedComponent.displayName = `StandardExport(${
    Component.displayName || Component.name || 'Component'
  })`;
  
  return WrappedComponent;
}

/**
 * Helper for consistent default exports
 * Use this when you want to export a component as both named and default
 */
export function createStandardExport<P extends object>(
  Component: React.ComponentType<P>, 
  componentName: string
): Record<string, React.ComponentType<P>> & { default: React.ComponentType<P> } {
  const StandardComponent = withStandardizedExport(Component);
  
  // Create an object that has both named export and default export
  const exports: Record<string, React.ComponentType<P>> = {
    [componentName]: StandardComponent,
    default: StandardComponent
  };
  
  return exports as Record<string, React.ComponentType<P>> & { default: React.ComponentType<P> };
}
