import React from 'react';
import * as THREE from 'three';
import { CountryMarker } from '../../types/globe';

interface MarkersProps {
  markers: CountryMarker[];
  radius: number;
}

const Markers: React.FC<MarkersProps> = ({ markers, radius }) => {
  const markerGeometry = new THREE.SphereGeometry(radius * 0.02, 16, 16);
  const markerMaterial = new THREE.MeshPhongMaterial({
    color: 0x4CAF50,
    emissive: 0x2E7D32,
    emissiveIntensity: 0.5,
  });

  return (
    <group>
      {markers.map((marker, index) => {
        const phi = (90 - marker.lat) * (Math.PI / 180);
        const theta = (marker.lng + 180) * (Math.PI / 180);
        
        const x = -radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.sin(theta);

        return (
          <mesh
            key={index}
            geometry={markerGeometry}
            material={markerMaterial}
            position={[x, y, z]}
          >
            <meshPhongMaterial color={0x4CAF50} emissive={0x2E7D32} emissiveIntensity={0.5} />
          </mesh>
        );
      })}
    </group>
  );
};

export default Markers;