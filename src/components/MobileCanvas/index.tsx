import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, StyleSheet, Dimensions, PanResponder, TouchableOpacity, Text } from 'react-native';
import { useApi } from '../../utils/UseApi';
import { useLocation } from '../../utils/router';
import Node from './Node.tsx';
import AddNode from './AddNode.tsx';
import EditMenu from './EditMenu';
import type { EditMenuHandle } from './EditMenu/EditMenu.types';
import Svg, { Path } from 'react-native-svg';
import { routeConnection } from './connectionRouter';

const computeSnapOffset = (worldSize: number, gridPx: number) => {
  const cells = Math.round(worldSize / gridPx);
  return (cells % 2 === 0) ? 0 : gridPx / 2;
};

type CredentialItem = { id: string; provider?: string; type?: string; name?: string; metadata?: Record<string, any> };

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

const MobileCanva: React.FC = () => {
  const location = useLocation();
  const workflowFromState = (location as any)?.state?.workflow;
  const { get } = useApi();

  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [nodes, setNodes] = useState<NodeItem[]>([]);
  const [credentials, setCredentials] = useState<CredentialItem[]>([]);
  const [modules, setModules] = useState<Array<{ name: string; data: any }>>([]);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [lines, setLines] = useState<LineItem[]>([]);

  const editMenuRef = useRef<EditMenuHandle | null>(null);

  type LineItem = { a: EndpointRef; b: EndpointRef; stroke?: string; strokeWidth?: number };
  type EndpointRef = { nodeId?: string; side?: 'left' | 'right' | 'top' | 'bottom'; offset?: number };

  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const lastTouchDistance = useRef<number | null>(null);
  const lastScale = useRef(1);
  const initialPosSet = useRef(false);
  const containerSize = useRef(Dimensions.get('window'));

  const gridPx = 24;

  // Load modules from API
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

  // Load credentials from API
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
      if (err?.response?.status === 404 || err?.response?.status === 401) {
        setCredentials([]);
      } else {
        console.error('Failed to load credentials', err);
      }
    }
  }, [get]);

  useEffect(() => {
    fetchCredentials();
  }, [fetchCredentials]);

  // Load workflow from navigation state
  useEffect(() => {
    if (!workflowFromState) return;
    const wf = workflowFromState;
    const safeNodes = Array.isArray(wf.nodes) ? wf.nodes : [];

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

    setNodes(normalizedNodes);
  }, [workflowFromState, gridPx]);

  // Create default node if empty
  useEffect(() => {
    if (initialPosSet.current) return;
    if (nodes.length > 0) return;

    const timer = setTimeout(() => {
      const { width, height } = containerSize.current;
      if (width === 0 || height === 0) return;

      const cx = width / 2;
      const cy = height / 2;
      const w = 240;
      const h = 144;
      const rawWorldX = (cx - offset.x) / scale;
      const rawWorldY = (cy - offset.y) / scale;
      const snapOffX = computeSnapOffset(w, gridPx);
      const snapOffY = computeSnapOffset(h, gridPx);
      const x = Math.round((rawWorldX - snapOffX) / gridPx) * gridPx + snapOffX;
      const y = Math.round((rawWorldY - snapOffY) / gridPx) * gridPx + snapOffY;

      setNodes([{ id: 'n1', x, y, width: w, height: h, label: 'Start' }]);
      initialPosSet.current = true;
    }, 100);

    return () => clearTimeout(timer);
  }, [nodes.length, offset.x, offset.y, scale, gridPx]);

  const handleAddFromMenu = useCallback((node: any) => {
    setNodes((ns) => [...ns, node]);
    setShowAddMenu(false);
  }, []);

  const handleRemoveNode = useCallback((nodeId: string) => {
    setNodes((ns) => ns.filter((n) => n.id !== nodeId));
    setLines((ls) => ls.filter((l) => l.a.nodeId !== nodeId && l.b.nodeId !== nodeId));
    setSelectedId((sid) => (sid === nodeId ? null : sid));
  }, []);

  const handleNodePress = useCallback((nodeId: string) => {
    console.log('Node pressed:', nodeId);
    setSelectedId(nodeId);
  }, []);

  const handleUpdateNode = useCallback((nodeId: string, updates: Partial<NodeItem>) => {
    setNodes((ns) => ns.map((n) => (n.id === nodeId ? { ...n, ...updates } : n)));
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt) => {
        // Capture immediately for pinch gestures (2 fingers)
        return evt.nativeEvent.touches.length === 2;
      },
      onStartShouldSetPanResponderCapture: (evt) => {
        // Don't capture if it's a single touch (let nodes handle it)
        return evt.nativeEvent.touches.length === 2;
      },
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only capture if there's actual movement
        return !showAddMenu && (Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5 || evt.nativeEvent.touches.length === 2);
      },
      onMoveShouldSetPanResponderCapture: (evt) => {
        // Don't capture if it's a single touch on a node
        return evt.nativeEvent.touches.length === 2;
      },

      onPanResponderGrant: (evt, gestureState) => {
        const touches = evt.nativeEvent.touches;

        if (touches.length === 2) {
          // Pinch to zoom
          const dx = touches[0].pageX - touches[1].pageX;
          const dy = touches[0].pageY - touches[1].pageY;
          lastTouchDistance.current = Math.sqrt(dx * dx + dy * dy);
          lastScale.current = scale;
        } else if (touches.length === 1) {
          // Pan
          dragging.current = true;
          lastPos.current = { x: gestureState.x0, y: gestureState.y0 };
        }
      },

      onPanResponderMove: (evt, gestureState) => {
        const touches = evt.nativeEvent.touches;

        if (touches.length === 2 && lastTouchDistance.current !== null) {
          // Pinch to zoom
          const dx = touches[0].pageX - touches[1].pageX;
          const dy = touches[0].pageY - touches[1].pageY;
          const currentDistance = Math.sqrt(dx * dx + dy * dy);
          const scaleFactor = currentDistance / lastTouchDistance.current;
          let newScale = lastScale.current * scaleFactor;
          newScale = Math.min(3, Math.max(0.5, newScale));
          setScale(newScale);
        } else if (touches.length === 1 && dragging.current) {
          // Pan
          const dx = gestureState.moveX - lastPos.current.x;
          const dy = gestureState.moveY - lastPos.current.y;
          setOffset(o => ({ x: o.x + dx, y: o.y + dy }));
          lastPos.current = { x: gestureState.moveX, y: gestureState.moveY };
        }
      },

      onPanResponderRelease: () => {
        dragging.current = false;
        lastTouchDistance.current = null;
      },
    })
  ).current;

  console.log('Rendering', nodes.length, 'nodes');

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
    return { x: 0, y: 0, side: 'right' as const };
  }, [nodes]);

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <View style={styles.canvas}>
        {/* Render connection lines */}
        <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
          {lines.map((line, idx) => {
            const epA = resolveEndpoint(line.a);
            const epB = resolveEndpoint(line.b);
            const screenA = {
              x: epA.x * scale + offset.x,
              y: epA.y * scale + offset.y,
            };
            const screenB = {
              x: epB.x * scale + offset.x,
              y: epB.y * scale + offset.y,
            };

            const obstacles: any[] = [];
            const routed = routeConnection(screenA, screenB, epA.side, epB.side, obstacles);
            return (
              <Path
                key={idx}
                d={routed.d}
                stroke={line.stroke || '#fff'}
                strokeWidth={(line.strokeWidth || 4) * scale}
                fill="none"
              />
            );
          })}
        </Svg>

        {/* Render nodes */}
        {nodes.map(node => (
          <Node
            key={node.id}
            node={node}
            scale={scale}
            offset={offset}
            onPress={() => handleNodePress(node.id)}
            onRemove={() => handleRemoveNode(node.id)}
            onUpdate={(updates: Partial<NodeItem>) => handleUpdateNode(node.id, updates)}
            selected={selectedId === node.id}
          />
        ))}
      </View>

      {/* Edit Menu */}
      {selectedId && (
        <>
          {console.log('Rendering EditMenu for node:', selectedId)}
          <EditMenu
            ref={editMenuRef}
            node={nodes.find(n => n.id === selectedId) || null}
            updateNode={(updates) => handleUpdateNode(selectedId, updates)}
            onClose={() => setSelectedId(null)}
            onDelete={() => {
              if (selectedId) {
                handleRemoveNode(selectedId);
              }
            }}
            credentials={credentials}
            refreshCredentials={fetchCredentials}
          />
        </>
      )}

      {/* Add Node Menu */}
      {showAddMenu && (
        <AddNode
          modules={modules}
          credentials={credentials}
          onClose={() => setShowAddMenu(false)}
          onAdd={handleAddFromMenu}
          offset={offset}
          scale={scale}
          gridPx={gridPx}
        />
      )}

      {/* Add Node Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowAddMenu(true)}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#151316',
  },
  canvas: {
    flex: 1,
    position: 'relative',
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
  },
});

export default MobileCanva;
