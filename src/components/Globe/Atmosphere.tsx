import React from 'react';
import * as THREE from 'three';

interface AtmosphereProps {
  radius: number;
}

const Atmosphere: React.FC<AtmosphereProps> = ({ radius }) => {
  const atmosphereGeometry = new THREE.SphereGeometry(radius * 1.1, 64, 64);
  const atmosphereMaterial = new THREE.ShaderMaterial({
    transparent: true,
    side: THREE.BackSide,
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vPosition;
      
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vNormal;
      varying vec3 vPosition;
      
      void main() {
        float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
        gl_FragColor = vec4(0.3, 0.6, 1.0, intensity * 0.5);
      }
    `,
  });

  return <mesh geometry={atmosphereGeometry} material={atmosphereMaterial} />;
};

export default Atmosphere;