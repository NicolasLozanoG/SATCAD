import { Parser } from '@etothepii/satisfactory-file-parser';

// Map satisfactory class paths to our internal building IDs
const classToIdMap = {
  'Build_SmelterMk1_C': 'smelter',
  'Build_ConstructorMk1_C': 'constructor',
  'Build_MinerMk1_C': 'miner',
  'Build_AssemblerMk1_C': 'assembler',
  'Build_ManufacturerMk1_C': 'manufacturer',
  'Build_OilRefinery_C': 'refinery',
  'Build_WaterPump_C': 'water_extractor',
  'Build_CoalGenerator_C': 'coal_generator',
  'Build_GeneratorBiomass_C': 'biomass_burner',
  'Build_StorageContainerMk1_C': 'storage_container',
  'Build_StorageContainerMk2_C': 'industrial_storage',
  'Build_ConveyorAttachmentSplitter_C': 'conveyor_splitter',
  'Build_ConveyorAttachmentMerger_C': 'conveyor_merger',
  'Build_Foundation_8x4_01_C': 'foundation_8x4',
  'Build_Foundation_8x2_01_C': 'foundation_8x2',
  'Build_Foundation_8x1_01_C': 'foundation_8x1',
  'Build_Foundation_Glass_01_C': 'glass_foundation',
  'Build_Wall_8x4_01_C': 'wall_8x4',
  'Build_Wall_Window_8x4_01_C': 'wall_8x4_window',
  'Build_Wall_Door_8x4_01_C': 'wall_8x4_door',
  'Build_Wall_Conveyor_8x4_01_C': 'wall_8x4_conveyor'
};

const reversePortMappings = {
  smelter: { 'Input0': 'in_1', 'Output2': 'out_1' },
  constructor: { 'Input0': 'in_1', 'Output0': 'out_1' },
  assembler: { 'Input0': 'in_1', 'Input1': 'in_2', 'Output0': 'out_1' },
  conveyor_splitter: { 'Input1': 'in_1', 'Output1': 'out_1', 'Output2': 'out_2', 'Output3': 'out_3' },
  conveyor_merger: { 'Input1': 'in_1', 'Input2': 'in_2', 'Input3': 'in_3', 'Output1': 'out_1' },
  storage_container: { 'Input0': 'in_1', 'Output0': 'out_1' }
};

function getSatCadPort(buildingType, uePort) {
  if (reversePortMappings[buildingType] && reversePortMappings[buildingType][uePort]) {
    return reversePortMappings[buildingType][uePort];
  }
  if (uePort.startsWith('Input')) return 'in_' + (parseInt(uePort.replace('Input', '')) + 1);
  if (uePort.startsWith('Output')) return 'out_' + (parseInt(uePort.replace('Output', '')) + 1);
  return 'in_1';
}

export const parseBlueprint = async (sbpFile, sbpcfgFile, addBuilding, addConnection) => {
  try {
    const sbpArrayBuffer = await sbpFile.arrayBuffer();
    const sbpcfgArrayBuffer = await sbpcfgFile.arrayBuffer();

    const name = sbpFile.name.replace('.sbp', '');
    
    // The parser requires ArrayBuffers
    const bp = Parser.ParseBlueprintFiles(name, sbpArrayBuffer, sbpcfgArrayBuffer);
    
    if (!bp || !bp.objects) {
      throw new Error('No objects found in blueprint.');
    }

    // Add everything to the center for now (offset)
    const entities = bp.objects.filter(obj => obj.type === 'SaveEntity');
    
    let addedCount = 0;
    const entityIdMap = {};

    entities.forEach(entity => {
      const parts = entity.typePath.split('.');
      const className = parts[parts.length - 1];
      
      const buildingId = classToIdMap[className];
      
      if (buildingId) {
        const x = entity.transform.translation.x / 800;
        const y = entity.transform.translation.z / 800; 
        const z = entity.transform.translation.y / 800; 
        
        const q = entity.transform.rotation;
        const yaw = Math.atan2(2.0 * (q.w * q.z + q.x * q.y), 1.0 - 2.0 * (q.y * q.y + q.z * q.z));
        
        const generatedId = addBuilding(buildingId, x, y, z, yaw);
        entityIdMap[entity.instanceName] = { id: generatedId, type: buildingId };
        addedCount++;
      }
    });

    let connCount = 0;
    const components = bp.objects.filter(obj => obj.type === 'SaveComponent');
    const belts = bp.objects.filter(obj => obj.typePath.includes('ConveyorBeltMk1') || obj.typePath.includes('Build_ConveyorBelt'));

    belts.forEach(belt => {
      const any0 = components.find(c => c.instanceName === `${belt.instanceName}.ConveyorAny0`);
      const any1 = components.find(c => c.instanceName === `${belt.instanceName}.ConveyorAny1`);
      
      if (any0 && any1 && any0.properties?.mConnectedComponent && any1.properties?.mConnectedComponent) {
        let sourceId, sourcePort, targetId, targetPort;
        
        const sPath = any0.properties.mConnectedComponent.value.pathName;
        const sParts = sPath.split('.');
        const sMachine = entityIdMap[`${sParts[0]}.${sParts[1]}`];
        if (sMachine) {
          sourceId = sMachine.id;
          sourcePort = getSatCadPort(sMachine.type, sParts[2]);
        }

        const tPath = any1.properties.mConnectedComponent.value.pathName;
        const tParts = tPath.split('.');
        const tMachine = entityIdMap[`${tParts[0]}.${tParts[1]}`];
        if (tMachine) {
          targetId = tMachine.id;
          targetPort = getSatCadPort(tMachine.type, tParts[2]);
        }

        if (sourceId && targetId) {
          addConnection(sourceId, sourcePort, targetId, targetPort, 'default');
          connCount++;
        }
      }
    });

    return { success: true, message: `Se importaron ${addedCount} máquinas y ${connCount} conexiones.` };
  } catch (error) {
    console.error('Error al parsear el blueprint:', error);
    return { success: false, message: 'Error al procesar el archivo: ' + error.message };
  }
};
