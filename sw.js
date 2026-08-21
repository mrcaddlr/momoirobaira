const CACHE="momoirobara-shell-v5";
const ASSETS=["./","./index.html","./manifest.json","./icon.svg","./responsive.js"];

const CLEAN_UI=`<style id="momo-no-floating-close">
#mobileMenuClose,#momoFixedMenuClose,#momoResponsiveMenuClose,#momoResponsiveMenuBtn{display:none!important;visibility:hidden!important;pointer-events:none!important}
</style><script id="momo-no-floating-close-js">(()=>{const kill=()=>{for(const id of ['mobileMenuClose','momoFixedMenuClose','momoResponsiveMenuClose','momoResponsiveMenuBtn'])document.getElementById(id)?.remove();document.querySelectorAll('[aria-label="Close menu"],[title="Close menu"]').forEach(e=>e.remove())};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',kill,{once:true});else kill();new MutationObserver(kill).observe(document.documentElement,{childList:true,subtree:true})})();</script>`;

async function clean(response){
  if(!response||!response.ok)return response;
  const type=response.headers.get('content-type')||'';
  if(!type.includes('text/html'))return response;
  try{
    const html=await response.text();
    if(html.includes('id="momo-no-floating-close"'))return new Response(html,{status:response.status,statusText:response.statusText,headers:response.headers});
    const patched=html.replace(/<\\/body>/i,CLEAN_UI+'</body>');
    const headers=new Headers(response.headers);headers.delete('content-length');
    return new Response(patched,{status:response.status,statusText:response.statusText,headers});
  }catch{return response}
}

self.addEventListener("install",event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener("activate",event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",event=>{
  const request=event.request,url=new URL(request.url);
  if(url.origin!==location.origin||url.pathname.includes('/api/'))return;
  if(request.mode==='navigate'||request.destination==='document'){
    event.respondWith(fetch(request,{cache:'no-store'}).then(clean).then(response=>{const copy=response.clone();caches.open(CACHE).then(c=>c.put(request,copy));return response}).catch(()=>caches.match(request).then(clean));return;
  }
  event.respondWith(caches.match(request).then(cached=>cached||fetch(request).then(response=>{const copy=response.clone();caches.open(CACHE).then(c=>c.put(request,copy));return response})));
});
