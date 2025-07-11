import { useFrame, useThree } from '@react-three/fiber';
import React, { useRef, useState, memo } from 'react';
import { Text, Html } from '@react-three/drei';

const tooltipStyle = {
  background: 'rgba(0, 0, 0, 0.7)',
  color: 'white',
  padding: '8px 12px',
  borderRadius: '6px',
  fontSize: '12px',
  whiteSpace: 'nowrap',
  pointerEvents: 'none',
};

const Cube = ({
  position,
  cubeRef,
  onSelect,
  isSelected,
  onRightClick,
  size = [1, 1, 1],
  color = 'white',
  label = '',
  item = {}
}) => {
  const [hovered, setHovered] = useState(false);
  const labelRef = useRef();
  const { camera } = useThree();

  // Calculate distance from camera to cube center
  const [fontSize, setFontSize] = useState(0.25);
  const [tooltipFactor, setTooltipFactor] = useState(10);

  useFrame(() => {
    if (hovered && labelRef.current) {
      const target = camera.position.clone().sub(labelRef.current.position);
      labelRef.current.rotation.y = Math.atan2(target.x, target.z);
    }
    if (hovered) {
      const camDist = camera.position.distanceTo({ x: position[0], y: position[1], z: position[2] });
      // Clamp font size and tooltip factor for usability
      setFontSize(Math.max(0.25, Math.min(0.7, camDist * 0.07)));
      setTooltipFactor(Math.max(10, Math.min(30, camDist * 1.2)));
    }
  });

  return (
    <group ref={cubeRef} position={position}>
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onSelect(cubeRef);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onContextMenu={(e) => {
          e.stopPropagation();
          onRightClick(cubeRef);
        }}
        onPointerOut={() => setHovered(false)}
        castShadow
        receiveShadow
      >
        <boxGeometry args={size} />
        <meshStandardMaterial
          color={color}
          emissive={isSelected ? 'white' : 'black'}
          emissiveIntensity={0.15}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>

      {hovered && !!label && (
        <Text
          ref={labelRef}
          position={[0, size[1] / 2 + 0.3, 0]}
          fontSize={fontSize}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineColor="black"
          outlineWidth={0.01}
        >
          {label}
        </Text>
      )}

      {hovered && (
        <Html
          position={[0, size[1] / 2 + 0.8, 0]}
          center
          distanceFactor={tooltipFactor}
          style={tooltipStyle}
        >
          <div><strong>SKU:</strong> {item?.sku || '—'}</div>
          <div><strong>Qty:</strong> {item?.quantity ?? 0}</div>
          <div><strong>Category:</strong> {item?.category || '—'}</div>
        </Html>
      )}
    </group>
  );
};

export default memo(Cube);
