/**
 * Utility functions for combining and managing CSS class names
 */

type ClassValue = string | number | boolean | undefined | null;
type ClassArray = ClassValue[];
type ClassDictionary = Record<string, any>;
type ClassNameInput = ClassValue | ClassArray | ClassDictionary;

/**
 * Combines multiple class names into a single string
 * Similar to clsx/classnames but simpler
 */
export function cn(...inputs: ClassNameInput[]): string {
  const classes: string[] = [];

  for (const input of inputs) {
    if (!input) continue;

    if (typeof input === 'string') {
      classes.push(input);
    } else if (typeof input === 'number') {
      classes.push(String(input));
    } else if (Array.isArray(input)) {
      const result = cn(...input);
      if (result) classes.push(result);
    } else if (typeof input === 'object') {
      for (const key in input) {
        if (input[key]) classes.push(key);
      }
    }
  }

  return classes.join(' ');
}

/**
 * Conditional class name helper
 */
export function conditional(condition: boolean, trueClass: string, falseClass?: string): string {
  return condition ? trueClass : (falseClass || '');
}

/**
 * Variant-based class name selector
 */
export function variant<T extends string>(
  activeVariant: T,
  variants: Record<T, string>
): string {
  return variants[activeVariant] || '';
}

/**
 * Size-based class name selector
 */
export function size(
  activeSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl',
  sizes: Partial<Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', string>>
): string {
  return sizes[activeSize] || '';
}

/**
 * State-based class name selector
 */
export function state(
  currentState: string,
  states: Record<string, string>
): string {
  return states[currentState] || '';
}