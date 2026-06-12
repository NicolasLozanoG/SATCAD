import { Parser } from '@etothepii/satisfactory-file-parser';

const idToClassMap = {
  'smelter': '/Game/FactoryGame/Buildable/Factory/SmelterMk1/Build_SmelterMk1.Build_SmelterMk1_C',
  'constructor': '/Game/FactoryGame/Buildable/Factory/ConstructorMk1/Build_ConstructorMk1.Build_ConstructorMk1_C',
  'miner': '/Game/FactoryGame/Buildable/Factory/MinerMk1/Build_MinerMk1.Build_MinerMk1_C',
  'assembler': '/Game/FactoryGame/Buildable/Factory/AssemblerMk1/Build_AssemblerMk1.Build_AssemblerMk1_C',
  'manufacturer': '/Game/FactoryGame/Buildable/Factory/ManufacturerMk1/Build_ManufacturerMk1.Build_ManufacturerMk1_C',
  'refinery': '/Game/FactoryGame/Buildable/Factory/OilRefinery/Build_OilRefinery.Build_OilRefinery_C',
  'water_extractor': '/Game/FactoryGame/Buildable/Factory/WaterPump/Build_WaterPump.Build_WaterPump_C',
  'coal_generator': '/Game/FactoryGame/Buildable/Factory/GeneratorCoal/Build_GeneratorCoal.Build_GeneratorCoal_C',
  'biomass_burner': '/Game/FactoryGame/Buildable/Factory/GeneratorBiomass/Build_GeneratorBiomass.Build_GeneratorBiomass_C',
  'storage_container': '/Game/FactoryGame/Buildable/Factory/StorageContainerMk1/Build_StorageContainerMk1.Build_StorageContainerMk1_C',
  'industrial_storage': '/Game/FactoryGame/Buildable/Factory/StorageContainerMk2/Build_StorageContainerMk2.Build_StorageContainerMk2_C',
  'conveyor_splitter': '/Game/FactoryGame/Buildable/Factory/ConveyorAttachmentSplitter/Build_ConveyorAttachmentSplitter.Build_ConveyorAttachmentSplitter_C',
  'conveyor_merger': '/Game/FactoryGame/Buildable/Factory/ConveyorAttachmentMerger/Build_ConveyorAttachmentMerger.Build_ConveyorAttachmentMerger_C',
  'foundation_8x4': '/Game/FactoryGame/Buildable/Building/Foundation/Build_Foundation_8x4_01.Build_Foundation_8x4_01_C',
  'foundation_8x2': '/Game/FactoryGame/Buildable/Building/Foundation/Build_Foundation_8x2_01.Build_Foundation_8x2_01_C',
  'foundation_8x1': '/Game/FactoryGame/Buildable/Building/Foundation/Build_Foundation_8x1_01.Build_Foundation_8x1_01_C',
  'glass_foundation': '/Game/FactoryGame/Buildable/Building/Foundation/Build_Foundation_Glass_01.Build_Foundation_Glass_01_C',
  'wall_8x4': '/Game/FactoryGame/Buildable/Building/Wall/Build_Wall_8x4_01.Build_Wall_8x4_01_C',
  'wall_8x4_window': '/Game/FactoryGame/Buildable/Building/Wall/Build_Wall_Window_8x4_01.Build_Wall_Window_8x4_01_C',
  'wall_8x4_door': '/Game/FactoryGame/Buildable/Building/Wall/Build_Wall_Door_8x4_01.Build_Wall_Door_8x4_01_C',
  'wall_8x4_conveyor': '/Game/FactoryGame/Buildable/Building/Wall/Build_Wall_Conveyor_8x4_01.Build_Wall_Conveyor_8x4_01_C'
};

// Mapeo manual de puertos de nuestra app a los nombres internos de Unreal Engine
const portMappings = {
  smelter: { 'in_1': 'Input0', 'out_1': 'Output2' },
  constructor: { 'in_1': 'Input0', 'out_1': 'Output0' },
  assembler: { 'in_1': 'Input0', 'in_2': 'Input1', 'out_1': 'Output0' },
  conveyor_splitter: { 'in_1': 'Input1', 'out_1': 'Output1', 'out_2': 'Output2', 'out_3': 'Output3' },
  conveyor_merger: { 'in_1': 'Input1', 'in_2': 'Input2', 'in_3': 'Input3', 'out_1': 'Output1' },
  storage_container: { 'in_1': 'Input0', 'out_1': 'Output0' }
};

function getUePortName(buildingType, portId) {
  if (portMappings[buildingType] && portMappings[buildingType][portId]) {
    return portMappings[buildingType][portId];
  }
  // Default guess
  if (portId.startsWith('in_')) return 'Input' + (parseInt(portId.split('_')[1]) - 1);
  if (portId.startsWith('out_')) return 'Output' + (parseInt(portId.split('_')[1]) - 1);
  return 'Input0';
}

