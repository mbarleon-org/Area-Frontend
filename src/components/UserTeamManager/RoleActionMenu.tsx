import React, { useState, useRef, useEffect } from 'react';
import { isWeb } from '../../utils/IsWeb';
import type { TeamMember } from './teamUtils';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
} from 'react-native';

export interface RoleActionMenuProps {
  member: TeamMember;
  isCurrentUser: boolean;
  onPromoteToOwner: (member: TeamMember) => void;
  onRemoveMember: (member: TeamMember) => void;
}

const RoleActionMenu: React.FC<RoleActionMenuProps> = ({
  member,
  isCurrentUser,
  onPromoteToOwner,
  onRemoveMember,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isWeb || !menuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const handleToggleMenu = () => {
    if (isWeb && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
    setMenuOpen(!menuOpen);
  };

  const handlePromote = () => {
    setMenuOpen(false);
    onPromoteToOwner(member);
  };

  const handleRemove = () => {
    setMenuOpen(false);
    onRemoveMember(member);
  };

  // ------------------------ Web View ------------------------
  if (isWeb) {
    return (
      <div style={webStyles.container}>
        <button
          ref={buttonRef}
          style={webStyles.menuButton}
          onClick={handleToggleMenu}
          title="Actions"
        >
          ⋮
        </button>

        {menuOpen && (
          <div
            ref={menuRef}
            style={{
              ...webStyles.menuDropdown,
              position: 'fixed',
              top: menuPosition.top,
              right: menuPosition.right,
            }}
          >
            {/* Promote to Owner - only for members, not owners */}
            {member.role === 'member' && (
              <button
                style={webStyles.menuItemGold}
                onClick={handlePromote}
              >
                <span style={webStyles.menuItemIcon}>👑</span>
                <span>Promote to Owner</span>
              </button>
            )}

            {/* Remove - available for both members and owners (except self) */}
            {!isCurrentUser && (
              <button
                style={webStyles.menuItemDanger}
                onClick={handleRemove}
              >
                <span style={webStyles.menuItemIcon}>🗑️</span>
                <span>Remove {member.role === 'owner' ? 'Owner' : 'Member'}</span>
              </button>
            )}

            {/* Self info */}
            {isCurrentUser && (
              <div style={webStyles.menuItemDisabled}>
                <span style={webStyles.menuItemIcon}>ℹ️</span>
                <span>This is you</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // ------------------------ Mobile View ------------------------
  return (
    <View style={mobileStyles.container}>
      <TouchableOpacity
        style={mobileStyles.menuButton}
        onPress={handleToggleMenu}
      >
        <Text style={mobileStyles.menuButtonText}>⋮</Text>
      </TouchableOpacity>

      <Modal
        visible={menuOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setMenuOpen(false)}
      >
        <View style={mobileStyles.bottomSheetOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setMenuOpen(false)}
          />
          <View style={mobileStyles.bottomSheet}>
            <View style={mobileStyles.handleBar} />

            {/* Member Info Header */}
            <View style={mobileStyles.memberHeader}>
              <View style={mobileStyles.memberAvatar}>
                <Text style={mobileStyles.memberAvatarText}>
                  {member.username.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={mobileStyles.memberInfo}>
                <Text style={mobileStyles.memberName}>{member.username}</Text>
                <Text style={mobileStyles.memberRole}>
                  {member.role === 'owner' ? '👑 Owner' : 'Member'}
                </Text>
              </View>
            </View>

            {/* Actions */}
            <View style={mobileStyles.actionsList}>
              {/* Promote to Owner */}
              {member.role === 'member' && (
                <TouchableOpacity
                  style={mobileStyles.actionItemGold}
                  onPress={handlePromote}
                >
                  <Text style={mobileStyles.actionIcon}>👑</Text>
                  <Text style={mobileStyles.actionTextGold}>Promote to Owner</Text>
                </TouchableOpacity>
              )}

              {/* Remove */}
              {!isCurrentUser && (
                <TouchableOpacity
                  style={mobileStyles.actionItemDanger}
                  onPress={handleRemove}
                >
                  <Text style={mobileStyles.actionIcon}>🗑️</Text>
                  <Text style={mobileStyles.actionTextDanger}>
                    Remove {member.role === 'owner' ? 'Owner' : 'Member'}
                  </Text>
                </TouchableOpacity>
              )}

              {/* Self info */}
              {isCurrentUser && (
                <View style={mobileStyles.actionItemDisabled}>
                  <Text style={mobileStyles.actionIcon}>ℹ️</Text>
                  <Text style={mobileStyles.actionTextDisabled}>This is you</Text>
                </View>
              )}
            </View>

            {/* Cancel */}
            <TouchableOpacity
              style={mobileStyles.cancelButton}
              onPress={() => setMenuOpen(false)}
            >
              <Text style={mobileStyles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// ------------------------ Web Styles ------------------------
const webStyles: Record<string, React.CSSProperties> = {
  container: {
    position: 'relative',
  },
  menuButton: {
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    border: 'none',
    borderRadius: '6px',
    color: '#666',
    fontSize: '18px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  menuDropdown: {
    minWidth: '200px',
    background: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '10px',
    boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
    zIndex: 10001,
    overflow: 'hidden',
  },
  menuItemGold: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    background: 'rgba(245, 175, 25, 0.08)',
    border: 'none',
    color: '#f5af19',
    fontSize: '14px',
    fontWeight: 500,
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  menuItemDanger: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    background: 'transparent',
    border: 'none',
    color: '#e74c3c',
    fontSize: '14px',
    fontWeight: 500,
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  menuItemDisabled: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    color: '#555',
    fontSize: '14px',
    fontStyle: 'italic',
  },
  menuItemIcon: {
    fontSize: '16px',
    width: '20px',
    textAlign: 'center',
  },
};

// ------------------------ Mobile Styles ------------------------
const mobileStyles = StyleSheet.create({
  container: {},
  menuButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  menuButtonText: {
    color: '#666',
    fontSize: 18,
    fontWeight: '700',
  },
  bottomSheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  bottomSheet: {
    backgroundColor: '#0f0f0f',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: 34,
    maxHeight: Dimensions.get('window').height * 0.5,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#444',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    marginBottom: 16,
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberAvatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  memberRole: {
    color: '#888',
    fontSize: 13,
  },
  actionsList: {
    gap: 4,
  },
  actionItemGold: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    backgroundColor: 'rgba(245, 175, 25, 0.1)',
    borderRadius: 10,
  },
  actionItemDanger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 10,
  },
  actionItemDisabled: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    opacity: 0.5,
  },
  actionIcon: {
    fontSize: 18,
    width: 24,
    textAlign: 'center',
  },
  actionTextGold: {
    color: '#f5af19',
    fontSize: 15,
    fontWeight: '600',
  },
  actionTextDanger: {
    color: '#e74c3c',
    fontSize: 15,
    fontWeight: '500',
  },
  actionTextDisabled: {
    color: '#555',
    fontSize: 15,
    fontStyle: 'italic',
  },
  cancelButton: {
    marginTop: 16,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
  },
  cancelButtonText: {
    color: '#888',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default RoleActionMenu;
