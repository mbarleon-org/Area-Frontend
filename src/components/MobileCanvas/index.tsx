import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { View, StyleSheet, Dimensions, PanResponder, TouchableOpacity, Text, Share } from 'react-native';
import type { LayoutChangeEvent } from 'react-native';
import { useApi } from '../../utils/UseApi';
import { useLocation } from '../../utils/router';
import Node from './Node.tsx';
import AddNode from './AddNode.tsx';
import EditMenu from './EditMenu';
import type { EditMenuHandle } from './EditMenu/EditMenu.types';
import Svg, { Path, Defs, Pattern, Rect, Line as SvgLine, G } from 'react-native-svg';
import { routeConnection } from './connectionRouter';
import { getConnectionPointsForModule, getIconForModule } from '../../utils/iconHelper';
import SaveWorkflowModalMobile from './SaveWorkflowModalMobile';
import { convertCanvasToWorkflow, validateCanvasData, validateWorkflow } from '../../utils/workflowConverter';

const mod = (n: number, m: number) => ((n % m) + m) % m;

const computeSnapOffset = (worldSize: number, gridPx: number) => {
  const cells = Math.round(worldSize / gridPx);
  return (cells % 2 === 0) ? 0 : gridPx / 2;
};

type CredentialItem = { id: string; provider?: string; type?: string; name?: string; metadata?: Record<string, any> };
type CanvasSize = { width: number; height: number };
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
type LineItem = { a: EndpointRef; b: EndpointRef; stroke?: string; strokeWidth?: number };
type EndpointRef = { nodeId?: string; side?: 'left' | 'right' | 'top' | 'bottom'; offset?: number; x?: number; y?: number };

