import React, { useRef, useState, useCallback, useEffect } from "react";
import Node from "./Node";

const mod = (n: number, m: number) => ((n % m) + m) % m;

const Canvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const initialPosSet = useRef(false);

  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);

  const [rectPos, setRectPos] = useState({ x: 0, y: 0 });

  const gridPx = 24;

  const onDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    dragging.current = true;
    const isTouch = "touches" in e;
    const p = isTouch ? (e as React.TouchEvent).touches[0] : (e as React.MouseEvent).nativeEvent;
    lastPos.current = { x: p.clientX, y: p.clientY };
    (document.activeElement as HTMLElement)?.blur();
    if (!isTouch)
      (e as React.MouseEvent).preventDefault();
  }, []);

  const onMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const p = "touches" in e ? e.touches[0] : (e as React.MouseEvent).nativeEvent;
    const clientX = p.clientX;
    const clientY = p.clientY;
    if (!dragging.current)
      return;
    const dx = clientX - lastPos.current.x;
    const dy = clientY - lastPos.current.y;
    lastPos.current = { x: clientX, y: clientY };
    setOffset(o => ({ x: o.x + dx, y: o.y + dy }));
  }, []);

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
    const worldX = Math.round((cx - offset.x) / scale);
    const worldY = Math.round((cy - offset.y) / scale);
    setRectPos({ x: worldX, y: worldY });
    initialPosSet.current = true;
  }, []);

  const [showCenter, setShowCenter] = useState(false);

  const recenter = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setOffset({ x: (rect.width / 2) - rectPos.x * scale, y: (rect.height / 2) - rectPos.y * scale });
  }, [rectPos, scale]);

  useEffect(() => {
    const update = () => {
      const el = containerRef.current;

      if (!el) {
        setShowCenter(false);
        return;
      }

      const SHOW_RATIO = 0.75;
      const HIDE_RATIO = 0.6;

      const rect = el.getBoundingClientRect();
      const showThreshold = Math.max(48, Math.min(rect.width, rect.height) * SHOW_RATIO);
      const hideThreshold = showThreshold * HIDE_RATIO;
      const dx = Math.abs((rectPos.x * scale + offset.x) - rect.width / 2);
      const dy = Math.abs((rectPos.y * scale + offset.y) - rect.height / 2);
      const withinShow = dx <= showThreshold && dy <= showThreshold;
      const withinHide = dx <= hideThreshold && dy <= hideThreshold;

      setShowCenter(prev => {
        if (prev) {
          return !withinHide;
        }
        return !withinShow;
      });
    };

    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [offset, scale, rectPos]);

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
    cursor: dragging.current ? "grabbing" : "grab",
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
      <div style={canvasStyle}>
        <Node
          pos={rectPos}
          setPos={setRectPos}
          width={96}
          height={96}
          scale={scale}
          offset={offset}
          gridPx={gridPx}
          label="Loïs"
        />
        {showCenter && (
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onMouseUp={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
            onClick={recenter}
            style={{
              position: 'absolute',
              right: 32,
              bottom: 32,
              zIndex: 1000,
              background: '#2b2b2b',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.06)',
              padding: '15px 20px',
              borderRadius: 6,
              cursor: 'pointer',
            }}
            aria-label="Recenter canvas"
          >
            Recenter
          </button>
        )}
      </div>
    </div>
  );
};

export default Canvas;
