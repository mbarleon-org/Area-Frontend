import React, { useEffect, useState } from "react";
import { useApi } from "../../utils/UseApi";
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
};

const AddNode: React.FC<Props> = ({ position = null, onAdd, onClose }) => {
  const { get } = useApi();
  const [modules, setModules] = useState<ModuleEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    let mounted = true;
    setLoading(true);
    get('/modules')
      .then((res: any) => {
        if (!mounted) return;
        const modulesObj = res?.modules || res || {};
        const list: ModuleEntry[] = Object.entries(modulesObj).map(([name, data]) => ({ name, data: data as ModuleItem }));
        setModules(normalizeModules(list));
        if (onClose) onClose();
        const positions: { [key: string]: { x: number; y: number } } = {};
        list.forEach((m) => {
          positions[m.name] = { x: 50, y: 50 };
        });
        setNodePositions(positions);
      })
      .catch((err: any) => {
        console.error('Failed to load modules', err);
        if (!mounted) return;
        setError(err?.message || 'Failed to load');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, [get]);

  const handleAdd = (m: ModuleEntry) => {
    const node = {
      id: `n${Date.now()}`,
      x: position?.x ?? 0,
      y: position?.y ?? 0,
      width: 96,
      height: 96,
      label: m.name || 'New Node',
      module: m.data,
    };
    if (onAdd) onAdd(node);
    else console.log('Add node', node);
    if (onClose) onClose();
  };

  return (
    <div style={styles.container}
    onMouseDown={(e) => e.stopPropagation()}
      onMouseUp={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
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
              style={{ position: 'relative', width: '100px', height: '100px', margin: '80px' }}
            >
              <Node
                id={m.name}
                pos={pos}
                setPos={() => {}}
                width={256}
                height={128}
                scale={1}
                offset={{ x: 0, y: 0 }}
                gridPx={16}
                label={m.name}
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
