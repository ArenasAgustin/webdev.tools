/**
 * Color constants for consistent theming across the application
 */

/**
 * Icon color classes for Tailwind CSS
 * Maps color keys to their corresponding Tailwind text utility classes
 */
export const ICON_COLORS = {
  "blue-400": "text-blue-400",
  "blue-300": "text-blue-300",
  "green-400": "text-green-400",
  "red-400": "text-red-400",
  "yellow-400": "text-yellow-400",
  "purple-400": "text-purple-400",
  "cyan-400": "text-cyan-400",
  "orange-400": "text-orange-400",
  "pink-400": "text-pink-400",
} as const;

/**
 * Type for valid icon color keys
 */
export type IconColorKey = keyof typeof ICON_COLORS;

/**
 * Helper function to get icon color class
 * Returns the Tailwind class or a default if the color is not found
 */
export function getIconColorClass(
  color?: string,
  defaultColor: IconColorKey = "blue-400",
): string {
  return ICON_COLORS[color as IconColorKey] || ICON_COLORS[defaultColor];
}
