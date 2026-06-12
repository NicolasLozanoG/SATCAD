import fs from 'fs';
const data = JSON.parse(fs.readFileSync('c:/Users/nicol/Desktop/ALGORITMOS/Proyecto-SatCAD/blueprints/parsed-conveyor.json'));
const splitter = data.objects.find(o => o.typePath.includes('Build_ConveyorAttachmentSplitter_C'));
if (splitter) {
  console.log('Splitter components:');
  splitter.components.forEach(c => console.log(c.pathName));
}
