import { useEffect } from 'react';
import * as THREE from 'three';

export function useCameraControls(camera, orbitControlsRef) {
  useEffect(() => {
    const keys = {};
    const direction = new THREE.Vector3();
    const right = new THREE.Vector3();
    const moveVector = new THREE.Vector3();
    const baseSpeed = 8; // units per second
    let lastTime = performance.now();

    const isTyping = () => {
      const el = document.activeElement;
      return el && (
        el.tagName === 'INPUT' ||
        el.tagName === 'TEXTAREA' ||
        el.isContentEditable
      );
    };

    const handleFrame = () => {
      if (isTyping()) return;

      const now = performance.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      if (!Object.values(keys).some(Boolean)) return;

      camera.getWorldDirection(direction);
      direction.y = 0;
      direction.normalize();
      right.crossVectors(direction, camera.up).normalize();

      moveVector.set(0, 0, 0);
      if (keys['w'] || keys['arrowup']) moveVector.add(direction);
      if (keys['s'] || keys['arrowdown']) moveVector.sub(direction);
      if (keys['a'] || keys['arrowleft']) moveVector.sub(right);
      if (keys['d'] || keys['arrowright']) moveVector.add(right);

      moveVector.normalize().multiplyScalar(baseSpeed * delta);
      camera.position.add(moveVector);
      orbitControlsRef.current?.target.add(moveVector);

      if (keys['q']) camera.position.add(direction.clone().multiplyScalar(baseSpeed * delta));
      if (keys['e']) camera.position.sub(direction.clone().multiplyScalar(baseSpeed * delta));

      orbitControlsRef.current?.update();
    };

    const handleKey = (e, pressed) => {
      keys[e.key.toLowerCase()] = pressed;
    };

    const tick = () => {
      handleFrame();
      requestAnimationFrame(tick);
    };
    tick();

    window.addEventListener('keydown', e => handleKey(e, true));
    window.addEventListener('keyup', e => handleKey(e, false));
    return () => {
      window.removeEventListener('keydown', e => handleKey(e, true));
      window.removeEventListener('keyup', e => handleKey(e, false));
    };
  }, [camera, orbitControlsRef]);
}
