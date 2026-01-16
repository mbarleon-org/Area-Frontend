import React, { useRef } from 'react';
import { View, Text, StyleSheet, PanResponder } from 'react-native';

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

type NodeProps = {
  node: NodeItem;
  scale: number;
  offset: { x: number; y: number };
  onPress: () => void;
  onRemove: () => void;
  onUpdate: (updates: Partial<NodeItem>) => void;
  selected: boolean;
};

const Node: React.FC<NodeProps> = ({ node, scale, offset, onPress, onRemove, onUpdate, selected }) => {
  const width = node.width || 240;
  const height = node.height || 144;
  const dragStartPos = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  // Convert world coordinates to screen coordinates
  const screenX = node.x * scale + offset.x;
  const screenY = node.y * scale + offset.y;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,

      onPanResponderGrant: (_evt, _gestureState) => {
        isDragging.current = false;
        dragStartPos.current = { x: node.x, y: node.y };

        // Start long press timer
        longPressTimer.current = setTimeout(() => {
          if (!isDragging.current) {
            onPress();
          }
        }, 500);
      },

      onPanResponderMove: (_evt, gestureState) => {
        // If moved more consider it a drag
        if (Math.abs(gestureState.dx) > 0 || Math.abs(gestureState.dy) > 5) {
          isDragging.current = true;

          if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
          }

          // Update node position in world coordinates
          const newX = dragStartPos.current.x + gestureState.dx / scale;
          const newY = dragStartPos.current.y + gestureState.dy / scale;
          onUpdate({ x: newX, y: newY });
        }
      },

      onPanResponderRelease: () => {
        // Clear long press timer
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }
        isDragging.current = false;
      },

      onPanResponderTerminate: () => {
        // Clear long press timer
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }
        isDragging.current = false;
      },
    })
  ).current;

  console.log('Node', node.id, 'at screen pos:', screenX, screenY, 'scale:', scale);

  return (
    <View
      {...panResponder.panHandlers}
      style={[
        styles.node,
        {
          left: screenX - (width * scale) / 2,
          top: screenY - (height * scale) / 2,
          width: width * scale,
          height: height * scale,
          borderColor: selected ? '#6366f1' : '#4a4750',
          borderWidth: selected ? 3 : 2,
        },
      ]}
    >
      {/* Icon placeholder */}
      {node.icon && (
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{node.icon}</Text>
        </View>
      )}

      {/* Label */}
      <Text style={styles.label} numberOfLines={1}>
        {node.label || 'Node'}
      </Text>

      {/* Module info */}
      {node.module && (
        <Text style={styles.moduleInfo} numberOfLines={1}>
          {node.module.name || ''}
        </Text>
      )}

      {/* Connection points */}
      {node.connectionPoints?.map((cp, idx) => (
        <View
          key={idx}
          style={[
            styles.connector,
            cp.side === 'left' && { left: -6, top: '50%', marginTop: -6 },
            cp.side === 'right' && { right: -6, top: '50%', marginTop: -6 },
            cp.side === 'top' && { top: -6, left: '50%', marginLeft: -6 },
            cp.side === 'bottom' && { bottom: -6, left: '50%', marginLeft: -6 },
          ]}
        />
      ))}

    </View>
  );
};

const styles = StyleSheet.create({
  node: {
    position: 'absolute',
    backgroundColor: '#2a2730',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    padding: 12,
  },
  iconContainer: {
    marginBottom: 4,
  },
  icon: {
    fontSize: 32,
  },
  label: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  moduleInfo: {
    color: '#888',
    fontSize: 10,
    marginTop: 4,
  },
  connector: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#6366f1',
    borderWidth: 2,
    borderColor: '#fff',
  },
  deleteButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 20,
  },
});

export default Node;
