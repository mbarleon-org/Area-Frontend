import React, { useRef, useEffect, useCallback } from "react";

type Vec = { x: number; y: number };

type NodeProps = {
  pos: Vec;
  setPos: (p: Vec) => void;
  onSelect?: () => void;
  id?: string;
  onConnectorClick?: (info: { nodeId?: string; side: 'left'|'right'|'top'|'bottom'; offset: number; worldX: number; worldY: number; index?: number }) => void;
  width: number;
  height: number;
  scale: number;
  offset: Vec;
  gridPx: number;
  label?: React.ReactNode;
  icon?: React.ReactNode;
  connectionPoints?: Array<{
    side: 'left' | 'right' | 'top' | 'bottom';
    offset: number;
    size?: number;
  }>;
  iconMaxPx?: number;
  iconMinPx?: number;
};

const computeSnapOffset = (worldSize: number, gridPx: number) => {
  const cells = Math.round(worldSize / gridPx);
  return (cells % 2 === 0) ? 0 : gridPx / 2;
};

const Node: React.FC<NodeProps> = ({ pos, setPos, onSelect, id, width = 96, height = 96, scale, offset, gridPx, label, icon, connectionPoints, onConnectorClick, iconMaxPx = 64, iconMinPx = 12 }) => {
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
    overflow: 'visible',
  };



  const renderConnector = (side: 'left' | 'right' | 'top' | 'bottom', off: number, size = 9, index?: number) => {
    const screenOffset = off * scale;
    const visibleSize = size;
    const hitSize = Math.max(20, visibleSize);
    const hitHalf = Math.round(hitSize / 2);

    const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      let worldX = pos.x;
      let worldY = pos.y;
      if (side === 'right') {
        worldX = pos.x + width / 2;
        worldY = pos.y + off;
      } else if (side === 'left') {
        worldX = pos.x - width / 2;
        worldY = pos.y + off;
      } else if (side === 'top') {
        worldY = pos.y - height / 2;
        worldX = pos.x + off;
      } else {
        worldY = pos.y + height / 2;
        worldX = pos.x + off;
      }
      console.log('Connector clicked:', { nodeId: id, side, offset: off, worldX, worldY, index });
      onConnectorClick?.({ nodeId: id, side, offset: off, worldX, worldY, index });
    };

    const hitStyleBase: React.CSSProperties = {
      position: 'absolute',
      width: hitSize,
      height: hitSize,
      background: 'transparent',
      borderRadius: '50%',
      pointerEvents: 'auto',
      zIndex: 20,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'default'
    };

    const hitStyle: React.CSSProperties = { ...hitStyleBase };
    if (side === 'right') {
      hitStyle.right = -hitHalf;
      hitStyle.top = `calc(50% + ${screenOffset}px)`;
      hitStyle.transform = 'translateY(-50%)';
    } else if (side === 'left') {
      hitStyle.left = -hitHalf;
      hitStyle.top = `calc(50% + ${screenOffset}px)`;
      hitStyle.transform = 'translateY(-50%)';
    } else if (side === 'top') {
      hitStyle.top = -hitHalf;
      hitStyle.left = `calc(50% + ${screenOffset}px)`;
      hitStyle.transform = 'translateX(-50%)';
    } else {
      hitStyle.bottom = -hitHalf;
      hitStyle.left = `calc(50% + ${screenOffset}px)`;
      hitStyle.transform = 'translateX(-50%)';
    }

    const visualStyle: React.CSSProperties = { width: visibleSize, height: visibleSize, borderRadius: '50%', background: '#fff', boxShadow: '0 0 0 2px rgba(255,255,255,0.06)', pointerEvents: 'none' };

    return (
      <div
        key={`${side}-${off}-${size}-${index}`}
        onClick={handleClick}
        onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); }}
        onTouchStart={(e) => { e.stopPropagation(); e.preventDefault(); }}
        style={hitStyle}
      >
        <div style={visualStyle} />
      </div>
    );
  };

  return (
    <div
      style={style}
      onClick={(e) => { e.stopPropagation(); if (!moved.current) { onSelect?.(); } moved.current = false; }}
      onDoubleClick={(e) => { e.stopPropagation(); }}
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
      {icon && (() => {
        const iconAreaWidth = Math.max(0, screenW * 0.35);
        const iconAreaHeight = screenH;
        const desiredIconPx = Math.min(iconAreaWidth * 0.75, iconAreaHeight * 0.75);
        const iconSizePx = Math.max(iconMinPx, Math.min(desiredIconPx, iconMaxPx));

        const wrapperStyle: React.CSSProperties = {
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: '35%',
          background: 'rgba(255,255,255,0.1)',
          borderTopLeftRadius: '100% 50%',
          borderBottomLeftRadius: '100% 50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none'
        };

        const imgStyle: React.CSSProperties = {
          width: iconSizePx,
          height: iconSizePx,
          objectFit: 'contain',
          pointerEvents: 'none'
        };

        if (React.isValidElement(icon)) {
          return (
            <div style={wrapperStyle}>
              {React.cloneElement(icon as React.ReactElement, { style: { ...((icon as any).props?.style || {}), ...imgStyle } } as any)}
            </div>
          );
        }

        if (typeof icon === 'string') {
          return (
            <div style={wrapperStyle}>
              <img src={icon} alt="icon" style={imgStyle} />
            </div>
          );
        }

        return (
          <div style={wrapperStyle}>{icon}</div>
        );
      })()}
      <div style={{
        pointerEvents: 'none',
        width: icon ? '65%' : '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 8,
        boxSizing: 'border-box',
        wordBreak: 'break-word',
        position: 'absolute',
        left: 0,
        top: 0
      }}>{label ?? 'Drag me'}</div>
      {connectionPoints?.map((cp: { side: 'left' | 'right' | 'top' | 'bottom'; offset: number; size?: number }) => renderConnector(cp.side, cp.offset, cp.size))}
    </div>
  );
};

export default Node;
