import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { BUILDINGS } from '../data/buildings';

const getAABB = (b, typeOverride, xOverride, yOverride, zOverride, rotOverride) => {
  const type = typeOverride || b?.type;
  const data = BUILDINGS[type];
  const x = xOverride !== undefined ? xOverride : b?.x;
  const y = yOverride !== undefined ? yOverride : (b?.y || 0);
  const z = zOverride !== undefined ? zOverride : b?.z;
  const rot = rotOverride !== undefined ? rotOverride : (b?.rotation || 0);
  
  const isSwapped = Math.abs(Math.sin(rot)) > 0.5;
  const spanX = isSwapped ? data.depth : data.width;
  const spanZ = isSwapped ? data.width : data.depth;
  const spanY = data.height; // Already in foundation units logic in some contexts, wait, height is in multiples of 8m foundation size? Yes, 'height' in buildings is foundation relative.
  
  return {
    minX: x - spanX / 2,
    maxX: x + spanX / 2,
    minY: y,
    maxY: y + spanY,
    minZ: z - spanZ / 2,
    maxZ: z + spanZ / 2
  };
};

export const useFactoryStore = create((set, get) => ({
  buildings: [],
  connections: [],
  selectedIds: [],
  cameraMode: '3D', // '2D' or '3D'
  blueprintSize: 32, // 32 = Mk.1, 40 = Mk.2, 48 = Mk.3
  showBlueprintBox: true,
  moveModeBuildingId: null, // ID of building currently being moved

  setShowBlueprintBox: (show) => set({ showBlueprintBox: show }),

  setSelectedEntity: (id, shiftKey = false) => set((state) => {
    if (!id) return { selectedIds: [] };
    if (Array.isArray(id)) {
      if (shiftKey) {
        const newIds = new Set(state.selectedIds);
        id.forEach(i => newIds.add(i));
        return { selectedIds: Array.from(newIds) };
      }
      return { selectedIds: id };
    }
    if (shiftKey) {
      if (state.selectedIds.includes(id)) {
        return { selectedIds: state.selectedIds.filter(i => i !== id) };
      }
      return { selectedIds: [...state.selectedIds, id] };
    }
    return { selectedIds: [id] };
  }),

  setMoveMode: (id) => set({ moveModeBuildingId: id, selectedIds: id ? [id] : [] }),

  removeSelected: () => set((state) => {
    return {
      buildings: state.buildings.filter(b => !state.selectedIds.includes(b.id)),
      connections: state.connections.filter(c => !state.selectedIds.includes(c.id)),
      selectedIds: [],
      moveModeBuildingId: null
    };
  }),

  checkCollision: (type, x, y, z, rotation, excludeId = null) => {
    const { buildings } = get();
    const bData = BUILDINGS[type];
    
    // Si es un muro, ignorar colisiones
    if (bData && bData.subCategory === 'wall') {
      return false;
    }

    const newAABB = getAABB(null, type, x, y, z, rotation);
    const epsilon = 0.01; // Tolerance for stacking
    
    for (const b of buildings) {
      if (b.id === excludeId) continue;

      const targetData = BUILDINGS[b.type];
      // Ignorar colisiones con muros que ya estén colocados
      if (targetData && targetData.subCategory === 'wall') {
        continue;
      }

      const bAABB = getAABB(b);
      
      if (
        newAABB.minX < bAABB.maxX - epsilon &&
        newAABB.maxX > bAABB.minX + epsilon &&
        newAABB.minZ < bAABB.maxZ - epsilon &&
        newAABB.maxZ > bAABB.minZ + epsilon &&
        newAABB.minY < bAABB.maxY - epsilon &&
        newAABB.maxY > bAABB.minY + epsilon
      ) {
        return true; // Collision
      }
    }
    return false;
  },

  addBuilding: (type, x, y, z, rotation = 0) => {
    const newBuilding = {
      id: uuidv4(),
      type,
      x,
      y,
      z,
      rotation,
      recipeId: null,
      clockSpeed: 100,
    };
    set((state) => ({ buildings: [...state.buildings, newBuilding] }));
    return newBuilding.id;
  },

  removeBuilding: (id) => {
    set((state) => ({
      buildings: state.buildings.filter(b => b.id !== id),
      connections: state.connections.filter(c => c.sourceId !== id && c.targetId !== id),
      selectedIds: state.selectedIds.filter(i => i !== id)
    }));
  },

  updateBuilding: (id, updates) => {
    set((state) => ({
      buildings: state.buildings.map(b => b.id === id ? { ...b, ...updates } : b)
    }));
  },

  addConnection: (sourceId, sourcePort, targetId, targetPort, buildMode = 'default') => {
    const newConnection = {
      id: uuidv4(),
      sourceId,
      sourcePort,
      targetId,
      targetPort,
      buildMode, // 'default', 'smooth', 'orthogonal'
    };
    set((state) => ({ connections: [...state.connections, newConnection] }));
  },

  updateConnection: (id, updates) => {
    set((state) => ({
      connections: state.connections.map(c => c.id === id ? { ...c, ...updates } : c)
    }));
  },

  removeConnection: (id) => {
    set((state) => ({
      connections: state.connections.filter(c => c.id !== id)
    }));
  },

  setCameraMode: (mode) => set({ cameraMode: mode }),
  setBlueprintSize: (size) => set({ blueprintSize: size }),

  // For import / export
  exportBlueprint: () => {
    const { buildings, connections } = get();
    return JSON.stringify({ buildings, connections });
  },

  importBlueprint: (jsonStr) => {
    try {
      const { buildings, connections } = JSON.parse(jsonStr);
      set({ buildings, connections, selectedIds: [], moveModeBuildingId: null });
    } catch (e) {
      console.error("Failed to import blueprint", e);
    }
  }
}));
