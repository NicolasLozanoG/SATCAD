import fs from 'fs';
const data = JSON.parse(fs.readFileSync('c:/Users/nicol/Desktop/ALGORITMOS/Proyecto-SatCAD/blueprints/parsed-conveyor.json'));
const comp = data.objects.find(o => o.type === 'SaveComponent' && o.typePath.includes('FGFactoryConnectionComponent'));
fs.writeFileSync('c:/Users/nicol/Desktop/ALGORITMOS/Proyecto-SatCAD/blueprints/sample-connection.json', JSON.stringify(comp, null, 2));
console.log('Saved to sample-connection.json');
