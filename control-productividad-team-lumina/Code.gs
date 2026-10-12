/** Backend de Google Apps Script. Pegar en Extensiones > Apps Script. */
const SHEET_NAME = 'Reportes';
const HEADERS = ['ID','Registrado el','Fecha','Asesor','Turno','Nuevos prospectos','Llamadas realizadas','Llamadas contestadas','Seguimientos realizados','Clientes interesados','Visitas agendadas','Observaciones'];

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    if (!e || !e.postData || !e.postData.contents) throw new Error('Datos vacíos');
    const p = JSON.parse(e.postData.contents);
    const asesor = String(p.asesor || '').trim().slice(0,80);
    const fecha = String(p.fecha || '');
    const turno = String(p.turno || '');
    const id = String(p.id || '').slice(0,100);
    if (!asesor || !/^\d{4}-\d{2}-\d{2}$/.test(fecha) || !id) throw new Error('Faltan datos obligatorios');
    if (!['Día completo','Mañana','Tarde'].includes(turno)) throw new Error('Turno inválido');
    const fields = ['prospectos','llamadas','contestadas','seguimientos','interesados','visitas'];
    const numbers=fields.map(k=>Number(p[k]));
    if (numbers.some(n=>!Number.isInteger(n)||n<0||n>99999)) throw new Error('Indicadores inválidos');
    if (numbers[2]>numbers[1]) throw new Error('Contestadas supera realizadas');
    // Formula injection prevention for user-entered free text
    const safe=s=>{const t=String(s||'').slice(0,600);return /^[=+\-@\t\r]/.test(t)?"'"+t:t;};
    const ss=SpreadsheetApp.openById('1JQBFcYsN4zGPKJXhvndHBvywWd29MWMiiBXtqWLawEQ');
    lock.waitLock(20000);
    let sh=ss.getSheetByName(SHEET_NAME);
    if(!sh){sh=ss.insertSheet(SHEET_NAME);sh.appendRow(HEADERS);sh.setFrozenRows(1);}
    // Reenvíos con el mismo ID no crean duplicados
    const rows=sh.getLastRow();
    if(rows>1 && sh.getRange(2,1,rows-1,1).createTextFinder(id).matchEntireCell(true).findNext())return output({ok:true,duplicate:true});
    sh.appendRow([id,new Date(),fecha,safe(asesor),turno,...numbers,safe(p.observaciones)]);
    return output({ok:true});
  } catch(err){console.error(err);return output({ok:false,error:String(err)});}
  finally {try{lock.releaseLock();}catch(e){}}
}
function output(obj){return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);}
