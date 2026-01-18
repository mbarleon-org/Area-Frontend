import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { isWeb } from '../../utils/IsWeb';
import type { AdminCardData } from '../../types/AdminTypes';

interface AdminCardProps {
  data: AdminCardData;
  onMenuPress?: (id: string) => void;
  onView?: (data: AdminCardData) => void;
  onDelete?: (data: AdminCardData) => void;
}

const AdminCard: React.FC<AdminCardProps> = ({ data, onMenuPress, onView, onDelete }) => {
  const [hovered, setHovered] = useState(false);
  const [menuHovered, setMenuHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownHoverIndex, setDropdownHoverIndex] = useState<number | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const widthMap: Record<string, string> = {
    Name: '12%',
    Username: '20%',
    Description: '60%',
    Enabled: '10%',
    Version: '10%',
    'Workflow Name': '20%',
    'Workflow Description': '40%',
    'Credential Name': '20%',
    'Credential Description': '40%',
    Id: '10%',
  };

  const handleMenuToggle = () => {
    setMenuOpen((prev) => !prev);
    onMenuPress?.(data.id);
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const handleView = () => {
    setMenuOpen(false);
    setMobileMenuOpen(false);
    onView?.(data);
  };

  const handleDelete = () => {
    setMenuOpen(false);
    setMobileMenuOpen(false);
    onDelete?.(data);
  };

  useEffect(() => {
    if (!menuOpen) return;
    const handleOutside = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (wrapperRef.current && target && !wrapperRef.current.contains(target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [menuOpen]);

  // ------------------------ Mobile View ------------------------
  if (!isWeb) {
    return (
      <View style={mobileStyles.card}>
        <View style={mobileStyles.cardContent}>
          <View style={mobileStyles.fieldsContainer}>
            {data.fields.map((field, idx) => {
              return (
                <View key={idx} style={mobileStyles.fieldRow}>
                  <Text style={mobileStyles.fieldLabel}>{field.label}</Text>
                  <Text
                    style={mobileStyles.fieldValue}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    {typeof field.value === 'boolean' ? (field.value ? 'Yes' : 'No') : String(field.value)}
                  </Text>
                </View>
              );
            })}
          </View>
          <TouchableOpacity style={mobileStyles.menuBtn} onPress={handleMobileMenuToggle}>
            <Text style={mobileStyles.menuIcon}>⋮</Text>
          </TouchableOpacity>
        </View>

        {/* Mobile Menu Modal */}
        <Modal visible={mobileMenuOpen} transparent animationType="fade" onRequestClose={() => setMobileMenuOpen(false)}>
          <TouchableOpacity style={mobileStyles.menuOverlay} activeOpacity={1} onPress={() => setMobileMenuOpen(false)}>
            <View style={mobileStyles.menuDropdown}>
              <TouchableOpacity style={mobileStyles.menuItem} onPress={handleView}>
                <Text style={mobileStyles.menuItemText}>View</Text>
              </TouchableOpacity>
              <TouchableOpacity style={mobileStyles.menuItem} onPress={handleDelete}>
                <Text style={[mobileStyles.menuItemText, { color: '#e74c3c' }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    );
  }

  // ------------------------ Web View ------------------------
  const handleCardMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const related = e.relatedTarget as Node | null;
    if (menuOpen) {
      if (related && wrapperRef.current && wrapperRef.current.contains(related))
        return;
      setHovered(false);
    } else {
      setHovered(false);
    }
  };

  return (
    <div
      ref={(el) => { wrapperRef.current = el; }}
      style={{
        ...webStyles.card,
        ...(hovered ? webStyles.cardHover : {}),
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleCardMouseLeave}
    >
      <div style={webStyles.fieldsContainer}>
        {data.fields.map((field, idx) => {
          const preset = widthMap[field.label];
          const cellStyle: React.CSSProperties = {
            ...webStyles.fieldCell,
            ...(preset ? { flexBasis: preset, maxWidth: preset } : {}),
          };
          return (
            <div key={idx} style={cellStyle} title={String(field.value)}>
              <div style={webStyles.fieldLabel}>{field.label}</div>
              <div style={webStyles.fieldValue}>
                {typeof field.value === 'boolean' ? (field.value ? 'Yes' : 'No') : String(field.value)}
              </div>
            </div>
          );
        })}
      </div>
      <div style={webStyles.menuWrapper}>
        <button
          style={{
            ...webStyles.menuBtn,
            ...(menuHovered ? webStyles.menuBtnHover : {}),
          }}
          onClick={handleMenuToggle}
          onMouseEnter={() => setMenuHovered(true)}
          onMouseLeave={() => setMenuHovered(false)}
        >
          ⋮
        </button>
        {menuOpen && (
          <div
            style={webStyles.dropdown}
            onMouseEnter={() => setHovered(false)}
          >
            <button
              style={{
                ...webStyles.dropdownItem,
                ...(dropdownHoverIndex === 0 ? webStyles.dropdownItemHover : {}),
              }}
              onClick={handleView}
              onMouseEnter={() => setDropdownHoverIndex(0)}
              onMouseLeave={() => setDropdownHoverIndex(null)}
            >
              View
            </button>
            <button
              style={{
                ...webStyles.dropdownItem,
                ...(dropdownHoverIndex === 1 ? webStyles.dropdownItemHover : {}),
                color: '#e74c3c',
              }}
              onClick={handleDelete}
              onMouseEnter={() => setDropdownHoverIndex(1)}
              onMouseLeave={() => setDropdownHoverIndex(null)}
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const mobileStyles = StyleSheet.create({
  card: {
    backgroundColor: '#0a0a0a',
    borderColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  fieldsContainer: {
    flex: 1,
    marginRight: 8,
  },
  fieldCell: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    marginBottom: 6,
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    gap: 8,
  },
  fieldLabel: {
    color: '#999',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    flex: 1,
    maxWidth: '40%',
  },
  fieldValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  menuBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  menuIcon: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuDropdown: {
    backgroundColor: '#111',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    minWidth: 180,
    overflow: 'hidden',
  },
  menuItem: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  menuItemText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

const webStyles: { [k: string]: React.CSSProperties } = {
  card: {
    background: '#0a0a0a',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 10,
    padding: '18px 24px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    position: 'relative',
    transition: 'transform 0.18s ease, border-color 0.18s ease, background 0.18s ease',
    marginBottom: 12,
    boxSizing: 'border-box',
  },
  cardHover: {
    transform: 'translateY(-2px)',
    border: '1px solid rgba(255,255,255,0.12)',
    background: '#111',
  },
  fieldsContainer: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
    gap: '16px 32px',
  },

  // new cell style for web
  fieldCell: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 140,
    maxWidth: '33%',
    flex: 1,
    overflow: 'hidden',
    paddingRight: 12,
    boxSizing: 'border-box',
  },
  fieldLabel: {
    color: '#888',
    fontSize: 11,
    fontWeight: 500,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  fieldValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 600,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  menuWrapper: {
    position: 'relative',
    marginLeft: 16,
  },
  menuBtn: {
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.15)',
    color: '#fff',
    borderRadius: 6,
    width: 32,
    height: 32,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: 18,
    fontWeight: 700,
    transition: 'background 0.15s ease, border-color 0.15s ease',
  },
  menuBtnHover: {
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.35)',
  },
  dropdown: {
    position: 'absolute',
    top: 36,
    right: 0,
    background: '#111',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 8,
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    minWidth: 120,
    zIndex: 10,
    display: 'flex',
    flexDirection: 'column',
  },
  dropdownItem: {
    padding: '10px 12px',
    background: 'transparent',
    color: '#fff',
    border: 'none',
    textAlign: 'left',
    cursor: 'pointer',
    fontSize: 13,
    transition: 'background 0.12s ease',
  },
  dropdownItemHover: {
    background: 'rgba(255,255,255,0.04)',
  },
};

export default AdminCard;
