import React, { useRef, useState, useCallback, useEffect } from "react";
import Node from "./Node";
import { useApi } from "../../utils/UseApi";
import EditMenu from "./EditMenu";
import CenterControl from "./CenterControl";
import AddNode from "./AddNode";
import TopBar from "./TopBar";
import BinButton from "./BinButton";
import { useLocation } from "../../utils/router";

const mod = (n: number, m: number) => ((n % m) + m) % m;

const Canvas: React.FC = () => {
  const location = useLocation();
  const workflowFromState = (location as any)?.state?.workflow;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const initialPosSet = useRef(false);
  const binButtonRef = useRef<HTMLButtonElement | null>(null);

  type CredentialItem = { id: string; provider?: string; type?: string; name?: string; metadata?: Record<string, any> };

  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);

  type NodeItem = {
    id: string;
    x: number;
    y: number;
    width?: number;
    height?: number;
    label?: string;
    icon?: string;
    module?: any;
    connectionPoints?: Array<{ side: 'left'|'right'|'top'|'bottom'; offset: number; size?: number }>;
    inputs?: Record<string, string>;
    outputs?: Record<string, string>;
    options?: Record<string, any>;
    credential_id?: string;
  };
  const [nodes, setNodes] = useState<NodeItem[]>([]);
  type EndpointRef = { nodeId?: string; side?: 'left' | 'right' | 'top' | 'bottom'; offset?: number; worldX?: number; worldY?: number; index?: number };
  type LineItem = { a: EndpointRef; b: EndpointRef; stroke?: string; strokeWidth?: number };
  const [lines, setLines] = useState<LineItem[]>([]);
  const [pendingConnection, setPendingConnection] = useState<null | EndpointRef>(null);
  const [hoveredLineIndex, setHoveredLineIndex] = useState<number | null>(null);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [credentials, setCredentials] = useState<CredentialItem[]>([]);

  const gridPx = 24;

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const isEditMenuOpen = selectedId !== null;
  const editMenuRef = useRef<import("./EditMenu").EditMenuHandle | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const interactionLocked = showAddMenu || isEditMenuOpen || isSaveModalOpen;
  const { get } = useApi();
    const recenterNodes = useCallback((items?: NodeItem[]) => {
      const el = containerRef.current;
      if (!el)
        return;
      const rect = el.getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const list = (items && items.length > 0) ? items : nodes;
      if (!list || list.length === 0)
        return;

      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const n of list) {
        minX = Math.min(minX, n.x - (n.width ?? 0) / 2);
        minY = Math.min(minY, n.y - (n.height ?? 0) / 2);
        maxX = Math.max(maxX, n.x + (n.width ?? 0) / 2);
        maxY = Math.max(maxY, n.y + (n.height ?? 0) / 2);
      }
      if (!isFinite(minX))
        return;

      const bboxW = Math.max(1, maxX - minX);
      const bboxH = Math.max(1, maxY - minY);
      const padding = 120;
      const scaleX = (rect.width - padding) / bboxW;
      const scaleY = (rect.height - padding) / bboxH;
      const targetScale = Math.max(0.2, Math.min(3, Math.min(scaleX, scaleY)));
      const centerWorldX = (minX + maxX) / 2;
      const centerWorldY = (minY + maxY) / 2;
      setScale(targetScale);
      setOffset({ x: cx - centerWorldX * targetScale, y: cy - centerWorldY * targetScale });
    }, [nodes]);
  const [modules, setModules] = useState<Array<{ name: string; data: any }>>([]);
  const fetchCredentials = useCallback(async () => {
    try {
      const res = await get('/credentials');

      const normalize = (raw: any): CredentialItem => {
        const base = raw || {};
        const provider = base.provider || (typeof base.type === 'string' ? base.type.split('.')?.[0] : undefined);
        return { ...base, provider };
      };

      const arr = Array.isArray(res)
        ? res
        : Array.isArray((res as any)?.credentials)
          ? (res as any).credentials
          : Array.isArray((res as any)?.credentials?.credentials)
            ? (res as any).credentials.credentials
            : [];

      setCredentials(arr.map(normalize));
    } catch (err: any) {
      if (err?.response?.status === 404) {
        setCredentials([]);
      } else {
        console.error('Failed to load credentials (canvas)', err);
      }
    }
  }, [get]);

  const computeSnapOffset = (worldSize: number, gridPx: number) => {
    const cells = Math.round(worldSize / gridPx);
    return (cells % 2 === 0) ? 0 : gridPx / 2;
  };

  const handleAddNode = useCallback(() => {
    setShowAddMenu(true);
  }, [offset.x, offset.y, scale, gridPx]);

  const handleAddFromMenu = useCallback((node: any) => {
    setNodes((ns) => [...ns, node]);
    setShowAddMenu(false);
  }, []);

  const handleRemoveNode = useCallback((nodeId: string) => {
    setNodes((ns) => ns.filter((n) => n.id !== nodeId));
    setLines((ls) => ls.filter((l) => l.a.nodeId !== nodeId && l.b.nodeId !== nodeId));
    setSelectedId((sid) => (sid === nodeId ? null : sid));
  }, []);

  type DragPayload = {
    name: string;
    module: any;
    icon?: string | null;
    width?: number;
    height?: number;
    connectionPoints?: Array<{ side: 'left'|'right'|'top'|'bottom'; offset: number; size?: number }>;
  };

  const handleDropOnCanvas = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const el = containerRef.current;
    if (!el) return;

    const json = e.dataTransfer.getData("application/json") || e.dataTransfer.getData("text/plain");
    if (!json) return;
    let payload: DragPayload | null = null;
    try {
      payload = JSON.parse(json);
    } catch (err) {
      return;
    }
    if (!payload) return;

    const rect = el.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const worldX = (cx - offset.x) / scale;
    const worldY = (cy - offset.y) / scale;
    const w = payload.width || 240;
    const h = payload.height || 120;
    const snapOffX = computeSnapOffset(w, gridPx);
    const snapOffY = computeSnapOffset(h, gridPx);
    const x = Math.round((worldX - snapOffX) / gridPx) * gridPx + snapOffX;
    const y = Math.round((worldY - snapOffY) / gridPx) * gridPx + snapOffY;

    const newNode: NodeItem = {
      id: `n${Date.now()}`,
      x,
      y,
      width: w,
      height: h,
      label: payload.name || "New Node",
      icon: payload.icon || undefined,
      module: payload.module,
      connectionPoints: payload.connectionPoints,
    };
    setNodes((ns) => [...ns, newNode]);
  }, [gridPx, offset.x, offset.y, scale]);

  const handleCanvasClick = useCallback(() => {
    if (showAddMenu) {
      setShowAddMenu(false);
      return;
    }
    if (hoveredLineIndex !== null) {
      setLines(ls => ls.filter((_, i) => i !== hoveredLineIndex));
      setHoveredLineIndex(null);
      return;
    }
    if (editMenuRef.current?.requestClose) {
      editMenuRef.current.requestClose();
      return;
    }
    setSelectedId(null);
  }, [hoveredLineIndex, showAddMenu]);

  const onDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (interactionLocked) return;
    dragging.current = true;
    const isTouch = "touches" in e;
    const p = isTouch ? (e as React.TouchEvent).touches[0] : (e as React.MouseEvent).nativeEvent;
    lastPos.current = { x: p.clientX, y: p.clientY };
    if (typeof document !== 'undefined') (document.activeElement as HTMLElement)?.blur();
    if (!isTouch)
      (e as React.MouseEvent).preventDefault();
  }, [interactionLocked]);

  const onMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (interactionLocked) return;
    const p = "touches" in e ? (e as React.TouchEvent).touches[0] : (e as React.MouseEvent).nativeEvent;
    const clientX = p.clientX;
    const clientY = p.clientY;
    if (dragging.current) {
      const dx = clientX - lastPos.current.x;
      const dy = clientY - lastPos.current.y;
      lastPos.current = { x: clientX, y: clientY };
      setOffset(o => ({ x: o.x + dx, y: o.y + dy }));
      return;
    }

    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const mx = clientX - rect.left;
    const my = clientY - rect.top;
    let bestIndex: number | null = null;
    let bestDist = Infinity;
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i];
      const resolve = (ep: EndpointRef) => {
        if (ep.nodeId) {
          const node = nodes.find(n => n.id === ep.nodeId);
          if (node) {
            let wx = node.x;
            let wy = node.y;
            const w = node.width || 240;
            const h = node.height || 120;
            if (ep.side === 'right') {
              wx = node.x + w / 2; wy = node.y + (ep.offset || 0);
            } else if (ep.side === 'left') {
              wx = node.x - w / 2; wy = node.y + (ep.offset || 0);
            } else if (ep.side === 'top') {
              wy = node.y - h / 2; wx = node.x + (ep.offset || 0);
            } else if (ep.side === 'bottom') {
              wy = node.y + h / 2; wx = node.x + (ep.offset || 0);
            }
            return { x: offset.x + wx * scale, y: offset.y + wy * scale };
          }
        }
        if (ep.worldX !== undefined && ep.worldY !== undefined) return { x: offset.x + ep.worldX * scale, y: offset.y + ep.worldY * scale };
        return { x: 0, y: 0 };
      };
      const a = resolve(l.a);
      const b = resolve(l.b);
      const vx = b.x - a.x;
      const vy = b.y - a.y;
      const len2 = vx*vx + vy*vy;
      let t = 0;
      if (len2 > 0) t = ((mx - a.x) * vx + (my - a.y) * vy) / len2;
      t = Math.max(0, Math.min(1, t));
      const px = a.x + t * vx;
      const py = a.y + t * vy;
      const dist = Math.hypot(mx - px, my - py);
      if (dist < bestDist) { bestDist = dist; bestIndex = i; }
    }
    const threshold = 10;
    if (bestIndex !== null && bestDist <= threshold)
      setHoveredLineIndex(bestIndex);
    else
      setHoveredLineIndex(null);
  }, [lines, nodes, offset.x, offset.y, scale, interactionLocked]);

  const onUp = useCallback(() => {
    dragging.current = false;
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el)
        return;
    const wheel = (e: WheelEvent) => {
      if (interactionLocked)
        return;
      e.preventDefault();
      const delta = -e.deltaY;
      const rect = el.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      const oldScale = scale;
      let newScale = scale * (delta > 0 ? 1.08 : 0.92);
      newScale = Math.min(3, Math.max(0.5, newScale));
      setOffset(o => {
        const ox = (o.x - cx) * (newScale / oldScale) + cx;
        const oy = (o.y - cy) * (newScale / oldScale) + cy;
        return { x: ox, y: oy };
      });
      setScale(newScale);
    };
    el.addEventListener('wheel', wheel, { passive: false });
    return () => el.removeEventListener('wheel', wheel as EventListener);
  }, [scale, setScale, interactionLocked]);

  useEffect(() => {
    const layout = workflowFromState?.data || workflowFromState?.datas || workflowFromState?.canvas;
    if (!layout)
      return;

    const safeNodes = Array.isArray(layout.nodes) ? layout.nodes : [];
    const safeLines = Array.isArray(layout.lines) ? layout.lines : [];

    const normalizedNodes = safeNodes.map((n: any) => {
      const w = n?.width || 240;
      const h = n?.height || 120;
      const snapOffX = computeSnapOffset(w, gridPx);
      const snapOffY = computeSnapOffset(h, gridPx);
      const x = Math.round(((n?.x ?? 0) - snapOffX) / gridPx) * gridPx + snapOffX;
      const y = Math.round(((n?.y ?? 0) - snapOffY) / gridPx) * gridPx + snapOffY;

      return {
        id: n?.id || `n${Date.now()}`,
        x,
        y,
        width: w,
        height: h,
        label: n?.label,
        icon: n?.icon,
        module: n?.module,
        connectionPoints: n?.connectionPoints,
        inputs: n?.inputs,
        outputs: n?.outputs,
        options: n?.options,
        credential_id: n?.credential_id,
      } as NodeItem;
    });

    const normalizedLines = safeLines.map((l: any) => ({
      a: l?.a || {},
      b: l?.b || {},
      stroke: l?.stroke || '#fff',
      strokeWidth: l?.strokeWidth || 4,
    } as LineItem));

    initialPosSet.current = true;
    setNodes(normalizedNodes);
    setLines(normalizedLines);

    setTimeout(() => recenterNodes(normalizedNodes), 30);
  }, [workflowFromState]);

  useEffect(() => {
    if (initialPosSet.current) return;
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const w = 240;
    const h = 120;
    const rawWorldX = (cx - offset.x) / scale;
    const rawWorldY = (cy - offset.y) / scale;
    const snapOffX = computeSnapOffset(w, gridPx);
    const snapOffY = computeSnapOffset(h, gridPx);
    const x = Math.round((rawWorldX - snapOffX) / gridPx) * gridPx + snapOffX;
    const y = Math.round((rawWorldY - snapOffY) / gridPx) * gridPx + snapOffY;
    setNodes([{ id: 'n1', x, y, width: w, height: h, label: 'Default' }]);
    initialPosSet.current = true;
  }, [offset.x, offset.y, scale]);

  useEffect(() => {
    let mounted = true;
    get('/modules')
      .then((res: any) => {
        if (!mounted) return;
        const modulesObj = res?.modules || res || {};
        const list = Object.entries(modulesObj).map(([name, data]) => ({ name, data }));
        setModules(list);
      })
      .catch((err: any) => {
        console.error('Failed to load modules (canvas)', err);
      });
    return () => { mounted = false; };
  }, [get]);

  useEffect(() => {
    fetchCredentials();
  }, [fetchCredentials]);

  const bgSize1 = `${gridPx * scale}px ${gridPx * scale}px`;
  const bgSize2 = `${gridPx * 8 * scale}px ${gridPx * 8 * scale}px`;
  const pos1x = Math.round(mod(offset.x, gridPx * scale));
  const pos1y = Math.round(mod(offset.y, gridPx * scale));
  const pos2x = Math.round(mod(offset.x, gridPx * 8 * scale));
  const pos2y = Math.round(mod(offset.y, gridPx * 8 * scale));

  const minorColor = 'rgba(255,255,255,0.04)';
  const majorColor = 'rgba(255,255,255,0.08)';

  const canvasStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
  cursor: hoveredLineIndex !== null ? 'default' : (dragging.current ? "grabbing" : "grab"),
    backgroundColor: "transparent",
    backgroundImage: `
      repeating-linear-gradient(0deg, ${minorColor} 0px, ${minorColor} 1px, transparent 1px, transparent ${gridPx * scale}px),
      repeating-linear-gradient(90deg, ${minorColor} 0px, ${minorColor} 1px, transparent 1px, transparent ${gridPx * scale}px),
      repeating-linear-gradient(0deg, ${majorColor} 0px, ${majorColor} 1px, transparent 1px, transparent ${gridPx * 8 * scale}px),
      repeating-linear-gradient(90deg, ${majorColor} 0px, ${majorColor} 1px, transparent 1px, transparent ${gridPx * 8 * scale}px)
    `,
    backgroundSize: `${bgSize1}, ${bgSize1}, ${bgSize2}, ${bgSize2}`,
    backgroundPosition: `${pos1x}px ${pos1y}px, ${pos1x}px ${pos1y}px, ${pos2x}px ${pos2y}px, ${pos2x}px ${pos2y}px`,
    transformOrigin: "0 0",
    overflow: "hidden",
    touchAction: "none",
  };


  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100vh", position: "relative", background: "#151316ff" }}
      onMouseDown={onDown}
      onMouseMove={onMove}
      onMouseUp={onUp}
      onMouseLeave={onUp}
      onTouchStart={onDown}
      onTouchMove={onMove}
  onTouchEnd={onUp}
    >
  <div style={canvasStyle} onClick={handleCanvasClick} onDoubleClick={handleAddNode} onDragOver={(e) => e.preventDefault()} onDrop={handleDropOnCanvas}>
        <svg style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          {lines.map((l, i) => {
            const resolve = (ep: EndpointRef) => {
              if (ep.nodeId) {
                const node = nodes.find(n => n.id === ep.nodeId);
                if (node) {
                  let wx = node.x;
                  let wy = node.y;
                  const w = node.width || 96;
                  const h = node.height || 96;
                  if (ep.side === 'right') {
                    wx = node.x + w / 2;
                    wy = node.y + (ep.offset || 0);
                  } else if (ep.side === 'left') {
                    wx = node.x - w / 2;
                    wy = node.y + (ep.offset || 0);
                  } else if (ep.side === 'top') {
                    wy = node.y - h / 2;
                    wx = node.x + (ep.offset || 0);
                  } else if (ep.side === 'bottom') {
                    wy = node.y + h / 2;
                    wx = node.x + (ep.offset || 0);
                  }
                  return { x: offset.x + wx * scale, y: offset.y + wy * scale };
                }
              }
              if (ep.worldX !== undefined && ep.worldY !== undefined) {
                return { x: offset.x + ep.worldX * scale, y: offset.y + ep.worldY * scale };
              }
              return { x: 0, y: 0 };
            };
            const a = resolve(l.a);
            const b = resolve(l.b);
            const isHovered = hoveredLineIndex === i;
            return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={isHovered ? '#ff8b8b' : (l.stroke || '#ffffff')} strokeWidth={l.strokeWidth} />;
          })}
        </svg>
        {nodes.map(n => (
          <Node
            key={n.id}
            id={n.id}
            pos={{ x: n.x, y: n.y }}
            setPos={(p) => setNodes(ns => ns.map(item => item.id === n.id ? { ...item, x: p.x, y: p.y } : item))}
            onSelect={() => setSelectedId(n.id)}
            width={n.width || 96}
            height={n.height || 96}
            scale={scale}
            offset={offset}
            gridPx={gridPx}
            label={n.label}
            icon={n.icon ? <img src={n.icon} alt={n.label ?? n.id} style={{ width: '40px', height: '40px', objectFit: 'contain' }} /> : undefined}
            connectionPoints={n.connectionPoints || [{ side: 'right', offset: 0 }, { side: 'left', offset: 0 }, { side: 'top', offset: 0 }, { side: 'bottom', offset: 0 }]}
            disableDrag={isEditMenuOpen || isSaveModalOpen}
            onConnectorClick={(info) => {
              if (interactionLocked) return;
              if (!pendingConnection) {
                setPendingConnection(info);
                return;
              }
              const a = pendingConnection;
              const b = info;
              setLines(ls => [...ls, { a: { nodeId: a.nodeId, side: a.side, offset: a.offset, worldX: a.worldX, worldY: a.worldY }, b: { nodeId: b.nodeId, side: b.side, offset: b.offset, worldX: b.worldX, worldY: b.worldY }, stroke: '#fff', strokeWidth: 4 }]);
              setPendingConnection(null);
            }}
            onDragEnd={({ id: draggedId, screenX, screenY }) => {
              if (!draggedId) return;
              const binEl = binButtonRef.current;
              if (!binEl) return;
              const rect = binEl.getBoundingClientRect();
              const isOverBin =
                screenX >= rect.left &&
                screenX <= rect.right &&
                screenY >= rect.top &&
                screenY <= rect.bottom;

              if (isOverBin) {
                handleRemoveNode(draggedId);
              }
            }}
          />
        ))}
        <CenterControl
          containerRef={containerRef}
          offset={offset}
          setOffset={setOffset}
          scale={scale}
          setScale={setScale}
          nodes={nodes}
        />
      </div>
      {showAddMenu && <AddNode onClose={() => setShowAddMenu(false)} onAdd={handleAddFromMenu} modules={modules} />}
      <TopBar
        nodes={nodes}
        lines={lines}
        saveModalOpen={isSaveModalOpen}
            setSaveModalOpen={(open) => {
              if (open) {
                setSelectedId(null);
                setShowAddMenu(false);
              }
              setIsSaveModalOpen(open);
            }}
            initialName={workflowFromState?.name}
            initialDescription={workflowFromState?.description}
            initialEnabled={workflowFromState?.enabled}
            existingWorkflowId={workflowFromState?.id}
            existingWorkflowData={workflowFromState?.data || workflowFromState?.datas || workflowFromState?.canvas}
            onRecenter={() => recenterNodes()}
      />
      <BinButton ref={binButtonRef} />
      {selectedId && (
        <EditMenu
          node={nodes.find(n => n.id === selectedId) || null}
          updateNode={(patch) => setNodes(ns => ns.map(n => n.id === selectedId ? { ...n, ...patch } : n))}
          onClose={() => setSelectedId(null)}
          credentials={credentials}
          refreshCredentials={fetchCredentials}
          ref={editMenuRef}
        />
      )}
    </div>
  );
};

export default Canvas;
