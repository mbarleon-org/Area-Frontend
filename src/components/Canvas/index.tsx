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

  const offsetRef = useRef(offset);
  const scaleRef = useRef(scale);
  useEffect(() => { offsetRef.current = offset; }, [offset]);
  useEffect(() => { scaleRef.current = scale; }, [scale]);

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

  const [showCenter, setShowCenter] = useState(false);

  type NodeItem = { x: number; y: number; width?: number; height?: number };

  const recenter = useCallback((nodes?: NodeItem[]) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;

    const items = (nodes && nodes.length > 0)
      ? nodes
      : [{ x: rectPos.x, y: rectPos.y, width: 96, height: 96 }];

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const n of items) {
      minX = Math.min(minX, n.x);
      minY = Math.min(minY, n.y);
      maxX = Math.max(maxX, n.x + (n.width ?? 0));
      maxY = Math.max(maxY, n.y + (n.height ?? 0));
    }

    if (!isFinite(minX)) {
      setOffset({ x: cx, y: cy });
      return;
    }

    const bboxW = Math.max(1, maxX - minX);
    const bboxH = Math.max(1, maxY - minY);
    const padding = 120;

    const fitsHoriz = bboxW * scale <= (rect.width - padding);
    const fitsVert = bboxH * scale <= (rect.height - padding);
    const centerWorldX = (minX + maxX) / 2;
    const centerWorldY = (minY + maxY) / 2;

    if (fitsHoriz && fitsVert) {
      const targetOffset = { x: cx - centerWorldX * scale, y: cy - centerWorldY * scale };
      animateCenterAndZoom(targetOffset, scale);
      return;
    }

    const minScale = 0.2;
    const maxScale = 3;
    const scaleX = (rect.width - padding) / bboxW;
    const scaleY = (rect.height - padding) / bboxH;
    const targetScale = Math.max(minScale, Math.min(maxScale, Math.min(scaleX, scaleY)));

    const targetOffset = { x: cx - centerWorldX * targetScale, y: cy - centerWorldY * targetScale };
    animateCenterAndZoom(targetOffset, targetScale);
  }, [rectPos, scale, setOffset, setScale]);

  const animateCenterAndZoom = useCallback((targetOffset: { x: number; y: number }, targetScale: number) => {
    const duration = 350;
    const startOffset = { ...offsetRef.current };
    const startScale = scaleRef.current;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const ease = 0.5 - 0.5 * Math.cos(Math.PI * t);
      setOffset({
        x: startOffset.x + (targetOffset.x - startOffset.x) * ease,
        y: startOffset.y + (targetOffset.y - startOffset.y) * ease,
      });
      setScale(startScale + (targetScale - startScale) * ease);
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, []);

  useEffect(() => {
    const update = () => {
      const el = containerRef.current;
      if (!el) {
        setShowCenter(false);
        return;
      }

      const paddingPxSmall = 80;
      const paddingPxLarge = 220;
      const nodeW = 96;
      const nodeH = 96;

      const rect = el.getBoundingClientRect();

      const viewWorldW = rect.width / scale;
      const viewWorldH = rect.height / scale;

      const paddingWorldSmallW = paddingPxSmall / scale;
      const paddingWorldSmallH = paddingPxSmall / scale;
      const paddingWorldLargeW = paddingPxLarge / scale;
      const paddingWorldLargeH = paddingPxLarge / scale;

      const minX = rectPos.x - nodeW / 2;
      const maxX = rectPos.x + nodeW / 2;
      const minY = rectPos.y - nodeH / 2;
      const maxY = rectPos.y + nodeH / 2;

      const bboxW = maxX - minX;
      const bboxH = maxY - minY;

      const fitsSmallHoriz = bboxW <= (viewWorldW - paddingWorldSmallW);
      const fitsSmallVert = bboxH <= (viewWorldH - paddingWorldSmallH);

      const fitsLargeHoriz = bboxW <= (viewWorldW - paddingWorldLargeW);
      const fitsLargeVert = bboxH <= (viewWorldH - paddingWorldLargeH);

      const bboxCenterX = (minX + maxX) / 2;
      const bboxCenterY = (minY + maxY) / 2;
      const viewCenterWorldX = (rect.width / 2 - offset.x) / scale;
      const viewCenterWorldY = (rect.height / 2 - offset.y) / scale;
      const dxWorld = bboxCenterX - viewCenterWorldX;
      const dyWorld = bboxCenterY - viewCenterWorldY;
      const distWorld = Math.hypot(dxWorld, dyWorld);

      const minView = Math.min(viewWorldW, viewWorldH);
      const showDist = Math.max(1, minView);
      const hideDist = Math.max(1, minView);

      if (showCenter) {
        if (fitsLargeHoriz && fitsLargeVert && distWorld <= hideDist) {
          setShowCenter(false);
        } else {
          setShowCenter(true);
        }
        return;
      }

      if (!(fitsSmallHoriz && fitsSmallVert) || distWorld > showDist) {
        setShowCenter(true);
      } else {
        setShowCenter(false);
      }
    };

    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [offset, scale]);

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
            onClick={(e) => { e.stopPropagation(); recenter(); }}
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
