import React, { useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import Atmosphere from './Atmosphere';
import Markers from './Markers';
import TranslationArc from './TranslationArc';
import { CountryMarker } from '../../types/globe';

interface GlobeProps {
  sourceCountry?: CountryMarker;
  targetCountry?: CountryMarker;
}

const Globe: React.FC<GlobeProps> = ({ sourceCountry, targetCountry }) => {
  const globeRef = useRef<THREE.Mesh>(null);
  const GLOBE_RADIUS = 100;

  useEffect(() => {
    if (globeRef.current && sourceCountry && targetCountry) {
      // Rotate globe to focus on the source country
      const phi = (90 - sourceCountry.lat) * (Math.PI / 180);
      const theta = (sourceCountry.lng + 90) * (Math.PI / 180);
      
      globeRef.current.rotation.y = theta;
      globeRef.current.rotation.x = phi;
    }
  }, [sourceCountry, targetCountry]);

  return (
    <Canvas
      camera={{ position: [0, 0, 300], fov: 45 }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.1} />
      <directionalLight position={[100, 100, 100]} intensity={1.5} />
      <pointLight position={[-100, -100, -100]} intensity={0.5} />
      
      <group>
        <mesh ref={globeRef}>
          <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
          <meshPhongMaterial
            map={new THREE.TextureLoader().load('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg')}
            bumpMap={new THREE.TextureLoader().load('https://unpkg.com/three-globe/example/img/earth-topology.png')}
            bumpScale={0.5}
            specularMap={new THREE.TextureLoader().load('https://unpkg.com/three-globe/example/img/earth-water.png')}
            specular={new THREE.Color(0x666666)}
            shininess={60}
          />
        </mesh>
        
        <Atmosphere radius={GLOBE_RADIUS} />
        
        {sourceCountry && targetCountry && (
          <>
            <Markers 
              markers={[sourceCountry, targetCountry]} 
              radius={GLOBE_RADIUS} 
            />
            <TranslationArc 
              source={sourceCountry} 
              target={targetCountry} 
              radius={GLOBE_RADIUS} 
            />
          </>
        )}
      </group>

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        rotateSpeed={0.5}
        autoRotate={!sourceCountry}
        autoRotateSpeed={0.5}
      />
    </Canvas>
  );
};

export default Globe;