function createConnectionComponent(parentInstanceName, componentName, targetPath) {
  return {
    "typePath": "/Script/FactoryGame.FGFactoryConnectionComponent",
    "rootObject": "Persistent_Level",
    "instanceName": `${parentInstanceName}.${componentName}`,
    "flags": 2097152,
    "properties": {
      "mConnectedComponent": {
        "type": "ObjectProperty",
        "name": "mConnectedComponent",
        "propertyTagType": { "name": "ObjectProperty", "children": [] },
        "value": {
          "levelName": "Persistent_Level",
          "pathName": targetPath
        }
      }
    },
    "specialProperties": { "type": "EmptySpecialProperties" },
    "trailingData": [ 0, 0, 0, 0 ],
    "saveCustomVersion": 0,
    "shouldMigrateObjectRefsToPersistent": false,
    "parentEntityName": parentInstanceName,
    "type": "SaveComponent"
  };
}

function downloadBufferAsFile(buffer, filename) {
  const blob = new Blob([buffer], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export const exportToBlueprint = async (buildings, connections = [], blueprintName = "SatCAD_Export") => {
  try {
    const sbpReq = await fetch('/template.sbp');
    const sbpcfgReq = await fetch('/template.sbpcfg');

    if (!sbpReq.ok || !sbpcfgReq.ok) {
      throw new Error("No se pudo cargar el archivo Template.sbp de la carpeta public.");
    }

    const sbpAB = await sbpReq.arrayBuffer();
    const sbpcfgAB = await sbpcfgReq.arrayBuffer();

    const bp = Parser.ParseBlueprintFiles(blueprintName, sbpAB, sbpcfgAB);

    const baseEntity = bp.objects.find(o => o.type === 'SaveEntity');
    if (!baseEntity) throw new Error("El template no tiene un SaveEntity válido para clonar.");

    bp.objects = [];

    // Map to keep track of building entities to add components to later
    const entityMap = new Map();

    let instanceCount = 0;
    
    // 1. GENERATE BUILDINGS
    for (const b of buildings) {
      const classPath = idToClassMap[b.type];
      if (!classPath) {
        console.warn(`Saltando edificio ${b.type}: No hay mapeo de clase.`);
        continue;
      }

      const newEntity = JSON.parse(JSON.stringify(baseEntity));
      
      const id = 1000000 + instanceCount;
      newEntity.instanceName = `Persistent_Level:PersistentLevel.${b.type}_${id}`;
      newEntity.typePath = classPath;
      
      // SatCAD pos (1 unit = 800cm)
      newEntity.transform.translation.x = b.x * 800;
      newEntity.transform.translation.z = b.y * 800; 
      newEntity.transform.translation.y = b.z * 800; 
      
      const yaw = b.rotation || 0;
      newEntity.transform.rotation = {
        x: 0,
        y: 0,
        z: Math.sin(yaw / 2),
        w: Math.cos(yaw / 2)
      };
      
      newEntity.components = [];
      newEntity.properties = {};
      
      bp.objects.push(newEntity);
      entityMap.set(b.id, newEntity);
      instanceCount++;
    }

    // 2. GENERATE CONNECTIONS (CONVEYORS / PIPES)
    let beltCount = 0;
    for (const conn of connections) {
      const sourceB = buildings.find(b => b.id === conn.sourceId);
      const targetB = buildings.find(b => b.id === conn.targetId);
      const sourceEntity = entityMap.get(conn.sourceId);
      const targetEntity = entityMap.get(conn.targetId);

      if (!sourceB || !targetB || !sourceEntity || !targetEntity) continue;

      // Generar entidad de la cinta
      const beltEntity = JSON.parse(JSON.stringify(baseEntity));
      const beltId = 2000000 + beltCount;
      beltEntity.instanceName = `Persistent_Level:PersistentLevel.ConveyorBeltMk1_${beltId}`;
      beltEntity.typePath = "/Game/FactoryGame/Buildable/Factory/ConveyorBeltMk1/Build_ConveyorBeltMk1.Build_ConveyorBeltMk1_C";
      
      // Posición aproximada en el centro
      beltEntity.transform.translation.x = (sourceB.x + targetB.x) * 400;
      beltEntity.transform.translation.z = (sourceB.y + targetB.y) * 400;
      beltEntity.transform.translation.y = (sourceB.z + targetB.z) * 400;
      beltEntity.transform.rotation = { x: 0, y: 0, z: 0, w: 1 };
      beltEntity.components = [];
      
      // Generar nombres de componentes
      const ueSourcePort = getUePortName(sourceB.type, conn.sourcePort);
      const ueTargetPort = getUePortName(targetB.type, conn.targetPort);

      const sourcePortPath = `${sourceEntity.instanceName}.${ueSourcePort}`;
      const targetPortPath = `${targetEntity.instanceName}.${ueTargetPort}`;
      const beltPort0Path = `${beltEntity.instanceName}.ConveyorAny0`;
      const beltPort1Path = `${beltEntity.instanceName}.ConveyorAny1`;

      // Añadir componentes a las entidades
      sourceEntity.components.push({ levelName: "Persistent_Level", pathName: sourcePortPath });
      targetEntity.components.push({ levelName: "Persistent_Level", pathName: targetPortPath });
      beltEntity.components.push({ levelName: "Persistent_Level", pathName: beltPort1Path });
      beltEntity.components.push({ levelName: "Persistent_Level", pathName: beltPort0Path });

      // Crear los 4 SaveComponents
      const compSource = createConnectionComponent(sourceEntity.instanceName, ueSourcePort, beltPort0Path);
      const compTarget = createConnectionComponent(targetEntity.instanceName, ueTargetPort, beltPort1Path);
      const compBelt0 = createConnectionComponent(beltEntity.instanceName, "ConveyorAny0", sourcePortPath);
      const compBelt1 = createConnectionComponent(beltEntity.instanceName, "ConveyorAny1", targetPortPath);

      // Math para Spline
      const dx = (targetB.x - sourceB.x) * 800;
      const dz = (targetB.y - sourceB.y) * 800;
      const dy = (targetB.z - sourceB.z) * 800;
      const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
      
      // Construir las propiedades del Conveyor
      beltEntity.properties = {
        "mSplineData": {
          "type": "ArrayProperty",
          "name": "mSplineData",
          "propertyTagType": {
            "name": "ArrayProperty",
            "children": [ { "name": "StructProperty", "children": [ { "name": "SplinePointData", "children": [ { "name": "/Script/Engine", "children": [] } ] } ] } ]
          },
          "values": [
            {
              "type": "SplinePointData",
              "properties": {
                "Location": {
                  "type": "StructProperty", "name": "Location",
                  "propertyTagType": { "name": "StructProperty", "children": [ { "name": "Vector", "children": [ { "name": "/Script/CoreUObject", "children": [] } ] } ] },
                  "flags": 8, "value": { "x": 0, "y": 0, "z": 0 }
                },
                "ArriveTangent": {
                  "type": "StructProperty", "name": "ArriveTangent",
                  "propertyTagType": { "name": "StructProperty", "children": [ { "name": "Vector", "children": [ { "name": "/Script/CoreUObject", "children": [] } ] } ] },
                  "flags": 8, "value": { "x": dx/2, "y": dy/2, "z": dz/2 }
                },
                "LeaveTangent": {
                  "type": "StructProperty", "name": "LeaveTangent",
                  "propertyTagType": { "name": "StructProperty", "children": [ { "name": "Vector", "children": [ { "name": "/Script/CoreUObject", "children": [] } ] } ] },
                  "flags": 8, "value": { "x": dx/2, "y": dy/2, "z": dz/2 }
                }
              }
            },
            {
              "type": "SplinePointData",
              "properties": {
                "Location": {
                  "type": "StructProperty", "name": "Location",
                  "propertyTagType": { "name": "StructProperty", "children": [ { "name": "Vector", "children": [ { "name": "/Script/CoreUObject", "children": [] } ] } ] },
                  "flags": 8, "value": { "x": dx, "y": dy, "z": dz }
                },
                "ArriveTangent": {
                  "type": "StructProperty", "name": "ArriveTangent",
                  "propertyTagType": { "name": "StructProperty", "children": [ { "name": "Vector", "children": [ { "name": "/Script/CoreUObject", "children": [] } ] } ] },
                  "flags": 8, "value": { "x": dx/2, "y": dy/2, "z": dz/2 }
                },
                "LeaveTangent": {
                  "type": "StructProperty", "name": "LeaveTangent",
                  "propertyTagType": { "name": "StructProperty", "children": [ { "name": "Vector", "children": [ { "name": "/Script/CoreUObject", "children": [] } ] } ] },
                  "flags": 8, "value": { "x": dx/2, "y": dy/2, "z": dz/2 }
                }
              }
            }
          ]
        }
      };
      
      beltEntity.specialProperties = { type: "ConveyorSpecialProperties" };

      // Añadirlos a los objetos
      bp.objects.push(beltEntity);
      bp.objects.push(compSource);
      bp.objects.push(compTarget);
      bp.objects.push(compBelt0);
      bp.objects.push(compBelt1);

      beltCount++;
    }

    bp.header.itemCosts = [];

    const mainFileChunks = [];
    
    const result = Parser.WriteBlueprintFiles(
      bp,
      (headerBuffer) => {
        mainFileChunks.push(new Uint8Array(headerBuffer));
      },
      (chunkBuffer) => {
        mainFileChunks.push(new Uint8Array(chunkBuffer));
      }
    );

    const totalLength = mainFileChunks.reduce((acc, val) => acc + val.length, 0);
    const finalSbp = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of mainFileChunks) {
      finalSbp.set(chunk, offset);
      offset += chunk.length;
    }

    const finalSbpcfg = new Uint8Array(result.configFileBinary);

    downloadBufferAsFile(finalSbp, `${blueprintName}.sbp`);
    downloadBufferAsFile(finalSbpcfg, `${blueprintName}.sbpcfg`);

    return { success: true, message: `Blueprint exportado con ${instanceCount} máquinas y ${beltCount} conexiones!` };

  } catch (error) {
    console.error('Error al exportar el blueprint:', error);
    return { success: false, message: 'Error en la exportación: ' + error.message };
  }
};
