import { Parser } from '@etothepii/satisfactory-file-parser';
import fs from 'fs';

try {
  const sbpBuffer = fs.readFileSync('c:/Users/nicol/Desktop/ALGORITMOS/Proyecto-SatCAD/public/template.sbp');
  const sbpcfgBuffer = fs.readFileSync('c:/Users/nicol/Desktop/ALGORITMOS/Proyecto-SatCAD/public/template.sbpcfg');
  
  const sbpAB = sbpBuffer.buffer.slice(sbpBuffer.byteOffset, sbpBuffer.byteOffset + sbpBuffer.byteLength);
  const sbpcfgAB = sbpcfgBuffer.buffer.slice(sbpcfgBuffer.byteOffset, sbpcfgBuffer.byteOffset + sbpcfgBuffer.byteLength);

  const bp = Parser.ParseBlueprintFiles('TemplateBP', sbpAB, sbpcfgAB);
  const baseEntity = bp.objects.find(o => o.type === 'SaveEntity');
  
  bp.objects = [];

  const idToClassMap = {
    'smelter': '/Game/FactoryGame/Buildable/Factory/SmelterMk1/Build_SmelterMk1.Build_SmelterMk1_C',
    'constructor': '/Game/FactoryGame/Buildable/Factory/ConstructorMk1/Build_ConstructorMk1.Build_ConstructorMk1_C'
  };

  const myBuildings = [
    { type: 'smelter', x: 0, y: 0, z: 0, yaw: 0 },
    { type: 'constructor', x: 2, y: 0, z: 0, yaw: Math.PI / 2 }
  ];

  let instanceCount = 0;
  for (const b of myBuildings) {
    const newEntity = JSON.parse(JSON.stringify(baseEntity));
    const id = 100000000 + instanceCount;
    newEntity.instanceName = `Persistent_Level:PersistentLevel.${b.type}_${id}`;
    newEntity.typePath = idToClassMap[b.type];
    newEntity.transform.translation.x = b.x * 800;
    newEntity.transform.translation.z = b.y * 800; 
    newEntity.transform.translation.y = b.z * 800; 
    newEntity.transform.rotation = { x: 0, y: 0, z: Math.sin(b.yaw / 2), w: Math.cos(b.yaw / 2) };
    newEntity.components = [];
    newEntity.properties = {};
    bp.objects.push(newEntity);
    instanceCount++;
  }

  bp.header.itemCosts = [];
  
  let mainFileBuffers = [];
  
  const result = Parser.WriteBlueprintFiles(
    bp,
    (headerBuffer) => {
      mainFileBuffers.push(Buffer.from(headerBuffer));
    },
    (chunkBuffer) => {
      mainFileBuffers.push(Buffer.from(chunkBuffer));
    }
  );
  
  const finalSbp = Buffer.concat(mainFileBuffers);
  const finalSbpcfg = Buffer.from(result.configFileBinary);
  
  fs.writeFileSync('c:/Users/nicol/Desktop/ALGORITMOS/Proyecto-SatCAD/blueprints/Exported.sbp', finalSbp);
  fs.writeFileSync('c:/Users/nicol/Desktop/ALGORITMOS/Proyecto-SatCAD/blueprints/Exported.sbpcfg', finalSbpcfg);
  
  console.log("Successfully exported to blueprints/Exported.sbp");
  
} catch (e) {
  console.error(e);
}
