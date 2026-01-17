import React from 'react';
import { isWeb } from '../../utils/IsWeb';
import type { Team } from './TeamSelector';
import type { TeamMember, TeamDetails } from './teamUtils';
import TeamDropdown from './TeamDropdown';
import TeamStatsBar from './TeamStatsBar';
import MemberCard from './MemberCard';
import TeamSettings from './TeamSettings';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

export interface MembersTabProps {
  teams: Team[];
  selectedTeam: Team | null;
  loadingTeams: boolean;
  teamDropdownOpen: boolean;
  onDropdownToggle: () => void;
  onTeamSelect: (team: Team) => void;
  teamDetails: TeamDetails | null;
  loadingMembers: boolean;
  sortedMembers: TeamMember[];
  onAddMemberClick: () => void;
  successMessage: string | null;
  isOwner: boolean;
  currentUserId?: string | null;
  onPromote: (member: TeamMember) => void;
  onDemote: (member: TeamMember) => void;
  onRemove: (member: TeamMember) => void;
  memberActionLoading: boolean;
  memberActionError: string | null;
  onTeamUpdated: (updatedTeam: Team) => void;
  onTeamDeleted: () => void;
}

const MembersTab: React.FC<MembersTabProps> = ({
  teams,
  selectedTeam,
  loadingTeams,
  teamDropdownOpen,
  onDropdownToggle,
  onTeamSelect,
  teamDetails,
  loadingMembers,
  sortedMembers,
  onAddMemberClick,
  successMessage,
  isOwner,
  currentUserId,
  onPromote,
  onDemote,
  onRemove,
  memberActionLoading,
  memberActionError,
  onTeamUpdated,
  onTeamDeleted,
}) => {
  const headingLabel = isOwner ? 'Manage Team' : 'Team Members';

  // ------------------------ Web View ------------------------
  if (isWeb) {
    return (
      <>
        <div style={webStyles.headingRow}>
          <div style={webStyles.heading}>{headingLabel}</div>
          {memberActionError && <div style={webStyles.error}>{memberActionError}</div>}
          {successMessage && !memberActionError && (
            <div style={webStyles.success}>
              <span style={webStyles.successIcon}>✓</span>
              {successMessage}
            </div>
          )}
        </div>

        <div style={webStyles.section}>
          <label style={webStyles.label}>Select Team</label>
          <TeamDropdown
            teams={teams}
            selectedTeam={selectedTeam}
            loading={loadingTeams}
            isOpen={teamDropdownOpen}
            onToggle={onDropdownToggle}
            onSelect={onTeamSelect}
          />
        </div>

        {teamDetails && <TeamStatsBar teamDetails={teamDetails} />}

        {selectedTeam && isOwner && (
          <div style={webStyles.section}>
            <TeamSettings
              team={selectedTeam}
              isOwner={isOwner}
              onTeamUpdated={onTeamUpdated}
              onTeamDeleted={onTeamDeleted}
            />
          </div>
        )}

        {/* Members List */}
        <div style={webStyles.listContainer}>
          {loadingMembers ? (
            <div style={webStyles.loading}>
              <div style={webStyles.spinner} />
              <span>Loading members...</span>
            </div>
          ) : !selectedTeam ? (
            <div style={webStyles.empty}>
              <span style={webStyles.emptyIcon}>📋</span>
              <span>Select a team to view members</span>
            </div>
          ) : sortedMembers.length === 0 ? (
            <div style={webStyles.empty}>
              <span style={webStyles.emptyIcon}>👥</span>
              <span>No members in this team yet</span>
              <button style={webStyles.addFirstButton} onClick={onAddMemberClick}>
                Add the first member
              </button>
            </div>
          ) : (
            <div style={webStyles.list}>
              {sortedMembers.map((member) => (
                  <MemberCard
                    key={member.id}
                    member={member}
                    isViewerOwner={isOwner}
                    isCurrentUser={!!currentUserId && member.id === currentUserId}
                    onPromoteToOwner={() => onPromote(member)}
                    onDemoteToMember={() => onDemote(member)}
                    onRemoveMember={() => onRemove(member)}
                    actionsDisabled={memberActionLoading}
                  />
              ))}
            </div>
          )}
        </div>
        {memberActionLoading && (
          <div style={webStyles.inlineInfo}>Processing action...</div>
        )}
      </>
    );
  }

  // ------------------------ Mobile View ------------------------
  return (
    <>
      <View style={mobileStyles.headingRow}>
        <Text style={mobileStyles.heading}>{headingLabel}</Text>
        {memberActionError && <Text style={mobileStyles.error}>{memberActionError}</Text>}
        {successMessage && !memberActionError && (
          <Text style={mobileStyles.successText}>✓ {successMessage}</Text>
        )}
      </View>

      <View style={mobileStyles.section}>
        <Text style={mobileStyles.label}>Select Team</Text>
        <TeamDropdown
          teams={teams}
          selectedTeam={selectedTeam}
          loading={loadingTeams}
          isOpen={teamDropdownOpen}
          onToggle={onDropdownToggle}
          onSelect={onTeamSelect}
        />
      </View>

      {teamDetails && <TeamStatsBar teamDetails={teamDetails} />}

      {selectedTeam && isOwner && (
        <View style={mobileStyles.section}>
          <TeamSettings
            team={selectedTeam}
            isOwner={isOwner}
            onTeamUpdated={onTeamUpdated}
            onTeamDeleted={onTeamDeleted}
          />
        </View>
      )}

      {loadingMembers ? (
        <View style={mobileStyles.loading}>
          <ActivityIndicator size="small" color="#fff" />
          <Text style={mobileStyles.loadingText}>Loading members...</Text>
        </View>
      ) : !selectedTeam ? (
        <View style={mobileStyles.empty}>
          <Text style={mobileStyles.emptyIcon}>📋</Text>
          <Text style={mobileStyles.emptyText}>Select a team to view members</Text>
        </View>
      ) : sortedMembers.length === 0 ? (
        <View style={mobileStyles.empty}>
          <Text style={mobileStyles.emptyIcon}>👥</Text>
          <Text style={mobileStyles.emptyText}>No members in this team yet</Text>
          <TouchableOpacity style={mobileStyles.addFirstButton} onPress={onAddMemberClick}>
            <Text style={mobileStyles.addFirstButtonText}>Add the first member</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={mobileStyles.list}>
          {sortedMembers.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              isViewerOwner={isOwner}
              isCurrentUser={!!currentUserId && member.id === currentUserId}
              onPromoteToOwner={() => onPromote(member)}
              onDemoteToMember={() => onDemote(member)}
              onRemoveMember={() => onRemove(member)}
              actionsDisabled={memberActionLoading}
            />
          ))}
        </View>
      )}

      {memberActionLoading && (
        <View style={mobileStyles.inlineInfo}>
          <Text style={mobileStyles.inlineInfoText}>Processing action...</Text>
        </View>
      )}
    </>
  );
};

