import React from 'react';
import { isWeb } from '../../utils/IsWeb';
import type { TeamDetails } from './teamUtils';
import { getTeamStats } from './teamUtils';
import { View, Text, StyleSheet } from 'react-native';

export interface TeamStatsBarProps {
  teamDetails: TeamDetails;
}

const TeamStatsBar: React.FC<TeamStatsBarProps> = ({ teamDetails }) => {
  const stats = getTeamStats(teamDetails);

  // ------------------------ Web View ------------------------
  if (isWeb) {
    return (
      <div style={webStyles.container}>
        <span style={webStyles.item}>
          <span style={webStyles.icon}>👑</span>
          {stats.ownerCount} Owner{stats.ownerCount !== 1 ? 's' : ''}
        </span>
        <span style={webStyles.divider}>•</span>
        <span style={webStyles.item}>
          <span style={webStyles.icon}>👤</span>
          {stats.memberCount} Member{stats.memberCount !== 1 ? 's' : ''}
        </span>
        <span style={webStyles.divider}>•</span>
        <span style={webStyles.item}>
          {stats.totalCount} Total
        </span>
      </div>
    );
  }

  // ------------------------ Mobile View ------------------------
  return (
    <View style={mobileStyles.container}>
      <Text style={mobileStyles.item}>
        👑 {stats.ownerCount} Owner{stats.ownerCount !== 1 ? 's' : ''}
      </Text>
      <Text style={mobileStyles.divider}>•</Text>
      <Text style={mobileStyles.item}>
        👤 {stats.memberCount} Member{stats.memberCount !== 1 ? 's' : ''}
      </Text>
      <Text style={mobileStyles.divider}>•</Text>
      <Text style={mobileStyles.item}>
        {stats.totalCount} Total
      </Text>
    </View>
  );
};

// ------------------------ Web Styles ------------------------
const webStyles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '12px 16px',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '10px',
    marginBottom: '16px',
    flexWrap: 'wrap',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#888',
    fontSize: '13px',
    fontWeight: 500,
  },
  icon: {
    fontSize: '14px',
  },
  divider: {
    color: '#444',
    fontSize: '12px',
  },
};

// ------------------------ Mobile Styles ------------------------
const mobileStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 10,
    marginBottom: 16,
  },
  item: {
    color: '#888',
    fontSize: 13,
    fontWeight: '500',
  },
  divider: {
    color: '#444',
    fontSize: 12,
  },
});

export default TeamStatsBar;
