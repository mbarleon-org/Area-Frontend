import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { isWeb } from '../../utils/IsWeb';
import type { AdminCardData } from '../../types/AdminTypes';

interface AdminConfirmModalProps {
  visible: boolean;
  item: AdminCardData | null;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: (item: AdminCardData) => Promise<void>;
}

const AdminConfirmModal: React.FC<AdminConfirmModalProps> = ({ visible, item, loading = false, onCancel, onConfirm }) => {
  const [hoverConfirm, setHoverConfirm] = useState(false);
  const [hoverCancel, setHoverCancel] = useState(false);

  if (!visible || !item) return null;

  const title = `Delete ${item.type}`;
  const description = 'This action cannot be undone. Are you sure you want to proceed?';
  const primaryLabel = loading ? 'Deleting...' : 'Delete';

  // ------------------------ Mobile View ------------------------
  if (!isWeb) {
    return (
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
        <View style={mobileStyles.overlay}>
          <View style={mobileStyles.modal}>
            <Text style={mobileStyles.title}>{title}</Text>
            <Text style={mobileStyles.body}>{description}</Text>
            <View style={mobileStyles.actions}>
              <TouchableOpacity style={mobileStyles.cancelBtn} onPress={onCancel} disabled={loading}>
                <Text style={mobileStyles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[mobileStyles.confirmBtn, loading && mobileStyles.confirmDisabled]}
                onPress={() => onConfirm(item)}
                disabled={loading}
              >
                <Text style={mobileStyles.confirmText}>{primaryLabel}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  // ------------------------ Web View ------------------------
  return (
    <div style={webStyles.overlay} onClick={onCancel}>
      <div style={webStyles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 style={webStyles.title}>{title}</h3>
        <p style={webStyles.body}>{description}</p>
        <div style={webStyles.actions}>
          <button
            style={{
              ...webStyles.cancelBtn,
              ...(hoverCancel ? webStyles.cancelBtnHover : {}),
            }}
            onClick={onCancel}
            onMouseEnter={() => setHoverCancel(true)}
            onMouseLeave={() => setHoverCancel(false)}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            style={{
              ...webStyles.confirmBtn,
              ...(hoverConfirm ? webStyles.confirmBtnHover : {}),
              ...(loading ? webStyles.confirmBtnDisabled : {}),
            }}
            onClick={() => onConfirm(item)}
            onMouseEnter={() => setHoverConfirm(true)}
            onMouseLeave={() => setHoverConfirm(false)}
            disabled={loading}
          >
            {primaryLabel}
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
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 360,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  body: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 20,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'transparent',
  },
  cancelText: {
    color: '#fff',
    fontWeight: '600',
  },
  confirmBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#e74c3c',
  },
  confirmDisabled: {
    opacity: 0.5,
  },
  confirmText: {
    color: '#fff',
    fontWeight: '700',
  },
});

const webStyles: { [k: string]: React.CSSProperties } = {
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3000,
    padding: 20,
  },
  modal: {
    backgroundColor: '#1a1a1c',
    borderRadius: 12,
    padding: 28,
    width: '100%',
    maxWidth: 420,
    border: '1px solid rgba(255,255,255,0.1)',
    boxShadow: '0 24px 60px rgba(0,0,0,0.55)',
  },
  title: {
    color: '#fff',
    margin: '0 0 10px 0',
    fontSize: 20,
    fontWeight: 700,
  },
  body: {
    color: '#ccc',
    margin: '0 0 18px 0',
    fontSize: 14,
    lineHeight: 1.5,
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelBtn: {
    padding: '10px 16px',
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'transparent',
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  cancelBtnHover: {
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.35)',
  },
  confirmBtn: {
    padding: '10px 16px',
    borderRadius: 8,
    border: 'none',
    background: '#e74c3c',
    color: '#fff',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  confirmBtnHover: {
    background: '#cf4435',
    boxShadow: '0 6px 18px rgba(231,76,60,0.35)',
  },
  confirmBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
};

export default AdminConfirmModal;
