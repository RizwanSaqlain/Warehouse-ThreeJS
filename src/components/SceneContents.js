// src/components/SceneContents.js
import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, TransformControls, Environment } from '@react-three/drei';
import * as THREE from 'three';

import Cube from './MyCube';
import Wall from './Walls';

const SceneContents = ({ cubes, selectedRef, setSelectedRef, searchQuery, onRightClick, snapEnabled }) => {
  const { camera } = useThree();
  const orbitControlsRef = useRef();
  const transformRef = useRef();
  const prevPosRef = useRef(null);
  const isDraggingRef = useRef(false);
  const pressedKeysRef = useRef({});
  const lowerQuery = searchQuery?.toLowerCase?.();

  const BOUNDS = {
    minX: -10,
    maxX: 10,
    minZ: -10,
    maxZ: 10
  };

  const gridSnap = (value) => Math.round(value - 0.5) + 0.5;

  const getSnappedPosition = (pos) => {
    const x = gridSnap(pos.x);
    const z = gridSnap(pos.z);
    return {
      x: Math.max(BOUNDS.minX, Math.min(BOUNDS.maxX, x)),
      z: Math.max(BOUNDS.minZ, Math.min(BOUNDS.maxZ, z))
    };
  };

  useFrame(() => {
    if (isDraggingRef.current && selectedRef?.current) {
      const pos = selectedRef.current.position;
      const { x, z } = ((snapEnabled) ? getSnappedPosition(pos) : { x: pos.x, z: pos.z });
      

      const stackedBelow = cubes
        .map(cube => cube.ref.current)
        .filter(ref =>
          ref &&
          ref !== selectedRef.current &&
          Math.abs(ref.position.x - x) < 0.001 &&
          Math.abs(ref.position.z - z) < 0.001
        );

      const maxYBelow = stackedBelow.length
        ? Math.max(...stackedBelow.map(ref => ref.position.y))
        : -0.5;

      const targetY = maxYBelow + 1;
      pos.y = THREE.MathUtils.lerp(pos.y, targetY, 0.1);
    }

    // Keyboard-based camera movement
    const speed = 0.1;
    const keys = pressedKeysRef.current;
    const direction = new THREE.Vector3();
    const right = new THREE.Vector3();
    const moveVector = new THREE.Vector3();

    const moveForward = keys['arrowup'] || keys['w'];
    const moveBackward = keys['arrowdown'] || keys['s'];
    const moveLeft = keys['arrowleft'] || keys['a'];
    const moveRight = keys['arrowright'] || keys['d'];
    const zoomIn = keys['q'];
    const zoomOut = keys['e'];

    if (moveForward || moveBackward || moveLeft || moveRight || zoomIn || zoomOut) {
      camera.getWorldDirection(direction);
      direction.y = 0;
      direction.normalize();

      right.crossVectors(direction, camera.up).normalize();
      if (moveForward) moveVector.add(direction);
      if (moveBackward) moveVector.sub(direction);
      if (moveLeft) moveVector.sub(right);
      if (moveRight) moveVector.add(right);

      moveVector.normalize().multiplyScalar(speed);
      if (zoomIn) camera.position.add(direction.clone().multiplyScalar(speed));
      if (zoomOut) camera.position.sub(direction.clone().multiplyScalar(speed));

      camera.position.add(moveVector);
      orbitControlsRef.current.target.add(moveVector);
      orbitControlsRef.current.update();
    }
  });

  useEffect(() => {
    const isTyping = () => {
      const active = document.activeElement;
      return active && ['INPUT', 'TEXTAREA'].includes(active.tagName);
    };

    const handleKeyDown = (e) => {
      if (isTyping()) return;
      const key = e.key.toLowerCase();
      if ([
        'arrowup', 'arrowdown', 'arrowleft', 'arrowright',
        'w', 'a', 's', 'd', 'q', 'e'
      ].includes(key)) {
        e.preventDefault();
        pressedKeysRef.current[key] = true;
      }
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      if ([
        'arrowup', 'arrowdown', 'arrowleft', 'arrowright',
        'w', 'a', 's', 'd', 'q', 'e'
      ].includes(key)) {
        pressedKeysRef.current[key] = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const warehouseBounds = { width: 20, depth: 20, height: 5 };
  const wallSegments = [];

  for (let x = -warehouseBounds.width / 2 + 0.5; x < warehouseBounds.width / 2; x++) {
    wallSegments.push({ id: `front-${x}`, position: [x, 1, -warehouseBounds.depth / 2], size: [1, 2, 0.2] });
    wallSegments.push({ id: `back-${x}`, position: [x, 1, warehouseBounds.depth / 2], size: [1, 2, 0.2] });
  }
  for (let z = -warehouseBounds.depth / 2 + 0.5; z < warehouseBounds.depth / 2; z++) {
    wallSegments.push({ id: `left-${z}`, position: [-warehouseBounds.width / 2, 1, z], size: [0.2, 2, 1] });
    wallSegments.push({ id: `right-${z}`, position: [warehouseBounds.width / 2, 1, z], size: [0.2, 2, 1] });
  }

  return (
    <>
      <Environment preset="sunset" />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 7.5]} intensity={1} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-camera-far={50} shadow-camera-left={-10} shadow-camera-right={10} shadow-camera-top={10} shadow-camera-bottom={-10} />
      <gridHelper args={[40, 40]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#24292E" metalness={0.5} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} onClick={() => setSelectedRef(null)}>
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {cubes.map(cube => {
        const match = lowerQuery && (cube.item?.sku?.toLowerCase().includes(lowerQuery) || cube.item?.category?.toLowerCase().includes(lowerQuery));
        return (
          <Cube
            key={cube.id}
            position={cube.position}
            cubeRef={cube.ref}
            onSelect={setSelectedRef}
            onRightClick={onRightClick}
            isSelected={cube.ref.current === selectedRef?.current}
            label={cube.item?.sku || ''}
            color={match ? '#00ccff' : 'white'}
            item={cube.item}
            size={cube.size || [1, 1, 1]}
          />
        );
      })}

      {wallSegments.map(wall => (
        <Wall key={wall.id} position={wall.position} size={wall.size} />
      ))}

      {selectedRef && (
        <TransformControls
          ref={transformRef}
          object={selectedRef.current}
          mode="translate"
          showX
          showZ
          showY={false}
          onMouseDown={() => {
            orbitControlsRef.current.enabled = false;
            isDraggingRef.current = true;
            prevPosRef.current = selectedRef.current.position.clone();
          }}
          onMouseUp={() => {
            orbitControlsRef.current.enabled = true;
            isDraggingRef.current = false;

            const pos = selectedRef.current.position;
            const { x, z } = ((snapEnabled) ? getSnappedPosition(pos) : { x: pos.x, z: pos.z });
      

            const stackedBelow = cubes
              .map(c => c.ref.current)
              .filter(ref =>
                ref && ref !== selectedRef.current &&
                Math.abs(ref.position.x - x) < 0.001 &&
                Math.abs(ref.position.z - z) < 0.001
              );

            const maxY = stackedBelow.length ? Math.max(...stackedBelow.map(ref => ref.position.y)) : -0.5;
            const finalY = maxY + 1;

            selectedRef.current.position.set(x, finalY, z);

            const audio = new Audio('/sounds/pop1.wav');
            audio.volume = 0.2;
            audio.play();
          }}
        />
      )}

      <OrbitControls ref={orbitControlsRef} />
    </>
  );
};

export default SceneContents;