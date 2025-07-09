import React, { useState, useRef, useEffect } from 'react';

const WAREHOUSE_WIDTH = 20;
const WAREHOUSE_DEPTH = 20;

const mapStyles = {
  container: (x, y, dragging, width) => ({
    position: 'absolute',
    top: y,
    left: x,
    cursor: dragging ? 'grabbing' : 'grab',
    background: '#1e1e1e',
    color: '#f1f1f1',
    border: '1px solid #333',
    borderRadius: '6px',
    zIndex: 999,
    padding: '10px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.6)',
    userSelect: 'none',
    width: `${width}px`,
    resize: 'both',
    overflow: 'auto',
  }),
  canvas: {
    position: 'relative',
    height: '400px',
    backgroundColor: '#2c2c2c',
    backgroundImage: `radial-gradient(#444 1px, transparent 1px)`,
    backgroundSize: '20px 20px',
    border: '1px solid #444',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '10px',
  },
  cube: {
    position: 'absolute',
    boxSizing: 'border-box',
    borderRadius: '4px',
    opacity: 0.85,
    transition: 'all 0.2s ease-in-out',
  },
  closeButton: {
    background: '#ff5555',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '6px 12px',
    marginRight: '10px',
    fontWeight: 'bold',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'background 0.2s ease-in-out',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  title: {
    fontSize: '16px',
    fontWeight: 'bold',
  },
  footer: {
    fontSize: '13px',
    color: '#bbb',
    textAlign: 'right',
  },
};

export default function TopDownMapView({ cubes, selectedRef, onClose }) {
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: window.innerHeight / 2 - 100 });
  const [width, setWidth] = useState(420);
  const containerRef = useRef(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        setWidth(entry.contentRect.width);
      }
    });
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    return () => resizeObserver.disconnect();
  }, []);

  const handleMouseDown = (e) => {
    if (e.target.classList.contains('resizer')) return;
    setDragging(true);
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleMouseMove = (e) => {
    if (dragging) {
      setPosition({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y,
      });
    }
  };

  const handleMouseUp = () => setDragging(false);

  const totalArea = WAREHOUSE_WIDTH * WAREHOUSE_DEPTH;
  const usedArea = cubes.reduce((sum, cube) => {
    const [w, , d] = cube.size;
    return sum + (w * d);
  }, 0);
  const utilization = ((usedArea / totalArea) * 100).toFixed(1);

  return (
    <div
      ref={containerRef}
      style={mapStyles.container(position.x, position.y, dragging, width)}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div style={mapStyles.header}>
        <button style={mapStyles.closeButton} onClick={onClose}>Close</button>
        <div style={mapStyles.title}>Warehouse Map View</div>
      </div>

      <div style={mapStyles.canvas}>
        {cubes.map(cube => {
          const [x, , z] = cube.position;
          const [w, , d] = cube.size;

          const mapW = (w / WAREHOUSE_WIDTH) * 100;
          const mapH = (d / WAREHOUSE_DEPTH) * 100;

          const mapX = ((x - w / 2 + WAREHOUSE_WIDTH / 2) / WAREHOUSE_WIDTH) * 100;
          const mapZ = ((z - d / 2 + WAREHOUSE_DEPTH / 2) / WAREHOUSE_DEPTH) * 100;

          const isSelected = cube.ref === selectedRef;

          return (
            <div
              key={cube.id}
              style={{
                ...mapStyles.cube,
                left: `${mapX}%`,
                top: `${mapZ}%`,
                width: `${mapW}%`,
                height: `${mapH}%`,
                background: isSelected ? 'orange' : cube.color || '#888',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: `${Math.max(9, Math.min(mapW, mapH) * 0.7)}px`,
                color: '#fff',
                textAlign: 'center',
                overflow: 'hidden',
                padding: '2px',
              }}
              title={cube.item?.sku}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = 0.6)}
            >
              {/* {cube.item?.sku || ''} */}
            </div>
          );
        })}
      </div>

      <div style={mapStyles.footer}>
        {cubes.length} container{cubes.length !== 1 ? 's' : ''} • {utilization}% space used
      </div>
    </div>
  );
}
