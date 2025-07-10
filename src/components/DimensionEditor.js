import React, { useState, useRef, useEffect } from 'react';

const DimensionEditor = ({
  refTarget,
  getCubeSize,
  updateCubeSize,
  onClose,
  item = {},
}) => {
  const sku = item.sku || 'Unnamed';
  const draggingRef = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const panelRef = useRef(null);


  const defaultPosition = () => {
    const padding = 10;
    const panelWidth = panelRef.current?.offsetWidth || 300;
    const panelHeight = panelRef.current?.offsetHeight || 280;
    const x = Math.min(window.innerWidth - panelWidth - padding, window.innerWidth * 0.85);
    const y = Math.min(window.innerHeight - panelHeight - padding, window.innerHeight * 0.67);
    return { x, y };
  };


  const [position, setPosition] = useState(() => {
    const saved = localStorage.getItem('dimensionEditorPosition');
    return saved ? JSON.parse(saved) : defaultPosition();
  });

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!draggingRef.current) return;

      const rect = panelRef.current.getBoundingClientRect();
      const panelWidth = rect.width;
      const panelHeight = rect.height;
      const padding = 5;

      const x = e.clientX - dragOffset.current.x;
      const y = e.clientY - dragOffset.current.y;

      const clampedX = Math.max(padding, Math.min(x, window.innerWidth - panelWidth - padding));
      const clampedY = Math.max(padding, Math.min(y, window.innerHeight - panelHeight - padding));

      const newPos = { x: clampedX, y: clampedY };
      setPosition(newPos);
      localStorage.setItem('dimensionEditorPosition', JSON.stringify(newPos));
    };


    const handleMouseUp = () => {
      draggingRef.current = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  if (!refTarget?.current) return null;

  const handleMouseDown = (e) => {
    draggingRef.current = true;
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  return (
    <div
      ref={panelRef}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        zIndex: 10,
        background: '#1e1e1e',
        color: '#f0f0f0',
        padding: '1.5rem',
        borderRadius: '0.75rem',
        boxShadow: '0 12px 24px rgba(0, 0, 0, 0.4)',
        width: 'clamp(220px, 20vw, 300px)',
        fontFamily: 'Inter, sans-serif',
        fontSize: '0.875rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        cursor: draggingRef.current ? 'grabbing' : 'grab',
        userSelect: 'none',
      }}
      onMouseDown={handleMouseDown}
    >
      <h3
        style={{
          margin: 0,
          fontSize: '1.25rem',
          fontWeight: '700',
          color: '#ffffff',
          letterSpacing: '0.5px',
        }}
      >
        Edit Dimensions
      </h3>

      <div>
        <div
          style={{
            fontSize: '1rem',
            fontWeight: '600',
            color: '#00eaff',
            fontFamily: 'monospace',
            marginBottom: '0.25rem',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {sku}
        </div>
        <div style={{ fontSize: '0.75rem', color: '#aaa' }}>
          Right-click a cube to open this panel or switch.
        </div>
      </div>

      {['Width', 'Height', 'Depth'].map((label, i) => (
        <div key={label}>
          <label
            style={{
              display: 'block',
              marginBottom: '0.25rem',
              fontWeight: '500',
              color: '#cccccc',
            }}
          >
            {label}
          </label>
          <input
            type="number"
            min="0.1"
            step="0.1"
            value={getCubeSize(refTarget)[i]}
            onChange={(e) => {
              const newSize = [...getCubeSize(refTarget)];
              newSize[i] = parseFloat(e.target.value);
              updateCubeSize(refTarget, newSize);
            }}
            style={{
              width: '100%',
              padding: '0.625rem',
              background: '#2a2a2a',
              color: '#f0f0f0',
              border: '1px solid #555',
              borderRadius: '0.5rem',
              outline: 'none',
              transition: 'border-color 0.2s ease',
              boxSizing: 'border-box',
              fontSize: '0.875rem',
            }}
          />
        </div>
      ))}

      <button
        onClick={onClose}
        style={{
          width: '100%',
          padding: '0.75rem',
          background: '#3fcf6e',
          color: '#fff',
          border: 'none',
          borderRadius: '0.5rem',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '0.875rem',
          transition: 'background 0.2s ease',
        }}
        onMouseOver={(e) => (e.currentTarget.style.background = '#34b75e')}
        onMouseOut={(e) => (e.currentTarget.style.background = '#3fcf6e')}
      >
        ✅ Save & Close
      </button>
    </div>
  );
};

export default DimensionEditor;
