import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { isWeb } from '../../utils/IsWeb';

interface Team {
  id: string;
  name: string;
}

interface UserTeamManagerProps {
  userId: string;
  userTeams: string[]; // Array of team IDs the user belongs to
  get: (url: string) => Promise<any>;
  post: (url: string, data?: any) => Promise<any>;
  del: (url: string) => Promise<any>;
  onTeamsChange: () => void;
}

const UserTeamManager: React.FC<UserTeamManagerProps> = ({
  userId,
  userTeams,
  get,
  post,
  del,
  onTeamsChange,
}) => {
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [hoveredTeamId, setHoveredTeamId] = useState<string | null>(null);
  const [teamMembersMap, setTeamMembersMap] = useState<Record<string, string[]>>({});

  const fetchTeamMembers = useCallback(async (teamId: string) => {
    try {
      const detail = await get(`/teams/${teamId}`);
      const members = detail?.team?.users || [];
      const memberIds = members.map((u: any) => u?.id || u?.userId || u);
      setTeamMembersMap((prev) => ({ ...prev, [teamId]: memberIds }));
    } catch (err) {
      console.error(`Failed to fetch team members for ${teamId}`, err);
      setTeamMembersMap((prev) => ({ ...prev, [teamId]: prev[teamId] || [] }));
    }
  }, [get]);

  const fetchTeams = useCallback(async () => {
    try {
      setLoading(true);
      const res = await get('/teams/all');
      const teams = res?.teams || (Array.isArray(res) ? res : []);
      setAllTeams(teams);

      if (teams.length > 0) {
        const memberEntries = await Promise.all(teams.map(async (team: Team) => {
          try {
            const detail = await get(`/teams/${team.id}`);
            const members = detail?.team?.users || [];
            const memberIds = members.map((u: any) => u?.id || u?.userId || u);
            return [team.id, memberIds] as const;
          } catch {
            return [team.id, []] as const;
          }
        }));
        setTeamMembersMap(Object.fromEntries(memberEntries));
      }
    } catch (err) {
      console.error('Failed to fetch teams', err);
      setAllTeams([]);
    } finally {
      setLoading(false);
    }
  }, [get]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const filteredTeams = allTeams.filter((team) =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isUserInTeam = (teamId: string) => {
    const memberIds = teamMembersMap[teamId];
    if (Array.isArray(memberIds)) return memberIds.includes(userId);
    return userTeams.includes(teamId);
  };

  const handleToggleTeam = async (teamId: string) => {
    setActionLoading(teamId);
    try {
      if (isUserInTeam(teamId)) {
        await del(`/teams/${teamId}/users/${userId}`);
      } else {
        await post(`/teams/${teamId}/users`, { userId });
      }
      await fetchTeamMembers(teamId);
      onTeamsChange();
    } catch (err) {
      console.error('Failed to toggle team membership', err);
    } finally {
      setActionLoading(null);
    }
  };

  // ------------------------ Mobile View ------------------------
  if (!isWeb) {
    return (
      <View style={mobileStyles.container}>
        <Text style={mobileStyles.title}>Teams</Text>

        <TextInput
          style={mobileStyles.searchInput}
          placeholder="Search teams..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {loading ? (
          <Text style={mobileStyles.loadingText}>Loading teams...</Text>
        ) : filteredTeams.length === 0 ? (
          <Text style={mobileStyles.emptyText}>No teams found</Text>
        ) : (
          <ScrollView style={mobileStyles.teamList}>
            {filteredTeams.map((team) => {
              const isMember = isUserInTeam(team.id);
              const isLoading = actionLoading === team.id;
              return (
                <View key={team.id} style={mobileStyles.teamCard}>
                  <Text style={mobileStyles.teamName}>{team.name}</Text>
                  <TouchableOpacity
                    style={[
                      mobileStyles.actionBtn,
                      isMember ? mobileStyles.removeBtn : mobileStyles.addBtn,
                      isLoading && mobileStyles.actionBtnDisabled,
                    ]}
                    onPress={() => handleToggleTeam(team.id)}
                    disabled={isLoading}
                  >
                    <Text style={mobileStyles.actionBtnText}>
                      {isLoading ? '...' : isMember ? 'Remove' : 'Add'}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>
    );
  }

  // ------------------------ Web View ------------------------
  return (
    <div style={webStyles.container}>
      <h3 style={webStyles.title}>Teams</h3>

      <input
        type="text"
        placeholder="Search teams..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={webStyles.searchInput}
      />

      {loading ? (
        <div style={webStyles.loadingText}>Loading teams...</div>
      ) : filteredTeams.length === 0 ? (
        <div style={webStyles.emptyText}>No teams found</div>
      ) : (
        <div style={webStyles.teamList}>
          {filteredTeams.map((team) => {
            const isMember = isUserInTeam(team.id);
            const isLoading = actionLoading === team.id;
            const isHovered = hoveredTeamId === team.id;
            return (
              <div
                key={team.id}
                style={{
                  ...webStyles.teamCard,
                  ...(isHovered ? webStyles.teamCardHover : {}),
                }}
                onMouseEnter={() => setHoveredTeamId(team.id)}
                onMouseLeave={() => setHoveredTeamId(null)}
              >
                <span style={webStyles.teamName}>{team.name}</span>
                <button
                  style={{
                    ...webStyles.actionBtn,
                    ...(isMember ? webStyles.removeBtn : webStyles.addBtn),
                    ...(isLoading ? webStyles.actionBtnDisabled : {}),
                  }}
                  onClick={() => handleToggleTeam(team.id)}
                  disabled={isLoading}
                >
                  {isLoading ? '...' : isMember ? 'Remove' : 'Add'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const mobileStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 8,
    padding: 10,
    color: '#fff',
    fontSize: 13,
    marginBottom: 12,
  },
  loadingText: {
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
  emptyText: {
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
  teamList: {
    maxHeight: 300,
  },
  teamCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  teamName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  actionBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  addBtn: {
    backgroundColor: '#4CAF50',
  },
  removeBtn: {
    backgroundColor: '#ff6b6b',
  },
  actionBtnDisabled: {
    opacity: 0.5,
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

const webStyles: { [k: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 700,
    margin: '0 0 12px 0',
  },
  searchInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 8,
    padding: '10px 12px',
    color: '#fff',
    fontSize: 13,
    marginBottom: 12,
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  },
  loadingText: {
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
  emptyText: {
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
  teamList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    maxHeight: 300,
    overflowY: 'auto',
  },
  teamCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 8,
    padding: 12,
    border: '1px solid rgba(255,255,255,0.03)',
    transition: 'all 0.15s ease',
  },
  teamCardHover: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
  },
  teamName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 500,
  },
  actionBtn: {
    padding: '6px 12px',
    borderRadius: 6,
    border: 'none',
    color: '#fff',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  addBtn: {
    backgroundColor: '#4CAF50',
  },
  removeBtn: {
    backgroundColor: '#ff6b6b',
  },
  actionBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
};

export default UserTeamManager;
