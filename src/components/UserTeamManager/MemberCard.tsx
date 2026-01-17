import React from 'react';
import { isWeb } from '../../utils/IsWeb';
import type { TeamMember } from './teamUtils';
import RoleActionMenu from './RoleActionMenu';
import {
  View,
  Text,
  StyleSheet,
  Image,
} from 'react-native';

export interface MemberCardProps {
  member: TeamMember;
  isViewerOwner: boolean;
  isCurrentUser: boolean;
  onPromoteToOwner: (member: TeamMember) => void;
  onDemoteToMember: (member: TeamMember) => void;
  onRemoveMember: (member: TeamMember) => void;
  actionsDisabled?: boolean;
}

const MemberCard: React.FC<MemberCardProps> = ({
  member,
  isViewerOwner,
  isCurrentUser,
  onPromoteToOwner,
  onDemoteToMember,
  onRemoveMember,
  actionsDisabled,
}) => {
  // ------------------------ Web View ------------------------
  if (isWeb) {
    return (
      <div style={webStyles.card}>
        {/* Avatar */}
        <div style={webStyles.avatarContainer}>
          {member.avatar ? (
            <img
              src={member.avatar}
              alt={member.username}
              style={webStyles.avatarImage}
            />
          ) : (
            <span style={webStyles.avatarFallback}>
              {member.username.charAt(0).toUpperCase()}
            </span>
          )}
          {member.role === 'owner' && (
            <span style={webStyles.ownerCrown}>👑</span>
          )}
        </div>

        {/* Info */}
        <div style={webStyles.info}>
          <div style={webStyles.nameRow}>
            <span style={webStyles.name}>
              {member.username}
              {isCurrentUser && <span style={webStyles.youBadge}>(you)</span>}
            </span>
            {member.role === 'owner' && (
              <span style={webStyles.ownerBadge}>Owner</span>
            )}
          </div>
          {member.email && (
            <span style={webStyles.email}>{member.email}</span>
          )}
        </div>

        {/* Action Menu - Only visible to owners */}
        {isViewerOwner && (
          <RoleActionMenu
            member={member}
            isCurrentUser={isCurrentUser}
            onPromoteToOwner={onPromoteToOwner}
            onDemoteToMember={onDemoteToMember}
            onRemoveMember={onRemoveMember}
            disabled={actionsDisabled}
          />
        )}
      </div>
    );
  }

  // ------------------------ Mobile View ------------------------
  return (
    <View style={mobileStyles.card}>
      {/* Avatar */}
      <View style={mobileStyles.avatarContainer}>
        {member.avatar ? (
          <Image
            source={{ uri: member.avatar }}
            style={mobileStyles.avatarImage}
          />
        ) : (
          <View style={mobileStyles.avatarFallback}>
            <Text style={mobileStyles.avatarText}>
              {member.username.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        {member.role === 'owner' && (
          <Text style={mobileStyles.ownerCrown}>👑</Text>
        )}
      </View>

      {/* Info */}
      <View style={mobileStyles.info}>
        <View style={mobileStyles.nameRow}>
          <Text style={mobileStyles.name}>
            {member.username}
            {isCurrentUser && (
              <Text style={mobileStyles.youBadge}> (you)</Text>
            )}
          </Text>
          {member.role === 'owner' && (
            <View style={mobileStyles.ownerBadge}>
              <Text style={mobileStyles.ownerBadgeText}>Owner</Text>
            </View>
          )}
        </View>
        {member.email && (
          <Text style={mobileStyles.email} numberOfLines={1}>
            {member.email}
          </Text>
        )}
      </View>

      {/* Action Menu */}
      {isViewerOwner && (
        <RoleActionMenu
          member={member}
          isCurrentUser={isCurrentUser}
          onPromoteToOwner={onPromoteToOwner}
          onDemoteToMember={onDemoteToMember}
          onRemoveMember={onRemoveMember}
          disabled={actionsDisabled}
        />
      )}
    </View>
  );
};

// ------------------------ Web Styles ------------------------
const webStyles: Record<string, React.CSSProperties> = {
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
  avatarContainer: {
    position: 'relative',
    width: '44px',
    height: '44px',
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
    fontSize: '18px',
    fontWeight: 700,
  },
  ownerCrown: {
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
    flexWrap: 'wrap',
  },
  name: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#fff',
  },
  youBadge: {
    marginLeft: '6px',
    fontSize: '12px',
    color: '#666',
    fontWeight: 400,
  },
  ownerBadge: {
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
};

// ------------------------ Mobile Styles ------------------------
const mobileStyles = StyleSheet.create({
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
    width: 44,
    height: 44,
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  ownerCrown: {
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
    flexWrap: 'wrap',
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  youBadge: {
    fontSize: 12,
    color: '#666',
    fontWeight: '400',
  },
  ownerBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: '#f5af19',
  },
  ownerBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  email: {
    fontSize: 12,
    color: '#666',
  },
});

export default MemberCard;
