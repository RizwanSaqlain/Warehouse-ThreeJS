import React from 'react';

const Toolbar = ({
  onAdd,
  onDelete,
  selectedRef,
  searchQuery,
  setSearchQuery,
  snapEnabled,
  setSnapEnabled,
  handleExport,
  handleImport
}) => (
  <div
    style={{
      position: 'absolute',
      top: 20,
      left: 20,
      zIndex: 10,
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      padding: '20px',
      width: '260px',
      background: 'rgba(30, 30, 30, 0.95)',
      borderRadius: '12px',
      boxShadow: '0 6px 16px rgba(0,0,0,0.35)',
      fontFamily: 'Inter, sans-serif',
      color: '#f4f4f4'
    }}
  >
    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>📦 Warehouse Tools</h3>

    {/* Cube Actions */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <button
        onClick={onAdd}
        style={buttonStyle('#4caf50')}
      >
        ➕ Add Cube
      </button>
      <button
        onClick={onDelete}
        disabled={!selectedRef}
        style={buttonStyle(selectedRef ? '#f44336' : '#555', !selectedRef)}
      >
        🗑️ Delete Selected
      </button>
    </div>

    {/* Layout Actions */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <button
        onClick={handleExport}
        style={buttonStyle('#2196f3')}
      >
        📤 Export Layout
      </button>

      <label
        style={{
          fontSize: '14px',
          fontWeight: 500,
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}
      >
        📥 Import Layout
        <input
          type="file"
          accept=".json"
          onChange={handleImport}
          style={{
            padding: '6px',
            background: '#1e1e1e',
            color: '#ddd',
            border: '1px solid #444',
            borderRadius: '6px',
            fontSize: '13px'
          }}
        />
      </label>
    </div>

    {/* Search */}
    <input
      type="text"
      placeholder="🔍 Search SKU or Category..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      style={{
        padding: '10px 12px',
        borderRadius: '8px',
        fontSize: '14px',
        backgroundColor: '#2b2b2b',
        border: '1px solid #555',
        color: '#f0f0f0'
      }}
    />

    {/* Snapping Toggle */}
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        fontSize: '14px',
        fontWeight: 500,
        gap: '10px'
      }}
    >
      <input
        type="checkbox"
        checked={snapEnabled}
        onChange={(e) => setSnapEnabled(e.target.checked)}
        style={{ width: '18px', height: '18px' }}
      />
      Enable Snapping
    </label>
  </div>
);

// 🧩 Button Style Helper
const buttonStyle = (bg, disabled = false) => ({
  padding: '10px 14px',
  background: bg,
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontWeight: 'bold',
  fontSize: '14px',
  cursor: disabled ? 'not-allowed' : 'pointer',
  opacity: disabled ? 0.5 : 1,
  transition: 'background 0.3s ease'
});

export default Toolbar;
