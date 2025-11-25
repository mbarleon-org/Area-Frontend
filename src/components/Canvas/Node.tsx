import React, { useRef, useEffect, useCallback } from "react";

type Vec = { x: number; y: number };

type NodeProps = {
  pos: Vec;
  setPos: React.Dispatch<React.SetStateAction<Vec>>;
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

const Node: React.FC<NodeProps> = ({ pos, setPos, width, height, scale, offset, gridPx, label }) => {
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const accum = useRef({ x: 0, y: 0 });

  useEffect(() => {
    return () => {};
  }, [scale, gridPx, setPos, width, height]);

  useEffect(() => {
    return () => {};
  }, [scale, gridPx, setPos, width, height]);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    const dx = clientX - lastPos.current.x;
    const dy = clientY - lastPos.current.y;
    lastPos.current = { x: clientX, y: clientY };
    const worldDx = dx / scale;
    const worldDy = dy / scale;
    accum.current.x += worldDx;
    accum.current.y += worldDy;
    const stepX = Math.trunc(accum.current.x / gridPx);
    const stepY = Math.trunc(accum.current.y / gridPx);
    if (stepX !== 0 || stepY !== 0) {
      accum.current.x -= stepX * gridPx;
      accum.current.y -= stepY * gridPx;
      setPos(r => ({ x: r.x + stepX * gridPx, y: r.y + stepY * gridPx }));
    }
  }, [scale, gridPx, setPos]);

  const finishDrag = useCallback(() => {
    if (!dragging.current)
      return;
    dragging.current = false;
    const snapOffX = computeSnapOffset(width, gridPx);
    const snapOffY = computeSnapOffset(height, gridPx);
    setPos(r => {
      const x = Math.round((r.x - snapOffX) / gridPx) * gridPx + snapOffX;
      const y = Math.round((r.y - snapOffY) / gridPx) * gridPx + snapOffY;
      return { x, y };
    });
    accum.current = { x: 0, y: 0 };
    window.removeEventListener('mousemove', mouseMoveListener);
    window.removeEventListener('mouseup', mouseUpListener);
    window.removeEventListener('touchmove', touchMoveListener as any);
    window.removeEventListener('touchend', touchEndListener as any);
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
      onMouseDown={(e) => {
        e.stopPropagation();
        dragging.current = true;
        lastPos.current = { x: e.clientX, y: e.clientY };
        accum.current = { x: 0, y: 0 };
        const snapOffX = computeSnapOffset(width, gridPx);
        const snapOffY = computeSnapOffset(height, gridPx);
        setPos(r => ({
          x: Math.round((r.x - snapOffX) / gridPx) * gridPx + snapOffX,
          y: Math.round((r.y - snapOffY) / gridPx) * gridPx + snapOffY,
        }));
        window.addEventListener('mousemove', mouseMoveListener);
        window.addEventListener('mouseup', mouseUpListener);
      }}
      onTouchStart={(e) => {
        e.stopPropagation();
        const t = e.touches[0];
        dragging.current = true;
        lastPos.current = { x: t.clientX, y: t.clientY };
        accum.current = { x: 0, y: 0 };
        const snapOffX = computeSnapOffset(width, gridPx);
        const snapOffY = computeSnapOffset(height, gridPx);
        setPos(r => ({
          x: Math.round((r.x - snapOffX) / gridPx) * gridPx + snapOffX,
          y: Math.round((r.y - snapOffY) / gridPx) * gridPx + snapOffY,
        }));
        window.addEventListener('touchmove', touchMoveListener as any, { passive: false });
        window.addEventListener('touchend', touchEndListener as any);
      }}
    >
      <div style={{ pointerEvents: 'none' }}>{label ?? 'Drag me'}</div>
    </div>
  );
};

export default Node;
