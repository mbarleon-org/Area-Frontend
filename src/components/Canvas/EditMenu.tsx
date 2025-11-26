import React, { useState, useEffect } from "react";
import "../../index.css";

type NodeItem = { id: string; x: number; y: number; width?: number; height?: number; label?: string } | null;

type Props = {
  node: NodeItem;
  updateNode: (patch: Partial<NonNullable<NodeItem>>) => void;
  onClose: () => void;
};

const EditMenu: React.FC<Props> = ({ node, updateNode, onClose }) => {
  const [name, setName] = useState(node?.label || "");
  const [x, setX] = useState(node?.x ?? 0);
  const [y, setY] = useState(node?.y ?? 0);

  useEffect(() => {
    setName(node?.label || "");
    setX(node?.x ?? 0);
    setY(node?.y ?? 0);
  }, [node]);

  if (!node) return null;

  return (
    <div
      style={styles.container}
      onMouseDown={(e) => e.stopPropagation()}
      onMouseUp={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
    >
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
        <h3>Edit Menu</h3>
        <button onClick={onClose} style={{ background: 'transparent', color: '#fff', border: 'none' }}>✕</button>
      </div>
      <label style={{ alignSelf: 'flex-start' }}>Name</label>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name..." style={styles.input} />
      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        <button onClick={onClose} style={styles.closeButton}>Close</button>
        <button onClick={() => updateNode({ label: name, x, y })} style={styles.applyButton}>Apply</button>
      </div>
    </div>
  );
};

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
  input: {
    width: "100%",
    padding: "8px",
    marginBottom: "12px",
    borderRadius: "4px",
    border: "1px solid #333",
    backgroundColor: "#1e1e1e",
    color: "#fff",
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
