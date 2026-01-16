import React, { useState } from 'react';
import { useApi } from '../../utils/UseApi';
import { webStyles } from '../../pages/Dashboard/Dashboard.styles';
import { isWeb } from '../../utils/IsWeb';
import { Modal, View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';

interface AddCredentialModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const AddCredentialModal: React.FC<AddCredentialModalProps> = ({ onClose, onSuccess }) => {
  const { get, post } = useApi();
  const [email, setEmail] = useState('');
  const [appPassword, setAppPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !appPassword) return;
    setLoading(true);
    try {
      let list: any[] = [];
      try {
        const res = await get('/credentials');
        list = Array.isArray(res) ? res : Array.isArray((res as any)?.credentials) ? (res as any).credentials : [];
      } catch (err: any) {
        if (err?.response?.status === 404) {
          list = [];
        } else {
          throw err;
        }
      }

      const existing = list.find(
        (c: any) => (c.provider === 'gmail' || c.provider === 'google') && c.metadata?.email === email
      );

      let targetId = existing?.id;

      if (!targetId) {
        const payload = {
          id: Date.now().toString(),
          name: email,
          provider: 'gmail',
          type: 'gmail.email_app_password',
          version: '1.0.0',
          description: 'Gmail Credential via App Password',
          data: {
            email,
            token: appPassword,
            password: appPassword,
            app_password: appPassword,
          },
        };

        const newCred = await post('/credentials', payload);
        targetId = newCred?.id || payload.id;
      }

      if (targetId) {
        onSuccess();
      }
    } catch (err) {
      console.error("Failed to add credential", err);
    } finally {
      setLoading(false);
      onClose();
    }
  };

  // Styles for both platforms
  const inputStyle = {
    width: '100%',
    background: '#1a1a1a',
    border: '1px solid #333',
    padding: 10,
    borderRadius: 6,
    color: '#fff',
    marginBottom: 12,
    boxSizing: 'border-box' as const,
  };

  const labelStyle = {
    display: 'block',
    marginBottom: 6,
    color: '#888',
    fontSize: 12,
    fontWeight: 600,
  };

  // ------------------------ Web view ------------------------
  if (isWeb) {
    return (
      <div style={webStyles.confirmOverlay} onClick={onClose}>
        <div style={webStyles.confirmModal} onClick={(e) => e.stopPropagation()}>
          <div style={webStyles.confirmTitle}>Link New Account</div>

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Provider</label>
            <input style={inputStyle as any} value="Gmail" disabled />

            <label style={labelStyle}>Email</label>
            <input
              style={inputStyle as any}
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <label style={labelStyle}>App Password</label>
            <input
              style={inputStyle as any}
              type="password"
              placeholder="16-character Gmail App Password"
              value={appPassword}
              onChange={(e) => setAppPassword(e.target.value)}
            />
          </div>

          <div style={webStyles.confirmActions}>
            <button
              style={webStyles.confirmCancel}
              onClick={onClose}
              className="btn-hover"
            >
              Cancel
            </button>
            <button
              style={{ ...webStyles.addButton, background: loading ? '#555' : '#fff' }}
              onClick={handleSubmit}
              disabled={loading}
              className="btn-hover"
            >
              {loading ? 'Linking...' : 'Link Account'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ------------------------ Mobile view ------------------------
  return (
    <Modal animationType="fade" transparent visible onRequestClose={onClose}>
      <View style={mobileStyles.overlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />

        <View style={mobileStyles.modal} onStartShouldSetResponder={() => true}>
          <Text style={mobileStyles.title}>Link New Account</Text>

          <View style={{ marginBottom: 20 }}>
            <Text style={{ color: '#888', fontSize: 12, marginBottom: 6 }}>Provider</Text>
            <TextInput value="Gmail" editable={false} style={mobileStyles.input} />

            <Text style={{ color: '#888', fontSize: 12, marginTop: 12, marginBottom: 6 }}>Email</Text>
            <TextInput
              placeholder="user@example.com"
              placeholderTextColor="#888"
              value={email}
              onChangeText={setEmail}
              style={mobileStyles.input}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={{ color: '#888', fontSize: 12, marginTop: 12, marginBottom: 6 }}>App Password</Text>
            <TextInput
              placeholder="16-character Gmail App Password"
              placeholderTextColor="#888"
              value={appPassword}
              onChangeText={setAppPassword}
              secureTextEntry
              style={mobileStyles.input}
            />
          </View>

          <View style={mobileStyles.actionsRow}>
            <TouchableOpacity style={mobileStyles.cancelBtn} onPress={onClose} disabled={loading}>
              <Text style={mobileStyles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[mobileStyles.addBtn, { backgroundColor: loading ? '#555' : '#fff' }]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#000" /> : <Text style={mobileStyles.addBtnText}>Link Account</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const mobileStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modal: {
    width: '100%',
    backgroundColor: '#0f0f0f',
    borderRadius: 12,
    padding: 18
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6
  },
  subtitle: {
    color: '#aaa',
    fontSize: 13,
    marginBottom: 12
  },
  input: {
    backgroundColor: '#1f1f1f',
    color: '#fff',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginTop: 8
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginRight: 8
  },
  cancelText: {
    color: '#ccc'
  },
  addBtn: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8
  },
  addBtnText: {
    color: '#000',
    fontWeight: '700'
  },
});

export default AddCredentialModal;
