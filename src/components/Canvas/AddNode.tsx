import React, { useEffect, useState } from "react";
import { getIconForModule, getConnectionPointsForModule } from "../../utils/iconHelper";
import Node from "./Node";

type ModuleItem = {
  [k: string]: any;
};

type ModuleEntry = {
  name: string;
  data: ModuleItem;
};

type Props = {
  position?: { x: number; y: number } | null;
  onAdd?: (node: any) => void;
  onClose?: () => void;
  modules?: ModuleEntry[];
};

const AddNode: React.FC<Props> = ({ position = null, onAdd, onClose, modules: passedModules }) => {
  const [modules, setModules] = useState<ModuleEntry[]>(passedModules && passedModules.length > 0 ? passedModules : []);
  const [loading, _setLoading] = useState(false);
  const [error, _setError] = useState<string | null>(null);
  const [nodePositions, setNodePositions] = useState<{ [key: string]: { x: number; y: number } }>({});

  const normalizeModules = (mods: ModuleEntry[]) => {
    return mods.map((m) => {
      const name = (m.name || '').trim();
      const replaced = name.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ');
      const lower = replaced.toLowerCase();
      const capitalized = lower ? lower.charAt(0).toUpperCase() + lower.slice(1) : lower;
      return { ...m, name: capitalized };
    });
  };

  useEffect(() => {
    if (passedModules && passedModules.length > 0) {
      setModules(normalizeModules(passedModules));
      const positions: { [key: string]: { x: number; y: number } } = {};
      passedModules.forEach((m) => { positions[m.name] = { x: 50, y: 50 }; });
      setNodePositions(positions);
    }
  }, [passedModules]);

  const handleAdd = (m: ModuleEntry) => {
    const icon = getIconForModule(m.name || "");
    const node = {
      id: `n${Date.now()}`,
      x: position?.x ?? 0,
      y: position?.y ?? 0,
      width: 96,
      height: 96,
      label: m.name || 'New Node',
      module: m.data,
      icon,
        connectionPoints: getConnectionPointsForModule(m.name || ""),
    };
    if (onAdd) onAdd(node);
    if (onClose) onClose();
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, m: ModuleEntry) => {
    const icon = getIconForModule(m.name || "");
    const payload = {
      name: m.name || "New Node",
      module: m.data,
      icon,
      width: 240,
      height: 120,
        connectionPoints: getConnectionPointsForModule(m.name || ""),
    };
    e.dataTransfer.setData("application/json", JSON.stringify(payload));
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <div style={styles.container}
      onMouseDown={(e) => e.stopPropagation()}
      onMouseUp={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
      onDrop={(e) => { e.preventDefault(); e.stopPropagation(); }}
    >
      <h3 style={styles.title}>Add Module</h3>

      {loading && <div style={{ color: '#aaa', padding: 12 }}>Loading modules…</div>}
      {error && <div style={{ color: '#f88', padding: 12 }}>{error}</div>}

      <div style={styles.moduleContainer}>
        {modules.map((m) => {
          const pos = nodePositions[m.name] || { x: 50, y: 0 };
          return (
            <div
              key={m.name}
              onClick={() => handleAdd(m)}
              draggable
              onDragStart={(e) => handleDragStart(e, m)}
              style={{ position: 'relative', width: '100px', height: '100px', margin: '80px' }}
            >
              <Node
                id={m.name}
                pos={pos}
                setPos={() => {}}
                width={240}
                height={120}
                scale={1}
                offset={{ x: 0, y: 0 }}
                gridPx={16}
                label={m.name}
                icon={(() => {
                  const src = getIconForModule(m.name || "");
                  return src ? <img src={src} alt={m.name} style={{ width: '54px', height: '54px', objectFit: 'contain' }} /> : undefined;
                })()}
              />
            </div>
          );
        })}
        {!loading && modules.length === 0 && !error && <div style={{ color: '#888', paddingTop: 8 }}>No modules available.</div>}
      </div>
    </div>
  );
};

const styles = {
  container: {
    position: "fixed" as "fixed",
    top: 0,
    right: 0,
    width: "30%",
    height: "100vh",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    backgroundColor: "#141414",
    display: "flex",
    flexDirection: "column" as "column",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    borderRadius: "8px",
    transition: "opacity 0.46s ease-in-out",
    zIndex: 1000,
    overflowY: "auto" as "auto",
  },
  title: {
    fontSize: "20px",
    fontWeight: "bold" as "bold",
    marginBottom: "16px",
    color: "#ffffff",
    padding: "16px",
    width: "100%",
  },
  moduleContainer: {
    position: 'relative' as 'relative',
    width: '100%',
    height: 'calc(100vh - 120px)',
    overflow: 'auto',
    padding: 12,
    paddingTop: 32,
    display: 'flex',
    flexDirection: 'column' as 'column',
    alignItems: 'center'
  }
};

export default AddNode;
