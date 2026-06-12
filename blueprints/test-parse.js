import { Parser } from '@etothepii/satisfactory-file-parser';
import fs from 'fs';

try {
  const sbp = fs.readFileSync('c:/Users/nicol/Desktop/ALGORITMOS/Proyecto-SatCAD/blueprints/conveyor spliter.sbp');
  const sbpcfg = fs.readFileSync('c:/Users/nicol/Desktop/ALGORITMOS/Proyecto-SatCAD/blueprints/conveyor spliter.sbpcfg');
  
  const sbpAB = sbp.buffer.slice(sbp.byteOffset, sbp.byteOffset + sbp.byteLength);
  const sbpcfgAB = sbpcfg.buffer.slice(sbpcfg.byteOffset, sbpcfg.byteOffset + sbpcfg.byteLength);

  const bp = Parser.ParseBlueprintFiles('conveyor', sbpAB, sbpcfgAB);
  fs.writeFileSync('c:/Users/nicol/Desktop/ALGORITMOS/Proyecto-SatCAD/blueprints/parsed-conveyor.json', JSON.stringify(bp, null, 2));
  console.log('Parsed successfully! Check parsed-conveyor.json');
} catch (e) {
  console.log(e);
}
