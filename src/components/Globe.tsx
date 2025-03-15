import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { geoInterpolate } from 'd3-geo';

interface GlobeProps {
  sourceCountry?: { lat: number; lng: number; code: string };
  targetCountry?: { lat: number; lng: number; code: string };
}

const Globe: React.FC<GlobeProps> = ({ sourceCountry, targetCountry }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const globeRef = useRef<THREE.Mesh | null>(null);
  const arcRef = useRef<THREE.Line | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      45,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 300;
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Globe creation
    const radius = 100;
    const segments = 64;
    const geometry = new THREE.SphereGeometry(radius, segments, segments);
    
    // Load earth texture
    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load('https://unpkg.com/three-globe/example/img/earth-dark.jpg');
    const bumpTexture = textureLoader.load('https://unpkg.com/three-globe/example/img/earth-topology.png');
    
    const material = new THREE.MeshPhongMaterial({
      map: earthTexture,
      bumpMap: bumpTexture,
      bumpScale: 0.5,
      shininess: 0.5
    });

    const globe = new THREE.Mesh(geometry, material);
    scene.add(globe);
    globeRef.current = globe;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xbbbbbb);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(1000, 1000, 1000);
    scene.add(directionalLight);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.rotateSpeed = 0.5;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update arc when countries change
  useEffect(() => {
    if (!sceneRef.current || !sourceCountry || !targetCountry) return;

    // Remove existing arc
    if (arcRef.current) {
      sceneRef.current.remove(arcRef.current);
      arcRef.current = null;
    }

    // Create new arc
    const points = createArcPoints(
      sourceCountry.lat,
      sourceCountry.lng,
      targetCountry.lat,
      targetCountry.lng
    );

    const arcGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const arcMaterial = new THREE.LineBasicMaterial({
      color: 0x4CAF50,
      linewidth: 2,
      transparent: true,
      opacity: 0.8
    });

    const arc = new THREE.Line(arcGeometry, arcMaterial);
    sceneRef.current.add(arc);
    arcRef.current = arc;

  }, [sourceCountry, targetCountry]);

  const createArcPoints = (startLat: number, startLng: number, endLat: number, endLng: number) => {
    const points = [];
    const segments = 100;
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      
      // Interpolate between start and end points
      const lat = startLat + (endLat - startLat) * t;
      const lng = startLng + (endLng - startLng) * t;
      
      // Convert to radians
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lng + 180) * (Math.PI / 180);
      
      // Calculate point on sphere
      const x = -100 * Math.sin(phi) * Math.cos(theta);
      const y = 100 * Math.cos(phi);
      const z = 100 * Math.sin(phi) * Math.sin(theta);
      
      // Add arc height
      const arcHeight = Math.sin(Math.PI * t) * 20;
      const normalized = new THREE.Vector3(x, y, z).normalize();
      const point = normalized.multiplyScalar(100 + arcHeight);
      
      points.push(point);
    }
    
    return points;
  };

  return <div ref={containerRef} className="w-full h-full" />;
};

export default Globe;