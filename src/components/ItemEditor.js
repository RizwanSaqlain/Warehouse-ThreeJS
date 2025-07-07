// src/components/ItemEditor.js
import React, { useState, useEffect } from 'react';

const panelStyle = {
  position: 'absolute',
  top: 12,
  right: 12,
  width: 250,
  padding: 16,
  borderRadius: 8,
  background: '#1e1e1e',
  color: '#f0f0f0',
  boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
  fontFamily: 'sans-serif',
  fontSize: '14px',
  zIndex: 10,
  border: '1px solid #333',
};

const inputStyle = {
  width: '100%',
  padding: '6px 8px',
  marginTop: 4,
  marginBottom: 12,
  fontSize: '14px',
  borderRadius: 4,
  border: '1px solid #444',
  background: '#2a2a2a',
  color: '#f0f0f0',
  boxSizing: 'border-box',
};

const labelStyle = {
  fontWeight: 'bold',
  marginBottom: 2,
  display: 'block',
};

export default function ItemEditor({ cube, onUpdate }) {
  const [item, setItem] = useState({ sku: '', quantity: '', category: '' });

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
      <div>
        <label style={labelStyle}>SKU</label>
        <input
          style={inputStyle}
          value={item.sku}
          onChange={(e) => handleChange('sku', e.target.value)}
        />
      </div>

      <div>
        <label style={labelStyle}>Quantity</label>
        <input
          style={inputStyle}
          type="number"
          value={item.quantity}
          onChange={(e) => handleChange('quantity', parseInt(e.target.value) || 0)}
        />
      </div>

      <div>
        <label style={labelStyle}>Category</label>
        <input
          style={inputStyle}
          value={item.category}
          onChange={(e) => handleChange('category', e.target.value)}
        />
      </div>
    </div>
  );
}
