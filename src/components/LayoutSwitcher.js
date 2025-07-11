import React, { useState, useEffect, useRef } from 'react';

const LayoutSwitcher = ({
  layouts,
  currentLayoutIndex,
  setCurrentLayoutIndex,
  setLayouts
}) => {
  const [showUI, setShowUI] = useState(true);

  const [position, setPosition] = useState({ top: 24, left: 400 });
  const containerRef = useRef(null);
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  // Restore saved position
  useEffect(() => {
    const saved = localStorage.getItem('layout_ui_position');
    if (saved) {
      try {
        const pos = JSON.parse(saved);
        if (pos && typeof pos.top === 'number' && typeof pos.left === 'number') {
          setPosition(pos);
        }
      } catch {}
    }
  }, []);

  // Start dragging
  const handleMouseDown = (e) => {
    dragging.current = true;
    offset.current = {
      x: e.clientX - position.left,
      y: e.clientY - position.top,
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Move container
  const handleMouseMove = (e) => {
    if (!dragging.current) return;

    const container = containerRef.current;
    if (!container) return;

    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    const newLeft = e.clientX - offset.current.x;
    const newTop = e.clientY - offset.current.y;

    const clampedLeft = Math.max(0, Math.min(screenWidth - containerWidth, newLeft));
    const clampedTop = Math.max(0, Math.min(screenHeight - containerHeight, newTop));

    const newPos = {
      left: clampedLeft,
      top: clampedTop,
    };

    setPosition(newPos);
    localStorage.setItem('layout_ui_position', JSON.stringify(newPos));
  };

  // Stop dragging
  const handleMouseUp = () => {
    dragging.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  // Persist layout list
  const persistLayouts = (updatedLayouts) => {
    setLayouts(updatedLayouts);
    localStorage.setItem('warehouse_layouts', JSON.stringify(updatedLayouts));
  };

  const handleRemove = (index) => {
    const updatedLayouts = layouts.filter((_, i) => i !== index);
    persistLayouts(updatedLayouts);
    if (index === currentLayoutIndex) {
      setCurrentLayoutIndex(0);
    } else if (index < currentLayoutIndex) {
      setCurrentLayoutIndex((prev) => prev - 1);
    }
  };

  // For smooth unmount, keep content mounted for animation duration
  const [shouldRender, setShouldRender] = useState(showUI);
  useEffect(() => {
    if (showUI) setShouldRender(true);
    else {
      const timeout = setTimeout(() => setShouldRender(false), 400); // match transition duration
      return () => clearTimeout(timeout);
    }
  }, [showUI]);

  if (layouts.length <= 1 && !showUI) return null;

  return (
    <div
      ref={containerRef}
      style={{
        ...switcherContainerStyle,
        top: position.top,
        left: position.left,
      }}
    >
      <div
        style={headerStyle}
        onMouseDown={handleMouseDown}
        title="Drag me"
      >
        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, cursor: 'move' }}>
          🧭 Layout Controls
        </h3>
        <button
          onClick={() => setShowUI((prev) => !prev)}
          style={toggleButtonStyle}
          title="Toggle UI Visibility"
        >
          {showUI ? '🙈 Hide UI' : '👁 Show UI'}
        </button>
      </div>

      <div
        style={{
          ...switcherContentStyle,
          ...(showUI ? {} : switcherContentHiddenStyle),
        }}
      >
        {shouldRender && (
          <div>
            <label style={labelStyle}>Active Layout:</label>
            <div style={rowStyle}>
              <select
                value={currentLayoutIndex}
                onChange={(e) => setCurrentLayoutIndex(Number(e.target.value))}
                style={selectStyle}
              >
                {layouts.map((layout, index) => (
                  <option key={index} value={index}>
                    {layout.name || `Layout ${index + 1}`}
                  </option>
                ))}
              </select>
              <button
                onClick={() => handleRemove(currentLayoutIndex)}
                style={buttonStyle('#f44336')}
              >
                🗑 Remove
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const switcherContainerStyle = {
  position: 'absolute',
  background: 'rgba(30, 30, 30, 0.95)',
  color: '#f4f4f4',
  padding: '1.25rem',
  borderRadius: '0.75rem',
  boxShadow: '0 6px 16px rgba(0,0,0,0.35)',
  fontSize: '0.875rem',
  fontFamily: 'Inter, sans-serif',
  zIndex: 10,
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
  width: '30rem',
  boxSizing: 'border-box',
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  cursor: 'move',
};

const switcherContentStyle = {
  transition: 'max-height 0.4s cubic-bezier(.4,2,.6,1), opacity 0.3s, transform 0.3s',
  overflow: 'hidden',
  maxHeight: 500,
  opacity: 1,
  transform: 'scaleY(1)',
  pointerEvents: 'auto',
};

const switcherContentHiddenStyle = {
  maxHeight: 0,
  opacity: 0,
  transform: 'scaleY(0.95)',
  pointerEvents: 'none',
};

const labelStyle = {
  fontWeight: 600,
  fontSize: '0.875rem',
};

const rowStyle = {
  display: 'flex',
  gap: '0.5rem',
  alignItems: 'center',
  flexWrap: 'nowrap',
};

const selectStyle = {
  padding: '0.5rem',
  borderRadius: '0.5rem',
  background: '#2b2b2b',
  color: '#f0f0f0',
  border: '1px solid #555',
  fontSize: '0.875rem',
  width: '100%',
  flexGrow: 1,
};

const buttonStyle = (bg) => ({
  padding: '0.5rem 0.75rem',
  background: bg,
  color: 'white',
  border: 'none',
  borderRadius: '0.5rem',
  fontWeight: 'bold',
  fontSize: '0.875rem',
  cursor: 'pointer',
  transition: 'background 0.3s ease',
});

const toggleButtonStyle = {
  padding: '0.3rem 0.75rem',
  background: '#555',
  color: '#fff',
  border: 'none',
  borderRadius: '0.5rem',
  fontSize: '0.75rem',
  cursor: 'pointer',
};

export default LayoutSwitcher;
