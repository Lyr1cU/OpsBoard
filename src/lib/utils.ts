/**
 * Tailwind CSS class-name utility for OpsBoard UI components.
 *
 * Combines conditional classes (clsx) with Tailwind-aware deduplication (tailwind-merge).
 * Used throughout shadcn/ui components to merge variant classes without conflicts.
 */

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge class names safely for Tailwind — later conflicting utilities win.
 * Example: cn("px-2", isActive && "bg-primary", className)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
