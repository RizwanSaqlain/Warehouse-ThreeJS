import React, { useState, useRef, useEffect } from 'react';
const STORAGE_KEY = 'topDownMapViewState';


const mapStyles = {
  container: (x, y, dragging, width) => ({
    position: 'absolute',
    top: y,
    left: x,
    cursor: dragging ? 'grabbing' : 'default',
    background: '#1e1e1e',
    color: '#f1f1f1',
    border: '1px solid #333',
    borderRadius: '6px',
    zIndex: 999,
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.6)',
    userSelect: 'none',
    width: `${width}px`,
    display: 'flex',
    flexDirection: 'column',
    resize: 'horizontal',
    overflow: 'hidden',
    padding: '10px',
    minWidth: '300px',
    maxWidth: '30vw',


  }),
  canvas: (cellSize, _, height) => ({
    position: 'relative',
    width: '100%', // ✅ Full width of resizable container
    height: `${height}px`,
    backgroundColor: '#2c2c2c',
    backgroundImage: `radial-gradient(#444 1px, transparent 1px)`,
    backgroundSize: `${cellSize}px ${cellSize}px`,
    border: '1px solid #444',
    borderRadius: '4px',
    marginBottom: '10px',
    overflow: 'hidden',
  }),

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
    padding: '8px',
    cursor: 'grab',
  },
  title: {
    fontSize: '16px',
    fontWeight: 'bold',
  },
  footer: {
    fontSize: '13px',
    color: '#bbb',
    textAlign: 'right',
    padding: '0 8px 8px',
  },
};

export default function TopDownMapView({ cubes, selectedRef, onClose, bounds }) {
  const WAREHOUSE_WIDTH = bounds.width;
  const WAREHOUSE_DEPTH = bounds.depth;
  const defaultX = 20;
  const defaultY = window.innerHeight / 2 - 100;
  const defaultWidth = 420;
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState(() => {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved?.position || { x: defaultX, y: defaultY };
  });

  const [containerWidth, setContainerWidth] = useState(() => {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved?.width || defaultWidth;
  });

  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  const [canvasSize, setCanvasSize] = useState({ width: defaultWidth, height: 200 });

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width;
      const aspectRatio = WAREHOUSE_DEPTH / WAREHOUSE_WIDTH;
      const height = width * aspectRatio;
      setCanvasSize({ width, height });
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [WAREHOUSE_WIDTH, WAREHOUSE_DEPTH]);




  const handleMouseDown = (e) => {
    if (!e.target.closest('.map-header')) return;
    setDragging(true);
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleMouseMove = (e) => {
    if (dragging && containerRef.current) {
      const { offsetWidth, offsetHeight } = containerRef.current;
      const padding = 12;

      const rawX = e.clientX - dragOffset.current.x;
      const rawY = e.clientY - dragOffset.current.y;

      const clampedX = Math.min(
        Math.max(padding, rawX),
        window.innerWidth - offsetWidth - padding
      );
      const clampedY = Math.min(
        Math.max(padding, rawY),
        window.innerHeight - offsetHeight - padding
      );

      setPosition({ x: clampedX, y: clampedY });
    }
  };



  const handleMouseUp = () => setDragging(false);

  // Now use these values for drawing
  const { width: canvasWidth, height: canvasHeight } = canvasSize;
  const cellSize = canvasWidth / WAREHOUSE_WIDTH;



  const totalArea = WAREHOUSE_WIDTH * WAREHOUSE_DEPTH;
  const usedArea = cubes.reduce((sum, cube) => {
    const [w, , d] = cube.size;
    return sum + (w * d);
  }, 0);
  const utilization = ((usedArea / totalArea) * 100).toFixed(2);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ position, width: containerWidth })
    );
  }, [position, containerWidth]);


  return (
    <div
      ref={containerRef}
      style={{ ...mapStyles.container(position.x, position.y, dragging), width: 'fit-content' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div className="map-header" style={mapStyles.header}>
        <button style={mapStyles.closeButton} onClick={onClose}>Close</button>
        <div style={mapStyles.title}>Warehouse Map View</div>
      </div>

      <div
        ref={canvasRef}
        style={mapStyles.canvas(cellSize, canvasWidth, canvasHeight)}



      >
        {cubes.map(cube => {
          const [x, , z] = cube.position;
          const [w, , d] = cube.size;

          const pxW = (w / WAREHOUSE_WIDTH) * canvasWidth;
          const pxH = (d / WAREHOUSE_DEPTH) * canvasHeight;
          const pxX = ((x - w / 2 + WAREHOUSE_WIDTH / 2) / WAREHOUSE_WIDTH) * canvasWidth;
          const pxZ = ((z - d / 2 + WAREHOUSE_DEPTH / 2) / WAREHOUSE_DEPTH) * canvasHeight;


          const isSelected = cube.ref === selectedRef;

          return (
            <div
              key={cube.id}
              style={{
                ...mapStyles.cube,
                left: `${pxX}px`,
                top: `${pxZ}px`,
                width: `${pxW}px`,
                height: `${pxH}px`,
                background: isSelected ? 'orange' : cube.item?.color || '#888',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: `${Math.max(9, Math.min(pxW, pxH) * 0.3)}px`,
                color: '#fff',
                textAlign: 'center',
                overflow: 'hidden',
                padding: '2px',
              }}
              title={cube.item?.sku}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = 0.6)}
            />
          );
        })}
      </div>

      <div style={mapStyles.footer}>
        Map Size: {WAREHOUSE_WIDTH} x {WAREHOUSE_DEPTH} • {cubes.length} container{cubes.length !== 1 ? 's' : ''} • {utilization}% space used
      </div>
      
    </div>
  );
}
