/* v9.13: historia ekranów i okien dla przycisku Wstecz Androida/przeglądarki. */
(function(){
'use strict';
const ids=['start','produkty','posilki','cele','plan','zakupy','dziennik','kalendarz','historia'];
const modalIds=['eanScannerModal','offResultsModal','planDetailsModal','planModal','goalCalculatorModal','journalEntryCard','vesselModal','journalModal'];
let applying=false,lastSignature='',ready=false;
const el=id=>document.getElementById(id);
function activeScreen(){return ids.find(id=>el(id)&&!el(id).classList.contains('hide'))||'start'}
function openModals(){return modalIds.filter(id=>el(id)&&!el(id).classList.contains('hide'))}
function snapshot(){return{
 dm:true,screen:activeScreen(),modals:openModals(),
 journal:{person:el('jperson')?.value||'',date:el('jdate')?.value||''},
 plan:{date:el('planDate')?.value||''},calendar:{month:el('dietMonth')?.value||''},
 shopping:{from:el('shoppingFrom')?.value||'',to:el('shoppingTo')?.value||''}
}}
function signature(s){return JSON.stringify(s)}
function commit(replace=false){
 if(applying||!ready)return;
 const state=snapshot(),sig=signature(state);if(sig===lastSignature)return;
 lastSignature=sig;(replace?history.replaceState:history.pushState).call(history,state,'',location.href);
}
function restoreValues(s){
 if(s.journal){if(el('jperson')&&s.journal.person)el('jperson').value=s.journal.person;if(el('jdate')&&s.journal.date)el('jdate').value=s.journal.date}
 if(s.plan?.date&&el('planDate'))el('planDate').value=s.plan.date;
 if(s.calendar?.month&&el('dietMonth'))el('dietMonth').value=s.calendar.month;
 if(s.shopping){if(el('shoppingFrom')&&s.shopping.from)el('shoppingFrom').value=s.shopping.from;if(el('shoppingTo')&&s.shopping.to)el('shoppingTo').value=s.shopping.to}
}
function restore(s){
 if(!s?.dm)return;
 applying=true;
 try{
  restoreValues(s);
  ids.forEach(id=>el(id)?.classList.toggle('hide',id!==s.screen));
  modalIds.forEach(id=>el(id)?.classList.toggle('hide',!(s.modals||[]).includes(id)));
  if(!s.modals?.includes('eanScannerModal')&&typeof window.stopEanScanner==='function')window.stopEanScanner();
  if(s.screen==='dziennik'&&typeof window.renderJournal==='function')window.renderJournal();
  if(s.screen==='plan'&&typeof window.renderPlan==='function')window.renderPlan();
  if(s.screen==='cele'&&typeof window.renderGoals==='function')window.renderGoals();
  if(s.screen==='zakupy'&&typeof window.renderShopping==='function')window.renderShopping();
  if(s.screen==='kalendarz'&&typeof window.renderDietCalendar==='function')window.renderDietCalendar();
  lastSignature=signature(snapshot());
 }finally{setTimeout(()=>{applying=false},0)}
}
window.addEventListener('popstate',e=>restore(e.state||{dm:true,screen:'start',modals:[]}));
const observer=new MutationObserver(records=>{
 if(applying||!ready)return;
 const opened=records.some(r=>r.target.classList?.contains('modal')&&!r.target.classList.contains('hide'));
 const screenChanged=records.some(r=>r.target.tagName==='MAIN');
 if(opened||screenChanged)setTimeout(()=>commit(false),0);
});
ids.concat(modalIds).forEach(id=>{const node=el(id);if(node)observer.observe(node,{attributes:true,attributeFilter:['class']})});
['jperson','jdate','planDate','dietMonth','shoppingFrom','shoppingTo'].forEach(id=>el(id)?.addEventListener('change',()=>commit(true)));
setTimeout(()=>{ready=true;const initial=snapshot();lastSignature=signature(initial);history.replaceState(initial,'',location.href)},0);
})();
