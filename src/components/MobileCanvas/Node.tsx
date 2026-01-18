import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, PanResponder, TouchableOpacity, Image } from 'react-native';

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

type ConnectorInfo = {
  nodeId: string;
  side: 'left'|'right'|'top'|'bottom';
  offset: number;
  x: number;
  y: number;
};

type NodeProps = {
  node: NodeItem;
  scale: number;
  offset: { x: number; y: number };
  onPress: () => void;
  onRemove: () => void;
  onUpdate: (updates: Partial<NodeItem>) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onConnectorPress?: (info: ConnectorInfo) => void;
  selected: boolean;
  gridPx: number;
  isDrawMode: boolean;
};

const computeSnapOffset = (worldSize: number, gridPx: number) => {
  const cells = Math.round(worldSize / gridPx);
  return (cells % 2 === 0) ? 0 : gridPx / 2;
};

const Node: React.FC<NodeProps> = ({
  node,
  scale,
  offset,
  onPress,
  onUpdate,
  onDragStart,
  onDragEnd,
  onConnectorPress,
  selected,
  gridPx,
  isDrawMode
}) => {
  const baseWidth = node.width || 240;
  const baseHeight = node.height || 144;

  const isDragging = useRef(false);
  const pointerOffset = useRef({ x: 0, y: 0 });
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const scaleRef = useRef(scale);
  const offsetRef = useRef(offset);
  const currentPos = useRef({ x: node.x, y: node.y });
  const isDrawModeRef = useRef(isDrawMode);
  const onPressRef = useRef(onPress);
  const onUpdateRef = useRef(onUpdate);
  const onDragStartRef = useRef(onDragStart);
  const onDragEndRef = useRef(onDragEnd);

  useEffect(() => {
    scaleRef.current = scale;
    offsetRef.current = offset;
    currentPos.current = { x: node.x, y: node.y };
    isDrawModeRef.current = isDrawMode;
    onPressRef.current = onPress;
    onUpdateRef.current = onUpdate;
    onDragStartRef.current = onDragStart;
    onDragEndRef.current = onDragEnd;
  }, [scale, offset, node.x, node.y, isDrawMode, onPress, onUpdate, onDragStart, onDragEnd]);

  const screenX = node.x * scale + offset.x;
  const screenY = node.y * scale + offset.y;
  const screenWidth = baseWidth * scale;
  const screenHeight = baseHeight * scale;

  const iconSource = useMemo(() => {
    if (!node.icon) return null;
    if (typeof node.icon === 'number' || typeof node.icon === 'object') return node.icon;
    if (typeof node.icon === 'string') return { uri: node.icon };
    return null;
  }, [node.icon]);

  // Dimensions icône
  const iconAreaWidth = screenWidth * 0.35;
  const iconAreaHeight = screenHeight;
  const desiredIconSize = Math.min(iconAreaWidth * 0.75, iconAreaHeight * 0.75);
  const iconSizePx = Math.max(16, desiredIconSize);
  const wrapperBorderRadius = screenHeight;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !isDrawModeRef.current,
      onStartShouldSetPanResponderCapture: () => !isDrawModeRef.current,
      onMoveShouldSetPanResponder: () => !isDrawModeRef.current,
      onMoveShouldSetPanResponderCapture: () => !isDrawModeRef.current,

      onPanResponderGrant: (evt) => {
        onDragStartRef.current?.();
        isDragging.current = false;
        const currentScale = scaleRef.current;
        const currentOffset = offsetRef.current;
        const touchX = evt.nativeEvent.pageX;
        const touchY = evt.nativeEvent.pageY;
        const worldTouchX = (touchX - currentOffset.x) / currentScale;
        const worldTouchY = (touchY - currentOffset.y) / currentScale;
        pointerOffset.current = {
            x: worldTouchX - currentPos.current.x,
            y: worldTouchY - currentPos.current.y
        };
        longPressTimer.current = setTimeout(() => {
          if (!isDragging.current) onPressRef.current();
        }, 500);
      },

      onPanResponderMove: (_, gestureState) => {
        if (!isDragging.current && (Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5)) {
            isDragging.current = true;
            if (longPressTimer.current) {
                clearTimeout(longPressTimer.current);
                longPressTimer.current = null;
            }
        }
        if (isDragging.current) {
            const currentScale = scaleRef.current;
            const currentOffset = offsetRef.current;
            const currentTouchX = gestureState.moveX;
            const currentTouchY = gestureState.moveY;
            const worldTouchX = (currentTouchX - currentOffset.x) / currentScale;
            const worldTouchY = (currentTouchY - currentOffset.y) / currentScale;
            const desiredX = worldTouchX - pointerOffset.current.x;
            const desiredY = worldTouchY - pointerOffset.current.y;
            const snapOffX = computeSnapOffset(baseWidth, gridPx);
            const snapOffY = computeSnapOffset(baseHeight, gridPx);
            const snappedX = Math.round((desiredX - snapOffX) / gridPx) * gridPx + snapOffX;
            const snappedY = Math.round((desiredY - snapOffY) / gridPx) * gridPx + snapOffY;

            if (snappedX !== currentPos.current.x || snappedY !== currentPos.current.y) {
              currentPos.current = { x: snappedX, y: snappedY };
              onUpdateRef.current({ x: snappedX, y: snappedY });
            }
        }
      },

      onPanResponderRelease: () => {
        if (longPressTimer.current) clearTimeout(longPressTimer.current);
        if (!isDragging.current) {
          onPressRef.current();
        } else {
            const snapOffX = computeSnapOffset(baseWidth, gridPx);
            const snapOffY = computeSnapOffset(baseHeight, gridPx);
            const snappedX = Math.round(((currentPos.current.x) - snapOffX) / gridPx) * gridPx + snapOffX;
            const snappedY = Math.round(((currentPos.current.y) - snapOffY) / gridPx) * gridPx + snapOffY;
            currentPos.current = { x: snappedX, y: snappedY };
            onUpdateRef.current({ x: snappedX, y: snappedY });
        }
        isDragging.current = false;
        onDragEndRef.current?.();
      },

      onPanResponderTerminate: () => {
        if (longPressTimer.current) clearTimeout(longPressTimer.current);
        isDragging.current = false;
        onDragEndRef.current?.();
      },
    })
  ).current;

  const CONNECTOR_SIZE = 9;
  const CENTER_OFFSET = -CONNECTOR_SIZE / 2;

  return (
    <View
      {...panResponder.panHandlers}
      style={[
        styles.node,
        {
          left: screenX - screenWidth / 2,
          top: screenY - screenHeight / 2,
          width: screenWidth,
          height: screenHeight,
          borderColor: selected ? '#6366f1' : '#4a4750',
          borderWidth: selected ? 3 : 2,
        },
      ]}
    >
      {/* Label Zone */}
      <View style={[styles.textContainer, { width: iconSource ? '65%' : '100%' }]}>
        <Text style={styles.label} numberOfLines={1}>{node.label || 'Node'}</Text>
        {node.module && (
          <Text style={styles.moduleInfo} numberOfLines={1}>{node.module.name || ''}</Text>
        )}
      </View>

      {/* Icon Zone */}
      {iconSource && (
        <View style={[
          styles.iconWrapper,
          {
            borderTopLeftRadius: wrapperBorderRadius,
            borderBottomLeftRadius: wrapperBorderRadius,
          }
        ]}>
          <Image
            source={iconSource}
            style={{ width: iconSizePx, height: iconSizePx }}
            resizeMode="contain"
          />
        </View>
      )}

      {/* Connectors */}
      {node.connectionPoints?.map((cp, idx) => {
        let relX = 0;
        let relY = 0;
        if (cp.side === 'left') { relX = -baseWidth / 2; relY = cp.offset; }
        else if (cp.side === 'right') { relX = baseWidth / 2; relY = cp.offset; }
        else if (cp.side === 'top') { relY = -baseHeight / 2; relX = cp.offset; }
        else if (cp.side === 'bottom') { relY = baseHeight / 2; relX = cp.offset; }

        const worldX = node.x + relX;
        const worldY = node.y + relY;

        return (
          <TouchableOpacity
            key={idx}
            disabled={!isDrawMode}
            activeOpacity={0.7}
            hitSlop={{ top: 25, bottom: 25, left: 25, right: 25 }}
            onPress={(e) => {
                e.stopPropagation();
                onConnectorPress?.({
                    nodeId: node.id,
                    side: cp.side,
                    offset: cp.offset,
                    x: worldX,
                    y: worldY
                });
            }}
            style={[
              styles.connector,
              cp.side === 'left' && {
                left: -6,
                top: '50%',
                marginTop: CENTER_OFFSET + (cp.offset * scale)
              },
              cp.side === 'right' && {
                right: -6,
                top: '50%',
                marginTop: CENTER_OFFSET + (cp.offset * scale)
              },
              cp.side === 'top' && {
                top: -6,
                left: '50%',
                marginLeft: CENTER_OFFSET + (cp.offset * scale)
              },
              cp.side === 'bottom' && {
                bottom: -6,
                left: '50%',
                marginLeft: CENTER_OFFSET + (cp.offset * scale)
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  node: {
    position: 'absolute',
    backgroundColor: '#2a2730',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'visible',
  },
  iconWrapper: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '35%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  textContainer: {
    height: '100%',
    position: 'absolute',
    left: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  label: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center'
  },
  moduleInfo: {
    color: '#888',
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center'
  },
  connector: {
    position: 'absolute',
    width: 9,
    height: 9,
    borderRadius: 6,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#4a4750',
    zIndex: 10,
  },
});

export default Node;
