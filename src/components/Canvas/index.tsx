

import React, { useRef, useState, useCallback, useEffect } from "react";
import Node from "./Node";
import EditMenu from "./EditMenu";
import { isWeb } from "../../utils/IsWeb";
import CenterControl from "./CenterControl";

const mod = (n: number, m: number) => ((n % m) + m) % m;

const Canvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const initialPosSet = useRef(false);

  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);

  type NodeItem = { id: string; x: number; y: number; width?: number; height?: number; label?: string };
  const [nodes, setNodes] = useState<NodeItem[]>([]);
  type EndpointRef = { nodeId?: string; side?: 'left' | 'right' | 'top' | 'bottom'; offset?: number; worldX?: number; worldY?: number; index?: number };
  type LineItem = { a: EndpointRef; b: EndpointRef; stroke?: string; strokeWidth?: number };
  const [lines, setLines] = useState<LineItem[]>([]);
  const [pendingConnection, setPendingConnection] = useState<null | EndpointRef>(null);
  const [hoveredLineIndex, setHoveredLineIndex] = useState<number | null>(null);

  const gridPx = 24;

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const editMenuRef = useRef<import("./EditMenu").EditMenuHandle | null>(null);

  const computeSnapOffset = (worldSize: number, gridPx: number) => {
    const cells = Math.round(worldSize / gridPx);
    return (cells % 2 === 0) ? 0 : gridPx / 2;
  };

  const handleAddNode = useCallback((e: React.MouseEvent) => {
    const el = containerRef.current;
    if (!el)
      return;
    const rect = el.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const worldX = (cx - offset.x) / scale;
    const worldY = (cy - offset.y) / scale;
    const w = 96;
    const h = 96;
    const snapOffX = computeSnapOffset(w, gridPx);
    const snapOffY = computeSnapOffset(h, gridPx);
    const x = Math.round((worldX - snapOffX) / gridPx) * gridPx + snapOffX;
    const y = Math.round((worldY - snapOffY) / gridPx) * gridPx + snapOffY;
    const id = `n${Date.now()}`;
    setNodes(ns => [...ns, { id, x, y, width: w, height: h, label: 'Node'}] );
  }, [offset.x, offset.y, scale, gridPx]);

  const handleCanvasClick = useCallback(() => {
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
  }, [hoveredLineIndex]);

  const onDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    dragging.current = true;
    const isTouch = "touches" in e;
    const p = isTouch ? (e as React.TouchEvent).touches[0] : (e as React.MouseEvent).nativeEvent;
    lastPos.current = { x: p.clientX, y: p.clientY };
    if (typeof document !== 'undefined') (document.activeElement as HTMLElement)?.blur();
    if (!isTouch)
      (e as React.MouseEvent).preventDefault();
  }, []);

  const onMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
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
            const w = node.width || 96;
            const h = node.height || 96;
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
    if (bestIndex !== null && bestDist <= threshold) setHoveredLineIndex(bestIndex);
    else setHoveredLineIndex(null);
  }, [lines, nodes, offset.x, offset.y, scale]);

  const onUp = useCallback(() => {
    dragging.current = false;
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el)
        return;
    const wheel = (e: WheelEvent) => {
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
  }, [scale, setScale]);

  useEffect(() => {
    if (initialPosSet.current) return;
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const w = 96;
    const h = 96;
    const rawWorldX = (cx - offset.x) / scale;
    const rawWorldY = (cy - offset.y) / scale;
    const snapOffX = computeSnapOffset(w, gridPx);
    const snapOffY = computeSnapOffset(h, gridPx);
    const x = Math.round((rawWorldX - snapOffX) / gridPx) * gridPx + snapOffX;
    const y = Math.round((rawWorldY - snapOffY) / gridPx) * gridPx + snapOffY;
    setNodes([{ id: 'n1', x, y, width: w, height: h, label: 'Loïs' }]);
    initialPosSet.current = true;
  }, [offset.x, offset.y, scale]);

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

// ------------------------------ Mobile view ------------------------------------
  if (!isWeb) {
    const { View, Text, TouchableOpacity, Dimensions, StyleSheet, ScrollView, PanResponder } = require('react-native');
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

    // Ajout de node
    const handleBackgroundPress = (e: any) => {
      const cx = e.nativeEvent.locationX;
      const cy = e.nativeEvent.locationY;
      const tappedNode = mobileNodes.find(n => {
        const left = n.x + mobileOffset.x - (n.width || 96)/2;
        const top = n.y + mobileOffset.y - (n.height || 96)/2;
        const right = left + (n.width || 96);
        const bottom = top + (n.height || 96);
        return cx >= left && cx <= right && cy >= top && cy <= bottom;
      });
      if (tappedNode) return;
      const w = 96;
      const h = 96;
      const snapOffX = computeSnapOffset(w, gridPx);
      const snapOffY = computeSnapOffset(h, gridPx);
      const x = Math.round((cx - snapOffX) / gridPx) * gridPx + snapOffX;
      const y = Math.round((cy - snapOffY) / gridPx) * gridPx + snapOffY;
      const id = `n${Date.now()}`;
      setMobileNodes(ns => [...ns, { id, x, y, width: w, height: h, label: 'Node'}]);
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
                      autoFocus={true}
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

// ------------------------------ Web view ----------------------------------------

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
  <div style={canvasStyle} onClick={handleCanvasClick} onDoubleClick={handleAddNode}>
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
            connectionPoints={[{ side: 'right', offset: 0 }, { side: 'left', offset: 0 }, { side: 'top', offset: 0 }, { side: 'bottom', offset: 0 }]}
            onConnectorClick={(info) => {
              if (!pendingConnection) {
                setPendingConnection(info);
                return;
              }
              const a = pendingConnection;
              const b = info;
              setLines(ls => [...ls, { a: { nodeId: a.nodeId, side: a.side, offset: a.offset, worldX: a.worldX, worldY: a.worldY }, b: { nodeId: b.nodeId, side: b.side, offset: b.offset, worldX: b.worldX, worldY: b.worldY }, stroke: '#fff', strokeWidth: 4 }]);
              setPendingConnection(null);
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
      {selectedId && (
        <EditMenu
          node={nodes.find(n => n.id === selectedId) || null}
          updateNode={(patch) => setNodes(ns => ns.map(n => n.id === selectedId ? { ...n, ...patch } : n))}
          onClose={() => setSelectedId(null)}
          ref={editMenuRef}
        />
      )}
    </div>
  );
};

// StyleSheet pour le mobile
const mobileStyles : any = {
  menuText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    margin: 8,
  },
};

export default Canvas;
