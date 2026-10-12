const items = [
  {key:'prospectos',name:'Nuevos prospectos',goal:6},
  {key:'llamadas',name:'Llamadas realizadas',goal:30},
  {key:'contestadas',name:'Llamadas contestadas',goal:null},
  {key:'seguimientos',name:'Seguimientos realizados',goal:10},
  {key:'interesados',name:'Clientes interesados',goal:null},
  {key:'visitas',name:'Visitas agendadas',goal:4}
];
const $=id=>document.getElementById(id);
const counters=$('indicadores');
const data=Object.fromEntries(items.map(i=>[i.key,0]));
$('fecha').value=new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,10);
$('asesor').value=localStorage.getItem('lumina_asesor')||'';
$('asesor').addEventListener('input',()=>localStorage.setItem('lumina_asesor',$('asesor').value));
function setCount(key,value){const n=Number(value);data[key]=Number.isFinite(n)?Math.min(99999,Math.max(0,Math.trunc(n))):0;$(key).value=data[key];update();}
function update(){const goalItems=items.filter(i=>i.goal!==null);const met=goalItems.filter(i=>data[i.key]>=i.goal).length;
  $('resumen').textContent=`${met} de ${goalItems.length} metas`;
  const progress=Math.round(goalItems.reduce((s,i)=>s+Math.min(1,data[i.key]/i.goal),0)/goalItems.length*100);
  $('porcentaje').textContent=`${progress}%`;$('barra').style.width=`${progress}%`;$('avance').setAttribute('aria-valuenow',progress);
  for(const i of items){const e=$('goal_'+i.key);if(e)e.textContent=data[i.key]>=i.goal?'Meta alcanzada':`Meta: ${i.goal}`;}}
for(const i of items){const el=document.createElement('div');el.className='metric';
  const title=document.createElement('div');title.className='metric-title';const bold=document.createElement('strong');bold.textContent=i.name;const small=document.createElement('small');small.id='goal_'+i.key;small.textContent=i.goal===null?'Indicador de seguimiento':`Meta: ${i.goal}`;title.append(bold,small);
  const c=document.createElement('div');c.className='controls';const minus=document.createElement('button');minus.className='step';minus.type='button';minus.textContent='−';minus.setAttribute('aria-label',`Restar ${i.name}`);minus.addEventListener('click',()=>setCount(i.key,data[i.key]-1));
  const input=document.createElement('input');input.id=i.key;input.type='number';input.min='0';input.max='99999';input.value='0';input.setAttribute('aria-label',i.name);input.addEventListener('input',()=>setCount(i.key,input.value));
  const plus=document.createElement('button');plus.className='step';plus.type='button';plus.textContent='+';plus.setAttribute('aria-label',`Sumar ${i.name}`);plus.addEventListener('click',()=>setCount(i.key,data[i.key]+1));
  c.append(minus,input,plus);el.append(title,c);counters.appendChild(el);
}
function payload(){return {id:(typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():Date.now()+'-'+Math.random().toString(36).slice(2)),asesor:$('asesor').value.trim(),fecha:$('fecha').value,turno:$('turno').value,...data,observaciones:$('observaciones').value.trim()};}
function validate(p){if(!p.asesor)return 'Escribe el nombre del asesor.';if(!p.fecha)return 'Selecciona una fecha.';if(p.contestadas>p.llamadas)return 'Las llamadas contestadas no pueden superar las realizadas.';return '';}
function status(msg,type=''){const s=$('estado');s.textContent=msg;s.className='status '+type;}
$('copiar').addEventListener('click',async()=>{const p=payload();const msg=`📊 *REPORTE DIARIO – TEAM LUMINA*\n👤 *Asesor:* ${p.asesor||'________'}\n📅 *Fecha:* ${p.fecha}\n🕒 *Turno:* ${p.turno}\n\n1. Nuevos prospectos: ${p.prospectos}\n2. Llamadas realizadas: ${p.llamadas}\n3. Llamadas contestadas: ${p.contestadas}\n4. Seguimientos realizados: ${p.seguimientos}\n5. Clientes interesados: ${p.interesados}\n6. Visitas agendadas: ${p.visitas}\n\n📝 Observaciones: ${p.observaciones||'Ninguna'}`;
  try{await navigator.clipboard.writeText(msg);status('Reporte copiado. Ahora pégalo en WhatsApp.','ok');}catch{status('No se pudo copiar automáticamente. Usa una conexión HTTPS o localhost.','error');}});
$('limpiar').addEventListener('click',()=>{if(!confirm('¿Poner todas las cifras en cero?'))return;items.forEach(i=>setCount(i.key,0));$('observaciones').value='';status('Cifras reiniciadas.');});
$('enviar').addEventListener('click',async()=>{const p=payload();const error=validate(p);if(error){status(error,'error');return;}
  const url=(window.LUMINA_CONFIG?.APPS_SCRIPT_URL||'').trim();if(!/^https:\/\/script\.google\.com\/macros\/s\//.test(url)){status('Primero configura APPS_SCRIPT_URL en config.js.','error');return;}
  const button=$('enviar');button.disabled=true;status('Enviando solicitud…');
  try{
    // Apps Script redirige su respuesta a googleusercontent.com y GitHub Pages no puede leerla por CORS.
    // no-cors permite enviar la solicitud, pero NO garantiza que Google Sheets la haya guardado.
    await fetch(url,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(p)});
    status('Solicitud enviada. Comprueba en Google Sheets que se agregó la fila; el navegador no puede confirmar el guardado.','ok');
  }catch(e){status('No se pudo enviar. Revisa tu conexión y la URL de Apps Script.','error');}
  finally{button.disabled=false;}
});
update();
