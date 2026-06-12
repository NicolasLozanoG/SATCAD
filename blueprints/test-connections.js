import fs from 'fs';

try {
  const data = JSON.parse(fs.readFileSync('c:/Users/nicol/Desktop/ALGORITMOS/Proyecto-SatCAD/blueprints/parsed-conveyor.json'));
  const components = data.objects.filter(o => o.type === 'SaveComponent' && o.typePath.includes('FGFactoryConnectionComponent'));
  
  for (const comp of components) {
    if (comp.properties && comp.properties.mConnectedComponent) {
      console.log(`Connection in ${comp.instanceName}:`);
      console.log(' ->', comp.properties.mConnectedComponent.value.pathName);
    }
  }
} catch (e) {
  console.log(e);
}
