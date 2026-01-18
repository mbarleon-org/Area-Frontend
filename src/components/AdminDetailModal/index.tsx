import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Switch, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { isWeb } from '../../utils/IsWeb';
import { getFieldsForType } from '../../constants/AdminFieldConfig';
import type { FieldConfig } from '../../constants/AdminFieldConfig';
import type { AdminCardData } from '../../types/AdminTypes';
import UserTeamManager from '../AdminUserTeamManager';

interface AdminDetailModalProps {
  visible: boolean;
  data: AdminCardData | null;
  onClose: () => void;
  onSave: (id: string, type: string, changes: Record<string, any>) => Promise<boolean>;
  get?: (url: string) => Promise<any>;
  post?: (url: string, data?: any) => Promise<any>;
  del?: (url: string) => Promise<any>;
  onRefresh?: () => void;
}

const AdminDetailModal: React.FC<AdminDetailModalProps> = ({ visible, data, onClose, onSave, get, post, del, onRefresh }) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [hoverApply, setHoverApply] = useState(false);
  const [hoverCancel, setHoverCancel] = useState(false);

  const isUserType = data?.type === 'user';
  const isTeamType = data?.type === 'team';
  const userTeams: string[] = (data?.raw as any)?.teams || [];
  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  useEffect(() => {
    if (data?.raw) {
      setFormData({ ...data.raw });
    }
  }, [data]);

  useEffect(() => {
    if (!isTeamType || !get || !data?.id) {
      setTeamMembers([]);
      return;
    }

    (async () => {
      try {
        const detail = await get(`/teams/${data.id}`);
        const users = detail?.team?.users || [];
        setTeamMembers(users);
      } catch (err) {
        console.error('Failed to fetch team members', err);
        setTeamMembers([]);
      }
    })();
  }, [isTeamType, data?.id, get]);

  const handleTeamsChange = () => {
    onRefresh?.();
  };

  if (!visible || !data) return null;

  const fields = getFieldsForType(data.type);

  const handleChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    const changes: Record<string, any> = {};
    fields.forEach((f) => {
      if (f.editable && formData[f.key] !== (data.raw as any)[f.key]) {
        changes[f.key] = formData[f.key];
      }
    });

    if (Object.keys(changes).length > 0) {
      const success = await onSave(data.id, data.type, changes);
      if (success) {
        onClose();
      }
    } else {
      onClose();
    }
    setSaving(false);
  };

  const renderField = (field: FieldConfig) => {
    const value = formData[field.key];

    if (field.type === 'boolean') {
      if (!isWeb) {
        return (
          <View style={mobileStyles.fieldRow} key={field.key}>
            <Text style={mobileStyles.fieldLabel}>{field.label}</Text>
            <Switch
              value={!!value}
              onValueChange={(v) => { if (field.editable) handleChange(field.key, v); }}
              disabled={!field.editable}
              trackColor={{ false: '#333', true: '#4CAF50' }}
              thumbColor={value ? '#fff' : '#888'}
            />
          </View>
        );
      }
      return (
        <div style={webStyles.fieldRow} key={field.key}>
          <label style={webStyles.fieldLabel}>{field.label}</label>
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => field.editable && handleChange(field.key, e.target.checked)}
            disabled={!field.editable}
            style={webStyles.checkbox}
          />
        </div>
      );
    }

    if (!isWeb) {
      return (
        <View style={mobileStyles.fieldRow} key={field.key}>
          <Text style={mobileStyles.fieldLabel}>{field.label}</Text>
          <TextInput
            style={[
              mobileStyles.fieldInput,
              !field.editable && mobileStyles.fieldInputDisabled,
            ]}
            value={String(value ?? '')}
            onChangeText={(v) => handleChange(field.key, v)}
            editable={field.editable}
            placeholderTextColor="#666"
          />
        </View>
      );
    }

    return (
      <div style={webStyles.fieldRow} key={field.key}>
        <label style={webStyles.fieldLabel}>{field.label}</label>
        <input
          type={field.type === 'email' ? 'email' : 'text'}
          value={String(value ?? '')}
          onChange={(e) => handleChange(field.key, e.target.value)}
          disabled={!field.editable}
          style={{
            ...webStyles.fieldInput,
            ...(!field.editable ? webStyles.fieldInputDisabled : {}),
          }}
        />
      </div>
    );
  };

  const renderTeamMembers = (variant: 'mobile' | 'web') => {
    const members = Array.isArray(teamMembers) ? teamMembers : [];
    if (members.length === 0) {
      if (variant === 'mobile') {
        return <Text style={mobileStyles.emptyMembers}>No members</Text>;
      }
      return <div style={webStyles.emptyMembers}>No members</div>;
    }

    if (variant === 'mobile') {
      return (
        <View style={mobileStyles.membersList}>
          {members.map((m: any) => {
            const name = m?.username || m?.email || m?.id || 'Unknown';
            return (
              <View key={String(m?.id || name)} style={mobileStyles.memberItem}>
                <Text style={mobileStyles.memberName}>{name}</Text>
              </View>
            );
          })}
        </View>
      );
    }

    return (
      <div style={webStyles.membersList}>
        {members.map((m: any) => {
          const name = m?.username || m?.email || m?.id || 'Unknown';
          return (
            <div key={String(m?.id || name)} style={webStyles.memberItem}>
              <span style={webStyles.memberName}>{name}</span>
            </div>
          );
        })}
      </div>
    );
  };

  // ------------------------ Mobile View ------------------------
  if (!isWeb) {
    return (
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        <KeyboardAvoidingView
          style={mobileStyles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={mobileStyles.overlay}>
            <View style={[mobileStyles.modal, isUserType && mobileStyles.modalWide]}>
              <Text style={mobileStyles.title}>
                {data.type.charAt(0).toUpperCase() + data.type.slice(1)} Details
              </Text>
              <View style={isUserType ? mobileStyles.twoColumnLayout : undefined}>
                <ScrollView
                  style={[mobileStyles.scrollContent, isUserType && mobileStyles.leftColumn]}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                >
                  {fields.map(renderField)}
                  {isTeamType && (
                    <View style={mobileStyles.section}>
                      <Text style={mobileStyles.sectionTitle}>Members</Text>
                      {renderTeamMembers('mobile')}
                    </View>
                  )}
                </ScrollView>
                {isUserType && get && post && del && (
                  <View style={mobileStyles.rightColumn}>
                    <UserTeamManager
                      userId={data.id}
                      userTeams={userTeams}
                      get={get}
                      post={post}
                      del={del}
                      onTeamsChange={handleTeamsChange}
                    />
                  </View>
                )}
              </View>
              <View style={mobileStyles.actions}>
                <TouchableOpacity
                  style={mobileStyles.cancelBtn}
                  onPress={onClose}
                  disabled={saving}
                >
                  <Text style={mobileStyles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[mobileStyles.applyBtn, saving && mobileStyles.applyBtnDisabled]}
                  onPress={handleSave}
                  disabled={saving}
                >
                  <Text style={mobileStyles.applyBtnText}>
                    {saving ? 'Saving...' : 'Apply'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    );
  }

  // ------------------------ Web View ------------------------
  return (
    <div style={webStyles.overlay} onClick={onClose}>
      <div
        style={{
          ...webStyles.modal,
          ...(isUserType ? webStyles.modalWide : {}),
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={webStyles.title}>
          {data.type.charAt(0).toUpperCase() + data.type.slice(1)} Details
        </h2>
        <div style={isUserType ? webStyles.twoColumnLayout : undefined}>
          <div style={{
            ...webStyles.scrollContent,
            ...(isUserType ? webStyles.leftColumn : {}),
          }}>
            {fields.map(renderField)}
            {isTeamType && (
              <div style={webStyles.section}>
                <h4 style={webStyles.sectionTitle}>Members</h4>
                {renderTeamMembers('web')}
              </div>
            )}
          </div>
          {isUserType && get && post && del && (
            <div style={webStyles.rightColumn}>
              <UserTeamManager
                userId={data.id}
                userTeams={userTeams}
                get={get}
                post={post}
                del={del}
                onTeamsChange={handleTeamsChange}
              />
            </div>
          )}
        </div>
        <div style={webStyles.actions}>
          <button
            style={{
              ...webStyles.cancelBtn,
              ...(hoverCancel ? webStyles.cancelBtnHover : {}),
            }}
            onClick={onClose}
            onMouseEnter={() => setHoverCancel(true)}
            onMouseLeave={() => setHoverCancel(false)}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            style={{
              ...webStyles.applyBtn,
              ...(hoverApply ? webStyles.applyBtnHover : {}),
              ...(saving ? webStyles.applyBtnDisabled : {}),
            }}
            onClick={handleSave}
            onMouseEnter={() => setHoverApply(true)}
            onMouseLeave={() => setHoverApply(false)}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Apply'}
          </button>
        </div>
      </div>
    </div>
  );
};

const mobileStyles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
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
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  modalWide: {
    maxWidth: 600,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
  },
  twoColumnLayout: {
    flexDirection: 'row',
    gap: 20,
  },
  leftColumn: {
    flex: 1,
  },
  rightColumn: {
    flex: 1,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.1)',
    paddingLeft: 20,
  },
  scrollContent: {
    flexGrow: 0,
    marginBottom: 20,
  },
  section: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.12)',
    paddingTop: 12,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  membersList: {
    gap: 8,
  },
  memberItem: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginBottom: 8,
  },
  memberName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyMembers: {
    color: '#888',
    fontSize: 13,
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
  fieldInputDisabled: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    color: '#666',
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
  applyBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
  },
  applyBtnDisabled: {
    opacity: 0.5,
  },
  applyBtnText: {
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
    maxHeight: '80vh',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
    display: 'flex',
    flexDirection: 'column',
  },
  modalWide: {
    maxWidth: 720,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 700,
    margin: '0 0 24px 0',
  },
  twoColumnLayout: {
    display: 'flex',
    flexDirection: 'row',
    gap: 24,
    flex: 1,
    overflow: 'hidden',
  },
  leftColumn: {
    flex: 1,
    overflowY: 'auto',
    paddingRight: 12,
  },
  rightColumn: {
    flex: 1,
    borderLeft: '1px solid rgba(255,255,255,0.1)',
    paddingLeft: 24,
    overflowY: 'auto',
  },
  scrollContent: {
    flex: 1,
    overflowY: 'auto',
    marginBottom: 24,
  },
  section: {
    marginTop: 16,
    paddingTop: 12,
    borderTop: '1px solid rgba(255,255,255,0.12)',
  },
  sectionTitle: {
    margin: '0 0 12px 0',
    fontSize: 14,
    fontWeight: 700,
    color: '#fff',
  },
  membersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  memberItem: {
    padding: '10px 12px',
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  memberName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 500,
  },
  emptyMembers: {
    color: '#888',
    fontSize: 13,
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
  fieldInputDisabled: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    color: '#666',
    cursor: 'not-allowed',
  },
  checkbox: {
    width: 20,
    height: 20,
    cursor: 'pointer',
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
    marginTop: 10,
  },
  cancelBtnHover: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.3)',
  },
  applyBtn: {
    padding: '10px 20px',
    borderRadius: 8,
    border: 'none',
    backgroundColor: '#4CAF50',
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginTop: 10,
  },
  applyBtnHover: {
    backgroundColor: '#45a049',
    boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
  },
  applyBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
};

export default AdminDetailModal;
