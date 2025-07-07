// src/App.js
import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import SceneContents from './components/SceneContents';
import ItemEditor from './components/ItemEditor';
import Toolbar from './components/Toolbar';
import DimensionEditor from './components/DimensionEditor';

export default function App() {
  const [cubes, setCubes] = useState([
    {
      id: 0,
      ref: React.createRef(),
      position: [0, 0.5, 0],
      size: [1, 1, 1],
      item: {
        sku: 'Item1',
        quantity: 10,
        category: 'Electronics'
      }
    }
  ]);

  const [selectedRef, setSelectedRef] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dimensionTargetRef, setDimensionTargetRef] = useState(null);
  const [snapEnabled, setSnapEnabled] = useState(true);

  const MAX_HISTORY = 20;
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const pushToHistory = (newCubes) => {
    const newHistory = [...history.slice(0, historyIndex + 1), newCubes];
    if (newHistory.length > MAX_HISTORY) newHistory.shift();
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setCubes(history[historyIndex - 1]);
    }
  };

  // Call this whenever cubes change (add/delete/update)
  useEffect(() => {
    pushToHistory(cubes);
  }, [cubes]);

  useEffect(() => {
    const handleUndo = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        undo();
      }
    };
    window.addEventListener('keydown', handleUndo);
    return () => window.removeEventListener('keydown', handleUndo);
  }, [history, historyIndex]);



  const addCube = () => {
    const originX = 0;
    const originZ = 0;
    const newId = Date.now();
    const itemCount = cubes.length + 1;
    

    setCubes([
      ...cubes,
      {
        id: newId,
        ref: React.createRef(),
        position: [originX, 0.5, originZ],
        size: [1, 1, 1],
        item: {
          sku: `Item${itemCount}`,
          quantity: 0,
          category: 'Uncategorized'
        }
      }
    ]);
  };

  const deleteCube = () => {
    if (!selectedRef) return;
    setCubes(cubes.filter(c => c.ref !== selectedRef));
    setSelectedRef(null);
  };

  const updateCubeItem = (id, newItem) => {
    setCubes(prev =>
      prev.map(c => (c.id === id ? { ...c, item: newItem } : c))
    );
  };

  const getCubeSize = (ref) => {
    const cube = cubes.find(c => c.ref === ref);
    return cube?.size || [1, 1, 1];
  };

  const updateCubeSize = (ref, newSize) => {
    setCubes(prev =>
      prev.map(c => (c.ref === ref ? { ...c, size: newSize } : c))
    );
  };

  const getSelectedCube = () =>
    cubes.find(c => c.ref.current === selectedRef?.current);


  // Save cube layout to localStorage
  const saveLayout = () => {
    const data = cubes.map(cube => ({
      id: cube.id,
      position: cube.ref.current.position.toArray(),
      size: cube.size,
      item: cube.item
    }));
    localStorage.setItem('warehouseLayout', JSON.stringify(data));
    alert('Layout saved!');
  };

  // Load cube layout from localStorage
  const loadLayout = () => {
    const data = localStorage.getItem('warehouseLayout');
    if (!data) return;

    const parsed = JSON.parse(data);
    setCubes(
      parsed.map(cube => ({
        ...cube,
        ref: React.createRef()
      }))
    );
  };


  return (
    <>
      <Toolbar
        onAdd={addCube}
        onDelete={deleteCube}
        selectedRef={selectedRef}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        snapEnabled={snapEnabled}
        setSnapEnabled={setSnapEnabled}
        onSave={saveLayout}
        onLoad={loadLayout}
        cubes={cubes}                 // ✅ Add this
        setCubes={setCubes} 
      />

      <Canvas camera={{ position: [3, 3, 5], fov: 75 }} shadows>
        <SceneContents
          cubes={cubes}
          selectedRef={selectedRef}
          setSelectedRef={setSelectedRef}
          searchQuery={searchQuery}
          onRightClick={setDimensionTargetRef}
          snapEnabled={snapEnabled}
        />
      </Canvas>

      {dimensionTargetRef && (
        <DimensionEditor
          refTarget={dimensionTargetRef}
          getCubeSize={getCubeSize}
          updateCubeSize={updateCubeSize}
          onClose={() => setDimensionTargetRef(null)}
          item={
            cubes.find(c => c.ref === dimensionTargetRef)?.item
          }
        />
      )}


      <ItemEditor cube={getSelectedCube()} onUpdate={updateCubeItem} />
    </>
  );
}
