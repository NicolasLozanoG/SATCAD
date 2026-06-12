import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, Box, Line, QuadraticBezierLine } from '@react-three/drei';
import { useFactoryStore } from '../store/useFactoryStore';
import { BUILDINGS } from '../data/buildings';
import * as THREE from 'three';
import { MachineShape } from './MachineShapes';

const UNIT = 8;

const SelectionProjector = () => {
  const { camera } = useThree();
  const { buildings, setSelectedEntity } = useFactoryStore();

  useEffect(() => {
    const handleBoxSelection = (e) => {
      const { minX, maxX, minY, maxY, canvasRect } = e.detail;
      const selectedIds = [];
      
      buildings.forEach(b => {
        const bData = BUILDINGS[b.type];
        const vector = new THREE.Vector3(b.x * UNIT, (b.y + bData.height / 2) * UNIT, b.z * UNIT);
        vector.project(camera);
        
        const sx = (vector.x * 0.5 + 0.5) * canvasRect.width + canvasRect.left;
        const sy = (vector.y * -0.5 + 0.5) * canvasRect.height + canvasRect.top;
        
        if (sx >= minX && sx <= maxX && sy >= minY && sy <= maxY) {
          selectedIds.push(b.id);
        }
      });
      
      if (selectedIds.length > 0) {
         setSelectedEntity(selectedIds, true);
      }
    };

    window.addEventListener('boxSelectionComplete', handleBoxSelection);
    return () => window.removeEventListener('boxSelectionComplete', handleBoxSelection);
  }, [camera, buildings, setSelectedEntity]);

  return null;
};

const Port = ({ isInput, position, onClick }) => {
  return (
    <Box 
      args={[2.5, 2.5, 2.5]} 
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <meshStandardMaterial color={isInput ? '#22c55e' : '#fa9549'} />
    </Box>
  );
};

const BuildingModel = ({ data, buildingData, isSelected, isMoving, onSelect, onPortClick, connectingFrom, onHover, activeTool, moveModeBuildingId, onPlaceBuilding }) => {
  const color = isSelected ? '#ffffff' : buildingData.color;
  const w = buildingData.width * UNIT;
  const d = buildingData.depth * UNIT;
  const h = buildingData.height * UNIT;
  const rotation = data.rotation || 0;

  const handleClick = (e) => {
    e.stopPropagation();
    if (e.button !== 0) return;
    
    if (activeTool || moveModeBuildingId) {
      if (onPlaceBuilding) onPlaceBuilding(e);
      return;
    }

    if (connectingFrom && connectingFrom.bId !== data.id) {
      if (buildingData.inputs && buildingData.inputs.length > 0) {
        const inp = buildingData.inputs[0];
        const rx = inp.x * Math.cos(rotation) - inp.z * Math.sin(rotation);
        const rz = inp.x * Math.sin(rotation) + inp.z * Math.cos(rotation);
        const wx = data.x * UNIT + (rx * UNIT);
        const wy = data.y * UNIT + 2; // Ports are at height 2 from the building's base
        const wz = data.z * UNIT + (rz * UNIT);
        onPortClick(data.id, inp.id, 'input', wx, wy, wz);
        return;
      }
    }
    onSelect(data.id, e.shiftKey);
  };

  const handlePointerMove = (e) => {
    if (onHover && e.face) {
      e.stopPropagation();
      onHover(e.point, data, buildingData, e.face.normal);
    }
  };

  return (
    <group position={[data.x * UNIT, data.y * UNIT, data.z * UNIT]}>
      <MachineShape 
        type={data.type}
        w={w} h={h} d={d}
        color={color}
        rotation={rotation}
        isMoving={isMoving}
        isSelected={isSelected}
        onClick={handleClick}
        onPointerMove={handlePointerMove}
      />

      {/* Render Outputs */}
      {!isMoving && buildingData.outputs && buildingData.outputs.map(out => {
        const rx = out.x * Math.cos(rotation) - out.z * Math.sin(rotation);
        const rz = out.x * Math.sin(rotation) + out.z * Math.cos(rotation);
        const px = rx * UNIT;
        const py = 2; // Standard fixed height relative to building base
        const pz = rz * UNIT;
        return (
          <Port 
            key={out.id} 
            isInput={false} 
            position={[px, py, pz]} 
            onClick={() => onPortClick(data.id, out.id, 'output', data.x * UNIT + px, data.y * UNIT + py, data.z * UNIT + pz)}
          />
        );
      })}

      {/* Render Inputs */}
      {!isMoving && buildingData.inputs && buildingData.inputs.map(inp => {
        const rx = inp.x * Math.cos(rotation) - inp.z * Math.sin(rotation);
        const rz = inp.x * Math.sin(rotation) + inp.z * Math.cos(rotation);
        const px = rx * UNIT;
        const py = 2; 
        const pz = rz * UNIT;
        return (
          <Port 
            key={inp.id} 
            isInput={true} 
            position={[px, py, pz]} 
            onClick={() => onPortClick(data.id, inp.id, 'input', data.x * UNIT + px, data.y * UNIT + py, data.z * UNIT + pz)}
          />
        );
      })}
    </group>
  );
};

