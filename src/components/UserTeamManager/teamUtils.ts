export type TeamRole = 'owner' | 'member';

export interface TeamMember {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  role: TeamRole;
}

export interface TeamDetails {
  id: string;
  name: string;
  description?: string;
  owners: TeamMember[];
  members: TeamMember[];
  created_at?: string;
}

/**
 * Check if a user is in a team (either as owner or member)
 * Enforces mutual exclusivity: a user cannot be both owner AND member
 */
export const isUserInTeam = (
  userId: string,
  teamDetails: TeamDetails
): { inTeam: boolean; role: TeamRole | null } => {
  const isOwner = teamDetails.owners?.some(o => o.id === userId);
  const isMember = teamDetails.members?.some(m => m.id === userId);

  // Mutual exclusivity check
  if (isOwner && isMember) {
    console.warn(`User ${userId} found in both owners and members - this violates role exclusivity`);
  }

  if (isOwner) return { inTeam: true, role: 'owner' };
  if (isMember) return { inTeam: true, role: 'member' };
  return { inTeam: false, role: null };
};

/**
 * Get combined and sorted member list with owners first
 */
export const getSortedTeamMembers = (teamDetails: TeamDetails): TeamMember[] => {
  const owners = (teamDetails.owners || []).map(o => ({ ...o, role: 'owner' as TeamRole }));
  const members = (teamDetails.members || []).map(m => ({ ...m, role: 'member' as TeamRole }));

  // Owners first, then members (each group sorted alphabetically by username)
  const sortedOwners = owners.sort((a, b) => a.username.localeCompare(b.username));
  const sortedMembers = members.sort((a, b) => a.username.localeCompare(b.username));

  return [...sortedOwners, ...sortedMembers];
};

/**
 * Get team statistics
 */
export const getTeamStats = (teamDetails: TeamDetails) => {
  const ownerCount = teamDetails.owners?.length || 0;
  const memberCount = teamDetails.members?.length || 0;

  return {
    ownerCount,
    memberCount,
    totalCount: ownerCount + memberCount,
  };
};

/**
 * Check if user can manage team (is owner)
 */
export const canManageTeam = (userId: string, teamDetails: TeamDetails): boolean => {
  return teamDetails.owners?.some(o => o.id === userId) || false;
};

/**
 * Normalize API response to TeamDetails structure
 */
export const normalizeTeamDetails = (apiResponse: any): TeamDetails => {
  return {
    id: apiResponse.id || '',
    name: apiResponse.name || '',
    description: apiResponse.description || '',
    owners: (apiResponse.owners || []).map((o: any) => ({
      id: o.id || o.user_id,
      username: o.username || o.name || 'Unknown',
      email: o.email || '',
      avatar: o.avatar || o.profile_picture,
      role: 'owner' as TeamRole,
    })),
    members: (apiResponse.members || apiResponse.users || []).map((m: any) => ({
      id: m.id || m.user_id,
      username: m.username || m.name || 'Unknown',
      email: m.email || '',
      avatar: m.avatar || m.profile_picture,
      role: 'member' as TeamRole,
    })),
    created_at: apiResponse.created_at,
  };
};
