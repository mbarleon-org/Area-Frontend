import React, { useState, useCallback, useRef, useEffect } from 'react';
import { isWeb } from '../../utils/IsWeb';
import { useApi } from '../../utils/UseApi';
import type { Team } from './TeamSelector';
import {
  type TeamMember,
  type TeamDetails,
  getSortedTeamMembers,
  normalizeTeamDetails,
} from './teamUtils';
import MembersTab from './MembersTab';
import AddMemberTab from './AddMemberTab';
import CreateTeamTab from './CreateTeamTab';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Keyboard,
  ScrollView,
  Dimensions,
} from 'react-native';

interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
}

type ModalTab = 'members' | 'add-member' | 'create-team';

interface AddMemberModalProps {
  team: Team | null;
  onClose: () => void;
  onSuccess: () => void;
  onTeamCreated?: (newTeam: Team) => void;
}

const isEmailFormat = (input: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(input.trim());
};

const AddMemberModal: React.FC<AddMemberModalProps> = ({
  team,
  onClose,
  onSuccess,
  onTeamCreated,
}) => {
  const { get, post } = useApi();

  const [activeTab, setActiveTab] = useState<ModalTab>('members');

  const [teams, setTeams] = useState<Team[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [teamDropdownOpen, setTeamDropdownOpen] = useState(false);
  const [localSelectedTeam, setLocalSelectedTeam] = useState<Team | null>(team);

  const [teamDetails, setTeamDetails] = useState<TeamDetails | null>(null);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [sortedMembers, setSortedMembers] = useState<TeamMember[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<User | null>(null);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const [newTeamName, setNewTeamName] = useState('');
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchTeams = async () => {
      try {
        const res = await get('/teams');
        if (!mounted) return;
        const teamList = res?.teams || res || [];
        setTeams(Array.isArray(teamList) ? teamList : []);
        if (!localSelectedTeam && teamList.length > 0) {
          setLocalSelectedTeam(teamList[0]);
        }
      } catch (err) {
        console.error('Failed to fetch teams:', err);
      } finally {
        if (mounted) setLoadingTeams(false);
      }
    };
    fetchTeams();
    return () => {
      mounted = false;
    };
  }, [get]);

  const fetchTeamDetails = useCallback(
    async (teamId: string) => {
      setLoadingMembers(true);
      try {
        const res = await get(`/teams/${teamId}`);
        const details = normalizeTeamDetails(res?.team || res);
        setTeamDetails(details);
        setSortedMembers(getSortedTeamMembers(details));
      } catch (err) {
        console.error('Failed to fetch team details:', err);
        setTeamDetails(null);
        setSortedMembers([]);
      } finally {
        setLoadingMembers(false);
      }
    },
    [get]
  );

  useEffect(() => {
    if (localSelectedTeam?.id) {
      fetchTeamDetails(localSelectedTeam.id);
    } else {
      setTeamDetails(null);
      setSortedMembers([]);
    }
  }, [localSelectedTeam?.id, fetchTeamDetails]);

  const performSearch = useCallback(
    async (query: string) => {
      const trimmed = query.trim();
      if (!trimmed || trimmed.length < 2) {
        setSearchResult(null);
        setError(null);
        return;
      }

      setSearching(true);
      setError(null);
      setSearchResult(null);
      setSuccessMessage(null);

      try {
        const isEmail = isEmailFormat(trimmed);
        const endpoint = isEmail
          ? `/users/email/${encodeURIComponent(trimmed)}`
          : `/users/username/${encodeURIComponent(trimmed)}`;

        const res = await get(endpoint);

        if (res && (res.id || res.user?.id)) {
          const user = res.user || res;
          setSearchResult({
            id: user.id,
            username: user.username || user.name || 'Unknown',
            email: user.email || '',
            avatar: user.avatar || user.profile_picture,
          });
        } else {
          setError('User not found');
        }
      } catch (err: any) {
        const status = err?.response?.status || err?.status;
        if (status === 404) {
          setError('User not found');
        } else {
          setError('Search failed. Please try again.');
        }
      } finally {
        setSearching(false);
      }
    },
    [get]
  );

  const handleSearchChange = useCallback(
    (text: string) => {
      setSearchQuery(text);
      setSuccessMessage(null);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        performSearch(text);
      }, 400);
    },
    [performSearch]
  );

  const handleAddUser = useCallback(async () => {
    if (!searchResult || !localSelectedTeam) return;

    setAdding(true);
    setError(null);

    try {
      await post(`/teams/${localSelectedTeam.id}/users`, {
        userId: searchResult.id,
      });
      setSuccessMessage(`${searchResult.username} added to ${localSelectedTeam.name}`);
      setSearchResult(null);
      setSearchQuery('');

      fetchTeamDetails(localSelectedTeam.id);
      setActiveTab('members');
      onSuccess();
    } catch (err: any) {
      const status = err?.response?.status || err?.status;
      if (status === 409) {
        setError('User is already a team member');
      } else if (status === 403) {
        setError("You don't have permission to add members");
      } else {
        setError('Failed to add user. Please try again.');
      }
    } finally {
      setAdding(false);
    }
  }, [searchResult, localSelectedTeam, post, onSuccess, fetchTeamDetails]);

  const handleCreateTeam = useCallback(async () => {
    const trimmedName = newTeamName.trim();
    if (!trimmedName) {
      setCreateError('Team name is required');
      return;
    }

    setCreatingTeam(true);
    setCreateError(null);

    try {
      const res = await post('/teams', { name: trimmedName });
      const newTeam: Team = {
        id: res?.id || res?.team?.id,
        name: res?.name || res?.team?.name || trimmedName,
        description: res?.description || res?.team?.description,
      };

      setTeams((prev) => [...prev, newTeam]);
      setLocalSelectedTeam(newTeam);
      setCreateSuccess(`Team "${newTeam.name}" created successfully!`);
      setNewTeamName('');

      onTeamCreated?.(newTeam);

      setTimeout(() => {
        setActiveTab('add-member');
        setCreateSuccess(null);
      }, 1500);
    } catch (err: any) {
      const status = err?.response?.status || err?.status;
      if (status === 409) {
        setCreateError('A team with this name already exists');
      } else {
        setCreateError('Failed to create team. Please try again.');
      }
    } finally {
      setCreatingTeam(false);
    }
  }, [newTeamName, post, onTeamCreated]);

  const handleClose = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    onClose();
  }, [onClose]);

  const handleTabChange = useCallback((tab: ModalTab) => {
    setActiveTab(tab);
    setError(null);
    setSuccessMessage(null);
    setCreateError(null);
    setCreateSuccess(null);
    setSearchQuery('');
    setSearchResult(null);
    setTeamDropdownOpen(false);
  }, []);

  const handleTeamSelect = useCallback((t: Team) => {
    setLocalSelectedTeam(t);
    setTeamDropdownOpen(false);
  }, []);


  // ------------------------ Web View ------------------------
  if (isWeb) {
    return (
      <div style={webStyles.overlay} onClick={handleClose}>
        <div style={webStyles.modal} onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div style={webStyles.header}>
            <h2 style={webStyles.title}>Team Management</h2>
            <div style={webStyles.tabBar}>
              {(['members', 'add-member', 'create-team'] as ModalTab[]).map((tab) => (
                <button
                  key={tab}
                  style={{
                    ...webStyles.tab,
                    ...(activeTab === tab ? webStyles.tabActive : {}),
                  }}
                  onClick={() => handleTabChange(tab)}
                >
                  {tab === 'members' ? 'Members' : tab === 'add-member' ? 'Add Member' : 'Create Team'}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div style={webStyles.content}>
            {activeTab === 'members' && (
              <MembersTab
                teams={teams}
                selectedTeam={localSelectedTeam}
                loadingTeams={loadingTeams}
                teamDropdownOpen={teamDropdownOpen}
                onDropdownToggle={() => setTeamDropdownOpen(!teamDropdownOpen)}
                onTeamSelect={handleTeamSelect}
                teamDetails={teamDetails}
                loadingMembers={loadingMembers}
                sortedMembers={sortedMembers}
                onAddMemberClick={() => handleTabChange('add-member')}
                successMessage={successMessage}
              />
            )}

            {activeTab === 'add-member' && (
              <AddMemberTab
                teams={teams}
                selectedTeam={localSelectedTeam}
                loadingTeams={loadingTeams}
                teamDropdownOpen={teamDropdownOpen}
                onDropdownToggle={() => setTeamDropdownOpen(!teamDropdownOpen)}
                onTeamSelect={handleTeamSelect}
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
                searching={searching}
                searchResult={searchResult}
                adding={adding}
                onAddUser={handleAddUser}
                error={error}
                successMessage={successMessage}
              />
            )}

            {activeTab === 'create-team' && (
              <CreateTeamTab
                teamName={newTeamName}
                onTeamNameChange={(text) => {
                  setNewTeamName(text);
                  setCreateError(null);
                }}
                creating={creatingTeam}
                onCreateTeam={handleCreateTeam}
                error={createError}
                success={createSuccess}
              />
            )}
          </div>

          {/* Actions */}
          <div style={webStyles.actions}>
            <button style={webStyles.cancelButton} onClick={handleClose}>
              {successMessage || createSuccess ? 'Close' : 'Cancel'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ------------------------ Mobile View ------------------------
  return (
    <Modal visible transparent animationType="slide" onRequestClose={handleClose}>
      <View style={mobileStyles.overlayContainer}>
        <TouchableOpacity
          style={mobileStyles.overlayBackdrop}
          activeOpacity={1}
          onPress={() => {
            Keyboard.dismiss();
            handleClose();
          }}
        />
        <View style={mobileStyles.bottomSheet}>
          <View style={mobileStyles.handleBar} />

          {/* Header */}
          <View style={mobileStyles.header}>
            <Text style={mobileStyles.title}>Team Management</Text>
            <View style={mobileStyles.tabBar}>
              {(['members', 'add-member', 'create-team'] as ModalTab[]).map((tab) => (
                <TouchableOpacity
                  key={tab}
                  style={[mobileStyles.tab, activeTab === tab && mobileStyles.tabActive]}
                  onPress={() => handleTabChange(tab)}
                >
                  <Text style={[mobileStyles.tabText, activeTab === tab && mobileStyles.tabTextActive]}>
                    {tab === 'members' ? 'Members' : tab === 'add-member' ? 'Add' : 'Create'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <ScrollView
            style={mobileStyles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Tab Content */}
            {activeTab === 'members' && (
              <MembersTab
                teams={teams}
                selectedTeam={localSelectedTeam}
                loadingTeams={loadingTeams}
                teamDropdownOpen={teamDropdownOpen}
                onDropdownToggle={() => setTeamDropdownOpen(!teamDropdownOpen)}
                onTeamSelect={handleTeamSelect}
                teamDetails={teamDetails}
                loadingMembers={loadingMembers}
                sortedMembers={sortedMembers}
                onAddMemberClick={() => handleTabChange('add-member')}
                successMessage={successMessage}
              />
            )}

            {activeTab === 'add-member' && (
              <AddMemberTab
                teams={teams}
                selectedTeam={localSelectedTeam}
                loadingTeams={loadingTeams}
                teamDropdownOpen={teamDropdownOpen}
                onDropdownToggle={() => setTeamDropdownOpen(!teamDropdownOpen)}
                onTeamSelect={handleTeamSelect}
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
                searching={searching}
                searchResult={searchResult}
                adding={adding}
                onAddUser={handleAddUser}
                error={error}
                successMessage={successMessage}
              />
            )}

            {activeTab === 'create-team' && (
              <CreateTeamTab
                teamName={newTeamName}
                onTeamNameChange={(text) => {
                  setNewTeamName(text);
                  setCreateError(null);
                }}
                creating={creatingTeam}
                onCreateTeam={handleCreateTeam}
                error={createError}
                success={createSuccess}
              />
            )}

            {/* Actions */}
            <View style={mobileStyles.actions}>
              <TouchableOpacity style={mobileStyles.cancelButton} onPress={handleClose}>
                <Text style={mobileStyles.cancelButtonText}>
                  {successMessage || createSuccess ? 'Close' : 'Cancel'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// ------------------------ Web Styles ------------------------
const webStyles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '20px',
  },
  modal: {
    background: '#111',
    border: '1px solid #333',
    borderRadius: '16px',
    padding: '28px',
    width: '100%',
    maxWidth: '480px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  header: {
    marginBottom: '24px',
  },
  title: {
    fontSize: '22px',
    fontWeight: 700,
    color: '#fff',
    margin: 0,
    marginBottom: '16px',
  },
  tabBar: {
    display: 'flex',
    gap: '8px',
    padding: '4px',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.06)',
  },
  tab: {
    flex: 1,
    padding: '10px 16px',
    background: 'transparent',
    border: 'none',
    borderRadius: '8px',
    color: '#666',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  tabActive: {
    background: 'rgba(255,255,255,0.08)',
    color: '#fff',
  },
  content: {
    minHeight: '200px',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '1px solid rgba(255,255,255,0.06)',
  },
  cancelButton: {
    padding: '10px 20px',
    background: 'transparent',
    border: 'none',
    borderRadius: '8px',
    color: '#888',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'color 0.2s',
  },
};

// ------------------------ Mobile Styles ------------------------
const mobileStyles = StyleSheet.create({
  overlayContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlayBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  bottomSheet: {
    backgroundColor: '#0f0f0f',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: Dimensions.get('window').height * 0.85,
    borderWidth: 1,
    borderColor: '#333',
    borderBottomWidth: 0,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#444',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 10,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  tabTextActive: {
    color: '#fff',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  cancelButtonText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default AddMemberModal;
