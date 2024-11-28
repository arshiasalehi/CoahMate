import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const ThreeDPyramid = ({ onTabSelect }) => {
  const mountRef = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({ alpha: true }); // Enable transparency
    renderer.setSize(400, 400);
    mountRef.current.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(
      75,
      renderer.domElement.clientWidth / renderer.domElement.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 3;

    // Create the pyramid geometry
    const geometry = new THREE.TetrahedronGeometry();

    // Generate a canvas texture for the Sign In form
    const createFormTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');

      // Draw form background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add form title
      ctx.fillStyle = '#333';
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Sign In', canvas.width / 2, 50);

      // Add form fields (simplified as text placeholders)
      ctx.fillStyle = '#666';
      ctx.font = '16px Arial';
      ctx.fillText('Email:', 100, 150);
      ctx.fillRect(150, 135, 200, 30);

      ctx.fillText('Password:', 100, 200);
      ctx.fillRect(150, 185, 200, 30);

      // Add button
      ctx.fillStyle = '#007BFF';
      ctx.fillRect(200, 300, 100, 40);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('Login', 250, 325);

      return new THREE.CanvasTexture(canvas);
    };

    // Create materials
    const materials = [
      new THREE.MeshBasicMaterial({ map: createFormTexture() }), // Sign In
      new THREE.MeshBasicMaterial({ color: 0x33ff57 }), // Sign Up
      new THREE.MeshBasicMaterial({ color: 0x3357ff }), // Help Center
      new THREE.MeshBasicMaterial({ color: 0xffff33 }), // Logo
    ];

    const pyramid = new THREE.Mesh(geometry, materials);
    scene.add(pyramid);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const handleMouseClick = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObject(pyramid, true);

      if (intersects.length > 0) {
        const faceIndex = Math.floor(intersects[0].faceIndex / 3); // Map to face group
        if (faceIndex === 0) onTabSelect('login'); // Show full Sign In form
        if (faceIndex === 1) onTabSelect('signup');
        if (faceIndex === 2) onTabSelect('about');
        if (faceIndex === 3) console.log('Logo clicked!');
      }
    };

    renderer.domElement.addEventListener('click', handleMouseClick);

    const animate = () => {
      requestAnimationFrame(animate);
      pyramid.rotation.y += 0.01;
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      renderer.domElement.removeEventListener('click', handleMouseClick);
      mountRef.current.removeChild(renderer.domElement);
    };
  }, [onTabSelect]);

  return <div ref={mountRef}></div>;
};

export default ThreeDPyramid;
