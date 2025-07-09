import React from 'react';

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
    pointerEvents: 'none',
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
};

const Key = ({ children }) => <span style={hintStyles.key}>{children}</span>;

export default function ControlsHint() {
  return (
    <div style={hintStyles.container}>
      <div><Key>W</Key><Key>A</Key><Key>S</Key><Key>D</Key> / <Key>↑</Key><Key>↓</Key><Key>←</Key><Key>→</Key> — Move Camera</div>
      <div><Key>Q</Key><Key>E</Key> — Zoom In/Out</div>
      <div><Key>Ctrl</Key>+ <Key>Z</Key> — Undo </div>
      <div><Key>Ctrl</Key>+ <Key>Y</Key> — Redo </div>
      <div>Right Click Container to Edit Dimensions</div>
    </div>
  );
}
