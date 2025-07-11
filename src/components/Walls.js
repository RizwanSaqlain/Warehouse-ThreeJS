import React from 'react';

const Wall = React.memo(({ position, size = [1, 2, 0.2], color = '#444' }) => {
  return (
    <mesh position={position} receiveShadow castShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} metalness={0.2} roughness={0.6} />
    </mesh>
  );
});

export default Wall;
