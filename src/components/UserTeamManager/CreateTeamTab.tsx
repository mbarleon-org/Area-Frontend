import React from 'react';
import { isWeb } from '../../utils/IsWeb';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

export interface CreateTeamTabProps {
  teamName: string;
  onTeamNameChange: (text: string) => void;
  creating: boolean;
  onCreateTeam: () => void;
  error: string | null;
  success: string | null;
}

const CreateTeamTab: React.FC<CreateTeamTabProps> = ({
  teamName,
  onTeamNameChange,
  creating,
  onCreateTeam,
  error,
  success,
}) => {
  const isDisabled = creating || !teamName.trim();

  // ------------------------ Web View ------------------------
  if (isWeb) {
    return (
      <>
        <div style={webStyles.section}>
          <label style={webStyles.label}>Team Name</label>
          <input
            style={webStyles.input}
            type="text"
            placeholder="Enter team name..."
            value={teamName}
            onChange={(e) => onTeamNameChange(e.target.value)}
            autoFocus
          />
          <p style={webStyles.hint}>
            Create a new team and start adding members immediately.
          </p>
        </div>

        {/* Error */}
        {error && !success && (
          <div style={webStyles.error}>
            <span style={webStyles.errorIcon}>⚠</span>
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div style={webStyles.success}>
            <span style={webStyles.successIcon}>✓</span>
            {success}
          </div>
        )}

        <button
          style={{
            ...webStyles.createButton,
            opacity: isDisabled ? 0.6 : 1,
          }}
          onClick={onCreateTeam}
          disabled={isDisabled}
        >
          {creating ? 'Creating...' : 'Create Team'}
        </button>
      </>
    );
  }

  // ------------------------ Mobile View ------------------------
  return (
    <>
      <View style={mobileStyles.section}>
        <Text style={mobileStyles.label}>Team Name</Text>
        <TextInput
          style={mobileStyles.input}
          placeholder="Enter team name..."
          placeholderTextColor="#666"
          value={teamName}
          onChangeText={onTeamNameChange}
          autoCapitalize="words"
        />
        <Text style={mobileStyles.hint}>
          Create a team and add members immediately
        </Text>
      </View>

      {/* Error */}
      {error && !success && (
        <View style={mobileStyles.error}>
          <Text style={mobileStyles.errorText}>⚠ {error}</Text>
        </View>
      )}

      {/* Success */}
      {success && (
        <View style={mobileStyles.success}>
          <Text style={mobileStyles.successText}>✓ {success}</Text>
        </View>
      )}

      <TouchableOpacity
        style={[mobileStyles.createButton, isDisabled && mobileStyles.createButtonDisabled]}
        onPress={onCreateTeam}
        disabled={isDisabled}
      >
        {creating ? (
          <ActivityIndicator size="small" color="#000" />
        ) : (
          <Text style={mobileStyles.createButtonText}>Create Team</Text>
        )}
      </TouchableOpacity>
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
  input: {
    width: '100%',
    padding: '14px 16px',
    background: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  },
  hint: {
    fontSize: '12px',
    color: '#555',
    marginTop: '8px',
    margin: 0,
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
  createButton: {
    width: '100%',
    padding: '14px 20px',
    background: '#fff',
    border: 'none',
    borderRadius: '10px',
    color: '#000',
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginBottom: '16px',
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
  input: {
    padding: 14,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    color: '#fff',
    fontSize: 14,
  },
  hint: {
    fontSize: 11,
    color: '#555',
    marginTop: 8,
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
  createButton: {
    width: '100%',
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default CreateTeamTab;
