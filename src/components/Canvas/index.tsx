import React, { useRef, useState, useCallback, useEffect } from "react";
import Node from "./Node";
import EditMenu from "./EditMenu";
import CenterControl from "./CenterControl";

const mod = (n: number, m: number) => ((n % m) + m) % m;

const Canvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const initialPosSet = useRef(false);

  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);

  type NodeItem = { id: string; x: number; y: number; width?: number; height?: number; label?: string };
  const [nodes, setNodes] = useState<NodeItem[]>([]);

  const gridPx = 24;

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const computeSnapOffset = (worldSize: number, gridPx: number) => {
    const cells = Math.round(worldSize / gridPx);
    return (cells % 2 === 0) ? 0 : gridPx / 2;
  };

  const handleAddNode = useCallback((e: React.MouseEvent) => {
    const el = containerRef.current;
    if (!el)
      return;
    const rect = el.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const worldX = (cx - offset.x) / scale;
    const worldY = (cy - offset.y) / scale;
    const w = 96;
    const h = 96;
    const snapOffX = computeSnapOffset(w, gridPx);
    const snapOffY = computeSnapOffset(h, gridPx);
    const x = Math.round((worldX - snapOffX) / gridPx) * gridPx + snapOffX;
    const y = Math.round((worldY - snapOffY) / gridPx) * gridPx + snapOffY;
    const id = `n${Date.now()}`;
    setNodes(ns => [...ns, { id, x, y, width: w, height: h, label: 'Node' }] );
  }, [offset.x, offset.y, scale, gridPx]);

  const handleCanvasClick = useCallback(() => {
    setSelectedId(null);
  }, []);

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
    setNodes([{ id: 'n1', x: worldX, y: worldY, width: 96, height: 96, label: 'Loïs' }]);
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
  <div style={canvasStyle} onClick={handleCanvasClick} onDoubleClick={handleAddNode}>
        {nodes.map(n => (
          <Node
            key={n.id}
            pos={{ x: n.x, y: n.y }}
            setPos={(p) => setNodes(ns => ns.map(item => item.id === n.id ? { ...item, x: p.x, y: p.y } : item))}
            onSelect={() => setSelectedId(n.id)}
            width={n.width || 96}
            height={n.height || 96}
            scale={scale}
            offset={offset}
            gridPx={gridPx}
            label={n.label}
          />
        ))}
        <CenterControl
          containerRef={containerRef}
          offset={offset}
          setOffset={setOffset}
          scale={scale}
          setScale={setScale}
          nodes={nodes}
        />
      </div>
      {selectedId && (
        <EditMenu
          node={nodes.find(n => n.id === selectedId) || null}
          updateNode={(patch) => setNodes(ns => ns.map(n => n.id === selectedId ? { ...n, ...patch } : n))}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
};

export default Canvas;
