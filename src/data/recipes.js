export const RECIPES = {
  // --- Smelter ---
  iron_ingot: {
    id: 'iron_ingot',
    name: 'Iron Ingot',
    machine: 'smelter',
    time: 2,
    inputs: [{ item: 'Iron Ore', amount: 1 }],
    outputs: [{ item: 'Iron Ingot', amount: 1 }],
    isAlternate: false
  },
  copper_ingot: {
    id: 'copper_ingot',
    name: 'Copper Ingot',
    machine: 'smelter',
    time: 2,
    inputs: [{ item: 'Copper Ore', amount: 1 }],
    outputs: [{ item: 'Copper Ingot', amount: 1 }],
    isAlternate: false
  },
  caterium_ingot: {
    id: 'caterium_ingot',
    name: 'Caterium Ingot',
    machine: 'smelter',
    time: 4,
    inputs: [{ item: 'Caterium Ore', amount: 3 }],
    outputs: [{ item: 'Caterium Ingot', amount: 1 }],
    isAlternate: false
  },

  // --- Foundry ---
  steel_ingot: {
    id: 'steel_ingot',
    name: 'Steel Ingot',
    machine: 'foundry',
    time: 4,
    inputs: [{ item: 'Iron Ore', amount: 3 }, { item: 'Coal', amount: 3 }],
    outputs: [{ item: 'Steel Ingot', amount: 3 }],
    isAlternate: false
  },
  solid_steel_ingot: {
    id: 'solid_steel_ingot',
    name: 'Solid Steel Ingot',
    machine: 'foundry',
    time: 3,
    inputs: [{ item: 'Iron Ingot', amount: 2 }, { item: 'Coal', amount: 2 }],
    outputs: [{ item: 'Steel Ingot', amount: 3 }],
    isAlternate: true
  },
  iron_alloy_ingot: {
    id: 'iron_alloy_ingot',
    name: 'Iron Alloy Ingot',
    machine: 'foundry',
    time: 6,
    inputs: [{ item: 'Iron Ore', amount: 2 }, { item: 'Copper Ore', amount: 2 }],
    outputs: [{ item: 'Iron Ingot', amount: 5 }],
    isAlternate: true
  },

  // --- Constructor ---
  iron_plate: {
    id: 'iron_plate',
    name: 'Iron Plate',
    machine: 'constructor',
    time: 6,
    inputs: [{ item: 'Iron Ingot', amount: 3 }],
    outputs: [{ item: 'Iron Plate', amount: 2 }],
    isAlternate: false
  },
  iron_rod: {
    id: 'iron_rod',
    name: 'Iron Rod',
    machine: 'constructor',
    time: 4,
    inputs: [{ item: 'Iron Ingot', amount: 1 }],
    outputs: [{ item: 'Iron Rod', amount: 1 }],
    isAlternate: false
  },
  wire: {
    id: 'wire',
    name: 'Wire',
    machine: 'constructor',
    time: 4,
    inputs: [{ item: 'Copper Ingot', amount: 1 }],
    outputs: [{ item: 'Wire', amount: 2 }],
    isAlternate: false
  },
  iron_wire: {
    id: 'iron_wire',
    name: 'Iron Wire',
    machine: 'constructor',
    time: 2.4,
    inputs: [{ item: 'Iron Ingot', amount: 1 }],
    outputs: [{ item: 'Wire', amount: 9 }],
    isAlternate: true
  },
  cable: {
    id: 'cable',
    name: 'Cable',
    machine: 'constructor',
    time: 2,
    inputs: [{ item: 'Wire', amount: 2 }],
    outputs: [{ item: 'Cable', amount: 1 }],
    isAlternate: false
  },
  concrete: {
    id: 'concrete',
    name: 'Concrete',
    machine: 'constructor',
    time: 4,
    inputs: [{ item: 'Limestone', amount: 3 }],
    outputs: [{ item: 'Concrete', amount: 1 }],
    isAlternate: false
  },
  screws: {
    id: 'screws',
    name: 'Screws',
    machine: 'constructor',
    time: 6,
    inputs: [{ item: 'Iron Rod', amount: 1 }],
    outputs: [{ item: 'Screws', amount: 4 }],
    isAlternate: false
  },
  cast_screw: {
    id: 'cast_screw',
    name: 'Cast Screw',
    machine: 'constructor',
    time: 4.8,
    inputs: [{ item: 'Iron Ingot', amount: 1 }],
    outputs: [{ item: 'Screws', amount: 4 }],
    isAlternate: true
  },
  steel_pipe: {
    id: 'steel_pipe',
    name: 'Steel Pipe',
    machine: 'constructor',
    time: 6,
    inputs: [{ item: 'Steel Ingot', amount: 3 }],
    outputs: [{ item: 'Steel Pipe', amount: 2 }],
    isAlternate: false
  },
  steel_beam: {
    id: 'steel_beam',
    name: 'Steel Beam',
    machine: 'constructor',
    time: 4,
    inputs: [{ item: 'Steel Ingot', amount: 4 }],
    outputs: [{ item: 'Steel Beam', amount: 1 }],
    isAlternate: false
  },

  // --- Assembler ---
  reinforced_iron_plate: {
    id: 'reinforced_iron_plate',
    name: 'Reinforced Iron Plate',
    machine: 'assembler',
    time: 12,
    inputs: [{ item: 'Iron Plate', amount: 6 }, { item: 'Screws', amount: 12 }],
    outputs: [{ item: 'Reinforced Iron Plate', amount: 1 }],
    isAlternate: false
  },
  bolted_iron_plate: {
    id: 'bolted_iron_plate',
    name: 'Bolted Iron Plate',
    machine: 'assembler',
    time: 4,
    inputs: [{ item: 'Iron Plate', amount: 6 }, { item: 'Screws', amount: 16.66 }],
    outputs: [{ item: 'Reinforced Iron Plate', amount: 1 }],
    isAlternate: true
  },
  rotor: {
    id: 'rotor',
    name: 'Rotor',
    machine: 'assembler',
    time: 15,
    inputs: [{ item: 'Iron Rod', amount: 5 }, { item: 'Screws', amount: 25 }],
    outputs: [{ item: 'Rotor', amount: 1 }],
    isAlternate: false
  },
  stator: {
    id: 'stator',
    name: 'Stator',
    machine: 'assembler',
    time: 12,
    inputs: [{ item: 'Steel Pipe', amount: 3 }, { item: 'Wire', amount: 8 }],
    outputs: [{ item: 'Stator', amount: 1 }],
    isAlternate: false
  },
  motor: {
    id: 'motor',
    name: 'Motor',
    machine: 'assembler',
    time: 12,
    inputs: [{ item: 'Rotor', amount: 2 }, { item: 'Stator', amount: 2 }],
    outputs: [{ item: 'Motor', amount: 1 }],
    isAlternate: false
  },
  modular_frame: {
    id: 'modular_frame',
    name: 'Modular Frame',
    machine: 'assembler',
    time: 30,
    inputs: [{ item: 'Reinforced Iron Plate', amount: 3 }, { item: 'Iron Rod', amount: 6 }],
    outputs: [{ item: 'Modular Frame', amount: 2 }],
    isAlternate: false
  },
  encased_industrial_beam: {
    id: 'encased_industrial_beam',
    name: 'Encased Industrial Beam',
    machine: 'assembler',
    time: 10,
    inputs: [{ item: 'Steel Beam', amount: 3 }, { item: 'Concrete', amount: 4 }],
    outputs: [{ item: 'Encased Industrial Beam', amount: 1 }],
    isAlternate: false
  },

  // --- Manufacturer ---
  heavy_modular_frame: {
    id: 'heavy_modular_frame',
    name: 'Heavy Modular Frame',
    machine: 'manufacturer',
    time: 30,
    inputs: [
      { item: 'Modular Frame', amount: 5 },
      { item: 'Steel Pipe', amount: 15 },
      { item: 'Encased Industrial Beam', amount: 5 },
      { item: 'Screws', amount: 100 }
    ],
    outputs: [{ item: 'Heavy Modular Frame', amount: 1 }],
    isAlternate: false
  },
  computer: {
    id: 'computer',
    name: 'Computer',
    machine: 'manufacturer',
    time: 24,
    inputs: [
      { item: 'Circuit Board', amount: 10 },
      { item: 'Cable', amount: 9 },
      { item: 'Plastic', amount: 18 },
      { item: 'Screws', amount: 52 }
    ],
    outputs: [{ item: 'Computer', amount: 1 }],
    isAlternate: false
  },
  crystal_oscillator: {
    id: 'crystal_oscillator',
    name: 'Crystal Oscillator',
    machine: 'manufacturer',
    time: 120,
    inputs: [
      { item: 'Quartz Crystal', amount: 36 },
      { item: 'Cable', amount: 28 },
      { item: 'Reinforced Iron Plate', amount: 5 }
    ],
    outputs: [{ item: 'Crystal Oscillator', amount: 2 }],
    isAlternate: false
  },

  // --- Refinery ---
  plastic: {
    id: 'plastic',
    name: 'Plastic',
    machine: 'refinery',
    time: 6,
    inputs: [{ item: 'Crude Oil', amount: 3 }], // 30 per min
    outputs: [{ item: 'Plastic', amount: 2 }, { item: 'Heavy Oil Residue', amount: 1 }],
    isAlternate: false
  },
  rubber: {
    id: 'rubber',
    name: 'Rubber',
    machine: 'refinery',
    time: 6,
    inputs: [{ item: 'Crude Oil', amount: 3 }],
    outputs: [{ item: 'Rubber', amount: 2 }, { item: 'Heavy Oil Residue', amount: 2 }],
    isAlternate: false
  },
  pure_iron_ingot: {
    id: 'pure_iron_ingot',
    name: 'Pure Iron Ingot',
    machine: 'refinery',
    time: 1.71, // approx 35 per min
    inputs: [{ item: 'Iron Ore', amount: 1 }, { item: 'Water', amount: 0.57 }],
    outputs: [{ item: 'Iron Ingot', amount: 1.85 }],
    isAlternate: true
  },
  wet_concrete: {
    id: 'wet_concrete',
    name: 'Wet Concrete',
    machine: 'refinery',
    time: 3,
    inputs: [{ item: 'Limestone', amount: 6 }, { item: 'Water', amount: 5 }],
    outputs: [{ item: 'Concrete', amount: 4 }],
    isAlternate: true
  },

  // --- Packager ---
  packaged_water: {
    id: 'packaged_water',
    name: 'Packaged Water',
    machine: 'packager',
    time: 1,
    inputs: [{ item: 'Water', amount: 1 }, { item: 'Empty Canister', amount: 1 }],
    outputs: [{ item: 'Packaged Water', amount: 1 }],
    isAlternate: false
  },
  packaged_fuel: {
    id: 'packaged_fuel',
    name: 'Packaged Fuel',
    machine: 'packager',
    time: 1.5,
    inputs: [{ item: 'Fuel', amount: 1 }, { item: 'Empty Canister', amount: 1 }],
    outputs: [{ item: 'Packaged Fuel', amount: 1 }],
    isAlternate: false
  },

  // --- Blender ---
  turbo_blend_fuel: {
    id: 'turbo_blend_fuel',
    name: 'Turbo Blend Fuel',
    machine: 'blender',
    time: 8,
    inputs: [
      { item: 'Fuel', amount: 2 },
      { item: 'Heavy Oil Residue', amount: 4 },
      { item: 'Sulfur', amount: 3 },
      { item: 'Petroleum Coke', amount: 3 }
    ],
    outputs: [{ item: 'Turbofuel', amount: 6 }],
    isAlternate: true
  },
  battery: {
    id: 'battery',
    name: 'Battery',
    machine: 'blender',
    time: 3,
    inputs: [
      { item: 'Sulfuric Acid', amount: 2.5 },
      { item: 'Alumina Solution', amount: 2 },
      { item: 'Aluminum Casing', amount: 1 }
    ],
    outputs: [{ item: 'Battery', amount: 1 }, { item: 'Water', amount: 1.5 }],
    isAlternate: false
  },

  // --- Particle Accelerator ---
  nuclear_pasta: {
    id: 'nuclear_pasta',
    name: 'Nuclear Pasta',
    machine: 'particle_accelerator',
    time: 120,
    inputs: [{ item: 'Copper Powder', amount: 200 }, { item: 'Pressure Conversion Cube', amount: 1 }],
    outputs: [{ item: 'Nuclear Pasta', amount: 1 }],
    isAlternate: false
  },
  plutonium_pellet: {
    id: 'plutonium_pellet',
    name: 'Plutonium Pellet',
    machine: 'particle_accelerator',
    time: 60,
    inputs: [{ item: 'Non-fissile Uranium', amount: 100 }, { item: 'Uranium Waste', amount: 25 }],
    outputs: [{ item: 'Plutonium Pellet', amount: 30 }],
    isAlternate: false
  }
};
