import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import SceneContents from './components/SceneContents';
import ItemEditor from './components/ItemEditor';
import Toolbar from './components/Toolbar';
import DimensionEditor from './components/DimensionEditor';
import TopDownMapView from './components/TopDownMapView';
import ControlsHint from './components/ControlsHint';
import LayoutSwitcher from './components/LayoutSwitcher';


export default function App() {
  const [cubes, setCubes] = useState([{
    id: 0,
    ref: React.createRef(),
    position: [0, 0.5, 0],
    size: [1, 1, 1],
    item: {
      sku: 'Item1',
      quantity: 10,
      category: 'Electronics',
      weight: 0,
      notes: '',
      shipped: false,
      color: '#ffffff'
    }
  }]);

  const [selectedRef, setSelectedRef] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dimensionTargetRef, setDimensionTargetRef] = useState(null);
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [shippedItems, setShippedItems] = useState([]);
  const [showMapView, setShowMapView] = useState(false);
  const audioRef = useRef(null);
  const [musicOn, setMusicOn] = useState(true);
  const [copiedCube, setCopiedCube] = useState(null);
  const [bounds, setBounds] = useState({ width: 20, depth: 20, height: 5 });
  const [layouts, setLayouts] = useState([]); // [{ name: 'Layout 1', cubes: [...], bounds: {...} }]
  const [currentLayoutIndex, setCurrentLayoutIndex] = useState(0);



  const applyCubesUpdate = useCallback((updaterFn) => {
    setCubes((prevCubes) => {
      const updatedCubes = updaterFn(prevCubes);
      setHistory((prevHistory) => {
        const newHistory = [...prevHistory, prevCubes];
        return newHistory.length > 20 ? newHistory.slice(1) : newHistory;
      });
      setRedoStack([]);
      return updatedCubes;
    });
  }, []);

  const addCube = useCallback(() => {
    const newId = Date.now();
    const itemCount = cubes.length + 1;
    applyCubesUpdate((prev) => [...prev, {
      id: newId,
      ref: React.createRef(),
      position: [0, 0.5, 0],
      size: [1, 1, 1],
      item: {
        sku: `Item${itemCount}`,
        quantity: 0,
        category: 'Uncategorized',
        weight: 0,
        notes: '',
        shipped: false,
        color: '#ffffff'
      }
    }]);
  }, [applyCubesUpdate, cubes.length]);

  const deleteCube = useCallback(() => {
    if (!selectedRef) return;
    applyCubesUpdate(prev => prev.filter(c => c.ref !== selectedRef));
    setSelectedRef(null);
  }, [selectedRef, applyCubesUpdate]);

  const updateCubeItem = useCallback((id, newItem) => {
    applyCubesUpdate(prev => prev.map(c => (c.id === id ? { ...c, item: newItem } : c)));
  }, [applyCubesUpdate]);

  const shipCube = useCallback(() => {
    const cube = cubes.find(c => c.ref.current === selectedRef?.current);
    if (!cube) return;
    setShippedItems(prev => [...prev, { ...cube, item: { ...cube.item, shipped: true } }]);
    applyCubesUpdate(prev => prev.filter(c => c.ref !== selectedRef));
    setSelectedRef(null);
  }, [cubes, selectedRef, applyCubesUpdate]);

  const updateCubeSize = useCallback((ref, newSize) => {
    applyCubesUpdate(prev => prev.map(c => (c.ref === ref ? { ...c, size: newSize } : c)));
  }, [applyCubesUpdate]);

  const undoCubes = useCallback(() => {
    setHistory((prevHistory) => {
      if (prevHistory.length === 0) return prevHistory;
      setCubes((current) => {
        const lastState = prevHistory[prevHistory.length - 1];
        setRedoStack((prevRedo) => [...prevRedo, current]);
        return lastState;
      });
      return prevHistory.slice(0, -1);
    });
  }, []);

  const redoCubes = useCallback(() => {
    setRedoStack((prevRedo) => {
      if (prevRedo.length === 0) return prevRedo;
      setCubes((current) => {
        const nextState = prevRedo[prevRedo.length - 1];
        setHistory((prevHistory) => [...prevHistory, current]);
        return nextState;
      });
      return prevRedo.slice(0, -1);
    });
  }, []);

  const getCubeSize = useCallback((ref) => {
    const cube = cubes.find(c => c.ref === ref);
    return cube?.size || [1, 1, 1];
  }, [cubes]);

  const getSelectedCube = useCallback(() => {
    return cubes.find(c => c.ref.current === selectedRef?.current);
  }, [cubes, selectedRef]);

  const handleExport = useCallback(() => {
    const exportData = {
      cubes: cubes.map(cube => ({
        id: cube.id,
        position: cube.ref.current?.position.toArray() || cube.position,
        size: cube.size,
        item: cube.item
      })),
      bounds
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'warehouse-layout.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [cubes, bounds]);



  const handleImport = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader(); // ✅ declare before usage

    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        console.log('Imported JSON:', json); // 🔍 debug log

        const name = file.name.replace('.json', '');

        let cubesData = [];
        let boundsData = { width: 20, depth: 20, height: 5 };

        if (Array.isArray(json)) {
          cubesData = json; // legacy array-only format
        } else if (json && typeof json === 'object') {
          cubesData = Array.isArray(json.cubes) ? json.cubes : [];
          boundsData = json.bounds || boundsData;
        }

        if (cubesData.length === 0) {
          alert('Invalid layout: no cubes found');
          return;
        }

        const cubes = cubesData.map(cube => ({
          ...cube,
          ref: React.createRef()
        }));
        

        const newLayout = { name, cubes, bounds: boundsData };
        setLayouts((prev) => {
          const updated = [...prev, newLayout];
          localStorage.setItem('warehouse_layouts', JSON.stringify(updated));
          return updated;
        });
        setCurrentLayoutIndex(prev => prev + 1);
      } catch (err) {
        alert('Failed to import layout: ' + err.message);
      }
    };

    reader.readAsText(file);
  }, []);




  useEffect(() => {
    let lastKeyTime = 0;
    const handleKeyDown = (e) => {
      const now = Date.now();
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && now - lastKeyTime > 50) {
        undoCubes();
        lastKeyTime = now;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y' && now - lastKeyTime > 50) {
        redoCubes();
        lastKeyTime = now;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c' && now - lastKeyTime > 50) {
        const cube = cubes.find(c => c.ref.current === selectedRef?.current);
        if (cube) setCopiedCube({ ...cube, id: Date.now() }); // fresh ID
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v' && copiedCube && now - lastKeyTime > 50) {
        const newRef = React.createRef();
        const offsetPos = [
          copiedCube.position[0] + 1,
          copiedCube.position[1],
          copiedCube.position[2] + 1
        ];

        const newCube = {
          ...copiedCube,
          id: Date.now(),
          ref: newRef,
          position: offsetPos
        };

        applyCubesUpdate(prev => [...prev, newCube]);

        // Wait until the ref is populated and the position is correctly applied
        const waitForPosition = () => {
          const mesh = newRef.current;
          if (mesh && mesh.position && mesh.position.toArray().toString() === offsetPos.toString()) {
            setSelectedRef(newRef);
          } else {
            requestAnimationFrame(waitForPosition);
          }
        };
        requestAnimationFrame(waitForPosition);
      }


    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undoCubes, redoCubes, copiedCube, cubes, selectedRef, applyCubesUpdate]);

  useEffect(() => {
    const audio = new Audio('/sounds/background_music.mp3');
    audio.loop = true;
    audio.volume = 0.4;
    audio.play().catch(() => {}); // handle autoplay block
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  useEffect(() => {
    const layout = layouts[currentLayoutIndex];
    if (layout) {
      setCubes(layout.cubes || []);
      setBounds(layout.bounds || { width: 20, depth: 20, height: 5 });
    }
  }, [layouts, currentLayoutIndex]);

  useEffect(() => {
    const savedLayouts = localStorage.getItem('warehouse_layouts');
    if (savedLayouts) {
      try {
        const parsed = JSON.parse(savedLayouts);
        setLayouts(parsed);
      } catch (e) {
        console.warn('Failed to parse saved layouts:', e);
      }
    }
  }, []);


  useEffect(() => {
    // Skip update if layouts are not loaded or current index is out of bounds
    if (!layouts.length || currentLayoutIndex >= layouts.length) return;

    const updatedLayouts = [...layouts];
    updatedLayouts[currentLayoutIndex] = {
      ...updatedLayouts[currentLayoutIndex],
      cubes,
      bounds,
    };
    setLayouts(updatedLayouts);
    localStorage.setItem('warehouse_layouts', JSON.stringify(updatedLayouts));
  }, [cubes, bounds]);






  const toggleMusic = useCallback(() => {
    if (!audioRef.current) return;
    if (musicOn) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
    setMusicOn(prev => !prev);
  }, [musicOn]);

  const cameraSettings = useMemo(() => ({ position: [3, 3, 5], fov: 75 }), []);

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
        handleExport={handleExport}
        handleImport={handleImport}
        cubes={cubes}
        setCubes={setCubes}
        setShowMapView={setShowMapView}
        showMapView={showMapView}
        toggleMusic={toggleMusic}
        musicOn={musicOn}
        bounds={bounds}
        onBoundsChange={(newBounds) => setBounds(prev => ({ ...prev, ...newBounds }))}
      />

      <Canvas camera={cameraSettings} shadows>
        <SceneContents
          cubes={cubes}
          selectedRef={selectedRef}
          setSelectedRef={setSelectedRef}
          searchQuery={searchQuery}
          onRightClick={setDimensionTargetRef}
          snapEnabled={snapEnabled}
          setDimensionTargetRef={setDimensionTargetRef}
          updateCubes={applyCubesUpdate}
          bounds={bounds}
        />
      </Canvas>

      <ControlsHint />

      {dimensionTargetRef && (
        <DimensionEditor
          refTarget={dimensionTargetRef}
          getCubeSize={getCubeSize}
          updateCubeSize={updateCubeSize}
          onClose={() => setDimensionTargetRef(null)}
          item={cubes.find(c => c.ref?.current === dimensionTargetRef?.current)?.item}
        />
      )}

      <ItemEditor cube={getSelectedCube()} onUpdate={updateCubeItem} onShip={shipCube} />

      {showMapView && (
        <TopDownMapView
          cubes={cubes}
          selectedRef={selectedRef}
          onClose={() => setShowMapView(false)}
          bounds={bounds}
        />
      )}

      <LayoutSwitcher
        layouts={layouts}
        currentLayoutIndex={currentLayoutIndex}
        setCurrentLayoutIndex={setCurrentLayoutIndex}
        setLayouts={setLayouts}
      />


    </>
  );
}
