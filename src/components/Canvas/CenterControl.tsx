import React, { useCallback, useEffect, useRef, useState } from 'react';

type Vec = { x: number; y: number };

type NodeItem = { x: number; y: number; width?: number; height?: number };

type Props = {
  containerRef: React.RefObject<HTMLDivElement | null>;
  offset: Vec;
  setOffset: (s: React.SetStateAction<Vec> | Vec) => void;
  scale: number;
  setScale: (s: React.SetStateAction<number> | number) => void;
  rectPos?: Vec;
  nodes?: NodeItem[];
};

const CenterControl: React.FC<Props> = ({ containerRef, offset, setOffset, scale, setScale, rectPos, nodes }) => {
  const [showCenter, setShowCenter] = useState(false);

  const offsetRef = useRef(offset);
  const scaleRef = useRef(scale);
  useEffect(() => { offsetRef.current = offset; }, [offset]);
  useEffect(() => { scaleRef.current = scale; }, [scale]);

  const animateCenterAndZoom = useCallback((targetOffset: Vec, targetScale: number) => {
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
  }, [setOffset, setScale]);

  const recenter = useCallback((items?: NodeItem[]) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const list = (items && items.length > 0)
      ? items
      : (nodes && nodes.length > 0)
        ? nodes
        : [{ x: (rectPos && rectPos.x) || 0, y: (rectPos && rectPos.y) || 0, width: 96, height: 96 }];
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const n of list) {
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
  }, [containerRef, rectPos, scale, setOffset, setScale, animateCenterAndZoom]);

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

      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      if (nodes && nodes.length > 0) {
        for (const n of nodes) {
          minX = Math.min(minX, n.x);
          minY = Math.min(minY, n.y);
          maxX = Math.max(maxX, n.x + (n.width ?? 0));
          maxY = Math.max(maxY, n.y + (n.height ?? 0));
        }
      } else if (rectPos) {
        minX = rectPos.x - nodeW / 2;
        maxX = rectPos.x + nodeW / 2;
        minY = rectPos.y - nodeH / 2;
        maxY = rectPos.y + nodeH / 2;
      } else {
        minX = -nodeW/2; maxX = nodeW/2; minY = -nodeH/2; maxY = nodeH/2;
      }

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
  }, [containerRef, offset, rectPos, scale, showCenter]);

  if (!showCenter) return null;

  return (
    <button
      onMouseDown={(e) => e.stopPropagation()}
      onMouseUp={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
      onClick={(e) => { e.stopPropagation(); recenter(nodes); }}
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
  );
};

export default CenterControl;
