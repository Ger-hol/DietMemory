/* v9.12.2: wyłącznie kompaktowy interfejs mobilny. */
(function(){'use strict';const C=id=>document.getElementById(id);let productOpen=false;
function setProductOpen(open){productOpen=!!open;C('produkty').classList.toggle('compactEditorOpen',productOpen);C('compactNewProduct').textContent=productOpen?'× Zamknij formularz':'＋ Nowy produkt';if(!productOpen){C('compactPortionsContent').classList.add('hide');C('compactPortionsToggle').textContent='▸ Dodatkowe porcje';C('compactPortionsToggle').setAttribute('aria-expanded','false')}}
C('compactNewProduct').onclick=()=>{if(productOpen){if(!C('productCancelEdit').classList.contains('hide'))C('productCancelEdit').click();else{C('productForm').reset();setProductOpen(false)}return}if(!C('productCancelEdit').classList.contains('hide'))C('productCancelEdit').click();C('productForm').reset();setProductOpen(true);requestAnimationFrame(()=>C('pn').focus())};
C('productCancelEdit').addEventListener('click',()=>setTimeout(()=>setProductOpen(false),0));
C('productForm').addEventListener('submit',()=>setTimeout(()=>{if(C('pn').value===''&&C('productCancelEdit').classList.contains('hide'))setProductOpen(false)},900));
C('plist').addEventListener('click',e=>{if(e.target.closest('.productPick,.productItem button'))setTimeout(()=>setProductOpen(true),0)});
const productObserver=new MutationObserver(()=>{if(!C('productCancelEdit').classList.contains('hide'))setProductOpen(true)});productObserver.observe(C('productCancelEdit'),{attributes:true,attributeFilter:['class']});
C('compactPortionsToggle').onclick=()=>{const content=C('compactPortionsContent'),open=content.classList.contains('hide');content.classList.toggle('hide',!open);C('compactPortionsToggle').textContent=(open?'▾ ':'▸ ')+'Dodatkowe porcje';C('compactPortionsToggle').setAttribute('aria-expanded',String(open))};
// Formularz Posiłków był już otwierany tylko przy dodawaniu/edycji; po zapisie i anulowaniu pozostaje zwinięty.
const mealObserver=new MutationObserver(()=>{if(!C('mealEditor').classList.contains('hide'))C('mealEditor').scrollIntoView({block:'start',behavior:'smooth'})});mealObserver.observe(C('mealEditor'),{attributes:true,attributeFilter:['class']});
// Tara pozostaje zwinięta; jej baza nadal jest osobnym oknem.
setProductOpen(false);
})();
/* v9.12.3: po wyborze wpisu ukryj wyniki wyszukiwania - wybrana pozycja pozostaje w jchosen. */
(function(){
 const cmResults=document.getElementById('jresults');
 const cmSearch=document.getElementById('jsearch');
 if(cmResults&&cmSearch){
  cmResults.addEventListener('click',()=>setTimeout(()=>{cmResults.innerHTML=''},0));
  cmSearch.addEventListener('input',()=>{});
 }
})();
