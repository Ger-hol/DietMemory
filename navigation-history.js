/* v9.13.1: niezawodne Wstecz w Android PWA. */
(function(){'use strict';
const screens=['start','produkty','posilki','cele','plan','zakupy','dziennik','kalendarz','historia'];
const modals=['eanScannerModal','offResultsModal','planDetailsModal','planModal','goalCalculatorModal','journalEntryCard','vesselModal','journalModal'];
const $=id=>document.getElementById(id);let applying=false,ready=false,last='';
function screen(){return screens.find(id=>$(id)&&!$(id).classList.contains('hide'))||'start'}
function opened(){return modals.filter(id=>$(id)&&!$(id).classList.contains('hide'))}
function snap(){return{dm:true,screen:screen(),modals:opened(),journal:{person:$('jperson')?.value||'',date:$('jdate')?.value||''},plan:{date:$('planDate')?.value||''},calendar:{month:$('dietMonth')?.value||''},shopping:{from:$('shoppingFrom')?.value||'',to:$('shoppingTo')?.value||''}}}
function sig(s){return JSON.stringify(s)}
function write(mode){if(!ready||applying)return;const s=snap(),x=sig(s);if(x===last)return;last=x;history[mode+'State'](s,'',location.href)}
function restore(s){if(!s?.dm)return;applying=true;try{
 if(s.journal){if($('jperson'))$('jperson').value=s.journal.person;if($('jdate'))$('jdate').value=s.journal.date}
 if(s.plan?.date&&$('planDate'))$('planDate').value=s.plan.date;if(s.calendar?.month&&$('dietMonth'))$('dietMonth').value=s.calendar.month;
 if(s.shopping){if($('shoppingFrom'))$('shoppingFrom').value=s.shopping.from;if($('shoppingTo'))$('shoppingTo').value=s.shopping.to}
 screens.forEach(id=>$(id)?.classList.toggle('hide',id!==s.screen));modals.forEach(id=>$(id)?.classList.toggle('hide',!(s.modals||[]).includes(id)));
 if(!s.modals?.includes('eanScannerModal')&&typeof window.stopEanScanner==='function')window.stopEanScanner();
 ['renderJournal','renderPlan','renderGoals','renderShopping','renderDietCalendar'].forEach(fn=>{if(typeof window[fn]==='function')try{window[fn]()}catch(e){console.warn(fn,e)}});
 last=sig(snap());
 }finally{setTimeout(()=>applying=false,0)}}
window.addEventListener('popstate',e=>restore(e.state));
/* Klucz dla Android PWA: bazowy wpis + wartownik. Pierwsze Wstecz wraca do stanu aplikacji zamiast ją zamykać. */
const base=snap();history.replaceState(base,'',location.href);history.pushState({...base,dmGuard:true},'',location.href);last=sig(base);ready=true;
/* Podpinamy się pod właściwe kliknięcia nawigacyjne, nie tylko MutationObserver. */
document.addEventListener('click',e=>{if(applying)return;const target=e.target.closest('button,a,[role="button"]');if(!target)return;const before=sig(snap());setTimeout(()=>{const after=sig(snap());if(after!==before){last=before;write('push')}},0)},true);
const obs=new MutationObserver(()=>{if(!applying)requestAnimationFrame(()=>write('push'))});screens.concat(modals).forEach(id=>{const n=$(id);if(n)obs.observe(n,{attributes:true,attributeFilter:['class']})});
['jperson','jdate','planDate','dietMonth','shoppingFrom','shoppingTo'].forEach(id=>$(id)?.addEventListener('change',()=>write('replace')));
})();
