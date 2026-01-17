import React, { useState, useEffect, useRef, useCallback } from 'react';
import { isWeb } from '../../utils/IsWeb';
import { useApi } from '../../utils/UseApi';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';

export interface Team {
  id: string;
  name: string;
  description?: string;
  owner_id?: string;
  created_at?: string;
}

interface TeamSelectorProps {
  onTeamSelect?: (team: Team | null) => void;
  onAddMemberPress: (team: Team) => void;
  selectedTeam: Team | null;
}

const TeamSelector: React.FC<TeamSelectorProps> = ({
  onTeamSelect,
  onAddMemberPress,
  selectedTeam,
}) => {
  const { get } = useApi();
  const [teams, setTeams] = useState<Team[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let mounted = true;
    const fetchTeams = async () => {
      try {
        const res = await get('/teams');
        if (!mounted) return;
        const teamList = res?.teams || res || [];
        setTeams(Array.isArray(teamList) ? teamList : []);
        if (!selectedTeam && teamList.length > 0) {
          onTeamSelect?.(teamList[0]);
        }
      } catch (err) {
        console.error('Failed to fetch teams:', err);
        if (mounted) setTeams([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchTeams();
    return () => { mounted = false; };
  }, [get]);

  useEffect(() => {
    if (!isWeb) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: isOpen ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isOpen, fadeAnim]);

  const handleSelect = useCallback((team: Team) => {
    onTeamSelect?.(team);
    setIsOpen(false);
  }, [onTeamSelect]);

  const handleAddPress = useCallback(() => {
    onAddMemberPress(selectedTeam!);
  }, [selectedTeam, onAddMemberPress]);

  // ------------------------ Web View ------------------------
  if (isWeb) {
    return (
      <div style={webStyles.container} ref={dropdownRef}>
        <div style={webStyles.selectorWrapper}>
          <button
            style={webStyles.selectorButton}
            onClick={() => setIsOpen(!isOpen)}
            className="btn-hover"
          >
            <span style={webStyles.selectorLabel}>
              {loading ? 'Loading...' : (selectedTeam?.name || 'Select Team')}
            </span>
            <span style={webStyles.chevron}>{isOpen ? '▲' : '▼'}</span>
          </button>

          <button
            style={webStyles.addButton}
            onClick={handleAddPress}
            className="btn-icon-hover"
            title="Manage teams"
          >
            +
          </button>
        </div>

        {isOpen && teams.length > 0 && (
          <div style={webStyles.dropdown}>
            {teams.map((team) => (
              <button
                key={team.id}
                style={{
                  ...webStyles.dropdownItem,
                  backgroundColor: selectedTeam?.id === team.id ? 'rgba(255,255,255,0.08)' : 'transparent',
                }}
                className="dropdown-item-hover"
                onClick={() => handleSelect(team)}
              >
                {team.name}
              </button>
            ))}
          </div>
        )}

        {isOpen && teams.length === 0 && !loading && (
          <div style={webStyles.dropdown}>
            <div style={webStyles.emptyState}>No teams available</div>
          </div>
        )}
      </div>
    );
  }

  // ------------------------ Mobile View ------------------------
  return (
    <View style={mobileStyles.container}>
      <View style={mobileStyles.selectorWrapper}>
        <TouchableOpacity
          style={mobileStyles.selectorButton}
          onPress={() => setIsOpen(true)}
          activeOpacity={0.7}
        >
          <Text style={mobileStyles.selectorLabel} numberOfLines={1}>
            {loading ? 'Loading...' : (selectedTeam?.name || 'Select Team')}
          </Text>
          <Text style={mobileStyles.chevron}>▼</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={mobileStyles.addButton}
          onPress={handleAddPress}
          activeOpacity={0.7}
        >
          <Text style={mobileStyles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Mobile Dropdown Modal */}
      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={mobileStyles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={mobileStyles.modalContent} onStartShouldSetResponder={() => true}>
            <Text style={mobileStyles.modalTitle}>Select Team</Text>
            <ScrollView style={mobileStyles.teamList} showsVerticalScrollIndicator={false}>
              {teams.length === 0 && !loading && (
                <Text style={mobileStyles.emptyText}>No teams available</Text>
              )}
              {teams.map((team) => (
                <TouchableOpacity
                  key={team.id}
                  style={[
                    mobileStyles.teamItem,
                    selectedTeam?.id === team.id && mobileStyles.teamItemSelected,
                  ]}
                  onPress={() => handleSelect(team)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      mobileStyles.teamItemText,
                      selectedTeam?.id === team.id && mobileStyles.teamItemTextSelected,
                    ]}
                  >
                    {team.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={mobileStyles.closeButton}
              onPress={() => setIsOpen(false)}
            >
              <Text style={mobileStyles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

// ------------------------ Web Styles ------------------------
const webStyles: Record<string, React.CSSProperties> = {
  container: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  selectorWrapper: {
    display: 'flex',
    alignItems: 'stretch',
    height: '40px',
  },
  selectorButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    padding: '0 16px',
    height: '100%',
    minWidth: '160px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px 0 0 8px',
    color: '#fff',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  selectorLabel: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  chevron: {
    fontSize: '10px',
    opacity: 0.6,
  },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '30px',
    height: '100%',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderLeft: 'none',
    borderRadius: '0 8px 8px 0',
    color: '#fff',
    fontSize: '18px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  dropdown: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    left: 0,
    right: 0,
    background: '#111',
    border: '1px solid #333',
    borderRadius: '8px',
    boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
    zIndex: 100,
    overflow: 'hidden',
    maxHeight: '240px',
    overflowY: 'auto',
  },
  dropdownItem: {
    width: '100%',
    padding: '12px 16px',
    background: 'transparent',
    border: 'none',
    color: '#fff',
    fontSize: '14px',
    fontWeight: 500,
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'background 0.15s ease',
  },
  emptyState: {
    padding: '16px',
    color: '#666',
    fontSize: '13px',
    textAlign: 'center',
  },
};

// ------------------------ Mobile Styles ------------------------
const mobileStyles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  selectorWrapper: {
    flexDirection: 'row',
    alignItems: 'stretch',
    height: 44,
  },
  selectorButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    borderRightWidth: 0,
  },
  selectorLabel: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  chevron: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    marginLeft: 8,
  },
  addButton: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  addButtonDisabled: {
    opacity: 0.4,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxHeight: Dimensions.get('window').height * 0.6,
    backgroundColor: '#0f0f0f',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  teamList: {
    maxHeight: 280,
  },
  teamItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  teamItemSelected: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  teamItemText: {
    color: '#ccc',
    fontSize: 15,
    fontWeight: '500',
  },
  teamItemTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },
  closeButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default TeamSelector;
