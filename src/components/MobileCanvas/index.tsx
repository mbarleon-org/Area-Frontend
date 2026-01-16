import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, PanResponder, Dimensions } from 'react-native';

const MobileCanva: React.FC = () => {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const lastTouchDistance = useRef<number | null>(null);
  const lastScale = useRef(1);
  const lastTapTime = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: (evt, gestureState) => {
        const touches = evt.nativeEvent.touches;

        // Double tap detection
        const now = Date.now();
        if (now - lastTapTime.current < 300) {
          console.log('Double tap detected!');
          lastTapTime.current = 0;
          return;
        }
        lastTapTime.current = now;

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

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <View style={styles.canvas}>
        <Text style={styles.text}>Mobile Canvas</Text>
        <Text style={styles.info}>Scale: {scale.toFixed(2)}</Text>
        <Text style={styles.info}>Offset: X:{offset.x.toFixed(0)} Y:{offset.y.toFixed(0)}</Text>
        <Text style={styles.instruction}>Pinch to zoom, drag to pan, double tap to add node</Text>
      </View>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  info: {
    color: '#aaa',
    fontSize: 16,
    marginVertical: 5,
  },
  instruction: {
    color: '#666',
    fontSize: 14,
    marginTop: 20,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

export default MobileCanva;
