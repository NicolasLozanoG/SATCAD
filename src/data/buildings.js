export const BUILDINGS = {
  // Fábrica
  miner: {
    id: 'miner',
    name: 'Miner Mk.1',
    category: 'Fábrica',
    subCategory: 'extraction',
    color: '#ff9900',
    width: 1.5, // 12m
    depth: 2.5, // 20m
    height: 2.5, // 20m
    inputs: [],
    outputs: [{ id: 'out_1', x: 0, z: 1.25, type: 'belt' }],
  },
  smelter: {
    id: 'smelter',
    name: 'Smelter',
    category: 'Fábrica',
    subCategory: 'smelting',
    color: '#dd5522',
    width: 0.75, // 6m
    depth: 1.125, // 9m
    height: 1.125, // 9m
    inputs: [{ id: 'in_1', x: 0, z: -0.5625, type: 'belt' }],
    outputs: [{ id: 'out_1', x: 0, z: 0.5625, type: 'belt' }],
  },
  constructor: {
    id: 'constructor',
    name: 'Constructor',
    category: 'Fábrica',
    subCategory: 'production',
    color: '#cc7722',
    width: 1, // 8m
    depth: 1.25, // 10m
    height: 1, // 8m
    inputs: [{ id: 'in_1', x: 0, z: -0.625, type: 'belt' }],
    outputs: [{ id: 'out_1', x: 0, z: 0.625, type: 'belt' }],
  },
  assembler: {
    id: 'assembler',
    name: 'Assembler',
    category: 'Fábrica',
    subCategory: 'production',
    color: '#bb8833',
    width: 1.25, // 10m
    depth: 1.875, // 15m
    height: 1.375, // 11m
    inputs: [
      { id: 'in_1', x: -0.25, z: -0.9375, type: 'belt' },
      { id: 'in_2', x: 0.25, z: -0.9375, type: 'belt' }
    ],
    outputs: [{ id: 'out_1', x: 0, z: 0.9375, type: 'belt' }],
  },
  foundry: {
    id: 'foundry',
    name: 'Foundry',
    category: 'Fábrica',
    subCategory: 'smelting',
    color: '#d66838',
    width: 1.25, // 10m
    depth: 1.25, // 10m
    height: 1.25, // 10m
    inputs: [
      { id: 'in_1', x: -0.3, z: -0.625, type: 'belt' },
      { id: 'in_2', x: 0.3, z: -0.625, type: 'belt' }
    ],
    outputs: [{ id: 'out_1', x: 0, z: 0.625, type: 'belt' }],
  },
  manufacturer: {
    id: 'manufacturer',
    name: 'Manufacturer',
    category: 'Fábrica',
    subCategory: 'production',
    color: '#a47c41',
    width: 2.25, // 18m
    depth: 2.375, // 19m
    height: 1.5, // 12m
    inputs: [
      { id: 'in_1', x: -0.8, z: -1.1875, type: 'belt' },
      { id: 'in_2', x: -0.26, z: -1.1875, type: 'belt' },
      { id: 'in_3', x: 0.26, z: -1.1875, type: 'belt' },
      { id: 'in_4', x: 0.8, z: -1.1875, type: 'belt' }
    ],
    outputs: [{ id: 'out_1', x: 0, z: 1.1875, type: 'belt' }],
  },
  refinery: {
    id: 'refinery',
    name: 'Refinery',
    category: 'Fábrica',
    subCategory: 'fluid',
    color: '#8b8a5d',
    width: 1.25, // 10m
    depth: 2.5, // 20m
    height: 3.5, // 28m
    inputs: [
      { id: 'in_1', x: -0.3, z: -1.25, type: 'pipe' },
      { id: 'in_2', x: 0.3, z: -1.25, type: 'belt' }
    ],
    outputs: [
      { id: 'out_1', x: -0.3, z: 1.25, type: 'pipe' },
      { id: 'out_2', x: 0.3, z: 1.25, type: 'belt' }
    ],
  },
  packager: {
    id: 'packager',
    name: 'Packager',
    category: 'Fábrica',
    subCategory: 'fluid',
    color: '#708f86',
    width: 1, // 8m
    depth: 1, // 8m
    height: 1, // 8m
    inputs: [
      { id: 'in_1', x: -0.25, z: -0.5, type: 'pipe' },
      { id: 'in_2', x: 0.25, z: -0.5, type: 'belt' }
    ],
    outputs: [
      { id: 'out_1', x: -0.25, z: 0.5, type: 'pipe' },
      { id: 'out_2', x: 0.25, z: 0.5, type: 'belt' }
    ],
  },
  blender: {
    id: 'blender',
    name: 'Blender',
    category: 'Fábrica',
    subCategory: 'fluid',
    color: '#a1a89c',
    width: 2.25, // 18m
    depth: 2, // 16m
    height: 1.75, // 14m
    inputs: [
      { id: 'in_1', x: -0.6, z: -1, type: 'pipe' },
      { id: 'in_2', x: -0.2, z: -1, type: 'pipe' },
      { id: 'in_3', x: 0.2, z: -1, type: 'belt' },
      { id: 'in_4', x: 0.6, z: -1, type: 'belt' }
    ],
    outputs: [
      { id: 'out_1', x: -0.25, z: 1, type: 'pipe' },
      { id: 'out_2', x: 0.25, z: 1, type: 'belt' }
    ],
  },
  particle_accelerator: {
    id: 'particle_accelerator',
    name: 'Particle Accelerator',
    category: 'Fábrica',
    subCategory: 'advanced',
    color: '#8b5a8c',
    width: 3, // 24m
    depth: 4.75, // 38m
    height: 2.5, // 20m
    inputs: [
      { id: 'in_1', x: -0.5, z: -2.375, type: 'belt' },
      { id: 'in_2', x: 0.5, z: -2.375, type: 'pipe' }
    ],
    outputs: [{ id: 'out_1', x: 0, z: 2.375, type: 'belt' }],
  },
  water_extractor: {
    id: 'water_extractor',
    name: 'Water Extractor',
    category: 'Fábrica',
    subCategory: 'extraction',
    color: '#3498db',
    width: 2.5, // 20m
    depth: 2.5, // 20m
    height: 2.5, // 20m
    inputs: [],
    outputs: [{ id: 'out_1', x: 0, z: 1.25, type: 'pipe' }],
  },
  oil_extractor: {
    id: 'oil_extractor',
    name: 'Oil Extractor',
    category: 'Fábrica',
    subCategory: 'extraction',
    color: '#2c3e50',
    width: 2.5, // 20m
    depth: 2.5, // 20m
    height: 4, // 32m
    inputs: [],
    outputs: [{ id: 'out_1', x: 0, z: 1.25, type: 'pipe' }],
  },
  awesome_sink: {
    id: 'awesome_sink',
    name: 'AWESOME Sink',
    category: 'Fábrica',
    subCategory: 'special',
    color: '#e74c3c',
    width: 1.5, // 12m
    depth: 2, // 16m
    height: 1.5, // 12m
    inputs: [{ id: 'in_1', x: 0, z: -1, type: 'belt' }],
    outputs: [],
  },

  // Energía
  biomass_burner: {
    id: 'biomass_burner',
    name: 'Biomass Burner',
    category: 'Energía',
    subCategory: 'power',
    color: '#16a085',
    width: 1, // 8m
    depth: 1, // 8m
    height: 1, // 8m
    inputs: [{ id: 'in_1', x: 0, z: -0.5, type: 'belt' }],
    outputs: [],
  },
  coal_generator: {
    id: 'coal_generator',
    name: 'Coal Generator',
    category: 'Energía',
    subCategory: 'power',
    color: '#2c3e50',
    width: 1.25, // 10m
    depth: 3.25, // 26m
    height: 4.5, // 36m
    inputs: [
      { id: 'in_1', x: -0.3, z: -1.625, type: 'belt' },
      { id: 'in_2', x: 0.3, z: -1.625, type: 'pipe' }
    ],
    outputs: [],
  },
  fuel_generator: {
    id: 'fuel_generator',
    name: 'Fuel Generator',
    category: 'Energía',
    subCategory: 'power',
    color: '#d35400',
    width: 2, // 16m
    depth: 2.5, // 20m
    height: 4.5, // 36m
    inputs: [{ id: 'in_1', x: 0, z: -1.25, type: 'pipe' }],
    outputs: [],
  },
  geothermal_generator: {
    id: 'geothermal_generator',
    name: 'Geothermal Generator',
    category: 'Energía',
    subCategory: 'power',
    color: '#8e44ad',
    width: 2.5, // 20m
    depth: 2.5, // 20m
    height: 4, // 32m
    inputs: [],
    outputs: [],
  },
  nuclear_power_plant: {
    id: 'nuclear_power_plant',
    name: 'Nuclear Power Plant',
    category: 'Energía',
    subCategory: 'power',
    color: '#27ae60',
    width: 4.5, // 36m
    depth: 5.5, // 44m
    height: 6, // 48m
    inputs: [
      { id: 'in_1', x: -1, z: -2.75, type: 'belt' },
      { id: 'in_2', x: 1, z: -2.75, type: 'pipe' }
    ],
    outputs: [{ id: 'out_1', x: 0, z: 2.75, type: 'belt' }], // Nuclear waste
  },
  power_storage: {
    id: 'power_storage',
    name: 'Power Storage',
    category: 'Energía',
    subCategory: 'power',
    color: '#f39c12',
    width: 1, // 8m
    depth: 1, // 8m
    height: 2, // 16m
    inputs: [],
    outputs: [],
  },

  // Logística y Almacenamiento
  storage_container: {
    id: 'storage_container',
    name: 'Storage Container',
    category: 'Logística/Almacenamiento',
    subCategory: 'storage',
    color: '#f1c40f',
    width: 1, // 8m
    depth: 1.25, // 10m
    height: 1, // 8m
    inputs: [{ id: 'in_1', x: 0, z: -0.625, type: 'belt' }],
    outputs: [{ id: 'out_1', x: 0, z: 0.625, type: 'belt' }],
  },
  industrial_storage: {
    id: 'industrial_storage',
    name: 'Industrial Storage',
    category: 'Logística/Almacenamiento',
    subCategory: 'storage',
    color: '#f39c12',
    width: 1, // 8m
    depth: 1.25, // 10m
    height: 2, // 16m
    inputs: [
      { id: 'in_1', x: 0, z: -0.625, type: 'belt' }, // bottom
      { id: 'in_2', x: 0, z: -0.625, type: 'belt' }  // top (height handled abstractly or stacked visually)
    ],
    outputs: [
      { id: 'out_1', x: 0, z: 0.625, type: 'belt' },
      { id: 'out_2', x: 0, z: 0.625, type: 'belt' }
    ],
  },
  fluid_buffer: {
    id: 'fluid_buffer',
    name: 'Fluid Buffer',
    category: 'Logística/Almacenamiento',
    subCategory: 'storage',
    color: '#34495e',
    width: 2, // 16m
    depth: 2, // 16m
    height: 2, // 16m
    inputs: [{ id: 'in_1', x: -1, z: 0, type: 'pipe' }],
    outputs: [{ id: 'out_1', x: 1, z: 0, type: 'pipe' }],
  },
  industrial_fluid_buffer: {
    id: 'industrial_fluid_buffer',
    name: 'Industrial Fluid Buffer',
    category: 'Logística/Almacenamiento',
    subCategory: 'storage',
    color: '#2c3e50',
    width: 2.5, // 20m
    depth: 2.5, // 20m
    height: 3, // 24m
    inputs: [
      { id: 'in_1', x: -1.25, z: -0.5, type: 'pipe' },
      { id: 'in_2', x: -1.25, z: 0.5, type: 'pipe' }
    ],
    outputs: [
      { id: 'out_1', x: 1.25, z: -0.5, type: 'pipe' },
      { id: 'out_2', x: 1.25, z: 0.5, type: 'pipe' }
    ],
  },
  conveyor_splitter: {
    id: 'conveyor_splitter',
    name: 'Conveyor Splitter',
    category: 'Logística/Almacenamiento',
    subCategory: 'logistics',
    color: '#95a5a6',
    width: 0.5, // 4m
    depth: 0.5, // 4m
    height: 0.5, // 4m
    inputs: [{ id: 'in_1', x: 0, z: -0.25, type: 'belt' }],
    outputs: [
      { id: 'out_1', x: 0, z: 0.25, type: 'belt' },    // Front
      { id: 'out_2', x: -0.25, z: 0, type: 'belt' },   // Left
      { id: 'out_3', x: 0.25, z: 0, type: 'belt' }     // Right
    ],
  },
  conveyor_merger: {
    id: 'conveyor_merger',
    name: 'Conveyor Merger',
    category: 'Logística/Almacenamiento',
    subCategory: 'logistics',
    color: '#7f8c8d',
    width: 0.5, // 4m
    depth: 0.5, // 4m
    height: 0.5, // 4m
    inputs: [
      { id: 'in_1', x: 0, z: -0.25, type: 'belt' },    // Back
      { id: 'in_2', x: -0.25, z: 0, type: 'belt' },    // Left
      { id: 'in_3', x: 0.25, z: 0, type: 'belt' }      // Right
    ],
    outputs: [{ id: 'out_1', x: 0, z: 0.25, type: 'belt' }], // Front
  },
  pipeline_junction: {
    id: 'pipeline_junction',
    name: 'Pipeline Junction Cross',
    category: 'Logística/Almacenamiento',
    subCategory: 'logistics',
    color: '#d35400',
    width: 0.25, // 2m
    depth: 0.25, // 2m
    height: 0.25, // 2m
    inputs: [
      { id: 'in_1', x: 0, z: -0.125, type: 'pipe' },
      { id: 'in_2', x: -0.125, z: 0, type: 'pipe' },
      { id: 'in_3', x: 0.125, z: 0, type: 'pipe' }
    ],
    outputs: [{ id: 'out_1', x: 0, z: 0.125, type: 'pipe' }],
  },
  // Muros / Suelos
  foundation_8x4: {
    id: 'foundation_8x4',
    name: 'Foundation 8m x 4m',
    category: 'Muros/Suelos',
    subCategory: 'foundation',
    color: '#555555',
    width: 1, // 8m
    depth: 1, // 8m
    height: 0.5, // 4m
    inputs: [],
    outputs: [],
  },
  foundation_8x2: {
    id: 'foundation_8x2',
    name: 'Foundation 8m x 2m',
    category: 'Muros/Suelos',
    subCategory: 'foundation',
    color: '#555555',
    width: 1,
    depth: 1,
    height: 0.25, // 2m
    inputs: [],
    outputs: [],
  },
  foundation_8x1: {
    id: 'foundation_8x1',
    name: 'Foundation 8m x 1m',
    category: 'Muros/Suelos',
    subCategory: 'foundation',
    color: '#555555',
    width: 1,
    depth: 1,
    height: 0.125, // 1m
    inputs: [],
    outputs: [],
  },
  glass_foundation: {
    id: 'glass_foundation',
    name: 'Glass Foundation',
    category: 'Muros/Suelos',
    subCategory: 'foundation',
    color: '#85c1e9',
    width: 1,
    depth: 1,
    height: 0.125,
    inputs: [],
    outputs: [],
  },
  wall_8x4: {
    id: 'wall_8x4',
    name: 'Wall 8m x 4m',
    category: 'Muros/Suelos',
    subCategory: 'wall',
    color: '#666666',
    width: 1,
    depth: 0.125, // 1m
    height: 0.5,
    inputs: [],
    outputs: [],
  },
  wall_8x4_window: {
    id: 'wall_8x4_window',
    name: 'Windowed Wall',
    category: 'Muros/Suelos',
    subCategory: 'wall',
    color: '#7fb3d5',
    width: 1,
    depth: 0.125,
    height: 0.5,
    inputs: [],
    outputs: [],
  },
  wall_8x4_door: {
    id: 'wall_8x4_door',
    name: 'Door Wall',
    category: 'Muros/Suelos',
    subCategory: 'wall',
    color: '#4d5656',
    width: 1,
    depth: 0.125,
    height: 0.5,
    inputs: [],
    outputs: [],
  },
  wall_8x4_conveyor: {
    id: 'wall_8x4_conveyor',
    name: 'Conveyor Wall',
    category: 'Muros/Suelos',
    subCategory: 'wall',
    color: '#e67e22',
    width: 1,
    depth: 0.125,
    height: 0.5,
    inputs: [],
    outputs: [],
  },

  // Decoración
  walkway_straight: {
    id: 'walkway_straight',
    name: 'Walkway Straight',
    category: 'Decoración',
    subCategory: 'walkway',
    color: '#888888',
    width: 1,
    depth: 0.5,
    height: 0.1,
    inputs: [],
    outputs: [],
  },
  street_light: {
    id: 'street_light',
    name: 'Street Light',
    category: 'Decoración',
    subCategory: 'lighting',
    color: '#dddd44',
    width: 0.1,
    depth: 0.1,
    height: 1,
    inputs: [],
    outputs: [],
  }
};
