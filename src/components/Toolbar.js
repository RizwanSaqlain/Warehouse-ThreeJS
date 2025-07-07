import React from 'react';
import { downloadJSON, uploadJSON } from '../utils/storageUtils';

const Toolbar = ({ onAdd, onDelete, selectedRef, searchQuery, setSearchQuery, snapEnabled, setSnapEnabled, onSave, onLoad, cubes, setCubes }) => (
  <div
    style={{
      position: 'absolute',
      zIndex: 10,
      top: 20,
      left: 20,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      padding: '14px',
      backgroundColor: '#1e1e1e',
      borderRadius: '10px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      width: '22rem',
      fontFamily: 'sans-serif',
      color: '#f0f0f0',
    }}
  >
    <button
      onClick={onAdd}
      style={{
        padding: '10px 14px',
        background: '#4caf50',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 'bold',
      }}
    >
      ➕ Add Cube
    </button>

    <button
      onClick={onDelete}
      disabled={!selectedRef}
      style={{
        padding: '10px 14px',
        background: selectedRef ? '#f44336' : '#444',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: selectedRef ? 'pointer' : 'not-allowed',
        fontWeight: 'bold',
      }}
    >
      🗑️ Delete Selected
    </button>

        <button
        onClick={() => downloadJSON(cubes)}
        style={{ padding: '8px 12px', background: '#2196f3', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold' }}
        >
        💾 Save Layout
    </button>

    <button
        onClick={() => uploadJSON(data => setCubes(data))}
        style={{ padding: '8px 12px', background: '#ff9800', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold' }}
        >
        📂 Load Layout
    </button>

    <input
      type="text"
      placeholder="Search SKU or Category..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      style={{
        padding: '10px 12px',
        fontSize: '14px',
        borderRadius: '6px',
        border: '1px solid #555',
        backgroundColor: '#2c2c2c',
        color: '#f0f0f0',
        width: '100%',
        boxSizing: 'border-box',
      }}
    />




    <label style={{ display: 'flex', alignItems: 'center', color: 'white' }}>
        <input
            type="checkbox"
            checked={snapEnabled}
            onChange={(e) => setSnapEnabled(e.target.checked)}
            style={{ marginRight: '8px' }}
        />
        Enable Snapping
    </label>

  </div>
);

export default Toolbar;
