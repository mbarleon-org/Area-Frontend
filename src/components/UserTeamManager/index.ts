// UserTeamManager Components
// Modular team management system for Dashboard integration

// Main components
export { default as TeamSelector } from './TeamSelector';
export type { Team } from './TeamSelector';
export { default as AddMemberModal } from './AddMemberModal';

// Tab components
export { default as MembersTab } from './MembersTab';
export { default as AddMemberTab } from './AddMemberTab';
export { default as CreateTeamTab } from './CreateTeamTab';

// Reusable sub-components
export { default as TeamDropdown } from './TeamDropdown';
export { default as TeamStatsBar } from './TeamStatsBar';
export { default as MemberCard } from './MemberCard';
export { default as RoleActionMenu } from './RoleActionMenu';
export { default as ConfirmationModal } from './ConfirmationModal';
export { default as TeamSettings } from './TeamSettings';

// Team utilities for role management
export {
  type TeamMember,
  type TeamDetails,
  isUserInTeam,
  getSortedTeamMembers,
  getTeamStats,
  normalizeTeamDetails,
} from './teamUtils';
