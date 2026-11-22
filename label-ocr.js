/* Odczyt etykiety: osobny modul, bez zapisu do bazy. */
(function(){
'use strict';
const by=id=>document.getElementById(id);
let worker=null,busy=false,mode='nutrition',session=0,libraryPromise=null;
const fields=['ocrName','ocrKcal','ocrProtein','ocrFat','ocrCarbs'];
function clean(t){return String(t||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ł/g,'l').replace(/Ł/g,'L').toLowerCase()}
function parseNutrition(text){
 const lines=String(text||'').split(/\r?\n/).map(x=>x.trim()).filter(Boolean),out={};
 for(let i=0;i<lines.length;i++){
  const line=lines[i],n=clean(line);
  const energy=/(\d+(?:[.,]\d+)?)\s*kcal\b/i.exec(line);
  if(energy&&out.kcal===undefined)out.kcal=Number(energy[1].replace(',','.'));
  let key=null;
  if(/^(?:[-–•]\s*)?(?:bialko|proteins?|protein)\b/.test(n))key='protein';
  else if(/^(?:[-–•]\s*)?(?:tluszcz(?:e)?|(?:total\s+)?fat)\b/.test(n))key='fat';
  else if(/^(?:[-–•]\s*)?(?:weglowodany|carbohydrates?)\b/.test(n))key='carbs';
  if(!key||/[<≤]/.test(line))continue;
  const values=[...line.matchAll(/(\d+(?:[.,]\d+)?)\s*g\b/gi)];
  if(values.length&&out[key]===undefined)out[key]=Number(values[0][1].replace(',','.'));
 }
 return out;
}
function loadLibrary(){if(window.Tesseract)return Promise.resolve(window.Tesseract);if(!libraryPromise)libraryPromise=new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';script.onload=()=>window.Tesseract?resolve(window.Tesseract):reject(new Error('Brak biblioteki OCR'));script.onerror=()=>{libraryPromise=null;script.remove();reject(new Error('Nie można pobrać OCR. Sprawdź Internet.'))};document.head.appendChild(script)});return libraryPromise}
function buttons(disabled){['ocrNamePhoto','ocrNutritionPhoto','ocrGallery','ocrApply'].forEach(id=>by(id).disabled=disabled)}
function showCandidates(text){const box=by('ocrNameCandidates');box.replaceChildren();String(text).split(/\r?\n/).map(t=>t.trim()).filter(t=>t.length>=3&&/[a-ząćęłńóśźż]/i.test(t)).slice(0,30).forEach(line=>{const b=document.createElement('button');b.type='button';b.textContent=line;b.onclick=()=>{by('ocrName').value=line;by('ocrVerified').checked=false};box.appendChild(b)})}
async function readFile(file){
 if(!file||busy)return;
 if(!file.type.startsWith('image/')||file.size>20*1024*1024){by('ocrStatus').textContent='Wybierz zdjęcie do 20 MB.';return}
 const token=session;busy=true;buttons(true);by('ocrVerified').checked=false;by('ocrStatus').textContent='Uruchamianie OCR. Pierwsze użycie pobiera modele językowe.';
 let localWorker=null;
 try{
  const lib=await loadLibrary();if(token!==session)return;
  localWorker=await lib.createWorker('pol+eng',1,{logger:m=>{if(token===session&&m.status==='recognizing text')by('ocrStatus').textContent='Odczytywanie: '+Math.round((m.progress||0)*100)+'%'}});
  if(token!==session)return;worker=localWorker;
  const result=await localWorker.recognize(file);if(token!==session)return;
  const text=result.data.text||'';by('ocrRaw').textContent=text;showCandidates(text);
  if(mode==='name'){
   const first=text.split(/\r?\n/).map(t=>t.trim()).find(t=>t.length>=3&&/[a-ząćęłńóśźż]/i.test(t));if(first)by('ocrName').value=first;
   by('ocrStatus').textContent='Nazwa jest propozycją z pierwszego wiersza. Wybierz właściwy wiersz z odczytanego tekstu lub popraw ręcznie.';
  }else{
   const data=parseNutrition(text),mapping={kcal:'ocrKcal',protein:'ocrProtein',fat:'ocrFat',carbs:'ocrCarbs'};
   Object.values(mapping).forEach(id=>by(id).value='');
   Object.entries(data).forEach(([key,value])=>by(mapping[key]).value=value);
   by('ocrStatus').textContent='Odczyt zakończony. Sprawdź wszystkie pola: przy kilku kolumnach proponujemy pierwszą rozpoznaną wartość. Braków nie zastępujemy zerem.';
  }
 }catch(e){if(token===session)by('ocrStatus').textContent='Nie udało się odczytać zdjęcia: '+e.message+'. Spróbuj wyraźnego zdjęcia JPG/PNG.'}
 finally{if(localWorker)try{await localWorker.terminate()}catch(e){}if(worker===localWorker)worker=null;if(token===session){busy=false;buttons(false)}}
}
by('openLabelOcr').onclick=()=>{session++;busy=false;buttons(false);by('labelOcrModal').classList.remove('hide');fields.forEach(id=>by(id).value='');by('ocrVerified').checked=false;by('ocrRaw').textContent='';by('ocrNameCandidates').replaceChildren();by('ocrStatus').textContent='Zrób zdjęcie nazwy lub tabeli wartości odżywczych.'};
by('ocrNamePhoto').onclick=()=>{mode='name';by('ocrCameraFile').value='';by('ocrCameraFile').click()};
by('ocrNutritionPhoto').onclick=()=>{mode='nutrition';by('ocrCameraFile').value='';by('ocrCameraFile').click()};
by('ocrGallery').onclick=()=>{mode='nutrition';by('ocrGalleryFile').value='';by('ocrGalleryFile').click()};
by('ocrCameraFile').onchange=e=>readFile(e.target.files[0]);by('ocrGalleryFile').onchange=e=>readFile(e.target.files[0]);
by('ocrClose').onclick=()=>{session++;busy=false;buttons(false);by('labelOcrModal').classList.add('hide');if(worker){worker.terminate().catch(()=>{});worker=null}};
by('ocrApply').onclick=()=>{
 if(!by('ocrVerified').checked){by('ocrStatus').textContent='Najpierw sprawdź dane i zaznacz potwierdzenie.';return}
 const mapping={ocrName:'pn',ocrKcal:'pk',ocrProtein:'pb',ocrFat:'pt',ocrCarbs:'pw'};
 const filled=fields.filter(id=>by(id).value.trim()!=='');if(!filled.length){by('ocrStatus').textContent='Brak danych do przeniesienia.';return}
 for(const id of filled){if(id!=='ocrName'&&(!Number.isFinite(Number(by(id).value))||Number(by(id).value)<0)){by('ocrStatus').textContent='Popraw nieprawidłową wartość.';return}}
 if(filled.some(id=>by(mapping[id]).value.trim()!==''&&by(mapping[id]).value!==by(id).value)&&!confirm('Zastąpić istniejące wartości w formularzu produktu?'))return;
 filled.forEach(id=>by(mapping[id]).value=by(id).value.trim());by('labelOcrModal').classList.add('hide');by('pmsg').textContent='Dane z etykiety przeniesione. Produkt nie jest jeszcze zapisany. Sprawdź formularz i kliknij Dodaj produkt lub Zapisz zmiany.';
};
// Parser is tested independently; no application state or persistence is modified here.
})();
