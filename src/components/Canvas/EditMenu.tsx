import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import "../../index.css";

type NodeItem = { id: string; x: number; y: number; width?: number; height?: number; label?: string } | null;

type Props = {
  node: NodeItem;
  updateNode: (patch: Partial<NonNullable<NodeItem>>) => void;
  onClose: () => void;
};
export type EditMenuHandle = { requestClose: () => void };

const EditMenu = forwardRef<EditMenuHandle, Props>(({ node, updateNode, onClose }, ref) => {
  const [name, setName] = useState(node?.label || "");
  const [x, setX] = useState(node?.x ?? 0);
  const [y, setY] = useState(node?.y ?? 0);
  const [visible, setVisible] = useState(false);
  const nameRef = React.useRef<HTMLInputElement | null>(null);
  const closeTimerRef = useRef<number | null>(null);
  const TRANSITION_MS = 460;

  useEffect(() => {
    setName(node?.label || "");
    setX(node?.x ?? 0);
    setY(node?.y ?? 0);
  }, [node]);

  useEffect(() => {
    requestAnimationFrame(() => {
      setVisible(true);
      nameRef.current?.focus();
    });
  }, []);

  const handleRequestClose = () => {
    setVisible(false);
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }
    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null;
      onClose();
    }, TRANSITION_MS);
  };

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
    };
  }, []);

  useImperativeHandle(ref, () => ({ requestClose: handleRequestClose }), [handleRequestClose]);

  if (!node) return null;

  return (
    <div
      style={{
        ...styles.container,
        transform: `${styles.container.transform} ${visible ? ' translateY(0)' : ' translateY(80%)'}`,
        opacity: visible ? 1 : 0,
        transition: 'transform 420ms cubic-bezier(.16,.84,.36,1), opacity 320ms ease'
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onMouseUp={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
    >
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
        <h3>Edit Menu</h3>
        <button onClick={handleRequestClose} style={{ background: 'transparent', color: '#fff', border: 'none' }}>✕</button>
      </div>
      <div style={styles.inputContainer}>
        <label style={styles.label}>Name</label>
        <input ref={nameRef} value={name} onChange={(e) => setName(e.target.value)} placeholder="Name..." style={styles.input} />
      </div>
      <div style={{ marginTop: 12, display: 'flex', gap: 40 }}>
        <button onClick={handleRequestClose} style={styles.closeButton}>Close</button>
        <button onClick={() => updateNode({ label: name, x, y })} style={styles.applyButton}>Apply</button>
      </div>
    </div>
  );
});

const styles: { [k: string]: React.CSSProperties } = {
  container: {
    position: "absolute",
    top: 0,
    left: "50%",
    transform: "translateX(-50%)",
    width: "30%",
    height: "100vh",
    backgroundColor: "#141414",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    padding: "16px",
    color: "#ffffff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  inputContainer: {
    width: "90%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  input: {
    width: "100%",
    padding: "9px",
    marginBottom: "12px",
    borderRadius: "4px",
    border: "1px solid #333",
    backgroundColor: "#1e1e1e",
    color: "#fff",
    fontSize: "15px",
  },
  label: {
    fontSize: "14px",
    marginBottom: "8px",
    alignSelf: 'flex-start',
  },
  applyButton: {
    padding: "8px 12px",
    backgroundColor: "#007acc",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  closeButton: {
    padding: "8px 12px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};

export default EditMenu;
