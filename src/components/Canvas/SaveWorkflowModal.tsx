import React, { useState, useRef, useEffect } from 'react';
import { requiredStyle } from './EditMenu/EditMenu.styles';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: { name: string; description: string; enabled: boolean }) => void;
  initialName?: string;
  initialDescription?: string;
  loading?: boolean;
  error?: string | string[] | null;
};

const SaveWorkflowModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  initialName = '',
  initialDescription = '',
  loading = false,
  error = null,
}) => {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [enabled, setEnabled] = useState(true);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setDescription(initialDescription);
      setTimeout(() => nameInputRef.current?.focus(), 100);
    }
  }, [isOpen, initialName, initialDescription]);

  useEffect(() => {
    if (!isOpen)
      return;

    if (typeof document === 'undefined' || typeof window === 'undefined')
      return;

    const previousOverflow = document.body.style.overflow;
    const preventScroll = (e: Event) => e.preventDefault();

    document.body.style.overflow = 'hidden';
    window.addEventListener('wheel', preventScroll, { passive: false });
    window.addEventListener('touchmove', preventScroll, { passive: false });

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('wheel', preventScroll);
      window.removeEventListener('touchmove', preventScroll);
    };
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name: name.trim(), description: description.trim(), enabled });
  };

  if (!isOpen) return null;

  return (
    <div
      style={styles.overlay}
      onClick={onClose}
      onWheel={(e) => e.preventDefault()}
      onTouchMove={(e) => e.preventDefault()}
    >
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>Save Workflow</h2>
          <button onClick={onClose} style={styles.closeButton}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={{ ...styles.label, display: 'flex', alignItems: 'center' }}>
              <span>Workflow Name</span>
              <span style={requiredStyle}>*</span>
            </label>
            <input
              ref={nameInputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Awesome Workflow"
              style={styles.input}
              required
              disabled={loading}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this workflow does..."
              style={styles.textarea}
              rows={3}
              disabled={loading}
            />
          </div>

          <div style={styles.checkboxField}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                style={styles.checkbox}
                disabled={loading}
              />
              <span>Enable workflow immediately</span>
            </label>
          </div>

          {error && (
            <div style={styles.error}>
              {Array.isArray(error) ? (
                <ul style={styles.errorList}>
                  {error.map((msg, idx) => (
                    <li key={`${msg}-${idx}`}>{msg}</li>
                  ))}
                </ul>
              ) : error}
            </div>
          )}

          <div style={styles.actions}>
            <button
              type="button"
              onClick={onClose}
              style={styles.cancelButton}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={styles.saveButton}
              disabled={loading || !name.trim()}
            >
              {loading ? 'Saving...' : 'Save Workflow'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
  },
  modal: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 480,
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
    border: '1px solid #333',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    margin: 0,
    fontSize: 20,
    fontWeight: 600,
    color: '#fff',
  },
  closeButton: {
    background: 'transparent',
    border: 'none',
    color: '#888',
    fontSize: 18,
    cursor: 'pointer',
    padding: 4,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: 500,
    color: '#ccc',
  },
  input: {
    padding: '10px 12px',
    borderRadius: 6,
    border: '1px solid #444',
    backgroundColor: '#2a2a2a',
    color: '#fff',
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  textarea: {
    padding: '10px 12px',
    borderRadius: 6,
    border: '1px solid #444',
    backgroundColor: '#2a2a2a',
    color: '#fff',
    fontSize: 14,
    outline: 'none',
    resize: 'vertical' as 'vertical',
    fontFamily: 'inherit',
  },
  checkboxField: {
    marginTop: 4,
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 14,
    color: '#ccc',
    cursor: 'pointer',
  },
  checkbox: {
    width: 16,
    height: 16,
    cursor: 'pointer',
  },
  error: {
    padding: '10px 12px',
    borderRadius: 6,
    backgroundColor: 'rgba(255, 100, 100, 0.1)',
    border: '1px solid rgba(255, 100, 100, 0.3)',
    color: '#ff8888',
    fontSize: 13,
  },
  errorList: {
    margin: 0,
    paddingLeft: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    padding: '10px 20px',
    borderRadius: 6,
    border: '1px solid #444',
    backgroundColor: 'transparent',
    color: '#ccc',
    fontSize: 14,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  saveButton: {
    padding: '10px 20px',
    borderRadius: 6,
    border: 'none',
    backgroundColor: '#007acc',
    color: '#fff',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
};

export default SaveWorkflowModal;
