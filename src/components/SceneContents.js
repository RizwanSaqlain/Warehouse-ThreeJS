// src/components/SceneContents.js
import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, TransformControls, Environment } from '@react-three/drei';
import * as THREE from 'three';

import Cube from './MyCube';
import Wall from './Walls';

const SceneContents = ({ cubes, selectedRef, setSelectedRef, searchQuery, onRightClick, snapEnabled, setCubes, setDimensionTargetRef, updateCubes}) => {
  const { camera } = useThree();
  const orbitControlsRef = useRef();
  const transformRef = useRef();
  const prevPosRef = useRef(null);
  const isDraggingRef = useRef(false);
  const pressedKeysRef = useRef({});
  const lowerQuery = searchQuery?.toLowerCase?.();
  const audio = new Audio('/sounds/pop1.wav');
  audio.volume = 0.2;

  const BOUNDS = {
    minX: -10,
    maxX: 10,
    minZ: -10,
    maxZ: 10
  };

  const gridSnap = (value) => Math.round(value - 0.5) + 0.5;

  const getSnappedPosition = (pos, size) => {
    const snapToGrid = (val, dim, min, max) => {
      const minEdge = val - dim / 2;
      const snappedMin = Math.round(minEdge);
      const center = snappedMin + dim / 2;
      return Math.max(min + dim / 2, Math.min(max - dim / 2, center));
    };

    return {
      x: snapToGrid(pos.x, size[0], BOUNDS.minX, BOUNDS.maxX),
      z: snapToGrid(pos.z, size[2], BOUNDS.minZ, BOUNDS.maxZ),
    };
  };



  const getBoundingBox = (ref, size) => {
    const center = ref.position;
    return {
      minX: center.x - size[0] / 2,
      maxX: center.x + size[0] / 2,
      minZ: center.z - size[2] / 2,
      maxZ: center.z + size[2] / 2,
    };
  };

  const EPSILON = 0.1;

  const boxesOverlap = (a, b) => {
    return (
      a.minX < b.maxX - EPSILON &&
      a.maxX > b.minX + EPSILON &&
      a.minZ < b.maxZ - EPSILON &&
      a.maxZ > b.minZ + EPSILON
    );
  };



  useFrame(() => {
    if (isDraggingRef.current && selectedRef?.current) {
      const pos = selectedRef.current.position;
      const { x, z } = pos

      const selectedSize = cubes.find(c => c.ref.current === selectedRef.current)?.size || [1,1,1];
      const selectedBox = getBoundingBox(selectedRef.current, selectedSize);

      const stackedBelow = cubes
        .filter(c => {
          const ref = c.ref.current;
          if (!ref || ref === selectedRef.current) return false;

          const otherBox = getBoundingBox(ref, c.size || [1, 1, 1]);
          return boxesOverlap(selectedBox, otherBox);
        });


      const maxYBelow = stackedBelow.length
        ? Math.max(...stackedBelow.map(c => c.ref.current.position.y + (c.size?.[1] || 1) / 2))
        : 0;

      const finalY = maxYBelow + (selectedSize[1] / 2);
      selectedRef.current.position.set(x, finalY, z);

      pos.y = THREE.MathUtils.lerp(pos.y, finalY, 0.1);
    }

    const speed = 0.1;
    const keys = pressedKeysRef.current;
    const direction = new THREE.Vector3();
    const direction2 = new THREE.Vector3();
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
      camera.getWorldDirection(direction2);
      direction.y = 0;
      direction.normalize();
      direction2.normalize();

      right.crossVectors(direction, camera.up).normalize();
      if (moveForward) moveVector.add(direction);
      if (moveBackward) moveVector.sub(direction);
      if (moveLeft) moveVector.sub(right);
      if (moveRight) moveVector.add(right);
      
      moveVector.normalize().multiplyScalar(speed);
      if (zoomIn) camera.position.add(direction2.clone().multiplyScalar(speed));
      if (zoomOut) camera.position.sub(direction2.clone().multiplyScalar(speed));

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
      <mesh
        position={[0, 0.01, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={() => {
          setSelectedRef(null);
          setDimensionTargetRef?.(null); 
        }}
      >
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
            color={match ? '#00ccff' : cube.item?.color || '#ffffff' }
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
            const selectedSize = cubes.find(c => c.ref.current === selectedRef.current)?.size || [1, 1, 1];

            // 🔁 Snap the position
            const raw = snapEnabled
              ? getSnappedPosition(pos, selectedSize)
              : {
                  x: Math.max(BOUNDS.minX + selectedSize[0] / 2, Math.min(BOUNDS.maxX - selectedSize[0] / 2, pos.x)),
                  z: Math.max(BOUNDS.minZ + selectedSize[2] / 2, Math.min(BOUNDS.maxZ - selectedSize[2] / 2, pos.z)),
                };

            const { x, z } = raw;


            // 🔁 Set snapped position first (without Y)
            selectedRef.current.position.set(x, pos.y, z);

            // ✅ NOW calculate bounding box with new snapped position
            const selectedBox = {
              minX: x - selectedSize[0] / 2,
              maxX: x + selectedSize[0] / 2,
              minZ: z - selectedSize[2] / 2,
              maxZ: z + selectedSize[2] / 2,
            };

            // 📦 Check for stacked objects below AFTER snapping
            const stackedBelow = cubes.filter(c => {
              const ref = c.ref.current;
              if (!ref || ref === selectedRef.current) return false;

              const otherBox = getBoundingBox(ref, c.size || [1, 1, 1]);
              return boxesOverlap(selectedBox, otherBox);
            });

            const maxYBelow = stackedBelow.length
              ? Math.max(...stackedBelow.map(c => c.ref.current.position.y + (c.size?.[1] || 1) / 2))
              : 0;

            const finalY = maxYBelow + (selectedSize[1] / 2);

            // ✅ Apply final position
            selectedRef.current.position.set(x, finalY, z);

            audio.play();

            // 🧠 Update state
            updateCubes(prev =>
              prev.map(c =>
                c.ref === selectedRef
                  ? { ...c, position: selectedRef.current.position.toArray() }
                  : c
              )
            );
          }}
        />
      )}

      <OrbitControls ref={orbitControlsRef} />
    </>
  );
};

export default SceneContents;