const GhostLine = ({ connectingFrom, cursorPosRef }) => {
  const lineRef = useRef();
  useFrame(() => {
    if (lineRef.current && connectingFrom && cursorPosRef.current) {
      const positions = new Float32Array([
        connectingFrom.wx, connectingFrom.wy, connectingFrom.wz,
        cursorPosRef.current.x, cursorPosRef.current.y, cursorPosRef.current.z
      ]);
      lineRef.current.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      lineRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });
  if (!connectingFrom) return null;
  return (
    <line ref={lineRef}>
      <bufferGeometry />
      <lineBasicMaterial color="#fa9549" linewidth={2} />
    </line>
  );
};

const ConveyorBelt = ({ id, sourcePos, targetPos, buildMode, isSelected, onSelect }) => {
  const color = isSelected ? '#ffffff' : '#fa9549';
  const handleClick = (e) => { e.stopPropagation(); onSelect(id, e.shiftKey); };

  if (buildMode === 'smooth') {
    const midX = (sourcePos[0] + targetPos[0]) / 2;
    const midZ = (sourcePos[2] + targetPos[2]) / 2;
    const midY = (sourcePos[1] + targetPos[1]) / 2;
    const dist = Math.sqrt(Math.pow(sourcePos[0]-targetPos[0], 2) + Math.pow(sourcePos[2]-targetPos[2], 2));
    return (
      <QuadraticBezierLine 
        start={sourcePos} end={targetPos} mid={[midX, midY + dist * 0.3, midZ]} 
        color={color} lineWidth={isSelected ? 5 : 3} onClick={handleClick}
      />
    );
  }

  if (buildMode === 'orthogonal') {
    const midPt = [sourcePos[0], sourcePos[1], targetPos[2]];
    return (
      <group onClick={handleClick}>
        <Line points={[sourcePos, midPt]} color={color} lineWidth={isSelected ? 5 : 3} />
        <Line points={[midPt, targetPos]} color={color} lineWidth={isSelected ? 5 : 3} />
      </group>
    );
  }

  return <Line points={[sourcePos, targetPos]} color={color} lineWidth={isSelected ? 5 : 3} onClick={handleClick} />;
};

const PlacementGrid = ({ activeTool, cursorPosRef, currentRotation, moveModeBuildingId, targetElevationRef, onHover, handlePlacementClick, onClearSelection }) => {
  const handleClick = (e) => {
    if (e.button === 0) {
      if (activeTool || moveModeBuildingId) {
        if (handlePlacementClick) handlePlacementClick();
      } else {
        if (onClearSelection) onClearSelection(e);
      }
    }
  };

  const handlePointerMove = (e) => {
    if (onHover) onHover(e.point, null, null, new THREE.Vector3(0, 1, 0)); // Ground level
  };

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} onClick={handleClick} onPointerMove={handlePointerMove} receiveShadow>
      <planeGeometry args={[1000, 1000]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  );
};

