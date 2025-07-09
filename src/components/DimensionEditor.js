import React, { useState, useRef } from 'react';

const DimensionEditor = ({
  refTarget,
  getCubeSize,
  updateCubeSize,
  onClose,
  item = {},
}) => {
  const sku = item.sku || 'Unnamed';
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState(() => {
    const panelWidth = 300;
    const panelHeight = 280;
    const x = Math.min(window.innerWidth - panelWidth - 20, window.innerWidth * 0.85);
    const y = Math.min(window.innerHeight - panelHeight - 20, window.innerHeight * 0.67);
    return { x, y };
  });

  const dragOffset = useRef({ x: 0, y: 0 });
  if (!refTarget?.current) return null;

  
  

  const handleMouseDown = (e) => {
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

  return (
    <div
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
        cursor: dragging ? 'grabbing' : 'grab',
        userSelect: 'none',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
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
