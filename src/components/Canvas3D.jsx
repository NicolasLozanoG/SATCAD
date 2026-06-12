import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, Box, Line, QuadraticBezierLine } from '@react-three/drei';
import { useFactoryStore } from '../store/useFactoryStore';
import { BUILDINGS } from '../data/buildings';
import * as THREE from 'three';
import { MachineShape } from './MachineShapes';

const UNIT = 8;

const getDragBuildPositions = (type, startPos, endPos, startElev, endElev, rotation) => {
  const bData = BUILDINGS[type];
  if (!bData) return [];
  if (bData.subCategory !== 'foundation' && bData.subCategory !== 'wall') {
    return [{ x: endPos.x, y: endElev, z: endPos.z }];
  }

  const snap = UNIT / 8;
  const x1 = Math.round(startPos.x / snap) * snap;
  const z1 = Math.round(startPos.z / snap) * snap;
  const y1 = startElev;
  
  const x2 = Math.round(endPos.x / snap) * snap;
  const z2 = Math.round(endPos.z / snap) * snap;
  
  const positions = [];
  
  const isSwapped = Math.abs(Math.sin(rotation)) > 0.5;
  const stepX = (isSwapped ? bData.depth : bData.width) * UNIT;
  const stepZ = (isSwapped ? bData.width : bData.depth) * UNIT;

  if (bData.subCategory === 'foundation') {
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minZ = Math.min(z1, z2);
    const maxZ = Math.max(z1, z2);
    
    for (let x = minX; x <= maxX + 0.001; x += stepX) {
      for (let z = minZ; z <= maxZ + 0.001; z += stepZ) {
        positions.push({ x, y: y1, z });
      }
    }
  } else if (bData.subCategory === 'wall') {
    if (Math.abs(x2 - x1) > Math.abs(z2 - z1)) {
      const minX = Math.min(x1, x2);
      const maxX = Math.max(x1, x2);
      for (let x = minX; x <= maxX + 0.001; x += stepX) {
        positions.push({ x, y: y1, z: z1 });
      }
    } else {
      const minZ = Math.min(z1, z2);
      const maxZ = Math.max(z1, z2);
      for (let z = minZ; z <= maxZ + 0.001; z += stepZ) {
        positions.push({ x: x1, y: y1, z });
      }
    }
  }
  return positions;
};

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

