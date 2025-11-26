import React, { useRef, useEffect, useCallback } from "react";

type Vec = { x: number; y: number };

type NodeProps = {
  pos: Vec;
  setPos: (p: Vec) => void;
  onSelect?: () => void;
  width: number;
  height: number;
  scale: number;
  offset: Vec;
  gridPx: number;
  label?: React.ReactNode;
};

const computeSnapOffset = (worldSize: number, gridPx: number) => {
  const cells = Math.round(worldSize / gridPx);
  return (cells % 2 === 0) ? 0 : gridPx / 2;
};

const Node: React.FC<NodeProps> = ({ pos, setPos, onSelect, width = 96, height = 96, scale, offset, gridPx, label }) => {
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const pointerOffset = useRef({ x: 0, y: 0 });
  const currentPos = useRef<Vec>(pos);
  const moved = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    currentPos.current = pos;
  }, [pos]);

  useEffect(() => {
    return () => {};
  }, [scale, gridPx, setPos, width, height]);

  useEffect(() => {
    return () => {};
  }, [scale, gridPx, setPos, width, height]);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    lastPos.current = { x: clientX, y: clientY };
    if (!moved.current) {
      const dx0 = clientX - dragStart.current.x;
      const dy0 = clientY - dragStart.current.y;
      if (Math.hypot(dx0, dy0) > 4)
        moved.current = true;
    }
    const worldX = (clientX - offset.x) / scale;
    const worldY = (clientY - offset.y) / scale;
    const desiredX = worldX - pointerOffset.current.x;
    const desiredY = worldY - pointerOffset.current.y;
    const snapOffX = computeSnapOffset(width, gridPx);
    const snapOffY = computeSnapOffset(height, gridPx);
    const snappedX = Math.round((desiredX - snapOffX) / gridPx) * gridPx + snapOffX;
    const snappedY = Math.round((desiredY - snapOffY) / gridPx) * gridPx + snapOffY;
    currentPos.current = { x: snappedX, y: snappedY };
    setPos({ x: snappedX, y: snappedY });
  }, [offset.x, offset.y, scale, gridPx, width, height, setPos]);

  const finishDrag = useCallback(() => {
    if (!dragging.current)
      return;
    dragging.current = false;
    const snapOffX = computeSnapOffset(width, gridPx);
    const snapOffY = computeSnapOffset(height, gridPx);
  const cur = currentPos.current;
  const x = Math.round((cur.x - snapOffX) / gridPx) * gridPx + snapOffX;
  const y = Math.round((cur.y - snapOffY) / gridPx) * gridPx + snapOffY;
  currentPos.current = { x, y };
  setPos({ x, y });
    window.removeEventListener('mousemove', mouseMoveListener);
    window.removeEventListener('mouseup', mouseUpListener);
    window.removeEventListener('touchmove', touchMoveListener as any);
    window.removeEventListener('touchend', touchEndListener as any);
    // keep moved flag true until next mousedown; onClick will reset it
  }, [width, height, gridPx, setPos]);

  const mouseMoveListener = useCallback((e: MouseEvent) => {
    if (!dragging.current)
      return;
    handleMove(e.clientX, e.clientY);
  }, [handleMove]);
  const mouseUpListener = useCallback(() => {
    finishDrag();
  }, [finishDrag]);
  const touchMoveListener = useCallback((e: TouchEvent) => {
    if (!dragging.current)
      return;
    e.preventDefault();
    const t = e.touches[0];
    handleMove(t.clientX, t.clientY);
  }, [handleMove]);
  const touchEndListener = useCallback(() => {
    finishDrag();
  }, [finishDrag]);

  const screenX = offset.x + pos.x * scale;
  const screenY = offset.y + pos.y * scale;
  const screenW = width * scale;
  const screenH = height * scale;

  const style: React.CSSProperties = {
    position: 'absolute',
    left: screenX,
    top: screenY,
    width: screenW,
    height: screenH,
    transform: 'translate(-50%, -50%)',
    background: '#202020ff',
    border: '2px solid #ffffff33',
    borderRadius: 6,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    cursor: dragging.current ? 'grabbing' : 'grab',
    userSelect: 'none',
    touchAction: 'none',
  };

  return (
    <div
      style={style}
      onClick={(e) => { e.stopPropagation(); if (!moved.current) { onSelect?.(); } moved.current = false; }}
      onMouseDown={(e) => {
        e.stopPropagation();
        dragging.current = true;
        lastPos.current = { x: e.clientX, y: e.clientY };
        dragStart.current = { x: e.clientX, y: e.clientY };
        moved.current = false;
        const pwx = (e.clientX - offset.x) / scale;
        const pwy = (e.clientY - offset.y) / scale;
        const snapOffX = computeSnapOffset(width, gridPx);
        const snapOffY = computeSnapOffset(height, gridPx);
        const curX = Math.round((pos.x - snapOffX) / gridPx) * gridPx + snapOffX;
        const curY = Math.round((pos.y - snapOffY) / gridPx) * gridPx + snapOffY;
        setPos({ x: curX, y: curY });
        pointerOffset.current = { x: pwx - curX, y: pwy - curY };
        window.addEventListener('mousemove', mouseMoveListener);
        window.addEventListener('mouseup', mouseUpListener);
      }}
      onTouchStart={(e) => {
        e.stopPropagation();
        const t = e.touches[0];
        dragging.current = true;
        lastPos.current = { x: t.clientX, y: t.clientY };
        dragStart.current = { x: t.clientX, y: t.clientY };
        moved.current = false;
        const pwx = (t.clientX - offset.x) / scale;
        const pwy = (t.clientY - offset.y) / scale;
        const snapOffX = computeSnapOffset(width, gridPx);
        const snapOffY = computeSnapOffset(height, gridPx);
        const curX = Math.round((pos.x - snapOffX) / gridPx) * gridPx + snapOffX;
        const curY = Math.round((pos.y - snapOffY) / gridPx) * gridPx + snapOffY;
        setPos({ x: curX, y: curY });
        pointerOffset.current = { x: pwx - curX, y: pwy - curY };
        window.addEventListener('touchmove', touchMoveListener as any, { passive: false });
        window.addEventListener('touchend', touchEndListener as any);
      }}
    >
      <div style={{ pointerEvents: 'none' }}>{label ?? 'Drag me'}</div>
    </div>
  );
};

export default Node;
