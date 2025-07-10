import React, { useState } from 'react';

const hintStyles = {
  container: {
    position: 'absolute',
    bottom: '20px',
    left: '20px',
    background: 'rgba(20, 20, 20, 0.7)',
    color: '#f0f0f0',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    fontFamily: 'sans-serif',
    lineHeight: '1.4',
    boxShadow: '0 0 10px rgba(0,0,0,0.3)',
    maxWidth: '500px',
    userSelect: 'none',
  },
  key: {
    display: 'inline-block',
    padding: '2px 6px',
    margin: '0 2px',
    border: '1px solid #888',
    borderRadius: '4px',
    background: '#2e2e2e',
    fontWeight: 'bold',
    fontSize: '12px',
  },
  toggleButton: {
    marginTop: '0.5rem',
    marginBottom: '0.5rem',
    background: '#444',
    color: '#fff',
    fontSize: '12px',
    padding: '4px 8px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    pointerEvents: 'auto',
  },
};

const Key = ({ children }) => <span style={hintStyles.key}>{children}</span>;

export default function ControlsHint() {
  const [visible, setVisible] = useState(true);

  return (
    <div style={hintStyles.container}>
      {visible && (
        <>
          <div>
            <Key>W</Key><Key>A</Key><Key>S</Key><Key>D</Key> / <Key>↑</Key><Key>↓</Key><Key>←</Key><Key>→</Key> — Move Camera
          </div>
          <div><Key>Q</Key><Key>E</Key> — Zoom In/Out</div>
          <div><Key>Ctrl</Key>+<Key>Z</Key> — Undo</div>
          <div><Key>Ctrl</Key>+<Key>Y</Key> — Redo</div>
          <div><Key>Ctrl</Key>+<Key>C</Key> — Copy</div>
          <div><Key>Ctrl</Key>+<Key>V</Key> — Paste</div>
          <div>Right Click Container to Edit Dimensions</div>
        </>
      )}
      <button
        onClick={() => setVisible(!visible)}
        style={hintStyles.toggleButton}
      >
        {visible ? 'Hide Controls' : 'Show Controls'}
      </button>
    </div>
  );
}