const BuildingModel = ({ data, buildingData, isSelected, isMoving, onSelect, onDoubleClick, onPortClick, connectingFrom, onHover, activeTool, moveModeBuildingId, onPlaceBuildingDown, onPlaceBuildingUp, onPlaceBuildingClick }) => {
  const color = isSelected ? '#ffffff' : buildingData.color;
  const w = buildingData.width * UNIT;
  const d = buildingData.depth * UNIT;
  const h = buildingData.height * UNIT;
  const rotation = data.rotation || 0;

  const handlePointerDown = (e) => {
    if (e.button === 0 && (activeTool || moveModeBuildingId)) {
      if (onPlaceBuildingDown) onPlaceBuildingDown(e);
    }
  };

  const handlePointerUp = (e) => {
    if (e.button === 0 && (activeTool || moveModeBuildingId)) {
      if (onPlaceBuildingUp) onPlaceBuildingUp(e);
    }
  };

  const handleClick = (e) => {
    e.stopPropagation();
    if (e.button !== 0) return;
    
    if (activeTool || moveModeBuildingId) {
      if (onPlaceBuildingClick) onPlaceBuildingClick(e);
      return;
    }

    if (connectingFrom && connectingFrom.bId !== data.id) {
      if (buildingData.inputs && buildingData.inputs.length > 0) {
        const inp = buildingData.inputs[0];
        const rx = inp.x * Math.cos(rotation) - inp.z * Math.sin(rotation);
        const rz = inp.x * Math.sin(rotation) + inp.z * Math.cos(rotation);
        const wx = data.x * UNIT + (rx * UNIT);
        const wy = data.y * UNIT + 2;
        const wz = data.z * UNIT + (rz * UNIT);
        onPortClick(data.id, inp.id, 'input', wx, wy, wz);
        return;
      }
    }
    onSelect(data.id, e.shiftKey);
  };

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    if (e.button !== 0) return;
    if (!activeTool && !moveModeBuildingId) {
      if (onDoubleClick) onDoubleClick(data.id);
    }
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
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onPointerMove={handlePointerMove}
      />

      {!isMoving && buildingData.outputs && buildingData.outputs.map(out => {
        const rx = out.x * Math.cos(rotation) - out.z * Math.sin(rotation);
        const rz = out.x * Math.sin(rotation) + out.z * Math.cos(rotation);
        const px = rx * UNIT;
        const py = 2;
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

const PlacementGrid = ({ activeTool, moveModeBuildingId, onHover, handlePlacementDown, handlePlacementUp, handlePlacementClick, onClearSelection }) => {
  const handleDown = (e) => {
    if (e.button === 0 && (activeTool || moveModeBuildingId)) {
      if (handlePlacementDown) handlePlacementDown(e);
    }
  };

  const handleUp = (e) => {
    if (e.button === 0 && (activeTool || moveModeBuildingId)) {
      if (handlePlacementUp) handlePlacementUp(e);
    }
  };

  const handleClick = (e) => {
    if (e.button === 0) {
      if (activeTool || moveModeBuildingId) {
        if (handlePlacementClick) handlePlacementClick(e);
      } else {
        if (onClearSelection) onClearSelection(e);
      }
    }
  };

  const handlePointerMove = (e) => {
    if (onHover) onHover(e.point, null, null, new THREE.Vector3(0, 1, 0)); // Ground level
  };

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} onPointerDown={handleDown} onPointerUp={handleUp} onClick={handleClick} onPointerMove={handlePointerMove} receiveShadow>
      <planeGeometry args={[1000, 1000]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  );
};

const GhostBuildingPreview = ({ type, cursorPosRef, rotation, moveModeBuildingId, targetElevationRef, dragStartInfo, isDraggingBuild }) => {
  const { checkCollision } = useFactoryStore();
  const [positions, setPositions] = useState([]);
  const bData = BUILDINGS[type];
  
  useFrame(() => {
    if (cursorPosRef.current) {
      if (isDraggingBuild && dragStartInfo) {
        const newPositions = getDragBuildPositions(type, dragStartInfo.startPos, cursorPosRef.current, dragStartInfo.elevation, targetElevationRef.current, rotation);
        setPositions(prev => {
          if (prev.length !== newPositions.length) return newPositions;
          if (prev.length > 0 && (prev[0].x !== newPositions[0].x || prev[prev.length-1].x !== newPositions[newPositions.length-1].x || prev[prev.length-1].z !== newPositions[newPositions.length-1].z)) return newPositions;
          return prev;
        });
      } else {
        const snap = UNIT / 8;
        const x = Math.round(cursorPosRef.current.x / snap) * snap;
        const z = Math.round(cursorPosRef.current.z / snap) * snap;
        const y = targetElevationRef.current;
        setPositions(prev => {
           if (prev.length !== 1 || prev[0].x !== x || prev[0].y !== y || prev[0].z !== z) {
             return [{ x, y, z }];
           }
           return prev;
        });
      }
    }
  });

  if (!bData) return null;
  const w = bData.width * UNIT;
  const d = bData.depth * UNIT;
  const h = bData.height * UNIT;

  return (
    <group>
      {positions.map((pos, idx) => {
        const isColliding = checkCollision(type, pos.x / UNIT, pos.y, pos.z / UNIT, rotation, moveModeBuildingId);
        const color = isColliding ? '#ef4444' : bData.color;
        return (
          <group key={idx} position={[pos.x, pos.y * UNIT, pos.z]}>
            <MachineShape 
              type={type}
              w={w} h={h} d={d}
              color={color}
              rotation={rotation}
              isMoving={true} 
              isSelected={false}
            />
            <group rotation={[0, -rotation, 0]}>
              {bData.outputs && bData.outputs.map(out => (
                <Box key={`out-${out.id}`} args={[2.5, 2.5, 2.5]} position={[out.x * UNIT, 2, out.z * UNIT]} raycast={() => null}>
                  <meshStandardMaterial color="#fa9549" transparent opacity={0.7} />
                </Box>
              ))}
              {bData.inputs && bData.inputs.map(inp => (
                <Box key={`inp-${inp.id}`} args={[2.5, 2.5, 2.5]} position={[inp.x * UNIT, 2, inp.z * UNIT]} raycast={() => null}>
                  <meshStandardMaterial color="#22c55e" transparent opacity={0.7} />
                </Box>
              ))}
            </group>
          </group>
        );
      })}
    </group>
  );
};

export const Canvas3D = ({ activeTool, setActiveTool }) => {
  const { buildings, connections, addConnection, selectedIds, cameraMode, blueprintSize, showBlueprintBox, moveModeBuildingId, setSelectedEntity, checkCollision, addBuilding, updateBuilding, setMoveMode } = useFactoryStore();
  const [connectingFrom, setConnectingFrom] = useState(null);
  
  const [currentRotation, setCurrentRotation] = useState(0);
  const cursorPosRef = useRef(new THREE.Vector3());
  const targetElevationRef = useRef(0);
  
  const [boxStart, setBoxStart] = useState(null);
  const [boxCurrent, setBoxCurrent] = useState(null);
  const [isShiftDown, setIsShiftDown] = useState(false);

  // Drag build state
  const dragStartInfoRef = useRef(null);
  const [isDraggingBuild, setIsDraggingBuild] = useState(false);
  const justFinishedDragRef = useRef(false);

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

  useEffect(() => {
    if (moveModeBuildingId) {
      const b = buildings.find(b => b.id === moveModeBuildingId);
      if (b) setCurrentRotation(b.rotation || 0);
    }
  }, [moveModeBuildingId, buildings]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key.toLowerCase() === 'r') {
        setCurrentRotation(prev => (prev + Math.PI / 2) % (Math.PI * 2));
      }
      if (e.key === 'Escape') {
        if (setActiveTool) setActiveTool(null);
        if (setMoveMode) setMoveMode(null);
        setConnectingFrom(null);
        setIsDraggingBuild(false);
        dragStartInfoRef.current = null;
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

  const handlePointerDownWrapper = (e) => {
    if (e.shiftKey && e.button === 0) {
      setBoxStart({ x: e.clientX, y: e.clientY });
      setBoxCurrent({ x: e.clientX, y: e.clientY });
    }
  };

  const handlePointerMoveWrapper = (e) => {
    if (boxStart) {
      setBoxCurrent({ x: e.clientX, y: e.clientY });
    }
  };

  const handlePointerUpWrapper = (e) => {
    if (boxStart && boxCurrent) {
      const minX = Math.min(boxStart.x, boxCurrent.x);
      const maxX = Math.max(boxStart.x, boxCurrent.x);
      const minY = Math.min(boxStart.y, boxCurrent.y);
      const maxY = Math.max(boxStart.y, boxCurrent.y);
      
      if (maxX - minX > 5 || maxY - minY > 5) {
        const canvasRect = e.target.getBoundingClientRect();
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

  const handlePlacementDown = (e) => {
    if (activeTool && !moveModeBuildingId && !isShiftDown) {
      const bData = BUILDINGS[activeTool];
      if (bData && (bData.subCategory === 'foundation' || bData.subCategory === 'wall')) {
        dragStartInfoRef.current = {
          startPos: cursorPosRef.current.clone(),
          elevation: targetElevationRef.current
        };
        setIsDraggingBuild(true);
      }
    }
  };

  const handlePlacementUp = (e) => {
    if (isDraggingBuild && dragStartInfoRef.current) {
      const positions = getDragBuildPositions(activeTool, dragStartInfoRef.current.startPos, cursorPosRef.current, dragStartInfoRef.current.elevation, targetElevationRef.current, currentRotation);
      
      if (positions.length > 1) {
        positions.forEach(pos => {
          const px = pos.x / UNIT;
          const pz = pos.z / UNIT;
          if (!useFactoryStore.getState().checkCollision(activeTool, px, pos.y, pz, currentRotation, null)) {
            addBuilding(activeTool, px, pos.y, pz, currentRotation);
          }
        });
        justFinishedDragRef.current = true;
      }
      setIsDraggingBuild(false);
      dragStartInfoRef.current = null;
    }
  };

  const handlePlacementClick = () => {
    if (justFinishedDragRef.current) {
      justFinishedDragRef.current = false;
      return;
    }

    if (!activeTool && !moveModeBuildingId) return;

    const snap = UNIT / 8;
    const x = Math.round(cursorPosRef.current.x / snap) * snap / UNIT;
    const z = Math.round(cursorPosRef.current.z / snap) * snap / UNIT;
    const y = targetElevationRef.current;
    
    const type = moveModeBuildingId ? buildings.find(b => b.id === moveModeBuildingId)?.type : activeTool;
    
    if (useFactoryStore.getState().checkCollision(type, x, y, z, currentRotation, moveModeBuildingId)) {
      return; 
    }

    if (moveModeBuildingId) {
      updateBuilding(moveModeBuildingId, { x, y, z, rotation: currentRotation });
      setMoveMode(null); 
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
      onPointerDown={handlePointerDownWrapper}
      onPointerMove={handlePointerMoveWrapper}
      onPointerUp={handlePointerUpWrapper}
      onContextMenu={(e) => { 
        e.preventDefault(); 
        setConnectingFrom(null); 
        if (setActiveTool) setActiveTool(null); 
        if (setMoveMode) setMoveMode(null); 
        setIsDraggingBuild(false);
        dragStartInfoRef.current = null;
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

        {showBlueprintBox && (
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
        )}

        <PlacementGrid 
          activeTool={activeTool} 
          moveModeBuildingId={moveModeBuildingId}
          onHover={handleHover} 
          handlePlacementDown={handlePlacementDown}
          handlePlacementUp={handlePlacementUp}
          handlePlacementClick={handlePlacementClick} 
          onClearSelection={handleCanvasMissed}
        />
        
        {(activeTool || moveModeBuildingId) && (
          <GhostBuildingPreview 
            type={moveModeBuildingId ? buildings.find(b => b.id === moveModeBuildingId)?.type : activeTool} 
            cursorPosRef={cursorPosRef} 
            rotation={currentRotation} 
            moveModeBuildingId={moveModeBuildingId}
            targetElevationRef={targetElevationRef}
            dragStartInfo={dragStartInfoRef.current}
            isDraggingBuild={isDraggingBuild}
          />
        )}

        {buildings.map(b => (
          <BuildingModel 
            key={b.id} data={b} buildingData={BUILDINGS[b.type]}
            isSelected={selectedIds.includes(b.id)} isMoving={moveModeBuildingId === b.id}
            onSelect={setSelectedEntity} onDoubleClick={setMoveMode} onPortClick={handlePortClick} connectingFrom={connectingFrom}
            onHover={handleHover} activeTool={activeTool} moveModeBuildingId={moveModeBuildingId} 
            onPlaceBuildingDown={handlePlacementDown}
            onPlaceBuildingUp={handlePlacementUp}
            onPlaceBuildingClick={handlePlacementClick}
          />
        ))}

        {renderConnections}
        <GhostLine connectingFrom={connectingFrom} cursorPosRef={cursorPosRef} />

        <OrbitControls 
          makeDefault 
          enableDamping={false} 
          enableRotate={cameraMode === '3D' && !isShiftDown && !isDraggingBuild} 
          enablePan={!isShiftDown && !isDraggingBuild}
          enableZoom={!isShiftDown}
          maxPolarAngle={cameraMode === '2D' ? 0 : Math.PI / 2.1} 
          minPolarAngle={cameraMode === '2D' ? 0 : 0} 
        />
      </Canvas>
    </div>
  );
};
