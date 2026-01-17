import React from 'react';
import { isWeb } from '../../utils/IsWeb';
import type { Team } from './TeamSelector';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

export interface TeamDropdownProps {
  teams: Team[];
  selectedTeam: Team | null;
  loading: boolean;
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (team: Team) => void;
}

const TeamDropdown: React.FC<TeamDropdownProps> = ({
  teams,
  selectedTeam,
  loading,
  isOpen,
  onToggle,
  onSelect,
}) => {
  // ------------------------ Web View ------------------------
  if (isWeb) {
    return (
      <div style={webStyles.wrapper}>
        <button style={webStyles.button} onClick={onToggle}>
          <span style={webStyles.label}>
            {loading ? 'Loading...' : (selectedTeam?.name || 'Select a team')}
          </span>
          <span style={webStyles.chevron}>{isOpen ? '▲' : '▼'}</span>
        </button>
        {isOpen && (
          <div style={webStyles.list}>
            {teams.length === 0 && !loading && (
              <div style={webStyles.empty}>No teams available</div>
            )}
            {teams.map((t) => (
              <button
                key={t.id}
                style={{
                  ...webStyles.item,
                  backgroundColor: selectedTeam?.id === t.id ? 'rgba(255,255,255,0.08)' : 'transparent',
                }}
                onClick={() => onSelect(t)}
              >
                {t.name}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ------------------------ Mobile View ------------------------
  return (
    <View style={mobileStyles.wrapper}>
      <TouchableOpacity style={mobileStyles.button} onPress={onToggle}>
        <Text style={mobileStyles.label}>
          {loading ? 'Loading...' : (selectedTeam?.name || 'Select a team')}
        </Text>
        <Text style={mobileStyles.chevron}>{isOpen ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {isOpen && (
        <View style={mobileStyles.list}>
          {teams.length === 0 && !loading && (
            <Text style={mobileStyles.empty}>No teams available</Text>
          )}
          {teams.map((t) => (
            <TouchableOpacity
              key={t.id}
              style={[
                mobileStyles.item,
                selectedTeam?.id === t.id && mobileStyles.itemSelected,
              ]}
              onPress={() => onSelect(t)}
            >
              <Text style={[
                mobileStyles.itemText,
                selectedTeam?.id === t.id && mobileStyles.itemTextSelected,
              ]}>
                {t.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

// ------------------------ Web Styles ------------------------
const webStyles: Record<string, React.CSSProperties> = {
  wrapper: {
    position: 'relative',
  },
  button: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 16px',
    background: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'border-color 0.2s',
  },
  label: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  chevron: {
    fontSize: '10px',
    opacity: 0.6,
    marginLeft: '8px',
  },
  list: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    left: 0,
    right: 0,
    background: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '10px',
    boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
    zIndex: 10,
    maxHeight: '200px',
    overflowY: 'auto',
  },
  item: {
    width: '100%',
    padding: '12px 16px',
    background: 'transparent',
    border: 'none',
    color: '#ccc',
    fontSize: '14px',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  empty: {
    padding: '16px',
    color: '#666',
    fontSize: '13px',
    textAlign: 'center',
  },
};

// ------------------------ Mobile Styles ------------------------
const mobileStyles = StyleSheet.create({
  wrapper: {},
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
  },
  label: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
  },
  chevron: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    marginLeft: 8,
  },
  list: {
    marginTop: 8,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    maxHeight: 180,
  },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  itemSelected: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  itemText: {
    color: '#ccc',
    fontSize: 14,
  },
  itemTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  empty: {
    padding: 16,
    color: '#666',
    fontSize: 13,
    textAlign: 'center',
  },
});

export default TeamDropdown;
