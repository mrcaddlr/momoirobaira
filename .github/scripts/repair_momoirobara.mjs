import fs from 'node:fs';
const p='index.html';
let s=fs.readFileSync(p,'utf8');
if(!s.includes('MOMOIROBARA BOTANICAL UI V8')) throw new Error('V8 repair has not been applied');
s=s.replace(/<!-- MOMOIROBARA WORKFLOW TRIGGER -->/g,'');
s=s.replace(/<\/body>/i,'<!-- MOMOIROBARA WORKFLOW TRIGGER -->\n</body>');
fs.writeFileSync(p,s,'utf8');
console.log('V8 workflow trigger');
