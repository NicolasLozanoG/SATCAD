import React, { useState, useRef } from 'react';
import { useFactoryStore } from '../store/useFactoryStore';
import { BUILDINGS } from '../data/buildings';
import { RECIPES } from '../data/recipes';
import { parseBlueprint } from '../utils/blueprintParser';
import { exportToBlueprint } from '../utils/blueprintExporter';
import { Settings, Save, Upload, Cuboid, BoxSelect, Trash2, Menu, ChevronDown, ChevronRight, Workflow, Eye, EyeOff } from 'lucide-react';

export const UI = ({ activeTool, setActiveTool }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [openCategory, setOpenCategory] = useState('Fábrica');
  const [recipeTab, setRecipeTab] = useState('standard'); // 'standard' or 'alternate'
  const { selectedIds, buildings, connections, cameraMode, setCameraMode, removeBuilding, updateBuilding, removeConnection, updateConnection, removeSelected, exportBlueprint, importBlueprint, moveModeBuildingId, setMoveMode, showBlueprintBox, setShowBlueprintBox } = useFactoryStore();
  
  const selectedBuildings = buildings.filter(b => selectedIds.includes(b.id));
  const selectedConns = connections.filter(c => selectedIds.includes(c.id));
  const isMulti = selectedIds.length > 1;

  // Single selections
  const singleBuilding = selectedBuildings.length === 1 && !isMulti ? selectedBuildings[0] : null;
  const singleConn = selectedConns.length === 1 && !isMulti ? selectedConns[0] : null;
  const singleData = singleBuilding ? BUILDINGS[singleBuilding.type] : null;

  // Multi selection logic (same type check)
  const isAllSameBuildingType = isMulti && selectedBuildings.length === selectedIds.length && new Set(selectedBuildings.map(b => b.type)).size === 1;
  const multiData = isAllSameBuildingType ? BUILDINGS[selectedBuildings[0].type] : null;

  // Group buildings by category
  const categories = Object.values(BUILDINGS).reduce((acc, b) => {
    if (!acc[b.category]) acc[b.category] = [];
    acc[b.category].push(b);
    return acc;
  }, {});

  const handleExport = () => {
    const data = exportBlueprint();
    navigator.clipboard.writeText(data);
    alert('Blueprint copiado al portapapeles');
  };

  const handleImport = () => {
    const data = prompt('Pega el JSON del Blueprint:');
    if (data) importBlueprint(data);
  };

  const handleBulkUpdate = (updates) => {
    selectedBuildings.forEach(b => updateBuilding(b.id, updates));
  };

  const fileInputRef = useRef(null);

  const handleSbpUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const sbpFile = files.find(f => f.name.endsWith('.sbp'));
    const sbpcfgFile = files.find(f => f.name.endsWith('.sbpcfg'));

    if (!sbpFile || !sbpcfgFile) {
      alert('Por favor selecciona ambos archivos (.sbp y .sbpcfg) del blueprint a la vez.');
      return;
    }

    const { addBuilding, addConnection } = useFactoryStore.getState();
    const result = await parseBlueprint(sbpFile, sbpcfgFile, addBuilding, addConnection);
    
    alert(result.message);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSbpExport = async () => {
    const { buildings, connections } = useFactoryStore.getState();
    if (buildings.length === 0) {
      alert("No hay máquinas para exportar.");
      return;
    }
    const name = prompt("Nombre del Blueprint:", "MiDiseñoSatCAD");
    if (!name) return;

    const result = await exportToBlueprint(buildings, connections, name);
    if (!result.success) {
      alert(result.message);
    }
  };

  return (
    <div className="ui-layer">
      <div className="top-bar glass-panel">
        <div className="title">
          <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }} onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <Menu size={20} color="var(--text-main)" />
          </button>
          <Cuboid color="#fa9549" /> SatCAD
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <button 
            className={`btn ${cameraMode === '2D' ? 'btn-primary' : ''}`}
            onClick={() => setCameraMode('2D')}
          >
            <BoxSelect size={18} /> 2D Plan
          </button>
          <button 
            className={`btn ${cameraMode === '3D' ? 'btn-primary' : ''}`}
            onClick={() => setCameraMode('3D')}
          >
            <Cuboid size={18} /> 3D View
          </button>
          <button 
            className={`btn ${cameraMode === 'Graph' ? 'btn-primary' : ''}`}
            onClick={() => setCameraMode('Graph')}
          >
            <Workflow size={18} /> Graph View
          </button>
          
          <div style={{width: '24px'}} /> {/* Spacer */}
          
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{color: '#888', fontSize: '12px'}}>Blueprint Size:</span>
            <select 
              value={useFactoryStore.getState().blueprintSize} 
              onChange={(e) => useFactoryStore.getState().setBlueprintSize(Number(e.target.value))}
              style={{ background: '#1a1c23', color: '#fff', border: '1px solid #333', padding: '4px', borderRadius: '4px' }}
            >
              <option value={32}>Mk.1 (32m)</option>
              <option value={40}>Mk.2 (40m)</option>
              <option value={48}>Mk.3 (48m)</option>
            </select>
            <button 
              className={`btn ${showBlueprintBox ? 'btn-primary' : ''}`}
              style={{ padding: '4px', background: 'transparent', border: 'none', cursor: 'pointer' }}
              onClick={() => setShowBlueprintBox(!showBlueprintBox)}
              title={showBlueprintBox ? "Ocultar Límite" : "Mostrar Límite"}
            >
              {showBlueprintBox ? <Eye size={18} color="#888" /> : <EyeOff size={18} color="#888" />}
            </button>
          </div>

          <div style={{width: '24px'}} /> {/* Spacer */}
          
          <button className="btn" onClick={handleImport}>
            <Upload size={18} /> Importar JSON
          </button>
          
          <input 
            type="file" 
            ref={fileInputRef}
            style={{ display: 'none' }} 
            multiple 
            accept=".sbp,.sbpcfg"
            onChange={handleSbpUpload} 
          />
          <button className="btn" style={{backgroundColor: '#10b981', color: '#fff'}} onClick={() => fileInputRef.current?.click()}>
            <Upload size={18} /> Cargar .SBP
          </button>

          <button className="btn" onClick={handleExport}>
            <Save size={18} /> JSON
          </button>
          <button className="btn" style={{backgroundColor: '#fa9549', color: '#111'}} onClick={handleSbpExport}>
            <Save size={18} /> Exportar SBP
          </button>
        </div>
      </div>

      <div className="main-content">
        {/* Left Sidebar: Build Menu */}
        <div className={`sidebar-left glass-panel ${!isSidebarOpen ? 'closed' : ''}`}>
          <div className="panel-header">
            Construcción 
            <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
              (Presiona 'R' para rotar)
            </span>
          </div>
          <div className="panel-content" style={{ padding: 0 }}>
            {Object.keys(categories).map(catName => (
              <div key={catName}>
                <div 
                  style={{ padding: '12px 16px', background: 'rgba(0,0,0,0.3)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--panel-border)' }}
                  onClick={() => setOpenCategory(openCategory === catName ? null : catName)}
                >
                  <span style={{ fontWeight: 600, color: openCategory === catName ? 'var(--accent)' : 'var(--text-main)' }}>{catName}</span>
                  {openCategory === catName ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </div>
                
                {openCategory === catName && (
                  <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)' }}>
                    {categories[catName].map(b => (
                      <div 
                        key={b.id} 
                        className={`building-item ${activeTool === b.id ? 'active' : ''}`}
                        onClick={() => setActiveTool(activeTool === b.id ? null : b.id)}
                      >
                        <div className="building-icon" style={{ backgroundColor: b.color }}></div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{b.name}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {b.width * 8}x{b.depth * 8} m
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar: Properties */}
        {isMulti && (
          <div className="sidebar-right glass-panel">
            <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Selección Múltiple
              <button className="btn" style={{ padding: '4px', color: '#ef4444' }} onClick={removeSelected} title="Eliminar Todos">
                <Trash2 size={16} />
              </button>
            </div>
            <div className="panel-content">
              <h3 style={{ marginBottom: '16px', color: 'var(--accent)' }}>{selectedIds.length} Objetos</h3>
              
              {isAllSameBuildingType && multiData && multiData.category === 'Fábrica' && (
                <>
                  <div style={{ marginBottom: '16px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    Todos son: <strong>{multiData.name}</strong>
                  </div>
                  <div className="property-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                      <label style={{ margin: 0 }}>Asignar Receta en Masa</label>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button 
                          className="btn" 
                          style={{ padding: '2px 8px', fontSize: '0.75rem', backgroundColor: recipeTab === 'standard' ? 'var(--accent)' : 'rgba(255,255,255,0.1)' }}
                          onClick={() => setRecipeTab('standard')}
                        >
                          Estándar
                        </button>
                        <button 
                          className="btn" 
                          style={{ padding: '2px 8px', fontSize: '0.75rem', backgroundColor: recipeTab === 'alternate' ? 'var(--accent)' : 'rgba(255,255,255,0.1)' }}
                          onClick={() => setRecipeTab('alternate')}
                        >
                          Alternativas
                        </button>
                      </div>
                    </div>
                    <select 
                      onChange={e => handleBulkUpdate({ recipeId: e.target.value })}
                    >
                      <option value="">-- Mantener Mixto / Ninguna --</option>
                      {Object.values(RECIPES)
                        .filter(r => r.machine === multiData.id && !!r.isAlternate === (recipeTab === 'alternate'))
                        .map(r => (
                          <option key={r.id} value={r.id}>{r.name}</option>
                        ))
                      }
                    </select>
                  </div>
                  <div className="property-group">
                    <label>Asignar Overclock en Masa (%)</label>
                    <input 
                      type="number" 
                      placeholder="100"
                      min="1" max="250"
                      onChange={e => {
                        const val = parseInt(e.target.value);
                        if (val > 0) handleBulkUpdate({ clockSpeed: val });
                      }}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {singleBuilding && singleData && (
          <div className="sidebar-right glass-panel">
            <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Propiedades
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  className={`btn ${moveModeBuildingId === singleBuilding.id ? 'btn-primary' : ''}`} 
                  style={{ padding: '4px 8px', fontSize: '0.8rem' }} 
                  onClick={() => setMoveMode(moveModeBuildingId === singleBuilding.id ? null : singleBuilding.id)}
                >
                  {moveModeBuildingId === singleBuilding.id ? 'Moviendo...' : 'Mover'}
                </button>
                <button className="btn" style={{ padding: '4px', color: '#ef4444' }} onClick={() => removeBuilding(singleBuilding.id)} title="Eliminar">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className="panel-content">
              <h3 style={{ marginBottom: '16px', color: 'var(--accent)' }}>{singleData.name}</h3>
              
              {/* Recipe Selector */}
              {singleData.category === 'Fábrica' && singleData.subCategory !== 'extraction' ? (
                <div className="property-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                    <label style={{ margin: 0 }}>Receta</label>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button 
                        className="btn" 
                        style={{ padding: '2px 8px', fontSize: '0.75rem', backgroundColor: recipeTab === 'standard' ? 'var(--accent)' : 'rgba(255,255,255,0.1)' }}
                        onClick={() => setRecipeTab('standard')}
                      >
                        Estándar
                      </button>
                      <button 
                        className="btn" 
                        style={{ padding: '2px 8px', fontSize: '0.75rem', backgroundColor: recipeTab === 'alternate' ? 'var(--accent)' : 'rgba(255,255,255,0.1)' }}
                        onClick={() => setRecipeTab('alternate')}
                      >
                        Alternativas
                      </button>
                    </div>
                  </div>
                  <select 
                    value={singleBuilding.recipeId || ''} 
                    onChange={e => updateBuilding(singleBuilding.id, { recipeId: e.target.value })}
                  >
                    <option value="">-- Seleccionar --</option>
                    {Object.values(RECIPES)
                      .filter(r => r.machine === singleData.id && !!r.isAlternate === (recipeTab === 'alternate'))
                      .map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))
                    }
                  </select>
                </div>
              ) : null}

              {/* Overclock */}
              <div className="property-group">
                <label>Overclock (%)</label>
                <input 
                  type="number" 
                  value={singleBuilding.clockSpeed} 
                  min="1" max="250"
                  onChange={e => updateBuilding(singleBuilding.id, { clockSpeed: parseInt(e.target.value) || 100 })}
                />
              </div>

              {/* Ratios Display */}
              {singleBuilding.recipeId && (
                <div style={{ marginTop: '24px' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>
                    Entradas (Items/min)
                  </label>
                  {RECIPES[singleBuilding.recipeId].inputs.map(input => {
                    const baseRate = (60 / RECIPES[singleBuilding.recipeId].time) * input.amount;
                    const rate = baseRate * (singleBuilding.clockSpeed / 100);
                    return (
                      <div key={input.item} className="ratio-display">
                        <span>{input.item}</span>
                        <span style={{ color: '#ef4444' }}>{rate.toFixed(1)}/min</span>
                      </div>
                    );
                  })}

                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '16px', marginBottom: '8px', display: 'block' }}>
                    Salidas (Items/min)
                  </label>
                  {RECIPES[singleBuilding.recipeId].outputs.map(output => {
                    const baseRate = (60 / RECIPES[singleBuilding.recipeId].time) * output.amount;
                    const rate = baseRate * (singleBuilding.clockSpeed / 100);
                    return (
                      <div key={output.item} className="ratio-display">
                        <span>{output.item}</span>
                        <span style={{ color: '#22c55e' }}>{rate.toFixed(1)}/min</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {singleConn && (
          <div className="sidebar-right glass-panel">
            <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Conexión
              <button className="btn" style={{ padding: '4px', color: '#ef4444' }} onClick={() => removeConnection(singleConn.id)} title="Eliminar">
                <Trash2 size={16} />
              </button>
            </div>
            <div className="panel-content">
              <h3 style={{ marginBottom: '16px', color: 'var(--accent)' }}>Cinta Transportadora</h3>
              
              <div className="property-group">
                <label>Estilo de Ruta (Modo)</label>
                <select 
                  value={singleConn.buildMode} 
                  onChange={e => updateConnection(singleConn.id, { buildMode: e.target.value })}
                >
                  <option value="default">Ruta Recta (Default)</option>
                  <option value="orthogonal">Ortogonal (90°)</option>
                  <option value="smooth">Curva Suave</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
