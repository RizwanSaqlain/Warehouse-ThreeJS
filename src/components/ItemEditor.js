import React, { useState, useEffect, useRef } from 'react';

const presetColors = ['#f44336', '#2196f3', '#4caf50', '#ffeb3b', '#9c27b0', '#9e9e9e'];

const panelStyle = (x, y, dragging) => ({
  position: 'absolute',
  top: y,
  left: x,
  width: 'clamp(220px, 18vw, 300px)',
  padding: '1.5rem',
  backgroundColor: 'rgba(30, 30, 30, 0.95)',
  borderRadius: '0.75rem',
  boxShadow: '0 6px 16px rgba(0,0,0,0.35)',
  fontFamily: 'Inter, sans-serif',
  color: '#f0f0f0',
  fontSize: '0.875rem',
  zIndex: 10,
  border: '1px solid #333',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  cursor: dragging ? 'grabbing' : 'grab',
  userSelect: 'none'
});

const inputStyle = {
  width: '100%',
  padding: '0.625rem 0.75rem',
  fontSize: '0.875rem',
  borderRadius: '0.5rem',
  border: '1px solid #555',
  backgroundColor: '#2b2b2b',
  color: '#f0f0f0',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s ease'
};

const labelStyle = {
  fontWeight: 600,
  fontSize: '0.8rem',
  marginBottom: '0.25rem',
  display: 'block',
  color: '#ccc'
};

const buttonStyle = {
  padding: '0.625rem 0.875rem',
  fontSize: '0.8rem',
  fontWeight: 600,
  borderRadius: '0.5rem',
  border: 'none',
  backgroundColor: '#444',
  color: '#fff',
  cursor: 'pointer',
  transition: 'background 0.2s ease'
};

export default function ItemEditor({ cube, onUpdate, onShip }) {
  const [item, setItem] = useState({ sku: '', quantity: '', category: '', weight: '', notes: '', color: '#ffffff' });
  const [showDetails, setShowDetails] = useState(true);
  const [position, setPosition] = useState({ x: window.innerWidth - 380, y: 20 });
  const dragOffset = useRef({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    if (cube) {
      setItem({
        sku: cube.item?.sku || '',
        quantity: cube.item?.quantity || '',
        category: cube.item?.category || '',
        weight: cube.item?.weight || '',
        notes: cube.item?.notes || '',
        color: cube.item?.color || '#ffffff'
      });
    }
  }, [cube]);

  const handleChange = (field, value) => {
    const updated = { ...item, [field]: value };
    setItem(updated);
    if (cube) onUpdate(cube.id, updated);
  };

  const handleShip = () => {
    if (onShip && cube) onShip(cube);
  };

  const handleMouseDown = (e) => {
    setDragging(true);
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  const handleMouseMove = (e) => {
    if (!dragging || !panelRef.current) return;

    const rect = panelRef.current.getBoundingClientRect();
    const panelWidth = rect.width;
    const panelHeight = rect.height;
    const padding = 5;

    const rawX = e.clientX - dragOffset.current.x;
    const rawY = e.clientY - dragOffset.current.y;

    const x = Math.min(Math.max(padding, rawX), window.innerWidth - panelWidth - padding);
    const y = Math.min(Math.max(padding, rawY), window.innerHeight - panelHeight - padding);

    setPosition({ x, y });
  };

  const handleMouseUp = () => setDragging(false);

  if (!cube) return null;

  return (
    <div
      ref={panelRef}
      style={panelStyle(position.x, position.y, dragging)}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>📝 Edit Cube Info</h3>

      <div
        style={{
          overflow: 'hidden',
          transition: 'max-height 0.4s ease',
          maxHeight: showDetails ? '1000px' : '0px'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.75rem' }}>
          <div><label style={labelStyle}>🔖 SKU</label><input style={inputStyle} value={item.sku} onChange={(e) => handleChange('sku', e.target.value)} /></div>
          <div><label style={labelStyle}>📦 Quantity</label><input type="number" style={inputStyle} value={item.quantity} onChange={(e) => handleChange('quantity', parseInt(e.target.value) || 0)} /></div>
          <div><label style={labelStyle}>📁 Category</label><input style={inputStyle} value={item.category} onChange={(e) => handleChange('category', e.target.value)} /></div>
          <div>
            <label style={labelStyle}>🎨 Color</label>
            <select
              style={inputStyle}
              value={presetColors.includes(item.color) ? item.color : 'custom'}
              onChange={(e) => {
                const selected = e.target.value;
                if (selected === 'custom') {
                  if (presetColors.includes(item.color)) handleChange('color', '#ffffff');
                  return;
                }
                handleChange('color', selected);
              }}
            >
              <option value="#f44336">Red</option>
              <option value="#2196f3">Blue</option>
              <option value="#4caf50">Green</option>
              <option value="#ffeb3b">Yellow</option>
              <option value="#9c27b0">Purple</option>
              <option value="#9e9e9e">Gray</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          {!presetColors.includes(item.color) && (
            <div>
              <label style={labelStyle}>🎨 Custom Color</label>
              <input
                type="color"
                value={item.color || '#ffffff'}
                onChange={(e) => handleChange('color', e.target.value)}
                style={{ ...inputStyle, padding: 0, height: '2.5rem', cursor: 'pointer' }}
              />
            </div>
          )}
          <div><label style={labelStyle}>⚖️ Weight (kg)</label><input type="number" style={inputStyle} value={item.weight} onChange={(e) => handleChange('weight', parseFloat(e.target.value) || '')} /></div>
          <div><label style={labelStyle}>🗒️ Notes</label><textarea style={{ ...inputStyle, height: '4rem', resize: 'vertical' }} placeholder="Enter any special instructions..." value={item.notes} onChange={(e) => handleChange('notes', e.target.value)} /></div>
        </div>
      </div>

      <button style={buttonStyle} onClick={() => setShowDetails(prev => !prev)}>
        {showDetails ? '🔽 Hide Details' : '▶ Show Details'}
      </button>

      <button style={{ ...buttonStyle, backgroundColor: '#2e7d32' }} onClick={handleShip}>
        🚚 Ship Item
      </button>
    </div>
  );
}
