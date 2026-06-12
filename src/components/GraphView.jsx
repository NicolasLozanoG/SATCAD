import React, { useEffect, useCallback } from 'react';
import { ReactFlow, Controls, Background, Handle, Position, useNodesState, useEdgesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useFactoryStore } from '../store/useFactoryStore';
import { BUILDINGS } from '../data/buildings';
import { RECIPES } from '../data/recipes';
import dagre from 'dagre';

const nodeTypes = {
  machineNode: ({ data }) => {
    const { bData, recipe } = data;
    return (
      <div style={{
        background: 'rgba(20, 22, 30, 0.95)',
        border: `2px solid ${bData.color}`,
        borderRadius: '8px',
        padding: '12px',
        color: '#fff',
        width: '260px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}>
        <Handle type="target" position={Position.Top} style={{ background: '#22c55e', width: 12, height: 12 }} />
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <div style={{ width: 16, height: 16, borderRadius: '4px', backgroundColor: bData.color }} />
          <strong style={{ fontSize: '15px' }}>{bData.name}</strong>
        </div>
        
        {recipe ? (
          <div style={{ fontSize: '13px', color: '#ccc', borderTop: '1px solid #333', paddingTop: '8px' }}>
            <div style={{ color: '#fa9549', marginBottom: '8px' }}>Receta: <strong style={{ color: '#fff' }}>{recipe.name}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', marginBottom: '2px' }}>Entradas</div>
                {recipe.inputs.map(inp => (
                  <div key={inp.item} style={{ color: '#22c55e' }}>{inp.amount}x {inp.item}</div>
                ))}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', marginBottom: '2px' }}>Salidas</div>
                {recipe.outputs.map(out => (
                  <div key={out.item} style={{ color: '#fa9549' }}>{out.amount}x {out.item}</div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ fontSize: '13px', color: '#777', fontStyle: 'italic', borderTop: '1px solid #333', paddingTop: '8px' }}>
            Sin receta asignada / No aplica
          </div>
        )}
        
        <Handle type="source" position={Position.Bottom} style={{ background: '#fa9549', width: 12, height: 12 }} />
      </div>
    );
  }
};

const getLayoutedElements = (nodes, edges, direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  
  dagreGraph.setGraph({ rankdir: direction, nodesep: 80, ranksep: 120 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 300, height: 180 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - 150, 
        y: nodeWithPosition.y - 90,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

export const GraphView = () => {
  const { buildings, connections, selectedIds, setSelectedEntity } = useFactoryStore();
  
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    const validBuildings = buildings.filter(b => {
      const bData = BUILDINGS[b.type];
      return bData && bData.category !== 'Muros/Suelos' && bData.category !== 'Decoración';
    });

    const initialNodes = validBuildings.map(b => {
      const bData = BUILDINGS[b.type];
      const recipe = b.recipeId ? RECIPES[b.recipeId] : null;
      
      return {
        id: b.id,
        type: 'machineNode',
        data: { building: b, bData, recipe },
        position: { x: 0, y: 0 },
      };
    });

    const validBuildingIds = new Set(validBuildings.map(b => b.id));

    const initialEdges = connections
      .filter(c => validBuildingIds.has(c.sourceId) && validBuildingIds.has(c.targetId))
      .map(c => ({
        id: c.id,
        source: c.sourceId,
        target: c.targetId,
        animated: true,
        style: { stroke: '#fa9549', strokeWidth: 3 },
      }));

    if (initialNodes.length > 0) {
      const layouted = getLayoutedElements(initialNodes, initialEdges);
      setNodes(layouted.nodes);
      setEdges(layouted.edges);
    } else {
      setNodes([]);
      setEdges([]);
    }
  }, [buildings, connections]); 

  const onNodeClick = useCallback((_, node) => {
    setSelectedEntity(node.id);
  }, [setSelectedEntity]);

  const onPaneClick = useCallback(() => {
    setSelectedEntity(null);
  }, [setSelectedEntity]);

  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: '#0f111a', position: 'absolute', top: 0, left: 0, zIndex: 0 }}>
      <ReactFlow
        nodes={nodes.map(n => ({ 
          ...n, 
          style: { 
            ...n.style,
            opacity: selectedIds.length === 0 || selectedIds.includes(n.id) ? 1 : 0.4,
            filter: selectedIds.includes(n.id) ? 'drop-shadow(0 0 10px rgba(255,255,255,0.8))' : 'none'
          }
        }))}
        edges={edges.map(e => ({ 
          ...e, 
          style: { 
            ...e.style, 
            stroke: selectedIds.includes(e.id) ? '#ffffff' : '#fa9549',
            strokeWidth: selectedIds.includes(e.id) ? 5 : 3,
            opacity: selectedIds.length === 0 || selectedIds.includes(e.source) || selectedIds.includes(e.target) ? 1 : 0.2
          }
        }))}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        fitView
        minZoom={0.1}
      >
        <Background color="#333" gap={30} size={2} />
        <Controls />
      </ReactFlow>
    </div>
  );
};
