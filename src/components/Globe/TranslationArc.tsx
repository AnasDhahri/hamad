import React, { useMemo } from 'react';
import * as THREE from 'three';
import { CountryMarker } from '../../types/globe';

interface TranslationArcProps {
  source?: CountryMarker;
  target?: CountryMarker;
  radius: number;
}

const TranslationArc: React.FC<TranslationArcProps> = ({ source, target, radius }) => {
  const arcPoints = useMemo(() => {
    if (!source || !target) return [];

    const points = [];
    const segments = 100;

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      
      // Interpolate between source and target
      const lat = source.lat + (target.lat - source.lat) * t;
      const lng = source.lng + (target.lng - source.lng) * t;
      
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lng + 180) * (Math.PI / 180);
      
      const x = -radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.cos(phi);
      const z = radius * Math.sin(phi) * Math.sin(theta);
      
      // Add arc height
      const arcHeight = Math.sin(Math.PI * t) * (radius * 0.3);
      const normalized = new THREE.Vector3(x, y, z).normalize();
      points.push(normalized.multiplyScalar(radius + arcHeight));
    }
    
    return points;
  }, [source, target, radius]);

  if (!source || !target || arcPoints.length === 0) return null;

  const arcGeometry = new THREE.BufferGeometry().setFromPoints(arcPoints);
  const arcMaterial = new THREE.LineBasicMaterial({
    color: 0x4CAF50,
    linewidth: 2,
    transparent: true,
    opacity: 0.8,
  });

  return <line geometry={arcGeometry} material={arcMaterial} />;
};

export default TranslationArc;