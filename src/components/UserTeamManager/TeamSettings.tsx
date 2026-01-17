import React, { useState, useEffect } from 'react';
import { isWeb } from '../../utils/IsWeb';
import { useApi } from '../../utils/UseApi';
import type { Team } from './TeamSelector';
import ConfirmationModal from './ConfirmationModal';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

export interface TeamSettingsProps {
  team: Team;
  isOwner: boolean;
  onTeamUpdated: (updatedTeam: Team) => void;
  onTeamDeleted: () => void;
}

const TeamSettings: React.FC<TeamSettingsProps> = ({
  team,
  isOwner,
  onTeamUpdated,
  onTeamDeleted,
}) => {
  const { put, del } = useApi();

  const [teamName, setTeamName] = useState(team.name);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    setTeamName(team.name);
    setIsEditing(false);
    setSaveError(null);
    setSaveSuccess(false);
  }, [team.id, team.name]);

  const handleSaveName = async () => {
    const trimmedName = teamName.trim();
    if (!trimmedName || trimmedName === team.name) {
      setIsEditing(false);
      setTeamName(team.name);
      return;
    }

    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const res = await put(`/teams/${team.id}`, { name: trimmedName });
      const updatedTeam: Team = {
        ...team,
        name: res?.name || res?.team?.name || trimmedName,
      };
      onTeamUpdated(updatedTeam);
      setSaveSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err: any) {
      const status = err?.response?.status || err?.status;
      if (status === 409) {
        setSaveError('A team with this name already exists');
      } else if (status === 403) {
        setSaveError('You don\'t have permission to rename this team');
      } else {
        setSaveError('Failed to update team name');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTeam = async () => {
    setDeleting(true);
    setDeleteError(null);

    try {
      await del(`/teams/${team.id}`);
      setShowDeleteModal(false);
      onTeamDeleted();
    } catch (err: any) {
      const status = err?.response?.status || err?.status;
      if (status === 403) {
        setDeleteError('You don\'t have permission to delete this team');
      } else {
        setDeleteError('Failed to delete team. Please try again.');
      }
      setDeleting(false);
    }
  };

  const handleCancelEdit = () => {
    setTeamName(team.name);
    setIsEditing(false);
    setSaveError(null);
  };

  // Not owner - show read-only view
  if (!isOwner) {
    if (isWeb) {
      return (
        <div style={webStyles.container}>
          <div style={webStyles.readOnlySection}>
            <label style={webStyles.label}>Team Name</label>
            <div style={webStyles.readOnlyValue}>{team.name}</div>
          </div>
        </div>
      );
    }
    return (
      <View style={mobileStyles.container}>
        <View style={mobileStyles.readOnlySection}>
          <Text style={mobileStyles.label}>Team Name</Text>
          <Text style={mobileStyles.readOnlyValue}>{team.name}</Text>
        </View>
      </View>
    );
  }

  // ------------------------ Web View (Owner) ------------------------
  if (isWeb) {
    return (
      <div style={webStyles.container}>
        {/* Team Name Section */}
        <div style={webStyles.section}>
          <label style={webStyles.label}>Team Name</label>
          <div style={webStyles.inputRow}>
            {isEditing ? (
              <>
                <input
                  style={webStyles.input}
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveName();
                    if (e.key === 'Escape') handleCancelEdit();
                  }}
                  autoFocus
                  disabled={saving}
                />
                <button
                  style={{
                    ...webStyles.saveButton,
                    opacity: saving ? 0.6 : 1,
                  }}
                  onClick={handleSaveName}
                  disabled={saving}
                >
                  {saving ? '...' : 'Save'}
                </button>
                <button
                  style={webStyles.cancelEditButton}
                  onClick={handleCancelEdit}
                  disabled={saving}
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <span style={webStyles.teamNameDisplay}>
                  {team.name}
                  {saveSuccess && <span style={webStyles.savedBadge}>✓ Saved</span>}
                </span>
                <button
                  style={webStyles.editButton}
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </button>
              </>
            )}
          </div>
          {saveError && <p style={webStyles.errorText}>{saveError}</p>}
        </div>

        {/* Danger Zone */}
        <div style={webStyles.dangerZone}>
          <div style={webStyles.dangerHeader}>
            <span style={webStyles.dangerIcon}>⚠️</span>
            <span style={webStyles.dangerTitle}>Danger Zone</span>
          </div>
          <p style={webStyles.dangerDescription}>
            Deleting a team is permanent. All members will lose access immediately.
          </p>
          <button
            style={webStyles.deleteButton}
            onClick={() => setShowDeleteModal(true)}
          >
            Delete Team
          </button>
          {deleteError && <p style={webStyles.errorText}>{deleteError}</p>}
        </div>

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          visible={showDeleteModal}
          title="Delete Team"
          message={`Are you sure you want to permanently delete "${team.name}"? This action cannot be undone. All members will immediately lose access to this team and its associated resources.`}
          confirmLabel="Delete Team"
          cancelLabel="Keep Team"
          theme="danger"
          icon="🗑️"
          loading={deleting}
          onConfirm={handleDeleteTeam}
          onCancel={() => {
            setShowDeleteModal(false);
            setDeleteError(null);
          }}
        />
      </div>
    );
  }

  // ------------------------ Mobile View (Owner) ------------------------
  return (
    <View style={mobileStyles.container}>
      {/* Team Name Section */}
      <View style={mobileStyles.section}>
        <Text style={mobileStyles.label}>Team Name</Text>
        {isEditing ? (
          <View style={mobileStyles.inputRow}>
            <TextInput
              style={mobileStyles.input}
              value={teamName}
              onChangeText={setTeamName}
              autoFocus
              editable={!saving}
            />
            <TouchableOpacity
              style={[mobileStyles.saveButton, saving && mobileStyles.buttonDisabled]}
              onPress={handleSaveName}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <Text style={mobileStyles.saveButtonText}>Save</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={mobileStyles.cancelEditButton}
              onPress={handleCancelEdit}
              disabled={saving}
            >
              <Text style={mobileStyles.cancelEditButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={mobileStyles.inputRow}>
            <View style={mobileStyles.teamNameDisplayContainer}>
              <Text style={mobileStyles.teamNameDisplay}>{team.name}</Text>
              {saveSuccess && (
                <Text style={mobileStyles.savedBadge}>✓ Saved</Text>
              )}
            </View>
            <TouchableOpacity
              style={mobileStyles.editButton}
              onPress={() => setIsEditing(true)}
            >
              <Text style={mobileStyles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>
        )}
        {saveError && <Text style={mobileStyles.errorText}>{saveError}</Text>}
      </View>

      {/* Danger Zone */}
      <View style={mobileStyles.dangerZone}>
        <View style={mobileStyles.dangerHeader}>
          <Text style={mobileStyles.dangerIcon}>⚠️</Text>
          <Text style={mobileStyles.dangerTitle}>Danger Zone</Text>
        </View>
        <Text style={mobileStyles.dangerDescription}>
          Deleting a team is permanent. All members will lose access immediately.
        </Text>
        <TouchableOpacity
          style={mobileStyles.deleteButton}
          onPress={() => setShowDeleteModal(true)}
        >
          <Text style={mobileStyles.deleteButtonText}>Delete Team</Text>
        </TouchableOpacity>
        {deleteError && <Text style={mobileStyles.errorText}>{deleteError}</Text>}
      </View>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        visible={showDeleteModal}
        title="Delete Team"
        message={`Are you sure you want to permanently delete "${team.name}"? This action cannot be undone. All members will immediately lose access.`}
        confirmLabel="Delete Team"
        cancelLabel="Keep Team"
        theme="danger"
        icon="🗑️"
        loading={deleting}
        onConfirm={handleDeleteTeam}
        onCancel={() => {
          setShowDeleteModal(false);
          setDeleteError(null);
        }}
      />
    </View>
  );
};

// ------------------------ Web Styles ------------------------
const webStyles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  section: {
    marginBottom: '8px',
  },
  readOnlySection: {
    padding: '12px 0',
  },
  label: {
    display: 'block',
    fontSize: '12px',
    color: '#666',
    fontWeight: 600,
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  readOnlyValue: {
    fontSize: '15px',
    color: '#fff',
    fontWeight: 500,
  },
  inputRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  input: {
    flex: 1,
    padding: '10px 14px',
    background: '#1a1a1a',
    border: '1px solid #444',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
  },
  teamNameDisplay: {
    flex: 1,
    fontSize: '15px',
    color: '#fff',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  savedBadge: {
    fontSize: '12px',
    color: '#2ecc71',
    fontWeight: 500,
  },
  editButton: {
    padding: '8px 16px',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  saveButton: {
    padding: '8px 16px',
    background: '#fff',
    border: 'none',
    borderRadius: '6px',
    color: '#000',
    fontSize: '13px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  cancelEditButton: {
    padding: '8px 12px',
    background: 'transparent',
    border: 'none',
    color: '#666',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
  },
  errorText: {
    marginTop: '8px',
    fontSize: '13px',
    color: '#e74c3c',
  },
  dangerZone: {
    padding: '16px',
    background: 'rgba(231, 76, 60, 0.05)',
    border: '1px solid rgba(231, 76, 60, 0.2)',
    borderRadius: '10px',
  },
  dangerHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
  },
  dangerIcon: {
    fontSize: '16px',
  },
  dangerTitle: {
    fontSize: '14px',
    color: '#e74c3c',
    fontWeight: 600,
  },
  dangerDescription: {
    fontSize: '13px',
    color: '#888',
    lineHeight: 1.5,
    marginBottom: '16px',
  },
  deleteButton: {
    padding: '10px 20px',
    background: '#e74c3c',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '13px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
};

// ------------------------ Mobile Styles ------------------------
const mobileStyles = StyleSheet.create({
  container: {
    gap: 20,
  },
  section: {
    marginBottom: 8,
  },
  readOnlySection: {
    paddingVertical: 12,
  },
  label: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  readOnlyValue: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '500',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    flex: 1,
    padding: 10,
    paddingHorizontal: 14,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 8,
    color: '#fff',
    fontSize: 14,
  },
  teamNameDisplayContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  teamNameDisplay: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '500',
  },
  savedBadge: {
    fontSize: 12,
    color: '#2ecc71',
    fontWeight: '500',
  },
  editButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  saveButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 6,
    minWidth: 60,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#000',
    fontSize: 13,
    fontWeight: '700',
  },
  cancelEditButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  cancelEditButtonText: {
    color: '#666',
    fontSize: 13,
    fontWeight: '500',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  errorText: {
    marginTop: 8,
    fontSize: 13,
    color: '#e74c3c',
  },
  dangerZone: {
    padding: 16,
    backgroundColor: 'rgba(231, 76, 60, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(231, 76, 60, 0.2)',
    borderRadius: 10,
  },
  dangerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  dangerIcon: {
    fontSize: 16,
  },
  dangerTitle: {
    fontSize: 14,
    color: '#e74c3c',
    fontWeight: '600',
  },
  dangerDescription: {
    fontSize: 13,
    color: '#888',
    lineHeight: 20,
    marginBottom: 16,
  },
  deleteButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
});

export default TeamSettings;
