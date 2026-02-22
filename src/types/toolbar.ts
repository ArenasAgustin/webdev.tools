/**
 * Toolbar action types and configurations
 * Generic model for toolbar actions across all playgrounds
 */

/**
 * Available button variants for toolbar actions
 */
export type ToolbarButtonVariant = "primary" | "danger" | "success" | "purple" | "cyan" | "orange";

/**
 * Icon identifier (FontAwesome icon name without 'fa-' prefix)
 */
export type ToolbarIconName = string;

/**
 * Generic toolbar action model
 * Standard contract for all toolbar actions across playgrounds
 */
export interface ToolbarAction {
  /** Unique identifier for the action (optional, defaults to label) */
  id?: string;
  /** Display label for the button */
  label: string;
  /** Icon name (FontAwesome, e.g., "play", "indent", "trash") */
  icon: ToolbarIconName;
  /** Visual variant/color scheme for the button */
  variant: ToolbarButtonVariant;
  /** Action handler executed on click */
  onClick: () => void;
  /** Optional tooltip text (defaults to label) */
  tooltip?: string;
  /** Whether the action is currently disabled */
  disabled?: boolean;
  /** Optional loading state for async operations */
  loading?: boolean;
}

/**
 * Toolbar configuration for generic playgrounds
 */
export interface ToolbarConfig {
  /** Optional title for the toolbar section */
  title?: string;
  /** List of toolbar actions */
  actions: ToolbarAction[];
  /** Optional handler to open configuration modal */
  onOpenConfig?: () => void;
  /** Title for the config button */
  configButtonTitle?: string;
  /** Custom grid classes for layout */
  gridClassName?: string;
}

/**
 * Helper to create a toolbar action with type safety
 */
export function createToolbarAction(action: ToolbarAction): ToolbarAction {
  return {
    id: action.id ?? action.label,
    tooltip: action.tooltip ?? action.label,
    disabled: action.disabled ?? false,
    loading: action.loading ?? false,
    ...action,
  };
}

/**
 * Helper to create multiple toolbar actions
 */
export function createToolbarActions(actions: ToolbarAction[]): ToolbarAction[] {
  return actions.map(createToolbarAction);
}
