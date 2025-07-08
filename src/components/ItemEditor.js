import React, { useState, useEffect, useRef } from 'react';
import { color } from 'three/tsl';

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

const buttonStyle = {
  marginTop: '10px',
  padding: '10px 14px',
  fontSize: '13px',
  fontWeight: 600,
  borderRadius: '8px',
  border: 'none',
  backgroundColor: '#444',
  color: '#fff',
  cursor: 'pointer',
  transition: 'background 0.2s ease'
};

const presetColors = [
  '#f44336', // Red
  '#2196f3', // Blue
  '#4caf50', // Green
  '#ffeb3b', // Yellow
  '#9c27b0', // Purple
  '#9e9e9e'  // Gray
];


export default function ItemEditor({ cube, onUpdate, onShip }) {
  const [item, setItem] = useState({
    sku: '',
    quantity: '',
    category: '',
    weight: '',
    notes: '',
    color: '#ffffff'
  });

  const [showDetails, setShowDetails] = useState(true);
  const contentRef = useRef();

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
    if (onShip && cube) {
      onShip(cube);
    }
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

          <div>
            <label style={labelStyle}>🎨 Color</label>
            <select
              style={inputStyle}
              value={presetColors.includes(item.color) ? item.color : 'custom'}
              onChange={(e) => {
                const selected = e.target.value;
                if (selected === 'custom') {
                  // If it's currently a preset, switch to default custom color
                  if (presetColors.includes(item.color)) {
                    handleChange('color', '#ffffff');
                  }
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
                style={{
                  ...inputStyle,
                  padding: 0,
                  height: '40px',
                  width: '100%',
                  cursor: 'pointer'
                }}
              />
            </div>
          )}


          <div>
            <label style={labelStyle}>⚖️ Weight (kg)</label>
            <input
              style={inputStyle}
              type="number"
              placeholder="e.g. 2.5"
              value={item.weight}
              onChange={(e) => handleChange('weight', parseFloat(e.target.value) || '')}
            />
          </div>

          <div>
            <label style={labelStyle}>🗒️ Notes</label>
            <textarea
              style={{ ...inputStyle, height: '60px', resize: 'vertical' }}
              placeholder="Enter any special instructions..."
              value={item.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
            />
          </div>
        </div>
      </div>

      <button style={buttonStyle} onClick={() => setShowDetails(prev => !prev)}>
        {showDetails ? '🔽 Hide Details' : '▶ Show Details'}
      </button>

      <button
        style={{ ...buttonStyle, backgroundColor: '#2e7d32' }}
        onClick={handleShip}
      >
        🚚 Ship Item
      </button>
    </div>
  );
}
