import React from 'react';
import { isWeb } from '../../utils/IsWeb';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from 'react-native';

export type ConfirmationTheme = 'danger' | 'gold' | 'default';

export interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  theme?: ConfirmationTheme;
  loading?: boolean;
  icon?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancel',
  theme = 'default',
  loading = false,
  icon,
  onConfirm,
  onCancel,
}) => {
  if (!visible) return null;

  const getThemeStyles = () => {
    switch (theme) {
      case 'danger':
        return {
          iconBg: 'rgba(231, 76, 60, 0.15)',
          iconColor: '#e74c3c',
          confirmBg: '#e74c3c',
          confirmBgHover: '#c0392b',
          border: 'rgba(231, 76, 60, 0.3)',
        };
      case 'gold':
        return {
          iconBg: 'linear-gradient(135deg, rgba(245, 175, 25, 0.2) 0%, rgba(241, 39, 17, 0.1) 100%)',
          iconColor: '#f5af19',
          confirmBg: 'linear-gradient(135deg, #f5af19 0%, #f12711 100%)',
          confirmBgHover: 'linear-gradient(135deg, #e09c0f 0%, #d11a07 100%)',
          border: 'rgba(245, 175, 25, 0.4)',
        };
      default:
        return {
          iconBg: 'rgba(255, 255, 255, 0.05)',
          iconColor: '#888',
          confirmBg: '#fff',
          confirmBgHover: '#f0f0f0',
          border: 'rgba(255, 255, 255, 0.1)',
        };
    }
  };

  const themeStyles = getThemeStyles();

  // ------------------------ Web View ------------------------
  if (isWeb) {
    return (
      <div style={webStyles.overlay} onClick={onCancel}>
        <div
          style={{
            ...webStyles.modal,
            borderColor: themeStyles.border,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Icon */}
          {icon && (
            <div
              style={{
                ...webStyles.iconContainer,
                background: themeStyles.iconBg,
              }}
            >
              <span style={{ fontSize: '28px' }}>{icon}</span>
            </div>
          )}

          {/* Title */}
          <h3
            style={{
              ...webStyles.title,
              color: theme === 'gold' ? '#f5af19' : theme === 'danger' ? '#e74c3c' : '#fff',
            }}
          >
            {title}
          </h3>

          {/* Message */}
          <p style={webStyles.message}>{message}</p>

          {/* Actions */}
          <div style={webStyles.actions}>
            <button
              style={webStyles.cancelButton}
              onClick={onCancel}
              disabled={loading}
            >
              {cancelLabel}
            </button>
            <button
              style={{
                ...webStyles.confirmButton,
                background: themeStyles.confirmBg,
                color: theme === 'default' ? '#000' : '#fff',
                opacity: loading ? 0.7 : 1,
              }}
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <span style={webStyles.loadingContent}>
                  <span style={webStyles.spinnerSmall} />
                  Processing...
                </span>
              ) : (
                confirmLabel
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ------------------------ Mobile View ------------------------
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onCancel}>
      <View style={mobileStyles.overlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onCancel}
        />
        <View
          style={[
            mobileStyles.modal,
            {
              borderColor:
                theme === 'gold'
                  ? 'rgba(245, 175, 25, 0.4)'
                  : theme === 'danger'
                  ? 'rgba(231, 76, 60, 0.3)'
                  : 'rgba(255, 255, 255, 0.1)',
            },
          ]}
        >
          {/* Icon */}
          {icon && (
            <View
              style={[
                mobileStyles.iconContainer,
                {
                  backgroundColor:
                    theme === 'gold'
                      ? 'rgba(245, 175, 25, 0.15)'
                      : theme === 'danger'
                      ? 'rgba(231, 76, 60, 0.15)'
                      : 'rgba(255, 255, 255, 0.05)',
                },
              ]}
            >
              <Text style={mobileStyles.iconText}>{icon}</Text>
            </View>
          )}

          {/* Title */}
          <Text
            style={[
              mobileStyles.title,
              {
                color:
                  theme === 'gold'
                    ? '#f5af19'
                    : theme === 'danger'
                    ? '#e74c3c'
                    : '#fff',
              },
            ]}
          >
            {title}
          </Text>

          {/* Message */}
          <Text style={mobileStyles.message}>{message}</Text>

          {/* Actions */}
          <View style={mobileStyles.actions}>
            <TouchableOpacity
              style={mobileStyles.cancelButton}
              onPress={onCancel}
              disabled={loading}
            >
              <Text style={mobileStyles.cancelButtonText}>{cancelLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                mobileStyles.confirmButton,
                {
                  backgroundColor:
                    theme === 'gold'
                      ? '#f5af19'
                      : theme === 'danger'
                      ? '#e74c3c'
                      : '#fff',
                  opacity: loading ? 0.7 : 1,
                },
              ]}
              onPress={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={theme === 'default' ? '#000' : '#fff'} />
              ) : (
                <Text
                  style={[
                    mobileStyles.confirmButtonText,
                    { color: theme === 'default' ? '#000' : '#fff' },
                  ]}
                >
                  {confirmLabel}
                </Text>
              )}
            </TouchableOpacity>
          </View>
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
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    padding: '20px',
  },
  modal: {
    width: '100%',
    maxWidth: '420px',
    background: '#0f0f0f',
    borderRadius: '16px',
    padding: '28px',
    border: '1px solid',
    boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
    textAlign: 'center',
  },
  iconContainer: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
  },
  title: {
    fontSize: '20px',
    fontWeight: 700,
    margin: '0 0 16px 0',
  },
  message: {
    fontSize: '14px',
    color: '#888',
    lineHeight: 1.6,
    margin: '0 0 24px 0',
    textAlign: 'left',
  },
  actions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    padding: '12px 20px',
    background: 'transparent',
    border: '1px solid #333',
    borderRadius: '10px',
    color: '#888',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  confirmButton: {
    padding: '12px 24px',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s',
    minWidth: '120px',
  },
  loadingContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  spinnerSmall: {
    width: '14px',
    height: '14px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
};

// ------------------------ Mobile Styles ------------------------
const mobileStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modal: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#0f0f0f',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  iconText: {
    fontSize: 28,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: '#888',
    lineHeight: 22,
    marginBottom: 24,
    textAlign: 'left',
    width: '100%',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  cancelButtonText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '600',
  },
  confirmButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
});

export default ConfirmationModal;