// ------------------------ Web Styles ------------------------
const webStyles: Record<string, React.CSSProperties> = {
  headingRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '16px',
  },
  heading: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#fff',
  },
  error: {
    padding: '10px 12px',
    borderRadius: '8px',
    background: 'rgba(231,76,60,0.1)',
    border: '1px solid rgba(231,76,60,0.25)',
    color: '#e74c3c',
    fontSize: '13px',
    fontWeight: 500,
  },
  inlineInfo: {
    marginTop: '8px',
    color: '#aaa',
    fontSize: '12px',
  },
  section: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    color: '#888',
    fontWeight: 600,
    marginBottom: '8px',
  },
  listContainer: {
    flex: 1,
    minHeight: '200px',
    maxHeight: '320px',
    overflowY: 'auto',
    marginBottom: '16px',
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '40px 20px',
    color: '#666',
    fontSize: '13px',
  },
  spinner: {
    width: '18px',
    height: '18px',
    border: '2px solid rgba(255,255,255,0.1)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '40px 20px',
    color: '#555',
    fontSize: '14px',
    textAlign: 'center',
  },
  emptyIcon: {
    fontSize: '32px',
    marginBottom: '8px',
    opacity: 0.6,
  },
  addFirstButton: {
    marginTop: '12px',
    padding: '10px 20px',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  card: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '12px 14px',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '10px',
    transition: 'background 0.15s',
  },
  avatar: {
    position: 'relative',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667 0%, #444 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
    flexShrink: 0,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  avatarFallback: {
    color: '#fff',
    fontSize: '16px',
    fontWeight: 700,
  },
  crown: {
    position: 'absolute',
    top: '-6px',
    right: '-4px',
    fontSize: '14px',
    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))',
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  nameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '2px',
  },
  name: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#fff',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  badge: {
    padding: '2px 8px',
    background: 'linear-gradient(135deg, #f5af19 0%, #f12711 100%)',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '10px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  email: {
    fontSize: '12px',
    color: '#666',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  success: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 16px',
    background: 'rgba(46, 204, 113, 0.1)',
    border: '1px solid rgba(46, 204, 113, 0.2)',
    borderRadius: '8px',
    color: '#2ecc71',
    fontSize: '13px',
    fontWeight: 500,
    marginBottom: '16px',
  },
  successIcon: {
    fontSize: '14px',
  },
};

// ------------------------ Mobile Styles ------------------------
const mobileStyles = StyleSheet.create({
  headingRow: {
    marginBottom: 12,
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  error: {
    marginTop: 6,
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(231,76,60,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(231,76,60,0.25)',
    color: '#e74c3c',
    fontSize: 13,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    color: '#888',
    fontWeight: '600',
    marginBottom: 8,
  },
  loading: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    color: '#666',
    fontSize: 13,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 12,
    opacity: 0.6,
  },
  emptyText: {
    color: '#555',
    fontSize: 14,
    textAlign: 'center',
  },
  addFirstButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  addFirstButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  list: {
    gap: 8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  crown: {
    position: 'absolute',
    top: -6,
    right: -4,
    fontSize: 14,
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  badge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: '#f5af19',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  email: {
    fontSize: 12,
    color: '#666',
  },
  success: {
    padding: 12,
    backgroundColor: 'rgba(46, 204, 113, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(46, 204, 113, 0.2)',
    borderRadius: 8,
    marginBottom: 16,
  },
  successText: {
    color: '#2ecc71',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  inlineInfo: {
    marginTop: 8,
    alignItems: 'flex-start',
  },
  inlineInfoText: {
    color: '#aaa',
    fontSize: 12,
  },
});

export default MembersTab;
