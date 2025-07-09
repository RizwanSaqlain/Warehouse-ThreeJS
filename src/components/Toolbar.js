import React, { useRef, useState } from 'react';

const Toolbar = ({
  onAdd,
  onDelete,
  selectedRef,
  searchQuery,
  setSearchQuery,
  snapEnabled,
  setSnapEnabled,
  handleExport,
  handleImport,
  showMapView,
  setShowMapView,
  toggleMusic,
  musicOn
}) => {
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const dragOffset = useRef({ x: 0, y: 0 });
  const [musicPlaying, setMusicPlaying] = useState(true);

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
      style={toolbarStyle(position.x, position.y, dragging)}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>
        📦 Warehouse Tools
      </h3>

      <div style={sectionStyle}>
        <button onClick={onAdd} style={buttonStyle('#4caf50')}>
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

      <div style={sectionStyle}>
        <button onClick={handleExport} style={buttonStyle('#2196f3')}>
          📤 Export Layout
        </button>

        <label style={labelStyle}>
          📥 Import Layout
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            style={fileInputStyle}
          />
        </label>
      </div>

      <input
        type="text"
        placeholder="🔍 Search SKU or Category..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={inputStyle}
      />

      <label style={checkboxLabelStyle}>
        <input
          type="checkbox"
          checked={snapEnabled}
          onChange={(e) => setSnapEnabled(e.target.checked)}
          style={{ width: '18px', height: '18px' }}
        />
        Enable Snapping
      </label>

      <button onClick={toggleMusic} style={buttonStyle('#9c27b0')}>
        {musicOn ? '🔇 Mute Music' : '🔊 Play Music'}
      </button>


      <button onClick={() => setShowMapView((prev) => !prev)} style={buttonStyle('#673ab7')}>
        {showMapView ? '🗺️ Hide 2D Map' : '🗺️ Show 2D Map'}
      </button>
    </div>
  );
};

const toolbarStyle = (x, y, dragging) => ({
  position: 'absolute',
  top: y,
  left: x,
  zIndex: 10,
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  padding: '1.5rem',
  width: 'clamp(220px, 18vw, 300px)',
  background: 'rgba(30, 30, 30, 0.95)',
  borderRadius: '0.75rem',
  boxShadow: '0 6px 16px rgba(0,0,0,0.35)',
  fontFamily: 'Inter, sans-serif',
  color: '#f4f4f4',
  fontSize: '0.875rem',
  cursor: dragging ? 'grabbing' : 'grab',
  userSelect: 'none',
});

const sectionStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

const labelStyle = {
  fontSize: '0.875rem',
  fontWeight: 500,
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

const inputStyle = {
  padding: '0.625rem 0.75rem',
  borderRadius: '0.5rem',
  fontSize: '0.875rem',
  backgroundColor: '#2b2b2b',
  border: '1px solid #555',
  color: '#f0f0f0',
  boxSizing: 'border-box',
};

const fileInputStyle = {
  padding: '0.375rem',
  background: '#1e1e1e',
  color: '#ddd',
  border: '1px solid #444',
  borderRadius: '6px',
  fontSize: '0.8125rem',
};

const checkboxLabelStyle = {
  display: 'flex',
  alignItems: 'center',
  fontSize: '0.875rem',
  fontWeight: 500,
  gap: '10px',
};

const buttonStyle = (bg, disabled = false) => ({
  padding: '0.625rem 0.875rem',
  background: bg,
  color: 'white',
  border: 'none',
  borderRadius: '0.5rem',
  fontWeight: 'bold',
  fontSize: '0.875rem',
  cursor: disabled ? 'not-allowed' : 'pointer',
  opacity: disabled ? 0.5 : 1,
  transition: 'background 0.3s ease',
});

export default Toolbar;
