/* Giorenatto 5.0 staging UX extras — no remote purchases */
(function(){
 const nav=document.getElementById('gio5-menu'); const toggle=document.getElementById('gio5-menu-btn');
 if(toggle && nav){ toggle.addEventListener('click',()=>{const open=nav.classList.toggle('is-open');toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Cerrar menú':'Abrir menú')});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('is-open');toggle.setAttribute('aria-expanded','false')}));document.addEventListener('keydown',e=>{if(e.key==='Escape'){nav.classList.remove('is-open');toggle.setAttribute('aria-expanded','false')}})}
 const searchBtn=document.getElementById('gio5-search-btn');
 if(searchBtn)searchBtn.addEventListener('click',()=>{
  const searchBox=document.querySelector('.gio5-search'),q=document.getElementById('search');
  if(!searchBox||!q)return;
  const open=searchBox.classList.toggle('is-open');
  searchBtn.setAttribute('aria-expanded',String(open));
  if(open)q.focus();else q.blur();
 });
 // Fallbacks for missing original product imagery. Do NOT represent these as real merchandise.
 document.addEventListener('error',e=>{const im=e.target;if(!(im instanceof HTMLImageElement)||im.dataset.gio5Fallback)return;if((im.getAttribute('src')||'').includes('assets/products/')){im.dataset.gio5Fallback='true';im.src='assets/foto-pendiente.svg';im.classList.add('gio5-missing')}},true);
 document.querySelectorAll('img[src*="assets/products/"]').forEach(im=>{if(im.complete&&!im.naturalWidth){im.dispatchEvent(new Event('error'))}});
})();
function gio5Filtrar(cat){
 try{
  const classes={Accesorios:['Juguetes','Medias','Mantas']};window.gio5SelectedCategory=cat||'';
  const names=classes[cat]||[cat];
  document.querySelectorAll('.cat-group').forEach(group=>{const key=group.id.replace('cat-','');const shown=!cat||names.some(n=>n.toLowerCase().normalize('NFD').replace(/[^a-z]/g,'')===key);group.style.display=shown?'':'none'});
  const section=document.getElementById('catalogo');section?.scrollIntoView({behavior:'smooth'});
  document.querySelectorAll('.gio5-cat').forEach(a=>a.classList.toggle('is-selected',a.textContent.trim().startsWith(cat==='Bodies'?'Bodys':cat)));
 }catch(err){console.warn('Filtro de categorías:',err)}
}
// Reapply selected category if the admin JSON rerenders the list.
const gio5Observer=new MutationObserver(()=>{const cat=window.gio5SelectedCategory;if(!cat)return;const cats=cat==='Accesorios'?['Juguetes','Medias','Mantas']:[cat];document.querySelectorAll('.cat-group').forEach(el=>{el.style.display=cats.some(n=>'cat-'+n.toLowerCase().normalize('NFD').replace(/[^a-z]/g,'')===el.id)?'':'none'})});
const gio5Groups=document.getElementById('grupos');if(gio5Groups)gio5Observer.observe(gio5Groups,{childList:true});
