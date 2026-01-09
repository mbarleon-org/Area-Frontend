/**
 * EditMenu Component - Refactored
 *
 * This file re-exports the refactored EditMenu from the EditMenu folder.
 * The component has been split into:
 * - EditMenu.types.ts: All TypeScript types
 * - EditMenu.styles.ts: All CSS-in-JS styles
 * - useEditMenuLogic.ts: Custom hook with all business logic
 * - EditMenuField.tsx: Reusable input field component
 * - EditMenuTabs.tsx: Tab navigation component
 * - GmailConnection.tsx: Gmail authentication component
 * - CustomFieldsList.tsx: Dynamic fields list component
 * - EditMenu.tsx: Main component (thin shell)
 */

export { default } from './EditMenu/index';
export type { EditMenuHandle, NodeItem, EditMenuProps, TabType, InputSpec, OptionSpec, ModuleSpecs } from './EditMenu/index';
