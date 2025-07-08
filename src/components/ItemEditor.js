import React, { useState, useEffect, useRef } from 'react';

const panelStyle = {
  position: 'absolute',
  top: 20,
  right: 20,
  width: 280,
  padding: '20px',
  backgroundColor: 'rgba(30, 30, 30, 0.95)',
  borderRadius: '12px',
  boxShadow: '0 6px 16px rgba(0,0,0,0.35)',
  fontFamily: 'Inter, sans-serif',
  color: '#f0f0f0',
  fontSize: '14px',
  zIndex: 10,
  border: '1px solid #333',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px'
};

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  fontSize: '14px',
  borderRadius: '8px',
  border: '1px solid #555',
  backgroundColor: '#2b2b2b',
  color: '#f0f0f0',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s ease'
};

const labelStyle = {
  fontWeight: 600,
  fontSize: '13px',
  marginBottom: '6px',
  display: 'block',
  color: '#ccc'
};

const toggleButtonStyle = {
  marginTop: '10px',
  padding: '8px 12px',
  fontSize: '13px',
  fontWeight: 600,
  borderRadius: '8px',
  border: 'none',
  backgroundColor: '#444',
  color: '#fff',
  cursor: 'pointer',
  transition: 'background 0.2s ease'
};

export default function ItemEditor({ cube, onUpdate }) {
  const [item, setItem] = useState({ sku: '', quantity: '', category: '' });
  const [showDetails, setShowDetails] = useState(true);
  const contentRef = useRef();

  useEffect(() => {
    if (cube) setItem(cube.item || { sku: '', quantity: '', category: '' });
  }, [cube]);

  const handleChange = (field, value) => {
    const updated = { ...item, [field]: value };
    setItem(updated);
    if (cube) onUpdate(cube.id, updated);
  };

  if (!cube) return null;

  return (
    <div style={panelStyle}>
      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
        📝 Edit Cube Info
      </h3>

      <div
        ref={contentRef}
        style={{
          overflow: 'hidden',
          transition: 'max-height 0.4s ease',
          maxHeight: showDetails ? '1000px' : '0px'
        }}
      >
        <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={labelStyle}>🔖 SKU</label>
            <input
              style={inputStyle}
              placeholder="e.g. A12345"
              value={item.sku}
              onChange={(e) => handleChange('sku', e.target.value)}
            />
          </div>

          <div>
            <label style={labelStyle}>📦 Quantity</label>
            <input
              style={inputStyle}
              type="number"
              placeholder="e.g. 100"
              value={item.quantity}
              onChange={(e) => handleChange('quantity', parseInt(e.target.value) || 0)}
            />
          </div>

          <div>
            <label style={labelStyle}>📁 Category</label>
            <input
              style={inputStyle}
              placeholder="e.g. Electronics"
              value={item.category}
              onChange={(e) => handleChange('category', e.target.value)}
            />
          </div>
        </div>
      </div>

      <button
        style={toggleButtonStyle}
        onClick={() => setShowDetails((prev) => !prev)}
      >
        {showDetails ? '🔽 Hide Details' : '▶ Show Details'}
      </button>
    </div>
  );
}
