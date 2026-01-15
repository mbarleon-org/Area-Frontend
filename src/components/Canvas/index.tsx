import React, { useRef, useState, useCallback, useEffect } from "react";
import Node from "./Node";
import { useApi } from "../../utils/UseApi";
import EditMenu from "./EditMenu";
import CenterControl from "./CenterControl";
import AddNode from "./AddNode";
import TopBar from "./TopBar";
import BinButton from "./BinButton";
import { useLocation } from "../../utils/router";
import { isWeb } from "../../utils/IsWeb";
import { routeConnection } from "./connectionRouter";
import type { Side } from "./connectionMath";

const mod = (n: number, m: number) => ((n % m) + m) % m;

const computeSnapOffset = (worldSize: number, gridPx: number) => {
  const cells = Math.round(worldSize / gridPx);
  return (cells % 2 === 0) ? 0 : gridPx / 2;
};

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

  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [snapInfo, setSnapInfo] = useState<{ nodeId: string; side: Side; offset: number; x: number; y: number } | null>(null);

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
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const list = (items && items.length > 0) ? items : nodes;
      if (!list || list.length === 0) return;

      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const n of list) {
        minX = Math.min(minX, n.x - (n.width ?? 0) / 2);
        minY = Math.min(minY, n.y - (n.height ?? 0) / 2);
        maxX = Math.max(maxX, n.x + (n.width ?? 0) / 2);
        maxY = Math.max(maxY, n.y + (n.height ?? 0) / 2);
      }
      if (!isFinite(minX)) return;

      const bboxW = Math.max(1, maxX - minX);
      const bboxH = Math.max(1, maxY - minY);
      const padding = 144;
      const scaleX = (rect.width - padding) / bboxW;
      const scaleY = (rect.height - padding) / bboxH;
      const targetScale = Math.max(0.2, Math.min(3, Math.min(scaleX, scaleY)));
      const centerWorldX = (minX + maxX) / 2;
      const centerWorldY = (minY + maxY) / 2;
      setScale(targetScale);
      setOffset({ x: cx - centerWorldX * targetScale, y: cy - centerWorldY * targetScale });
  }, [nodes]);

  const [modules, setModules] = useState<Array<{ name: string; data: any }>>([]);

  // ------------------------------ Mobile view ------------------------------------
  if (!isWeb) {
    const { View, Text, TouchableOpacity, Dimensions, PanResponder } = require('react-native');
    const window = Dimensions.get('window');
    const [mobileNodes, setMobileNodes] = useState<NodeItem[]>([{ id: 'n1', x: window.width/2, y: window.height/2, width: 96, height: 96, label: 'Loïs' }]);
    const [mobileOffset, setMobileOffset] = useState({ x: 0, y: 0 });
    const [menuNodeIdx, setMenuNodeIdx] = useState<number | null>(null);
    const [editLabel, setEditLabel] = useState('');

    // Ajout de node sur tap
    const handleAddNodeMobile = (e: any) => {
      const cx = e.nativeEvent.locationX;
      const cy = e.nativeEvent.locationY;
      const w = 96;
      const h = 96;
      const snapOffX = computeSnapOffset(w, gridPx);
      const snapOffY = computeSnapOffset(h, gridPx);
      const x = Math.round((cx - snapOffX) / gridPx) * gridPx + snapOffX;
      const y = Math.round((cy - snapOffY) / gridPx) * gridPx + snapOffY;
      const id = `n${Date.now()}`;
      setMobileNodes(ns => [...ns, { id, x, y, width: w, height: h, label: 'Node'}]);
    };

    // Ajout de node sur double tap
    let lastTap = useRef<number>(0);
    const handleBackgroundPress = (e: any) => {
      const now = Date.now();
      const DOUBLE_PRESS_DELAY = 300;
      if (lastTap.current && (now - lastTap.current) < DOUBLE_PRESS_DELAY) {
        // Double tap détecté
        const cx = e.nativeEvent.locationX;
        const cy = e.nativeEvent.locationY;
        const tappedNode = mobileNodes.find(n => {
          const left = n.x + mobileOffset.x - (n.width || 96)/2;
          const top = n.y + mobileOffset.y - (n.height || 96)/2;
          const right = left + (n.width || 96);
          const bottom = top + (n.height || 96);
          return cx >= left && cx <= right && cy >= top && cy <= bottom;
        });
        if (tappedNode) {
          lastTap.current = 0;
          return;
        }
        const w = 96;
        const h = 96;
        const snapOffX = computeSnapOffset(w, gridPx);
        const snapOffY = computeSnapOffset(h, gridPx);
        const x = Math.round((cx - snapOffX) / gridPx) * gridPx + snapOffX;
        const y = Math.round((cy - snapOffY) / gridPx) * gridPx + snapOffY;
        const id = `n${Date.now()}`;
        setMobileNodes(ns => [...ns, { id, x, y, width: w, height: h, label: 'Node'}]);
        lastTap.current = 0;
      } else {
        lastTap.current = now;
      }
    };

    // Drag global
    const [dragNodeIdx, setDragNodeIdx] = useState<number | null>(null);
    const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
    const panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (_evt: any, gestureState: any) => {
        if (dragNodeIdx !== null) {
          setDragPos({ x: mobileNodes[dragNodeIdx].x, y: mobileNodes[dragNodeIdx].y });
        }
      },
      onPanResponderMove: (_evt: any, gestureState: any) => {
        if (dragNodeIdx !== null && dragPos) {
          setDragPos({
            x: mobileNodes[dragNodeIdx].x + gestureState.dx,
            y: mobileNodes[dragNodeIdx].y + gestureState.dy,
          });
        }
      },
      onPanResponderRelease: (_evt: any, gestureState: any) => {
        if (dragNodeIdx !== null) {
          const n = mobileNodes[dragNodeIdx];
          const w = n.width || 96;
          const h = n.height || 96;
          const snapOffX = computeSnapOffset(w, gridPx);
          const snapOffY = computeSnapOffset(h, gridPx);
          const x = Math.round((n.x + gestureState.dx - snapOffX) / gridPx) * gridPx + snapOffX;
          const y = Math.round((n.y + gestureState.dy - snapOffY) / gridPx) * gridPx + snapOffY;
          setMobileNodes(ns => ns.map((node, i) => i === dragNodeIdx ? { ...node, x, y } : node));
          setDragNodeIdx(null);
          setDragPos(null);
        }
      },
    });

    return (
      <View style={{ flex: 1, backgroundColor: '#151316ff', position: 'relative' }}>
        <TouchableOpacity
          activeOpacity={1}
          style={{ flex: 1, position: 'relative', width: window.width, height: window.height }}
          onPress={handleBackgroundPress}
        >
          {mobileNodes.map((n, idx) => {
            const left = (dragNodeIdx === idx && dragPos ? dragPos.x : n.x) + mobileOffset.x - (n.width || 96)/2;
            const top = (dragNodeIdx === idx && dragPos ? dragPos.y : n.y) + mobileOffset.y - (n.height || 96)/2;
            return (
              <TouchableOpacity
                key={n.id}
                activeOpacity={0.8}
                style={{
                  position: 'absolute',
                  left,
                  top,
                  width: n.width || 96,
                  height: n.height || 96,
                  backgroundColor: '#202020',
                  borderColor: '#fff',
                  borderWidth: 2,
                  borderRadius: 8,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPressIn={() => setDragNodeIdx(idx)}
                onLongPress={() => {
                  setMenuNodeIdx(idx);
                  setEditLabel(n.label || '');
                }}
                {...(dragNodeIdx === idx ? panResponder.panHandlers : {})}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>{n.label}</Text>
              </TouchableOpacity>
            );
          })}
        </TouchableOpacity>
        {/* Menu modal pour édition/suppression d'un node */}
        {menuNodeIdx !== null && (
          <View style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: window.width,
            height: window.height,
            backgroundColor: 'rgba(0,0,0,0.4)',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 100,
          }}>
            <View style={{ backgroundColor: '#222', borderRadius: 12, padding: 24, width: 280, alignItems: 'center' }}>
              <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Edit Node</Text>
              <View style={{ width: '100%', marginBottom: 16 }}>
                <Text style={{ color: '#fff', marginBottom: 4 }}>Label</Text>
                {/* TextInput natif pour édition du label */}
                {(() => {
                  const { TextInput } = require('react-native');
                  return (
                    <TextInput
                      style={{ backgroundColor: '#333', color: '#fff', borderRadius: 6, padding: 8, fontSize: 16 }}
                      value={editLabel}
                      onChangeText={setEditLabel}
                      placeholder="Node name"
                      placeholderTextColor="#888"
                    />
                  );
                })()}
              </View>
              <TouchableOpacity
                style={{ backgroundColor: '#4CAF50', borderRadius: 6, padding: 10, marginBottom: 8, width: '100%' }}
                onPress={() => {
                  setMobileNodes(ns => ns.map((node, i) => i === menuNodeIdx ? { ...node, label: editLabel } : node));
                  setMenuNodeIdx(null);
                }}
              >
                <Text style={{ color: '#fff', textAlign: 'center' }}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ backgroundColor: '#cd1d1d', borderRadius: 6, padding: 10, width: '100%' }}
                onPress={() => {
                  setMobileNodes(ns => ns.filter((_, i) => i !== menuNodeIdx));
                  setMenuNodeIdx(null);
                }}
              >
                <Text style={{ color: '#fff', textAlign: 'center' }}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ marginTop: 8, width: '100%' }}
                onPress={() => setMenuNodeIdx(null)}
              >
                <Text style={{ color: '#fff', textAlign: 'center' }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  }
  // ------------------------------Web view------------------------------------

  const fetchCredentials = useCallback(async () => {
    try {
      const res = await get('/credentials');
      const normalize = (raw: any): CredentialItem => {
        const base = raw || {};
        const provider = base.provider || (typeof base.type === 'string' ? base.type.split('.')?.[0] : undefined);
        return { ...base, provider };
      };
      const arr = Array.isArray(res) ? res : Array.isArray((res as any)?.credentials) ? (res as any).credentials : [];
      setCredentials(arr.map(normalize));
    } catch (err: any) {
      if (err?.response?.status === 404) setCredentials([]);
      else console.error('Failed to load credentials', err);
    }
  }, [get]);

  const handleAddNode = useCallback(() => setShowAddMenu(true), []);

  const handleAddFromMenu = useCallback((node: any) => {
    setNodes((ns) => [...ns, node]);
    setShowAddMenu(false);
  }, []);

  const handleRemoveNode = useCallback((nodeId: string) => {
    setNodes((ns) => ns.filter((n) => n.id !== nodeId));
    setLines((ls) => ls.filter((l) => l.a.nodeId !== nodeId && l.b.nodeId !== nodeId));
    setSelectedId((sid) => (sid === nodeId ? null : sid));
  }, []);

  const handleDropOnCanvas = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const el = containerRef.current;
    if (!el) return;

    const json = e.dataTransfer.getData("application/json") || e.dataTransfer.getData("text/plain");
    if (!json) return;
    let payload: any = null;
    try { payload = JSON.parse(json); } catch (err) { return; }
    if (!payload) return;

    const rect = el.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const worldX = (cx - offset.x) / scale;
    const worldY = (cy - offset.y) / scale;
    const w = payload.width || 240;
    const h = payload.height || 144;
    const snapOffX = computeSnapOffset(w, gridPx);
    const snapOffY = computeSnapOffset(h, gridPx);
    const x = Math.round((worldX - snapOffX) / gridPx) * gridPx + snapOffX;
    const y = Math.round((worldY - snapOffY) / gridPx) * gridPx + snapOffY;

    setNodes((ns) => [...ns, {
      id: `n${Date.now()}`,
      x, y, width: w, height: h,
      label: payload.name || "New Node",
      icon: payload.icon,
      module: payload.module,
      connectionPoints: payload.connectionPoints,
    }]);
  }, [gridPx, offset.x, offset.y, scale]);

  const handleCanvasClick = useCallback(() => {
    if (showAddMenu) {
      setShowAddMenu(false);
      return;
    }

    if (pendingConnection) {
        if (snapInfo) {
             setLines(ls => [...ls, {
                a: { nodeId: pendingConnection.nodeId, side: pendingConnection.side, offset: pendingConnection.offset },
                b: { nodeId: snapInfo.nodeId, side: snapInfo.side, offset: snapInfo.offset },
                stroke: '#fff',
                strokeWidth: 4
            }]);
            setPendingConnection(null);
            setSnapInfo(null);
        } else {
            setPendingConnection(null);
        }
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
  }, [hoveredLineIndex, showAddMenu, pendingConnection, snapInfo]);

  const onDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (interactionLocked) return;
    dragging.current = true;
    const isTouch = "touches" in e;
    const p = isTouch ? (e as React.TouchEvent).touches[0] : (e as React.MouseEvent).nativeEvent;
    lastPos.current = { x: p.clientX, y: p.clientY };
    if (typeof document !== 'undefined') (document.activeElement as HTMLElement)?.blur();
    if (!isTouch) (e as React.MouseEvent).preventDefault();
  }, [interactionLocked]);

  const onMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (interactionLocked) return;
    const p = "touches" in e ? (e as React.TouchEvent).touches[0] : (e as React.MouseEvent).nativeEvent;
    const clientX = p.clientX;
    const clientY = p.clientY;

    if (pendingConnection) {
        setCursorPos({ x: clientX, y: clientY });
        const el = containerRef.current;
        if (el) {
            const rect = el.getBoundingClientRect();
            let bestDist = 40;
            let found = null;

            nodes.forEach(n => {
                if (n.id === pendingConnection.nodeId) return;

                const cps = n.connectionPoints || [{ side: 'right', offset: 0 }, { side: 'left', offset: 0 }];
                const w = n.width || 240;
                const h = n.height || 144;

                cps.forEach(cp => {
                     let wx = n.x;
                     let wy = n.y;
                     if (cp.side === 'right') { wx += w / 2; wy += cp.offset; }
                     else if (cp.side === 'left') { wx -= w / 2; wy += cp.offset; }
                     else if (cp.side === 'top') { wy -= h / 2; wx += cp.offset; }
                     else if (cp.side === 'bottom') { wy += h / 2; wx += cp.offset; }

                     const sx = (wx * scale) + offset.x + rect.left;
                     const sy = (wy * scale) + offset.y + rect.top;

                     const dist = Math.hypot(clientX - sx, clientY - sy);
                     if (dist < bestDist) {
                         bestDist = dist;
                         found = { nodeId: n.id, side: cp.side as Side, offset: cp.offset, x: wx, y: wy };
                     }
                });
            });
            setSnapInfo(found);
        }
    }

    if (dragging.current) {
      const dx = clientX - lastPos.current.x;
      const dy = clientY - lastPos.current.y;
      lastPos.current = { x: clientX, y: clientY };
      setOffset(o => ({ x: o.x + dx, y: o.y + dy }));
      return;
    }
    lastPos.current = { x: clientX, y: clientY };
  }, [interactionLocked, pendingConnection, nodes, scale, offset]);

  const onUp = useCallback(() => { dragging.current = false; }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && pendingConnection) {
        e.preventDefault();
        setPendingConnection(null);
        setSnapInfo(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pendingConnection]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const wheel = (e: WheelEvent) => {
      if (interactionLocked) return;
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
    if (!layout) return;
    const safeNodes = Array.isArray(layout.nodes) ? layout.nodes : [];
    const safeLines = Array.isArray(layout.lines) ? layout.lines : [];

    const normalizedNodes = safeNodes.map((n: any) => {
      const w = n?.width || 240;
      const h = n?.height || 144;
      const snapOffX = computeSnapOffset(w, gridPx);
      const snapOffY = computeSnapOffset(h, gridPx);
      const x = Math.round(((n?.x ?? 0) - snapOffX) / gridPx) * gridPx + snapOffX;
      const y = Math.round(((n?.y ?? 0) - snapOffY) / gridPx) * gridPx + snapOffY;

      return {
        id: n?.id || `n${Date.now()}`,
        x, y, width: w, height: h,
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
    const h = 144;
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
    get('/modules').then((res: any) => {
        if (!mounted) return;
        const modulesObj = res?.modules || res || {};
        const list = Object.entries(modulesObj).map(([name, data]) => ({ name, data }));
        setModules(list);
    }).catch(console.error);
    return () => { mounted = false; };
  }, [get]);

  useEffect(() => { fetchCredentials(); }, [fetchCredentials]);

  const bgSize1 = `${gridPx * scale}px ${gridPx * scale}px`;
  const bgSize2 = `${gridPx * 8 * scale}px ${gridPx * 8 * scale}px`;
  const pos1x = Math.round(mod(offset.x, gridPx * scale));
  const pos1y = Math.round(mod(offset.y, gridPx * scale));
  const pos2x = Math.round(mod(offset.x, gridPx * 8 * scale));
  const pos2y = Math.round(mod(offset.y, gridPx * 8 * scale));
  const minorColor = 'rgba(255,255,255,0.04)';
  const majorColor = 'rgba(255,255,255,0.08)';
  const canvasStyle: React.CSSProperties = {
    width: "100%", height: "100%",
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
    transformOrigin: "0 0", overflow: "hidden", touchAction: "none",
  };

  const resolveEndpoint = useCallback((ep: EndpointRef) => {
    if (ep.nodeId) {
      const node = nodes.find(n => n.id === ep.nodeId);
      if (node) {
        let wx = node.x;
        let wy = node.y;
        const w = node.width || 240;
        const h = node.height || 144;
        if (ep.side === 'right') { wx = node.x + w / 2; wy = node.y + (ep.offset || 0); }
        else if (ep.side === 'left') { wx = node.x - w / 2; wy = node.y + (ep.offset || 0); }
        else if (ep.side === 'top') { wy = node.y - h / 2; wx = node.x + (ep.offset || 0); }
        else if (ep.side === 'bottom') { wy = node.y + h / 2; wx = node.x + (ep.offset || 0); }
        return { x: wx, y: wy, side: ep.side || 'right' };
      }
    }
    if (ep.worldX !== undefined && ep.worldY !== undefined) {
      return { x: ep.worldX, y: ep.worldY, side: ep.side || 'left' };
    }
    return { x: 0, y: 0, side: 'right' as const };
  }, [nodes]);

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
        {isWeb && (
          <svg style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible' }}>
            <g transform={`translate(${offset.x}, ${offset.y}) scale(${scale})`}>
            {lines.map((l, i) => {
              const start = resolveEndpoint(l.a);
              const end = resolveEndpoint(l.b);
              const obstacleRects = nodes.map(n => ({
                id: n.id,
                left: n.x - (n.width || 240)/2,
                right: n.x + (n.width || 240)/2,
                top: n.y - (n.height || 144)/2,
                bottom: n.y + (n.height || 144)/2
              }));

              const rendered = routeConnection(
                { x: start.x, y: start.y },
                { x: end.x, y: end.y },
                start.side as Side,
                end.side as Side,
                obstacleRects,
                l.a.nodeId,
                l.b.nodeId
              );
              const strokeColor = hoveredLineIndex === i ? '#ff8b8b' : (l.stroke || '#ffffff');
              return (
                <g key={i}>
                  <path d={rendered.d} stroke="transparent" strokeWidth={20} fill="none" style={{ pointerEvents: 'stroke', cursor: 'pointer' }} onMouseEnter={() => setHoveredLineIndex(i)} onMouseLeave={() => setHoveredLineIndex(null)} />
                  <path d={rendered.d} stroke={strokeColor} strokeWidth={l.strokeWidth || 4} fill="none" style={{ pointerEvents: 'none', transition: 'stroke 0.2s' }} />
                </g>
              );
            })}

            {pendingConnection && (() => {
               const start = resolveEndpoint(pendingConnection);
               let end = { x: 0, y: 0, side: 'left' as Side };
               let isSnapped = false;

               if (snapInfo) {
                   end = { x: snapInfo.x, y: snapInfo.y, side: snapInfo.side };
                   isSnapped = true;
               } else {
                   const rect = containerRef.current?.getBoundingClientRect();
                   const mouseWorldX = rect ? (cursorPos.x - rect.left - offset.x) / scale : start.x;
                   const mouseWorldY = rect ? (cursorPos.y - rect.top - offset.y) / scale : start.y;

                   const diffX = mouseWorldX - start.x;
                   const diffY = mouseWorldY - start.y;
                   let targetSide: Side = 'left';
                   if (Math.abs(diffX) > Math.abs(diffY)) targetSide = diffX > 0 ? 'left' : 'right';
                   else targetSide = diffY > 0 ? 'top' : 'bottom';

                   end = { x: mouseWorldX, y: mouseWorldY, side: targetSide };
               }

               const obstacleRects = nodes.map(n => ({
                id: n.id,
                left: n.x - (n.width || 240)/2,
                right: n.x + (n.width || 240)/2,
                top: n.y - (n.height || 144)/2,
                bottom: n.y + (n.height || 144)/2
              }));

               const rendered = routeConnection(
                   { x: start.x, y: start.y },
                   { x: end.x, y: end.y },
                   start.side as Side,
                   end.side,
                   obstacleRects,
                   pendingConnection.nodeId,
                   undefined
               );

               return <path d={rendered.d} stroke={isSnapped ? "#fff" : "#aaa"} strokeWidth={isSnapped ? 4 : 2} fill="none" strokeDasharray={isSnapped ? "" : "5,5"} />;
            })()}
            </g>
          </svg>
        )}
        {nodes.map(n => (
          <Node
            key={n.id} id={n.id}
            pos={{ x: n.x, y: n.y }}
            setPos={(p) => setNodes(ns => ns.map(item => item.id === n.id ? { ...item, x: p.x, y: p.y } : item))}
            onSelect={() => setSelectedId(n.id)}
            width={n.width || 240} height={n.height || 144}
            scale={scale} offset={offset} gridPx={gridPx}
            label={n.label}
            icon={n.icon ? <img src={n.icon} alt={n.label ?? n.id} style={{ width: '40px', height: '40px', objectFit: 'contain' }} /> : undefined}
            connectionPoints={n.connectionPoints || [{ side: 'right', offset: 0 }, { side: 'left', offset: 0 }]}
            disableDrag={isEditMenuOpen || isSaveModalOpen}
            onConnectorClick={(info) => {
              if (interactionLocked) return;
              if (!pendingConnection) {
                setPendingConnection(info);
                setCursorPos({ x: info.worldX * scale + offset.x, y: info.worldY * scale + offset.y });
                return;
              }
              const a = pendingConnection;
              const b = info;
              if (a.nodeId === b.nodeId) return;
              setLines(ls => [...ls, { a: { nodeId: a.nodeId, side: a.side, offset: a.offset }, b: { nodeId: b.nodeId, side: b.side, offset: b.offset }, stroke: '#fff', strokeWidth: 4 }]);
              setPendingConnection(null);
              setSnapInfo(null);
            }}
            onDragEnd={({ id: draggedId, screenX, screenY }) => {
              if (!draggedId) return;
              const binEl = binButtonRef.current;
              if (!binEl) return;
              const rect = binEl.getBoundingClientRect();
              const isOverBin = screenX >= rect.left && screenX <= rect.right && screenY >= rect.top && screenY <= rect.bottom;
              if (isOverBin) handleRemoveNode(draggedId);
            }}
          />
        ))}
        <CenterControl containerRef={containerRef} offset={offset} setOffset={setOffset} scale={scale} setScale={setScale} nodes={nodes} />
      </div>
      {showAddMenu && <AddNode onClose={() => setShowAddMenu(false)} onAdd={handleAddFromMenu} modules={modules} />}
      <TopBar
        nodes={nodes} lines={lines} saveModalOpen={isSaveModalOpen}
        setSaveModalOpen={(open) => { if (open) { setSelectedId(null); setShowAddMenu(false); } setIsSaveModalOpen(open); }}
        initialName={workflowFromState?.pretty_name || workflowFromState?.name}
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