// Ghost Building Preview
const GhostBuilding = ({ type, cursorPosRef, rotation, moveModeBuildingId, targetElevationRef }) => {
  const { checkCollision } = useFactoryStore();
  const groupRef = useRef();
  const [isColliding, setIsColliding] = useState(false);
  const bData = BUILDINGS[type];
  
  useFrame(() => {
    if (groupRef.current && cursorPosRef.current) {
      const snap = UNIT / 8;
      const x = Math.round(cursorPosRef.current.x / snap) * snap;
      const z = Math.round(cursorPosRef.current.z / snap) * snap;
      const y = targetElevationRef.current;
      
      groupRef.current.position.set(x, y * UNIT, z);
      
      const colliding = checkCollision(type, x / UNIT, y, z / UNIT, rotation, moveModeBuildingId);
      if (colliding !== isColliding) {
        setIsColliding(colliding);
      }
    }
  });

  if (!bData) return null;
  const w = bData.width * UNIT;
  const d = bData.depth * UNIT;
  const h = bData.height * UNIT;
  const color = isColliding ? '#ef4444' : bData.color;

  return (
    <group ref={groupRef}>
      <MachineShape 
        type={type}
        w={w} h={h} d={d}
        color={color}
        rotation={rotation}
        isMoving={true} // Makes it semi-transparent
        isSelected={false}
      />
      <group rotation={[0, -rotation, 0]}>
        {bData.outputs && bData.outputs.map(out => (
          <Box key={`out-${out.id}`} args={[2.5, 2.5, 2.5]} position={[out.x * UNIT, 2, out.z * UNIT]}>
            <meshStandardMaterial color="#fa9549" transparent opacity={0.7} />
          </Box>
        ))}
        {bData.inputs && bData.inputs.map(inp => (
          <Box key={`inp-${inp.id}`} args={[2.5, 2.5, 2.5]} position={[inp.x * UNIT, 2, inp.z * UNIT]}>
            <meshStandardMaterial color="#22c55e" transparent opacity={0.7} />
          </Box>
        ))}
      </group>
    </group>
  );
};

