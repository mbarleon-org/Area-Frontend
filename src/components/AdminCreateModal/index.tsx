import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal } from 'react-native';
import { isWeb } from '../../utils/IsWeb';
import { useApi } from '../../utils/UseApi';

type CreateType = 'user' | 'team';

interface AdminCreateModalProps {
  visible: boolean;
  onClose: () => void;
  onCreateUser: (data: { username: string; email: string; password?: string }) => Promise<boolean>;
  onCreateTeam: (data: { name: string }) => Promise<boolean>;
}

const AdminCreateModal: React.FC<AdminCreateModalProps> = ({
  visible,
  onClose,
  onCreateUser,
  onCreateTeam,
}) => {
  const [activeTab, setActiveTab] = useState<CreateType>('user');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needPassword, setNeedPassword] = useState<boolean>(false);

  // User fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Team fields
  const [teamName, setTeamName] = useState('');

  // Hover states for web
  const [hoverAdd, setHoverAdd] = useState(false);
  const [hoverCancel, setHoverCancel] = useState(false);
  const [hoverTabUser, setHoverTabUser] = useState(false);
  const [hoverTabTeam, setHoverTabTeam] = useState(false);

  const { get } = useApi();

  useEffect(() => {
    if (!visible) return;
    let mounted = true;
    (async () => {
      try {
        await get('/auth/supports_check_email');
        if (mounted) setNeedPassword(false);
      } catch (e) {
        if (mounted) setNeedPassword(true);
      }
    })();
    return () => { mounted = false; };
  }, [visible, get]);

  const resetForm = () => {
    setUsername('');
    setEmail('');
    setPassword('');
    setTeamName('');
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleAdd = async () => {
    setError(null);
    setSaving(true);

    try {
      let success = false;
      if (activeTab === 'user') {
        const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/;
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;

        if (!username.trim() || !email.trim()) {
          setError('All fields are required');
          setSaving(false);
          return;
        }
        if (!emailPattern.test(email.trim())) {
          setError('Enter a valid email');
          setSaving(false);
          return;
        }
        if (needPassword) {
          if (password.length < 8 || !passwordPattern.test(password)) {
            setError('Password must be at least 8 characters, include a letter, a number, and a special character.');
            setSaving(false);
            return;
          }
        }

        success = await onCreateUser({
          username: username.trim(),
          email: email.trim(),
          ...(needPassword ? { password } : {}),
        });
      } else {
        if (!teamName.trim()) {
          setError('Team name is required');
          setSaving(false);
          return;
        }
        success = await onCreateTeam({ name: teamName.trim() });
      }

      if (success) {
        handleClose();
      } else {
        setError('Failed to create ' + activeTab);
      }
    } catch (err: any) {
      setError(err?.message || 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  if (!visible) return null;

  // ------------------------ Mobile View ------------------------
  if (!isWeb) {
    return (
      <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
        <View style={mobileStyles.overlay}>
          <View style={mobileStyles.modal}>
            <Text style={mobileStyles.title}>Create Mode</Text>

            {/* Tabs */}
            <View style={mobileStyles.tabs}>
              <TouchableOpacity
                style={[mobileStyles.tab, activeTab === 'user' && mobileStyles.tabActive]}
                onPress={() => { setActiveTab('user'); setError(null); }}
              >
                <Text style={[mobileStyles.tabText, activeTab === 'user' && mobileStyles.tabTextActive]}>
                  User
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[mobileStyles.tab, activeTab === 'team' && mobileStyles.tabActive]}
                onPress={() => { setActiveTab('team'); setError(null); }}
              >
                <Text style={[mobileStyles.tabText, activeTab === 'team' && mobileStyles.tabTextActive]}>
                  Team
                </Text>
              </TouchableOpacity>
            </View>

            {/* User Form */}
            {activeTab === 'user' && (
              <View style={mobileStyles.form}>
                <View style={mobileStyles.fieldRow}>
                  <Text style={mobileStyles.fieldLabel}>Username</Text>
                  <TextInput
                    style={mobileStyles.fieldInput}
                    value={username}
                    onChangeText={setUsername}
                    placeholder="Enter username"
                    placeholderTextColor="#666"
                    autoCapitalize="none"
                  />
                </View>
                <View style={mobileStyles.fieldRow}>
                  <Text style={mobileStyles.fieldLabel}>Email</Text>
                  <TextInput
                    style={mobileStyles.fieldInput}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter email"
                    placeholderTextColor="#666"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                {needPassword && (
                  <View style={mobileStyles.fieldRow}>
                    <Text style={mobileStyles.fieldLabel}>Password</Text>
                    <TextInput
                      style={mobileStyles.fieldInput}
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Enter password"
                      placeholderTextColor="#666"
                      secureTextEntry
                    />
                  </View>
                )}
              </View>
            )}

            {/* Team Form */}
            {activeTab === 'team' && (
              <View style={mobileStyles.form}>
                <View style={mobileStyles.fieldRow}>
                  <Text style={mobileStyles.fieldLabel}>Name</Text>
                  <TextInput
                    style={mobileStyles.fieldInput}
                    value={teamName}
                    onChangeText={setTeamName}
                    placeholder="Enter team name"
                    placeholderTextColor="#666"
                  />
                </View>
              </View>
            )}

            {/* Error */}
            {error && <Text style={mobileStyles.error}>{error}</Text>}

            {/* Actions */}
            <View style={mobileStyles.actions}>
              <TouchableOpacity style={mobileStyles.cancelBtn} onPress={handleClose} disabled={saving}>
                <Text style={mobileStyles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[mobileStyles.addBtn, saving && mobileStyles.addBtnDisabled]}
                onPress={handleAdd}
                disabled={saving}
              >
                <Text style={mobileStyles.addBtnText}>{saving ? 'Adding...' : 'Add'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  // ------------------------ Web View ------------------------
  return (
    <div style={webStyles.overlay} onClick={handleClose}>
      <div style={webStyles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 style={webStyles.title}>Create Mode</h2>

        {/* Tabs */}
        <div style={webStyles.tabs}>
          <button
            style={{
              ...webStyles.tab,
              ...(activeTab === 'user' ? webStyles.tabActive : {}),
              ...(hoverTabUser && activeTab !== 'user' ? webStyles.tabHover : {}),
            }}
            onClick={() => { setActiveTab('user'); setError(null); }}
            onMouseEnter={() => setHoverTabUser(true)}
            onMouseLeave={() => setHoverTabUser(false)}
          >
            User
          </button>
          <button
            style={{
              ...webStyles.tab,
              ...(activeTab === 'team' ? webStyles.tabActive : {}),
              ...(hoverTabTeam && activeTab !== 'team' ? webStyles.tabHover : {}),
            }}
            onClick={() => { setActiveTab('team'); setError(null); }}
            onMouseEnter={() => setHoverTabTeam(true)}
            onMouseLeave={() => setHoverTabTeam(false)}
          >
            Team
          </button>
        </div>

        {/* User Form */}
        {activeTab === 'user' && (
          <div style={webStyles.form}>
            <div style={webStyles.fieldRow}>
              <label style={webStyles.fieldLabel}>Username</label>
              <input
                type="text"
                style={webStyles.fieldInput}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
              />
            </div>
            <div style={webStyles.fieldRow}>
              <label style={webStyles.fieldLabel}>Email</label>
              <input
                type="email"
                style={webStyles.fieldInput}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
              />
            </div>
              {needPassword && (
                <div style={webStyles.fieldRow}>
                  <label style={webStyles.fieldLabel}>Password</label>
                  <input
                    type="password"
                    style={webStyles.fieldInput}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                  />
                </div>
              )}
          </div>
        )}

        {/* Team Form */}
        {activeTab === 'team' && (
          <div style={webStyles.form}>
            <div style={webStyles.fieldRow}>
              <label style={webStyles.fieldLabel}>Name</label>
              <input
                type="text"
                style={webStyles.fieldInput}
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Enter team name"
              />
            </div>
          </div>
        )}

        {/* Error */}
        {error && <div style={webStyles.error}>{error}</div>}

        {/* Actions */}
        <div style={webStyles.actions}>
          <button
            style={{
              ...webStyles.cancelBtn,
              ...(hoverCancel ? webStyles.cancelBtnHover : {}),
            }}
            onClick={handleClose}
            onMouseEnter={() => setHoverCancel(true)}
            onMouseLeave={() => setHoverCancel(false)}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            style={{
              ...webStyles.addBtn,
              ...(hoverAdd ? webStyles.addBtnHover : {}),
              ...(saving ? webStyles.addBtnDisabled : {}),
            }}
            onClick={handleAdd}
            onMouseEnter={() => setHoverAdd(true)}
            onMouseLeave={() => setHoverAdd(false)}
            disabled={saving}
          >
            {saving ? 'Adding...' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
};

const mobileStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#1a1a1c',
    borderRadius: 14,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  tabText: {
    color: '#888',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#fff',
  },
  form: {
    marginBottom: 16,
  },
  fieldRow: {
    marginBottom: 16,
  },
  fieldLabel: {
    color: '#888',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  fieldInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 14,
  },
  error: {
    color: '#ff6b6b',
    fontSize: 13,
    marginBottom: 16,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'transparent',
  },
  cancelBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  addBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#007AFF',
  },
  addBtnDisabled: {
    opacity: 0.5,
  },
  addBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
});

const webStyles: { [k: string]: React.CSSProperties } = {
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
    padding: 20,
  },
  modal: {
    backgroundColor: '#1a1a1c',
    borderRadius: 14,
    padding: 32,
    width: '100%',
    maxWidth: 480,
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 700,
    margin: '0 0 24px 0',
  },
  tabs: {
    display: 'flex',
    gap: 8,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    padding: '10px 16px',
    borderRadius: 8,
    border: 'none',
    backgroundColor: 'rgba(255,255,255,0.05)',
    color: '#888',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  tabActive: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    color: '#fff',
  },
  tabHover: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  form: {
    marginBottom: 16,
  },
  fieldRow: {
    marginBottom: 20,
    display: 'flex',
    flexDirection: 'column',
  },
  fieldLabel: {
    color: '#888',
    fontSize: 11,
    fontWeight: 600,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  fieldInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 8,
    padding: '12px 14px',
    color: '#fff',
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.2s ease',
  },
  error: {
    color: '#ff6b6b',
    fontSize: 13,
    marginBottom: 16,
    textAlign: 'center',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelBtn: {
    padding: '10px 20px',
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.15)',
    backgroundColor: 'transparent',
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  cancelBtnHover: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.3)',
  },
  addBtn: {
    padding: '10px 20px',
    borderRadius: 8,
    border: 'none',
    backgroundColor: '#007AFF',
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  addBtnHover: {
    backgroundColor: '#0066DD',
    boxShadow: '0 4px 12px rgba(0, 122, 255, 0.3)',
  },
  addBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
};

export default AdminCreateModal;
