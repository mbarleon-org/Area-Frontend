import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  // --- OVERLAY & CONTAINER ---
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#1f1d24',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
  },

  // --- HEADER ---
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    color: '#6366f1',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    padding: 8,
  },
  deleteText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },

  // --- TABS ---
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#6366f1',
  },
  tabText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#6366f1',
  },

  // --- CONTENT ---
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  fieldGroup: {
    marginBottom: 16,
  },

  // --- INPUT FIELDS ---
  label: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  required: {
    color: '#ff6b6b',
  },
  input: {
    backgroundColor: '#2a2730',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#3a3740',
  },
  textarea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },

  // --- INFO BOX ---
  infoBox: {
    backgroundColor: '#2a2730',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    flexDirection: 'row',
    gap: 8,
  },
  infoLabel: {
    color: '#888',
    fontSize: 14,
  },
  infoValue: {
    color: '#fff',
    fontSize: 14,
  },

  // --- CONNECTION BOX ---
  connectionBox: {
    backgroundColor: '#252526',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 16,
    marginTop: 8,
  },
  connectionTitle: {
    color: '#fff',
    fontWeight: '600',
    marginBottom: 12,
    fontSize: 14,
  },
  connectedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
  },
  connectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  statusDot: {
    color: '#4caf50',
    fontSize: 16,
  },
  connectedText: {
    color: '#fff',
    fontSize: 13,
  },
  disconnectBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  disconnectBtnText: {
    color: '#bbb',
    fontSize: 11,
  },
  hintText: {
    fontSize: 11,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  selectLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 6,
  },

  // --- PICKER / SELECT ---
  picker: {
    backgroundColor: '#2a2730',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007acc',
    marginBottom: 12,
  },
  pickerItem: {
    color: '#fff',
    fontSize: 10,
  },

  // --- CONNECT BUTTON ---
  connectBtn: {
    backgroundColor: '#007acc',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  connectBtnDisabled: {
    opacity: 0.6,
  },
  connectBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },

  // --- CUSTOM FIELDS ---
  helpText: {
    fontSize: 13,
    color: '#888',
    marginBottom: 16,
    lineHeight: 20,
  },
  customRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
    gap: 8,
  },
  customRowField: {
    flex: 1,
  },
  deleteFieldBtn: {
    padding: 8,
    marginBottom: 4,
  },
  deleteFieldText: {
    color: '#ff6b6b',
    fontSize: 18,
  },
  addBox: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#333',
    borderStyle: 'dashed',
    paddingTop: 12,
    marginBottom: 24,
  },
  addInput: {
    flex: 1,
    backgroundColor: '#2a2730',
    borderRadius: 6,
    padding: 10,
    color: '#fff',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#3a3740',
  },
  addBtn: {
    backgroundColor: '#333',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    justifyContent: 'center',
  },
  addBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },

  // --- OPTIONS INPUT ---
  optionContainer: {
    marginBottom: 12,
  },
});
