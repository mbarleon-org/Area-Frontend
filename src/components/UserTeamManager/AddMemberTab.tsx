import React from 'react';
import { isWeb } from '../../utils/IsWeb';
import type { Team } from './TeamSelector';
import TeamDropdown from './TeamDropdown';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

interface SearchResult {
  id: string;
  username: string;
  email: string;
  avatar?: string;
}

export interface AddMemberTabProps {
  teams: Team[];
  selectedTeam: Team | null;
  loadingTeams: boolean;
  teamDropdownOpen: boolean;
  onDropdownToggle: () => void;
  onTeamSelect: (team: Team) => void;
  searchQuery: string;
  onSearchChange: (text: string) => void;
  searching: boolean;
  searchResult: SearchResult | null;
  adding: boolean;
  onAddUser: () => void;
  error: string | null;
  successMessage: string | null;
}

const AddMemberTab: React.FC<AddMemberTabProps> = ({
  teams,
  selectedTeam,
  loadingTeams,
  teamDropdownOpen,
  onDropdownToggle,
  onTeamSelect,
  searchQuery,
  onSearchChange,
  searching,
  searchResult,
  adding,
  onAddUser,
  error,
  successMessage,
}) => {
  // ------------------------ Web View ------------------------
  if (isWeb) {
    return (
      <>
        {/* Team Selector */}
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

        {/* Search Input */}
        <div style={webStyles.section}>
          <label style={webStyles.label}>Search by email or username</label>
          <div style={webStyles.inputWrapper}>
            <input
              style={webStyles.input}
              type="text"
              placeholder="john@example.com or johndoe"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              disabled={!selectedTeam}
            />
            {searching && (
              <div style={webStyles.searchingIndicator}>
                <div style={webStyles.spinner} />
              </div>
            )}
          </div>
          <p style={webStyles.hint}>
            Uses @ symbol to detect email vs username automatically.
          </p>
        </div>

        {/* Search Result */}
        {searchResult && !successMessage && (
          <div style={webStyles.resultCard}>
            <div style={webStyles.resultAvatar}>
              {searchResult.avatar ? (
                <img src={searchResult.avatar} alt="" style={webStyles.avatarImg} />
              ) : (
                <span style={webStyles.avatarPlaceholder}>
                  {searchResult.username.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div style={webStyles.resultInfo}>
              <div style={webStyles.resultName}>{searchResult.username}</div>
              <div style={webStyles.resultEmail}>{searchResult.email}</div>
            </div>
            <button
              style={{
                ...webStyles.addButton,
                opacity: adding ? 0.6 : 1,
              }}
              onClick={onAddUser}
              disabled={adding}
            >
              {adding ? 'Adding...' : 'Add'}
            </button>
          </div>
        )}

        {/* Error State */}
        {error && !successMessage && (
          <div style={webStyles.error}>
            <span style={webStyles.errorIcon}>⚠</span>
            {error}
          </div>
        )}

        {/* Success State */}
        {successMessage && (
          <div style={webStyles.success}>
            <span style={webStyles.successIcon}>✓</span>
            {successMessage}
          </div>
        )}
      </>
    );
  }

  // ------------------------ Mobile View ------------------------
  return (
    <>
      {/* Team Selector */}
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

      {/* Search Input */}
      <View style={mobileStyles.section}>
        <Text style={mobileStyles.label}>Search by email or username</Text>
        <View style={mobileStyles.inputWrapper}>
          <TextInput
            style={[mobileStyles.input, !selectedTeam && mobileStyles.inputDisabled]}
            placeholder="john@example.com or johndoe"
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={onSearchChange}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            editable={!!selectedTeam}
          />
          {searching && (
            <ActivityIndicator
              size="small"
              color="#fff"
              style={mobileStyles.searchingIndicator}
            />
          )}
        </View>
        <Text style={mobileStyles.hint}>Uses @ to detect email vs username</Text>
      </View>

      {/* Search Result */}
      {searchResult && !successMessage && (
        <View style={mobileStyles.resultCard}>
          <View style={mobileStyles.resultAvatar}>
            <Text style={mobileStyles.avatarText}>
              {searchResult.username.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={mobileStyles.resultInfo}>
            <Text style={mobileStyles.resultName}>{searchResult.username}</Text>
            <Text style={mobileStyles.resultEmail}>{searchResult.email}</Text>
          </View>
          <TouchableOpacity
            style={[mobileStyles.addButton, adding && mobileStyles.addButtonDisabled]}
            onPress={onAddUser}
            disabled={adding}
          >
            {adding ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <Text style={mobileStyles.addButtonText}>Add</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Error State */}
      {error && !successMessage && (
        <View style={mobileStyles.error}>
          <Text style={mobileStyles.errorText}>⚠ {error}</Text>
        </View>
      )}

      {/* Success State */}
      {successMessage && (
        <View style={mobileStyles.success}>
          <Text style={mobileStyles.successText}>✓ {successMessage}</Text>
        </View>
      )}
    </>
  );
};

// ------------------------ Web Styles ------------------------
const webStyles: Record<string, React.CSSProperties> = {
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
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    paddingRight: '44px',
    background: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  },
  searchingIndicator: {
    position: 'absolute',
    right: '14px',
  },
  spinner: {
    width: '18px',
    height: '18px',
    border: '2px solid rgba(255,255,255,0.1)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  hint: {
    fontSize: '12px',
    color: '#555',
    marginTop: '8px',
    margin: 0,
  },
  resultCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '14px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '10px',
    marginBottom: '16px',
  },
  resultAvatar: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667 0%, #444 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  avatarPlaceholder: {
    color: '#fff',
    fontSize: '18px',
    fontWeight: 700,
  },
  resultInfo: {
    flex: 1,
    minWidth: 0,
  },
  resultName: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#fff',
    marginBottom: '2px',
  },
  resultEmail: {
    fontSize: '13px',
    color: '#666',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  addButton: {
    padding: '10px 20px',
    background: '#fff',
    border: 'none',
    borderRadius: '8px',
    color: '#000',
    fontSize: '13px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s',
    flexShrink: 0,
  },
  error: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    background: 'rgba(231, 76, 60, 0.1)',
    border: '1px solid rgba(231, 76, 60, 0.2)',
    borderRadius: '8px',
    color: '#e74c3c',
    fontSize: '13px',
    fontWeight: 500,
    marginBottom: '16px',
  },
  errorIcon: {
    fontSize: '14px',
  },
  success: {
    display: 'flex',
    alignItems: 'center',
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
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    color: '#888',
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWrapper: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    padding: 14,
    paddingRight: 44,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    color: '#fff',
    fontSize: 14,
  },
  inputDisabled: {
    opacity: 0.5,
  },
  searchingIndicator: {
    position: 'absolute',
    right: 14,
  },
  hint: {
    fontSize: 11,
    color: '#555',
    marginTop: 8,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
    marginBottom: 16,
  },
  resultAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#555',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  resultEmail: {
    fontSize: 13,
    color: '#666',
  },
  addButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  addButtonText: {
    color: '#000',
    fontSize: 13,
    fontWeight: '700',
  },
  error: {
    padding: 12,
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(231, 76, 60, 0.2)',
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 13,
    fontWeight: '500',
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
  },
});

export default AddMemberTab;
