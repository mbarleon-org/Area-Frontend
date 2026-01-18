import { StyleSheet } from 'react-native';

// Web Styles
export const webStyles: any = {
  pageShell: {
    width: '100%',
    minHeight: '100vh',
    backgroundColor: '#050505',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'auto',
    overflowY: 'auto',
  },
  spotlight: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: '80vh',
    background: 'radial-gradient(ellipse at top, rgba(255,255,255,0.08), transparent 70%)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  mainLayout: {
    zIndex: 1,
    marginLeft: '80px',
    width: 'calc(100% - 80px)',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  containerCenter: {
    zIndex: 1,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBar: {
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: '40px 40px 20px',
    boxSizing: 'border-box',
  },
  centerContent: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingBottom: '60px',
  },
  heroTitle: {
    fontSize: '48px',
    fontWeight: 800,
    color: '#fff',
    marginBottom: '16px',
    letterSpacing: '-0.03em',
  },
  heroSubtitle: {
    fontSize: '18px',
    color: '#666'
  },
  addButton: {
    background: '#fff',
    color: '#000',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '14px',
    transition: 'all 0.2s',
  },
  plusButton: {
    background: 'transparent',
    color: '#fff',
    border: '2px solid rgba(255,255,255,0.2)',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '24px',
    lineHeight: '1',
    marginLeft: '16px',
    transition: 'all 0.2s',
  },
  itemWrapper: {
    width: '100%',
    opacity: 0
  },
  card: {
    background: '#0a0a0a',
    border: '1px solid #1a1a1a',
    borderRadius: '12px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    marginBottom: '16px',
    cursor: 'default',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '12px',
  },
  cardTitle: {
    fontWeight: 700,
    fontSize: '18px',
    color: '#fff'
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  versionPill: {
    fontSize: '12px',
    fontFamily: 'monospace',
    color: '#666',
    border: '1px solid #333',
    padding: '2px 6px',
    borderRadius: '4px',
  },
  statusEnabled: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#2ecc71',
    background: 'rgba(46, 204, 113, 0.1)',
    padding: '4px 10px',
    borderRadius: '20px',
  },
  statusDisabled: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#e74c3c',
    background: 'rgba(231, 76, 60, 0.1)',
    padding: '4px 10px',
    borderRadius: '20px',
  },
  cardBody: {
    fontSize: '14px',
    color: '#999',
    lineHeight: 1.6,
    marginBottom: '20px',
  },
  cardFooterRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
  filterBar: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '32px'
  },
  filterBtn: {
    background: 'transparent',
    border: '1px solid transparent',
    color: '#666',
    cursor: 'pointer',
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: 600,
    borderRadius: '20px',
    transition: 'all 0.2s',
    marginRight: '8px',
  },
  filterBtnActive: {
    color: '#fff',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  moreWrapper: {
    position: 'relative'
  },
  moreBtn: {
    background: 'transparent',
    border: 'none',
    color: '#fff',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '4px',
    opacity: 0.6,
    transition: 'opacity 0.2s',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    background: '#111',
    border: '1px solid #333',
    borderRadius: '8px',
    boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
    minWidth: '120px',
    zIndex: 20,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  dropdownItem: {
    padding: '10px 16px',
    background: 'transparent',
    color: '#fff',
    border: 'none',
    textAlign: 'left',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 500,
    transition: 'background 0.2s',
  },
  toggleBtn: {
    padding: '6px 12px',
    borderRadius: '6px',
    border: '1px solid #333',
    background: 'transparent',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 600,
    transition: 'all 0.2s',
  },
  confirmOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  confirmModal: {
    background: '#111',
    border: '1px solid #333',
    borderRadius: '12px',
    padding: '32px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
  },
  confirmTitle: {
    fontSize: '20px',
    fontWeight: 700,
    marginBottom: '12px',
    color: '#fff',
  },
  confirmText: {
    fontSize: '14px',
    color: '#888',
    marginBottom: '32px'
  },
  confirmActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px'
  },
  confirmCancel: {
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    background: 'transparent',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: 600,
    transition: 'background 0.2s',
  },
  confirmDelete: {
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    background: '#e74c3c',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: 600,
    transition: 'background 0.2s',
  },
};

// Mobile Styles)
export const mobileStyles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#050505'
  },
  centerScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  scrollContainer: {
    paddingTop: 120,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  actionButton: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  actionButtonText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 14
  },
  configToggle: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#111',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  configToggleText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600'
  },
  configContainer: {
    width: '100%',
    marginTop: 16,
    padding: 16,
    backgroundColor: '#0A0A0A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#222',
  },
  filterScroll: {
    flexGrow: 0,
    marginBottom: 24,
    height: 40
  },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.03)',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterBtnActive: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderColor: 'rgba(255,255,255,0.2)',
  },
  filterText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 13,
    marginTop: 3
  },
  filterTextActive: {
    color: '#fff'
  },
  card: {
    backgroundColor: '#0A0A0A',
    borderColor: '#1A1A1A',
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    zIndex: 10,
  },
  cardTitle: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
    marginBottom: 4,
  },
  version: {
    color: '#666',
    fontSize: 12,
    fontFamily: 'monospace'
  },
  moreBtn: {
    padding: 8
  },
  moreBtnText: {
    color: '#fff',
    fontSize: 11,
    lineHeight: 10
  },
  mobileDropdown: {
    position: 'absolute',
    top: 30,
    right: 0,
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    minWidth: 140,
    zIndex: 999,
  },
  mobileDropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16
  },
  mobileDropdownText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500'
  },
  cardBody: {
    color: '#999',
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 22,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  statusEnabled: {
    backgroundColor: 'rgba(46, 204, 113, 0.1)'
  },
  statusDisabled: {
    backgroundColor: 'rgba(231, 76, 60, 0.1)'
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600'
  },
  textEnabled: {
    color: '#2ecc71'
  },
  textDisabled: {
    color: '#e74c3c'
  },
  toggleBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#333',
  },
  toggleBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#111',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#333',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalText: {
    color: '#888',
    fontSize: 14,
    marginBottom: 24
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12
  },
  modalBtnCancel: {
    paddingVertical: 10,
    paddingHorizontal: 16
  },
  modalBtnDelete: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#e74c3c',
    borderRadius: 8,
  },
  modalBtnText: {
    color: '#fff',
    fontWeight: '600'
  },
  addButton: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 14,
  },
});
