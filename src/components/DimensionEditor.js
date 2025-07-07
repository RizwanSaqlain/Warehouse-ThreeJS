import React from 'react';

const DimensionEditor = ({
  refTarget,
  getCubeSize,
  updateCubeSize,
  onClose,
  item = {},
}) => {
  const sku = item.sku || 'Unnamed';

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 20,
        right: 20,
        zIndex: 10,
        background: '#1e1e1e',
        color: '#f0f0f0',
        padding: '16px',
        borderRadius: '10px',
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
        width: 220,
        fontFamily: 'sans-serif',
        fontSize: '14px',
      }}
    >
      <h4 style={{ marginTop: 0, marginBottom: 4, color: '#ffffff' }}>
        Edit Dimensions
      </h4>
      <div style={{ fontSize: '13px', marginBottom: 12, color: '#aaa' }}>
        <strong>Item:</strong> {sku}
      </div>

      {['Width', 'Height', 'Depth'].map((label, i) => (
        <div key={label} style={{ marginBottom: 10 }}>
          <label style={{ display: 'block', marginBottom: 4 }}>{label}</label>
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
              padding: '6px',
              background: '#2c2c2c',
              color: '#f0f0f0',
              border: '1px solid #444',
              borderRadius: '6px',
              boxSizing: 'border-box',
            }}
          />
        </div>
      ))}

      <button
        onClick={onClose}
        style={{
          width: '100%',
          marginTop: 12,
          padding: '8px',
          background: '#444',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
        }}
      >
        Close
      </button>
    </div>
  );
};

export default DimensionEditor;
