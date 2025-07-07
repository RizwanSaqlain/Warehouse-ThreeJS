import { useFrame, useThree } from '@react-three/fiber';
import React, { useRef, useState } from 'react';
import { Text, Html } from '@react-three/drei';

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

  // Smoothly rotate label to face the camera on Y axis only
  useFrame(() => {
    if (labelRef.current && hovered) {
      const target = camera.position.clone().sub(labelRef.current.position);
      const angle = Math.atan2(target.x, target.z); // Only Y rotation
      labelRef.current.rotation.y = angle;
    }
  });

  return (
    <group
      ref={cubeRef}
      position={position}
    >
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
          color={isSelected ? 'orange' : hovered ? '#ccc' : color}
          metalness={0.3}
          roughness={0.4}
        />
        
      </mesh>

      {hovered && (
        <Text
          ref={labelRef}
          position={[0, size[1] / 2 + 0.3, 0]}
          fontSize={0.25}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineColor="black"
          outlineWidth={0.01}
        >
          {label}
        </Text>
      )}

      {/* Tooltip with all item info */}
      {hovered && (
        <Html
          position={[0, size[1] / 2 + 0.8, 0]}
          center
          distanceFactor={10}
          style={{
            background: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
          }}
        >
          <div><strong>SKU:</strong> {item?.sku || '—'}</div>
          <div><strong>Qty:</strong> {item?.quantity ?? 0}</div>
          <div><strong>Category:</strong> {item?.category || '—'}</div>
        </Html>
      )}
    </group>
  );
};

export default Cube;