const MobileCanva: React.FC = () => {
  const location = useLocation();

  let routeParams: any = null;
  try {
    const rnNav = require('@react-navigation/native');
    const useRouteSafe = rnNav?.useRoute || (() => null);
    const route = useRouteSafe();
    routeParams = (route as any)?.params || null;
  } catch (e) {
  }

  const workflowFromState = routeParams?.workflow
    || (location as any)?.state?.workflow
    || (location as any)?.state?.workflowData
    || null;
  const { get, post } = useApi();

  const initialSize = Dimensions.get('window');
  const initialCanvasSize: CanvasSize = { width: initialSize.width, height: initialSize.height };

  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [canvasSize, setCanvasSize] = useState<CanvasSize>(initialCanvasSize);
  const [nodes, setNodes] = useState<NodeItem[]>([]);
  const [credentials, setCredentials] = useState<CredentialItem[]>([]);
  const [modules, setModules] = useState<Array<{ name: string; data: any }>>([]);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const showAddMenuRef = useRef(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedIdRef = useRef<string | null>(null);
  const [lines, setLines] = useState<LineItem[]>([]);

  const [isDrawMode, setIsDrawMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [pendingConnection, setPendingConnection] = useState<EndpointRef | null>(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [pressedLineIndex, setPressedLineIndex] = useState<number | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState<string[] | null>(null);

  const editMenuRef = useRef<EditMenuHandle | null>(null);

  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const scaleRef = useRef(scale);
  const offsetRef = useRef(offset);

  const initialTouchDistance = useRef<number>(1);
  const initialScale = useRef<number>(1);
  const initialOffset = useRef({ x: 0, y: 0 });
  const initialFocalPoint = useRef({ x: 0, y: 0 });

  const initialPosSet = useRef(false);
  const containerSize = useRef<CanvasSize>(initialCanvasSize);
  const nodeDraggingRef = useRef(false);

  useEffect(() => {
    scaleRef.current = scale;
    offsetRef.current = offset;
    showAddMenuRef.current = showAddMenu;
    selectedIdRef.current = selectedId;
  }, [scale, offset, showAddMenu, selectedId]);

  const gridPx = 24;

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

  useEffect(() => { fetchCredentials(); }, [fetchCredentials]);

  const extractWorkflowData = (wf: any) => {
    if (!wf) return {};
    return (
      wf?.data?.canvas ||
      wf?.canvas ||
      wf?.data ||
      wf?.datas ||
      wf ||
      {}
    );
  };

  useEffect(() => {
    if (!workflowFromState) return;
    const wf = extractWorkflowData(workflowFromState);
    const safeNodes = Array.isArray(wf.nodes) ? wf.nodes : [];
    const safeLines = Array.isArray(wf.lines) ? wf.lines : [];

    // Prevent default node injection when data already exists
    if (safeNodes.length > 0) initialPosSet.current = true;

    const normalizedNodes = safeNodes.map((n: any) => {
      const w = n?.width || 240;
      const h = n?.height || 144;
      const snapOffX = computeSnapOffset(w, gridPx);
      const snapOffY = computeSnapOffset(h, gridPx);
      const x = Math.round(((n?.x ?? 0) - snapOffX) / gridPx) * gridPx + snapOffX;
      const y = Math.round(((n?.y ?? 0) - snapOffY) / gridPx) * gridPx + snapOffY;

      const moduleName = n?.module?.name || n?.label || "";
      const cPoints = n?.connectionPoints || getConnectionPointsForModule(moduleName);
      const nodeIcon = n?.icon || getIconForModule(moduleName);

      return {
        id: n?.id || `n${Date.now()}`,
        x,
        y,
        width: w,
        height: h,
        label: n?.label,
        icon: nodeIcon,
        module: n?.module,
        connectionPoints: cPoints,
        inputs: n?.inputs,
        outputs: n?.outputs,
        options: n?.options,
        credential_id: n?.credential_id,
      } as NodeItem;
    });
    setNodes(normalizedNodes);
    setLines(safeLines.map((l: any) => ({
      a: l?.a || {},
      b: l?.b || {},
      stroke: l?.stroke || '#fff',
      strokeWidth: l?.strokeWidth || 4,
    })));
  }, [workflowFromState, gridPx]);

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

      const defaultPoints = getConnectionPointsForModule('Start');

      setNodes([{ id: 'n1', x, y, width: w, height: h, label: 'Start', connectionPoints: defaultPoints }]);
      initialPosSet.current = true;
    }, 100);
    return () => clearTimeout(timer);
  }, [nodes.length, offset.x, offset.y, scale, gridPx]);

  const handleAddFromMenu = useCallback((node: any) => {
    const w = node?.width || 240;
    const h = node?.height || 144;
    const snapOffX = computeSnapOffset(w, gridPx);
    const snapOffY = computeSnapOffset(h, gridPx);
    const snappedX = Math.round(((node?.x ?? 0) - snapOffX) / gridPx) * gridPx + snapOffX;
    const snappedY = Math.round(((node?.y ?? 0) - snapOffY) / gridPx) * gridPx + snapOffY;

    const moduleName = node?.module?.name || node?.label || "";
    const cPoints = node?.connectionPoints || getConnectionPointsForModule(moduleName);

    setNodes((ns) => [...ns, { ...node, x: snappedX, y: snappedY, width: w, height: h, connectionPoints: cPoints }]);
    setShowAddMenu(false);
  }, [gridPx]);

  const handleRemoveNode = useCallback((nodeId: string) => {
    setNodes((ns) => ns.filter((n) => n.id !== nodeId));
    setLines((ls) => ls.filter((l) => l.a.nodeId !== nodeId && l.b.nodeId !== nodeId));
    setSelectedId((sid) => (sid === nodeId ? null : sid));
  }, []);

  const handleNodePress = useCallback((nodeId: string) => {
    if (isDrawMode) return;
    if (pendingConnection) {
        setPendingConnection(null);
        return;
    }
    setSelectedId(nodeId);
  }, [pendingConnection, isDrawMode]);

  const handleUpdateNode = useCallback((nodeId: string, updates: Partial<NodeItem>) => {
    setNodes((ns) => ns.map((n) => (n.id === nodeId ? { ...n, ...updates } : n)));
  }, []);

  const handleConnectorPress = useCallback((info: { nodeId: string; side: 'left'|'right'|'top'|'bottom'; offset: number; x: number; y: number }) => {
    if (!isDrawMode) return;

    if (!pendingConnection) {
        setPendingConnection({
            nodeId: info.nodeId,
            side: info.side,
            offset: info.offset,
            x: info.x,
            y: info.y
        });
        setCursorPos({ x: info.x, y: info.y });
    } else {
        if (pendingConnection.nodeId === info.nodeId) return;

        setLines(ls => [...ls, {
            a: { nodeId: pendingConnection.nodeId, side: pendingConnection.side, offset: pendingConnection.offset },
            b: { nodeId: info.nodeId, side: info.side, offset: info.offset },
            stroke: '#fff',
            strokeWidth: 4
        }]);
        setPendingConnection(null);
    }
  }, [pendingConnection, isDrawMode]);

  const handleCanvasLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width !== canvasSize.width || height !== canvasSize.height) setCanvasSize({ width, height });
    containerSize.current = { width, height };
  }, [canvasSize.height, canvasSize.width]);

  const gridOverlay = useMemo(() => {
    const smallSize = gridPx * scale;
    const largeSize = gridPx * 8 * scale;

    const smallPatternX = mod(offset.x, smallSize);
    const smallPatternY = mod(offset.y, smallSize);

    const largePatternX = mod(offset.x, largeSize);
    const largePatternY = mod(offset.y, largeSize);

    return (
      <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
        <Defs>
          <Pattern
            id="smallGrid"
            x={smallPatternX}
            y={smallPatternY}
            width={smallSize}
            height={smallSize}
            patternUnits="userSpaceOnUse"
          >
            <Path
              d={`M ${smallSize} 0 L 0 0 0 ${smallSize}`}
              fill="none"
              stroke="rgba(255, 255, 255, 0.06)"
              strokeWidth={1}
            />
          </Pattern>

          <Pattern
            id="largeGrid"
            x={largePatternX}
            y={largePatternY}
            width={largeSize}
            height={largeSize}
            patternUnits="userSpaceOnUse"
          >
            <Path
              d={`M ${largeSize} 0 L 0 0 0 ${largeSize}`}
              fill="none"
              stroke="rgba(255,255,255,0.10)"
              strokeWidth={1}
            />
          </Pattern>
        </Defs>

        <Rect x="0" y="0" width="100%" height="100%" fill="url(#smallGrid)" />
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#largeGrid)" />
      </Svg>
    );
  }, [scale, offset.x, offset.y, gridPx]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt) => {
        if (showAddMenuRef.current || selectedIdRef.current) return false;
        const touchCount = evt.nativeEvent.touches.length;
        if (nodeDraggingRef.current) return false;
        if (touchCount === 1 && !showAddMenuRef.current) {
          if (isDrawMode) return false;
          return true;
        }
        return touchCount === 2;
      },
      onStartShouldSetPanResponderCapture: (evt) => {
        if (showAddMenuRef.current || selectedIdRef.current) return false;
        if (nodeDraggingRef.current) return false;
        return evt.nativeEvent.touches.length === 2;
      },
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        if (showAddMenuRef.current || selectedIdRef.current) return false;
        if (nodeDraggingRef.current) return false;
        const touchCount = evt.nativeEvent.touches.length;
        if (touchCount === 2) return true;
        if (isDrawMode) return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
        return !showAddMenuRef.current && (Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5);
      },
      onMoveShouldSetPanResponderCapture: (evt) => {
        if (showAddMenuRef.current || selectedIdRef.current) return false;
        if (nodeDraggingRef.current) return false;
        return evt.nativeEvent.touches.length === 2;
      },

      onPanResponderGrant: (evt, gestureState) => {
        if (showAddMenuRef.current || selectedIdRef.current) return false;
        const touches = evt.nativeEvent.touches;
        if (touches.length === 2) {
            const touch1 = touches[0];
            const touch2 = touches[1];
            const dist = Math.sqrt(Math.pow(touch1.pageX - touch2.pageX, 2) + Math.pow(touch1.pageY - touch2.pageY, 2));

            initialTouchDistance.current = dist;
            initialScale.current = scaleRef.current;
            initialOffset.current = { ...offsetRef.current };

            const midX = (touch1.pageX + touch2.pageX) / 2;
            const midY = (touch1.pageY + touch2.pageY) / 2;
            initialFocalPoint.current = { x: midX, y: midY };

        } else if (touches.length === 1) {
            dragging.current = true;
            lastPos.current = { x: gestureState.x0, y: gestureState.y0 };
        }
      },

      onPanResponderMove: (evt, gestureState) => {
                if (showAddMenuRef.current || selectedIdRef.current) return false;
        const touches = evt.nativeEvent.touches;

        const worldCursorX = (gestureState.moveX - offsetRef.current.x) / scaleRef.current;
        const worldCursorY = (gestureState.moveY - offsetRef.current.y) / scaleRef.current;
        setCursorPos({ x: worldCursorX, y: worldCursorY });

        if (touches.length === 2) {
            const touch1 = touches[0];
            const touch2 = touches[1];
            const curDist = Math.sqrt(Math.pow(touch1.pageX - touch2.pageX, 2) + Math.pow(touch1.pageY - touch2.pageY, 2));

            const scaleFactor = curDist / initialTouchDistance.current;
            let newScale = initialScale.current * scaleFactor;
            newScale = Math.min(3, Math.max(0.25, newScale));

            const midX = (touch1.pageX + touch2.pageX) / 2;
            const midY = (touch1.pageY + touch2.pageY) / 2;

            const worldFocusX = (initialFocalPoint.current.x - initialOffset.current.x) / initialScale.current;
            const worldFocusY = (initialFocalPoint.current.y - initialOffset.current.y) / initialScale.current;

            const newOffsetX = midX - (worldFocusX * newScale);
            const newOffsetY = midY - (worldFocusY * newScale);

            setScale(newScale);
            setOffset({ x: newOffsetX, y: newOffsetY });

        } else if (touches.length === 1 && dragging.current) {
            const dx = gestureState.moveX - lastPos.current.x;
            const dy = gestureState.moveY - lastPos.current.y;
            setOffset(o => ({ x: o.x + dx, y: o.y + dy }));
            lastPos.current = { x: gestureState.moveX, y: gestureState.moveY };
        }
      },

      onPanResponderRelease: () => {
        dragging.current = false;
      },
      onPanResponderTerminate: () => {
        dragging.current = false;
      }
    })
  ).current;

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
    if (ep.x !== undefined && ep.y !== undefined) {
        return { x: ep.x, y: ep.y, side: ep.side || 'left' };
    }
    return { x: 0, y: 0, side: 'right' as const };
  }, [nodes]);

  const handleSaveWorkflow = useCallback(async (config: { name: string; description: string; enabled: boolean }) => {
    setSaveLoading(true);
    setSaveError(null);

    try {
      const canvasValidation = validateCanvasData(nodes, lines);
      if (!canvasValidation.valid) {
        setSaveError(canvasValidation.errors);
        setSaveLoading(false);
        return;
      }

      const workflow = convertCanvasToWorkflow(nodes, lines, {
        name: config.name,
        description: config.description,
        enabled: config.enabled,
        existingData: workflowFromState?.data || workflowFromState?.datas || workflowFromState?.canvas,
      });

      const validation = validateWorkflow(workflow);
      if (!validation.valid) {
        setSaveError(validation.errors);
        setSaveLoading(false);
        return;
      }

      await post('/workflows', workflow);
      setShowSaveModal(false);
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Failed to save workflow';
      setSaveError([message]);
    } finally {
      setSaveLoading(false);
    }
  }, [get, lines, nodes, workflowFromState]);

  const handleExportWorkflow = useCallback(() => {
    const workflow = convertCanvasToWorkflow(nodes, lines, {
      name: 'Exported Workflow',
      description: 'Exported from canvas',
      existingData: workflowFromState?.data || workflowFromState?.datas || workflowFromState?.canvas,
    });

    const json = JSON.stringify(workflow, null, 2);

    Share.share({
      title: 'Workflow JSON',
      message: json,
    }).catch(() => {});
  }, [lines, nodes, workflowFromState]);

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <View style={styles.canvas} onLayout={handleCanvasLayout}>
        {gridOverlay}

        <Svg style={StyleSheet.absoluteFill} pointerEvents={isDrawMode ? "auto" : "none"}>
          <G transform={`translate(${offset.x}, ${offset.y}) scale(${scale})`}>
            {lines.map((line, idx) => {
              const start = resolveEndpoint(line.a);
              const end = resolveEndpoint(line.b);

              const obstacleRects = nodes.map(n => ({
                  id: n.id,
                  left: n.x - (n.width || 240)/2,
                  right: n.x + (n.width || 240)/2,
                  top: n.y - (n.height || 144)/2,
                  bottom: n.y + (n.height || 144)/2
              }));

              const routed = routeConnection(
                  { x: start.x, y: start.y },
                  { x: end.x, y: end.y },
                  line.a.side as any,
                  line.b.side as any,
                  obstacleRects
              );

              return (
                <Path key={idx} d={routed.d} stroke={pressedLineIndex === idx && isDrawMode ? '#ff8b8b' : line.stroke || '#fff'} strokeWidth={4} fill="none"
                  onPressIn={() => setPressedLineIndex(idx)}
                  onPressOut={() => setPressedLineIndex(null)}
                  onPress={() => {
                    setLines(ls => ls.filter((_, i) => i !== idx));
                    setPressedLineIndex(null);
                  }}
                />
              );
            })}

            {pendingConnection && (() => {
               const startEp = resolveEndpoint(pendingConnection);
               return (
                   <SvgLine
                      x1={startEp.x}
                      y1={startEp.y}
                      x2={cursorPos.x}
                      y2={cursorPos.y}
                      stroke="#fff"
                      strokeWidth={4}
                      strokeDasharray="10, 10"
                   />
               );
            })()}
          </G>
        </Svg>

        {nodes.map(node => (
          <Node
            key={node.id}
            node={node}
            scale={scale}
            offset={offset}
            gridPx={gridPx}
            onPress={() => handleNodePress(node.id)}
            onRemove={() => handleRemoveNode(node.id)}
            onUpdate={(updates: Partial<NodeItem>) => handleUpdateNode(node.id, updates)}
            onConnectorPress={handleConnectorPress}
            selected={selectedId === node.id}
            isDrawMode={isDrawMode}
            onDragStart={() => { nodeDraggingRef.current = true; }}
            onDragEnd={() => { nodeDraggingRef.current = false; }}
          />
        ))}
      </View>

      {selectedId && !isDrawMode && (
        <EditMenu
          ref={editMenuRef}
          node={nodes.find(n => n.id === selectedId) || null}
          updateNode={(updates) => handleUpdateNode(selectedId, updates)}
          onClose={() => setSelectedId(null)}
          onDelete={() => { if (selectedId) handleRemoveNode(selectedId); }}
          credentials={credentials}
          refreshCredentials={fetchCredentials}
        />
      )}

      {showAddMenu && (
        <AddNode
          modules={modules} credentials={credentials} onClose={() => setShowAddMenu(false)}
          onAdd={handleAddFromMenu} offset={offset} scale={scale} gridPx={gridPx}
        />
      )}

      <SaveWorkflowModalMobile
        isOpen={showSaveModal}
        onClose={() => { setShowSaveModal(false); setSaveError(null); }}
        onSave={handleSaveWorkflow}
        initialName={workflowFromState?.pretty_name || workflowFromState?.name || ''}
        initialDescription={workflowFromState?.description || ''}
        initialEnabled={workflowFromState?.enabled ?? true}
        loading={saveLoading}
        error={saveError}
      />

      {!isDrawMode && (
        <>
          {isMenuOpen && (
            <View style={styles.menuOptions}>
              <TouchableOpacity style={styles.menuOptionItem} onPress={() => {
                setIsMenuOpen(false);
                setShowSaveModal(true);
                setSaveError(null);
              }}>
                <Text style={styles.menuOptionIcon}>💾</Text>
                <Text style={styles.menuOptionText}>Save workflow</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuOptionItem} onPress={() => {
                setIsMenuOpen(false);
                handleExportWorkflow();
              }}>
                <Text style={styles.menuOptionIcon}>⤓</Text>
                <Text style={styles.menuOptionText}>Export as JSON</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuOptionItem} onPress={() => {
                setIsDrawMode(true);
                setIsMenuOpen(false);
                setSelectedId(null);
              }}>
                <Text style={styles.menuOptionIcon}>✎</Text>
                <Text style={styles.menuOptionText}>Draw connections</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Text style={styles.menuButtonText}>≡</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.addButton} onPress={() => {setShowAddMenu(true); setIsMenuOpen(false);}}>
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Exit Drawing Mode Button */}
      {isDrawMode && (
        <TouchableOpacity
          style={styles.exitButton}
          onPress={() => {
            setIsDrawMode(false);
            setPendingConnection(null);
          }}
        >
          <Text style={styles.exitButtonText}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505'
  },
  canvas: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden'
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ffffffc5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  addButtonText: {
    color: '#000000',
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32
  },
  menuButton: {
    position: 'absolute',
    bottom: 96,
    left: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#111012',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  menuButtonText: {
    color: '#ffffffc5',
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 28
  },
  menuOptions: {
    position: 'absolute',
    bottom: 160,
    left: 24,
    backgroundColor: '#0b0a0a',
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    minWidth: 160,
  },
  menuOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  menuOptionIcon: {
    color: '#ffffffc5',
    fontSize: 20,
    marginRight: 12,
  },
  menuOptionText: {
    color: '#ffffffc5',
    fontSize: 16,
    fontWeight: '600',
  },
  exitButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  exitButtonText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
});

export default MobileCanva;
