import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, TransformControls, Environment } from '@react-three/drei';
import * as THREE from 'three';

import Cube from './MyCube';
import Wall from './Walls';
import { useCameraControls } from '../hooks/useCameraControls';

const SceneContents = ({ cubes, selectedRef, setSelectedRef, searchQuery, onRightClick, snapEnabled, setCubes, setDimensionTargetRef, updateCubes }) => {
  const { camera } = useThree();
  const orbitControlsRef = useRef();
  const transformRef = useRef();
  const prevPosRef = useRef(null);
  const isDraggingRef = useRef(false);
  const lowerQuery = searchQuery?.toLowerCase?.();
  const audioRef = useRef(new Audio('/sounds/pop1.wav'));
  audioRef.current.volume = 0.2;

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
  const boxesOverlap = (a, b) => (
    a.minX < b.maxX - EPSILON &&
    a.maxX > b.minX + EPSILON &&
    a.minZ < b.maxZ - EPSILON &&
    a.maxZ > b.minZ + EPSILON
  );

  useCameraControls(camera, orbitControlsRef);

  useFrame(() => {
    if (isDraggingRef.current && selectedRef?.current) {
      const pos = selectedRef.current.position;
      const selectedCube = cubes.find(c => c.ref.current === selectedRef.current);
      if (!selectedCube) return;
      const selectedSize = selectedCube.size || [1, 1, 1];
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
      selectedRef.current.position.set(pos.x, finalY, pos.z);
    }
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      const active = document.activeElement;
      if (active && ['INPUT', 'TEXTAREA'].includes(active.tagName)) return;
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const warehouseBounds = { width: 20, depth: 20, height: 5 };
  const wallSegments = useMemo(() => {
    const segments = [];
    for (let x = -warehouseBounds.width / 2 + 0.5; x < warehouseBounds.width / 2; x++) {
      segments.push({ id: `front-${x}`, position: [x, 1, -warehouseBounds.depth / 2], size: [1, 2, 0.2] });
      segments.push({ id: `back-${x}`, position: [x, 1, warehouseBounds.depth / 2], size: [1, 2, 0.2] });
    }
    for (let z = -warehouseBounds.depth / 2 + 0.5; z < warehouseBounds.depth / 2; z++) {
      segments.push({ id: `left-${z}`, position: [-warehouseBounds.width / 2, 1, z], size: [0.2, 2, 1] });
      segments.push({ id: `right-${z}`, position: [warehouseBounds.width / 2, 1, z], size: [0.2, 2, 1] });
    }
    return segments;
  }, []);

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
            color={match ? '#00ccff' : cube.item?.color || '#ffffff'}
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
            const selectedCube = cubes.find(c => c.ref.current === selectedRef.current);
            const selectedSize = selectedCube?.size || [1, 1, 1];

            const raw = snapEnabled
              ? getSnappedPosition(pos, selectedSize)
              : {
                  x: Math.max(BOUNDS.minX + selectedSize[0] / 2, Math.min(BOUNDS.maxX - selectedSize[0] / 2, pos.x)),
                  z: Math.max(BOUNDS.minZ + selectedSize[2] / 2, Math.min(BOUNDS.maxZ - selectedSize[2] / 2, pos.z)),
                };

            const { x, z } = raw;
            selectedRef.current.position.set(x, pos.y, z);

            const selectedBox = {
              minX: x - selectedSize[0] / 2,
              maxX: x + selectedSize[0] / 2,
              minZ: z - selectedSize[2] / 2,
              maxZ: z + selectedSize[2] / 2,
            };

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
            selectedRef.current.position.set(x, finalY, z);

            audioRef.current.play();

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