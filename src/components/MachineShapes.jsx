import React from 'react';
import { Box } from '@react-three/drei';
import * as THREE from 'three';

export const MachineShape = ({ type, w, h, d, color, isMoving, isSelected, onClick, onPointerMove, onPointerDown, onPointerUp, onDoubleClick, rotation }) => {
  return (
    <group position={[0, 0, 0]}>
      <Box 
        args={[w, h, d]} 
        position={[0, h / 2, 0]}
        rotation={[0, -rotation, 0]}
        onClick={onClick}
        onPointerMove={onPointerMove}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onDoubleClick={onDoubleClick}
        raycast={isMoving ? () => null : undefined}
      >
        <meshStandardMaterial 
          color={color} 
          transparent 
          opacity={isMoving ? 0.3 : 0.9} 
        />
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(w, h, d)]} />
          <lineBasicMaterial 
            color={isSelected ? '#fa9549' : '#000000'} 
            linewidth={isSelected ? 3 : 2} 
          />
        </lineSegments>
      </Box>
    </group>
  );
};
