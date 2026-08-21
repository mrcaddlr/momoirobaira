const CACHE="momoirobara-shell-v6";
const ASSETS=["./","./index.html","./manifest.json","./icon.svg"];

// The old responsive patches kept recreating a floating close button.
// This service worker strips that UI from every HTML response before the
// browser sees it, so it cannot come back from stale cached HTML.
const CLEAN=`<style id="momo-hard-no-x">
#mobileMenuClose,#momoFixedMenuClose,#momoResponsiveMenuClose,#momoResponsiveMenuBtn,[aria-label="Close menu"],[title="Close menu"]{display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important}
</style><script id="momo-hard-no-x-js">(()=>{const kill=()=>{document.querySelectorAll('#mobileMenuClose,#momoFixedMenuClose,#momoResponsiveMenuClose,#momoResponsiveMenuBtn,[aria-label="Close menu"],[title="Close menu"]').forEach(e=>e.remove());document.body?.classList.remove('momo-menu-open','momo-fixed-menu-open','momo-responsive-menu')};kill();new MutationObserver(kill).observe(document.documentElement,{childList:true,subtree:true})})();</script>`;

async function clean(response){
  if(!response||!response.ok)return response;
  const type=response.headers.get("content-type")||"";
  if(!type.includes("text/html"))return response;
  try{
    const html=await response.text();
    const marker='id="momo-hard-no-x"';
    if(html.includes(marker)) return new Response(html,{status:response.status,statusText:response.statusText,headers:response.headers});
    const patched=html.replace(/<\/body\s*>/i,CLEAN+"</body>");
    const headers=new Headers(response.headers);
    headers.delete("content-length");
    return new Response(patched,{status:response.status,statusText:response.statusText,headers});
  }catch(e){return response}
}

self.addEventListener("install",event=>event.waitUntil(
  caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())
));

self.addEventListener("activate",event=>event.waitUntil(
  caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())
));

self.addEventListener("fetch",event=>{
  const request=event.request,url=new URL(request.url);
  if(url.origin!==location.origin||url.pathname.includes("/api/"))return;

  if(request.mode==="navigate"||request.destination==="document"){
    event.respondWith(
      fetch(request,{cache:"no-store"})
        .then(clean)
        .then(response=>{const copy=response.clone();caches.open(CACHE).then(c=>c.put(request,copy));return response})
        .catch(()=>caches.match(request).then(clean))
    );
    return;
  }

  event.respondWith(caches.match(request).then(cached=>cached||fetch(request).then(response=>{
    const copy=response.clone();caches.open(CACHE).then(c=>c.put(request,copy));return response;
  })));
});
