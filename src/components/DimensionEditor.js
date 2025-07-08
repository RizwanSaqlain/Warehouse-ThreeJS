import React from 'react';

const DimensionEditor = ({
  refTarget,
  getCubeSize,
  updateCubeSize,
  onClose,
  item = {},
}) => {
  const sku = item.sku || 'Unnamed';
  if (!refTarget?.current) return null;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 20,
        right: 20,
        zIndex: 10,
        background: '#1e1e1e',
        color: '#f0f0f0',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 12px 24px rgba(0, 0, 0, 0.4)',
        width: 280,
        fontFamily: 'Inter, sans-serif',
        fontSize: '14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}
    >
      <h3 style={{
        margin: 0,
        fontSize: '20px',
        fontWeight: '700',
        color: '#ffffff',
        letterSpacing: '0.5px',
      }}>
        Edit Dimensions
      </h3>

      <div>
        <div style={{
          fontSize: '15px',
          fontWeight: '600',
          color: '#00eaff',
          fontFamily: 'monospace',
          marginBottom: 4,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {sku}
        </div>
        <div style={{ fontSize: '12px', color: '#aaa' }}>
          Right-click a cube to open this panel or switch.
        </div>
      </div>

      {['Width', 'Height', 'Depth'].map((label, i) => (
        <div key={label}>
          <label
            style={{
              display: 'block',
              marginBottom: 4,
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
              padding: '10px',
              background: '#2a2a2a',
              color: '#f0f0f0',
              border: '1px solid #555',
              borderRadius: '8px',
              outline: 'none',
              transition: 'border-color 0.2s ease',
              boxSizing: 'border-box'
            }}
          />
        </div>
      ))}

      <button
        onClick={onClose}
        style={{
          width: '100%',
          padding: '10px',
          background: '#3fcf6e',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '14px',
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