export const Canvas3D = ({ activeTool, setActiveTool }) => {
  const { buildings, connections, addConnection, selectedIds, cameraMode, blueprintSize, moveModeBuildingId, setSelectedEntity, checkCollision, addBuilding, updateBuilding, setMoveMode } = useFactoryStore();
  const [connectingFrom, setConnectingFrom] = useState(null);
  
  // Custom rotation state for placement
  const [currentRotation, setCurrentRotation] = useState(0);
  const cursorPosRef = useRef(new THREE.Vector3());
  const targetElevationRef = useRef(0);
  
  // Selection box and Shift state
  const [boxStart, setBoxStart] = useState(null);
  const [boxCurrent, setBoxCurrent] = useState(null);
  const [isShiftDown, setIsShiftDown] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Shift') setIsShiftDown(true);
    };
    const handleKeyUp = (e) => {
      if (e.key === 'Shift') setIsShiftDown(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Sync rotation when entering move mode
  useEffect(() => {
    if (moveModeBuildingId) {
      const b = buildings.find(b => b.id === moveModeBuildingId);
      if (b) setCurrentRotation(b.rotation || 0);
    }
  }, [moveModeBuildingId, buildings]);

  // Handle R key for rotation and Escape to cancel tool
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key.toLowerCase() === 'r') {
        setCurrentRotation(prev => (prev + Math.PI / 2) % (Math.PI * 2));
      }
      if (e.key === 'Escape') {
        if (setActiveTool) setActiveTool(null);
        if (setMoveMode) setMoveMode(null);
        setConnectingFrom(null);
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (e.target.tagName.toLowerCase() === 'input' || e.target.tagName.toLowerCase() === 'textarea') return;
        const state = useFactoryStore.getState();
        if (state.selectedIds && state.selectedIds.length > 0) {
          state.removeSelected();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveTool, setMoveMode]);

  const handlePortClick = (bId, pId, type, wx, wy, wz) => {
    if (type === 'output') {
      setConnectingFrom({ bId, pId, wx, wy, wz });
    } else if (type === 'input' && connectingFrom) {
      if (connectingFrom.bId !== bId) addConnection(connectingFrom.bId, connectingFrom.pId, bId, pId, 'default');
      setConnectingFrom(null);
    }
  };

  const handleCanvasMissed = (e) => {
    if (!moveModeBuildingId && !e.shiftKey) setSelectedEntity(null);
    setConnectingFrom(null);
  };

  const handlePointerDown = (e) => {
    if (e.shiftKey && e.button === 0) {
      setBoxStart({ x: e.clientX, y: e.clientY });
      setBoxCurrent({ x: e.clientX, y: e.clientY });
    }
  };

  const handlePointerMove = (e) => {
    if (boxStart) {
      setBoxCurrent({ x: e.clientX, y: e.clientY });
    }
  };

  const handlePointerUp = (e) => {
    if (boxStart && boxCurrent) {
      const minX = Math.min(boxStart.x, boxCurrent.x);
      const maxX = Math.max(boxStart.x, boxCurrent.x);
      const minY = Math.min(boxStart.y, boxCurrent.y);
      const maxY = Math.max(boxStart.y, boxCurrent.y);
      
      if (maxX - minX > 5 || maxY - minY > 5) {
        // Find canvas element to project coordinates
        const canvasRect = e.target.getBoundingClientRect();
        
        // This requires access to the camera inside Canvas.
        // We'll dispatch a custom event that a child component inside Canvas will catch
        // because we can't easily access the camera from here (outside Canvas scope).
        window.dispatchEvent(new CustomEvent('boxSelectionComplete', {
          detail: { minX, maxX, minY, maxY, canvasRect }
        }));
      }
      
      setBoxStart(null);
      setBoxCurrent(null);
    }
  };

  const handleHover = (point, targetData, targetBData, normal) => {
    if (cursorPosRef.current) {
      const type = moveModeBuildingId ? buildings.find(b => b.id === moveModeBuildingId)?.type : activeTool;
      const bData = type ? BUILDINGS[type] : null;

      if (targetData && targetBData && normal && bData) {
        const tRot = targetData.rotation || 0;
        const tIsSwapped = Math.abs(Math.sin(tRot)) > 0.5;
        const tSpanX = (tIsSwapped ? targetBData.depth : targetBData.width) * UNIT;
        const tSpanZ = (tIsSwapped ? targetBData.width : targetBData.depth) * UNIT;

        const nIsSwapped = Math.abs(Math.sin(currentRotation)) > 0.5;
        const nSpanX = (nIsSwapped ? bData.depth : bData.width) * UNIT;
        const nSpanZ = (nIsSwapped ? bData.width : bData.depth) * UNIT;

        if (Math.abs(normal.y) > 0.5) {
          cursorPosRef.current.copy(point);
          targetElevationRef.current = targetData.y + (normal.y > 0 ? targetBData.height : -bData.height);
        } else {
          let nx = point.x;
          let nz = point.z;

          if (Math.abs(normal.x) > 0.5) {
            const faceX = targetData.x * UNIT + (Math.sign(normal.x) * tSpanX / 2);
            nx = faceX + (Math.sign(normal.x) * nSpanX / 2);
          }
          if (Math.abs(normal.z) > 0.5) {
            const faceZ = targetData.z * UNIT + (Math.sign(normal.z) * tSpanZ / 2);
            nz = faceZ + (Math.sign(normal.z) * nSpanZ / 2);
          }
          cursorPosRef.current.set(nx, point.y, nz);
          targetElevationRef.current = targetData.y;
        }
      } else {
        cursorPosRef.current.copy(point);
        targetElevationRef.current = 0;
      }
    }
  };

  const handlePlacementClick = () => {
    if (!activeTool && !moveModeBuildingId) return;

    const snap = UNIT / 8;
    const x = Math.round(cursorPosRef.current.x / snap) * snap / UNIT;
    const z = Math.round(cursorPosRef.current.z / snap) * snap / UNIT;
    const y = targetElevationRef.current;
    
    const type = moveModeBuildingId ? buildings.find(b => b.id === moveModeBuildingId)?.type : activeTool;
    
    if (useFactoryStore.getState().checkCollision(type, x, y, z, currentRotation, moveModeBuildingId)) {
      return; // Prevent placement on collision
    }

    if (moveModeBuildingId) {
      updateBuilding(moveModeBuildingId, { x, y, z, rotation: currentRotation });
      setMoveMode(null); // Stop moving
    } else if (activeTool) {
      addBuilding(activeTool, x, y, z, currentRotation);
    }
  };

  const renderConnections = connections.map(conn => {
    const sB = buildings.find(b => b.id === conn.sourceId);
    const tB = buildings.find(b => b.id === conn.targetId);
    if (!sB || !tB) return null;

    const sData = BUILDINGS[sB.type].outputs.find(o => o.id === conn.sourcePort);
    const tData = BUILDINGS[tB.type].inputs.find(i => i.id === conn.targetPort);
    if (!sData || !tData) return null;

    const sRot = sB.rotation || 0;
    const tRot = tB.rotation || 0;

    const srx = sData.x * Math.cos(sRot) - sData.z * Math.sin(sRot);
    const srz = sData.x * Math.sin(sRot) + sData.z * Math.cos(sRot);
    const sPos = [sB.x * UNIT + srx * UNIT, sB.y * UNIT + 2, sB.z * UNIT + srz * UNIT];

    const trx = tData.x * Math.cos(tRot) - tData.z * Math.sin(tRot);
    const trz = tData.x * Math.sin(tRot) + tData.z * Math.cos(tRot);
    const tPos = [tB.x * UNIT + trx * UNIT, tB.y * UNIT + 2, tB.z * UNIT + trz * UNIT];

    return (
      <ConveyorBelt key={conn.id} id={conn.id} sourcePos={sPos} targetPos={tPos} buildMode={conn.buildMode} isSelected={selectedIds.includes(conn.id)} onSelect={setSelectedEntity} />
    );
  });

  return (
    <div 
      className="canvas-container" 
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onContextMenu={(e) => { 
        e.preventDefault(); 
        setConnectingFrom(null); 
        if (setActiveTool) setActiveTool(null); 
        if (setMoveMode) setMoveMode(null); 
      }} 
    >
      {boxStart && boxCurrent && (
        <div style={{
          position: 'fixed',
          left: Math.min(boxStart.x, boxCurrent.x),
          top: Math.min(boxStart.y, boxCurrent.y),
          width: Math.abs(boxCurrent.x - boxStart.x),
          height: Math.abs(boxCurrent.y - boxStart.y),
          backgroundColor: 'rgba(250, 149, 73, 0.3)',
          border: '1px solid #fa9549',
          pointerEvents: 'none',
          zIndex: 1000
        }} />
      )}
      <Canvas 
        shadows 
        camera={{ position: [0, 50, 50], fov: 45 }} 
        orthographic={cameraMode === '2D'}
        onPointerMissed={handleCanvasMissed}
      >
        <SelectionProjector />
        <color attach="background" args={['#12141c']} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[50, 100, 50]} intensity={1} castShadow />

        <Grid infiniteGrid fadeDistance={200} sectionColor="#333333" cellColor="#222222" cellSize={UNIT / 2} sectionSize={UNIT} />

        {/* Blueprint Boundary Box */}
        <group position={[0, blueprintSize / 2, 0]} renderOrder={-1}>
          <mesh>
            <boxGeometry args={[blueprintSize, blueprintSize, blueprintSize]} />
            <meshBasicMaterial color="#3b82f6" transparent opacity={0.05} depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
          <mesh>
            <boxGeometry args={[blueprintSize, blueprintSize, blueprintSize]} />
            <meshBasicMaterial color="#3b82f6" wireframe transparent opacity={0.2} />
          </mesh>
        </group>

        <PlacementGrid 
          activeTool={activeTool} cursorPosRef={cursorPosRef} currentRotation={currentRotation} 
          moveModeBuildingId={moveModeBuildingId} targetElevationRef={targetElevationRef} 
          onHover={handleHover} handlePlacementClick={handlePlacementClick} onClearSelection={handleCanvasMissed}
        />
        
        {(activeTool || moveModeBuildingId) && (
          <GhostBuilding 
            type={moveModeBuildingId ? buildings.find(b => b.id === moveModeBuildingId)?.type : activeTool} 
            cursorPosRef={cursorPosRef} 
            rotation={currentRotation} 
            moveModeBuildingId={moveModeBuildingId}
            targetElevationRef={targetElevationRef}
          />
        )}

        {buildings.map(b => (
          <BuildingModel 
            key={b.id} data={b} buildingData={BUILDINGS[b.type]}
            isSelected={selectedIds.includes(b.id)} isMoving={moveModeBuildingId === b.id}
            onSelect={setSelectedEntity} onPortClick={handlePortClick} connectingFrom={connectingFrom}
            onHover={handleHover} activeTool={activeTool} moveModeBuildingId={moveModeBuildingId} onPlaceBuilding={() => handlePlacementClick()}
          />
        ))}

        {renderConnections}
        <GhostLine connectingFrom={connectingFrom} cursorPosRef={cursorPosRef} />

        <OrbitControls 
          makeDefault 
          enableDamping={false} 
          enableRotate={cameraMode === '3D' && !isShiftDown} 
          enablePan={!isShiftDown}
          enableZoom={!isShiftDown}
          maxPolarAngle={cameraMode === '2D' ? 0 : Math.PI / 2.1} 
          minPolarAngle={cameraMode === '2D' ? 0 : 0} 
        />
      </Canvas>
    </div>
  );
};
