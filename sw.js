const CACHE="momoirobara-shell-v3";
const ASSETS=["./","./index.html","./manifest.json","./icon.svg"];

const RESPONSIVE_PATCH=`
<style id="momo-responsive-v1">
/* Momoirobara is a landscape-first app. Portrait is intentionally blocked. */
#momoPortraitBlock{position:fixed;inset:0;z-index:2147483647;display:none;place-items:center;padding:28px;text-align:center;background:var(--bg,#fff8fb);color:var(--text,#392b35);font:600 15px/1.6 system-ui,sans-serif}
#momoPortraitBlock .momo-rotate-card{width:min(360px,100%);padding:28px 24px;border:1px solid var(--border,rgba(122,78,101,.13));border-radius:24px;background:var(--surface,#fffafd);box-shadow:0 20px 60px rgba(60,35,50,.14)}
#momoPortraitBlock .momo-rotate-icon{font-size:42px;line-height:1;margin-bottom:14px;display:block;transform:rotate(90deg)}
#momoPortraitBlock strong{display:block;font-size:19px;margin-bottom:7px}
#momoPortraitBlock span{display:block;color:var(--muted,#927c89);font-weight:500}
@media (orientation:portrait){#momoPortraitBlock{display:grid!important}.app,.player,#mobile,#momoFixedMenuClose{visibility:hidden!important;pointer-events:none!important}}

/* Large landscape screens, including the unfolded Z Fold inner display:
   use the full desktop navigation. No floating X and no hamburger. */
@media (orientation:landscape) and (min-width:900px){
  #momoFixedMenuClose,#mobile{display:none!important}
  .side{position:relative!important;left:auto!important;top:auto!important;width:var(--side,250px)!important;transform:none!important;box-shadow:none!important}
  .app{display:grid!important;grid-template-columns:var(--side,250px) minmax(0,1fr)!important}
  .content{padding-top:42px!important}
}

/* Normal/smaller landscape phones:
   hamburger opens the drawer, and the X only exists while the drawer is open. */
@media (orientation:landscape) and (max-width:899px){
  :root{--side:0px;--player:82px}
  .app{display:block!important}
  .side{position:fixed!important;left:0!important;top:0!important;width:min(280px,78vw)!important;height:100%!important;z-index:200!important;transform:translateX(-105%)!important;transition:transform .3s ease!important;box-shadow:20px 0 50px rgba(50,30,45,.15)!important}
  .side.open{transform:none!important}
  #mobile{display:grid!important;place-items:center!important;position:fixed!important;left:14px!important;top:14px!important;width:40px!important;height:40px!important;z-index:300!important;border:1px solid var(--border)!important;border-radius:13px!important;background:var(--surface)!important;color:var(--text)!important}
  #momoFixedMenuClose{display:none!important;position:fixed!important;right:14px!important;top:14px!important;width:40px!important;height:40px!important;z-index:10050!important}
  body.momo-fixed-menu-open #momoFixedMenuClose{display:grid!important}
  .content{padding:70px 16px calc(var(--player) + 20px)!important}
  .player{left:0!important;height:82px!important;grid-template-columns:1fr auto!important;gap:10px!important;padding:8px 12px!important}
  .volume{display:none!important}
}
</style>`;

const RESPONSIVE_BOOT=`
<script id="momo-responsive-v1-js">(()=>{
  'use strict';
  function setup(){
    if(document.getElementById('momoPortraitBlock'))return;
    const block=document.createElement('div');
    block.id='momoPortraitBlock';
    block.innerHTML='<div class="momo-rotate-card"><span class="momo-rotate-icon">↻</span><strong>Please rotate your device</strong><span>Momoirobara is designed to run in landscape mode.</span></div>';
    document.body.appendChild(block);

    const side=document.getElementById('side');
    const menu=document.getElementById('mobile');
    let close=document.getElementById('momoFixedMenuClose');
    if(!close){
      close=document.createElement('button');
      close.id='momoFixedMenuClose';
      close.type='button';
      close.setAttribute('aria-label','Close menu');
      close.innerHTML='<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>';
      document.body.appendChild(close);
    }
    const sync=()=>{
      if(!side)return;
      const open=side.classList.contains('open');
      document.body.classList.toggle('momo-fixed-menu-open',open);
      if(menu)menu.setAttribute('aria-expanded',String(open));
    };
    if(menu&&!menu.dataset.momoResponsiveBound){
      menu.dataset.momoResponsiveBound='1';
      menu.addEventListener('click',()=>requestAnimationFrame(sync));
    }
    if(close&&!close.dataset.momoResponsiveBound){
      close.dataset.momoResponsiveBound='1';
      close.addEventListener('click',e=>{
        e.preventDefault();
        side?.classList.remove('open');
        menu?.classList.remove('menu-open');
        sync();
      });
    }
    if(side)new MutationObserver(sync).observe(side,{attributes:true,attributeFilter:['class']});
    sync();

    const orient=()=>{
      const portrait=matchMedia('(orientation: portrait)').matches;
      document.documentElement.classList.toggle('momo-portrait',portrait);
      if(!portrait){side?.classList.remove('open');menu?.classList.remove('menu-open');sync()}
    };
    addEventListener('resize',orient,{passive:true});
    addEventListener('orientationchange',()=>setTimeout(orient,80),{passive:true});
    orient();

    // A real orientation lock is only available in contexts where the browser permits it.
    // The visual portrait block remains the fallback for normal browser tabs.
    if(screen.orientation?.lock){
      const lock=()=>{try{screen.orientation.lock('landscape').catch(()=>{})}catch{}};
      document.addEventListener('fullscreenchange',lock,{passive:true});
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});else setup();
})();</script>`;

self.addEventListener("install",event=>event.waitUntil(
  caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())
));

self.addEventListener("activate",event=>event.waitUntil(
  caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())
));

async function patchDocument(response){
  if(!response || !response.ok)return response;
  const type=response.headers.get("content-type")||"";
  if(!type.includes("text/html"))return response;
  try{
    const html=await response.text();
    if(html.includes('id="momo-responsive-v1"'))return new Response(html,{status:response.status,statusText:response.statusText,headers:response.headers});
    const patched=html.replace(/<\\/body>/i,RESPONSIVE_PATCH+RESPONSIVE_BOOT+"</body>");
    const headers=new Headers(response.headers);
    headers.delete("content-length");
    return new Response(patched,{status:response.status,statusText:response.statusText,headers});
  }catch{return response}
}

self.addEventListener("fetch",event=>{
  const request=event.request;
  const url=new URL(request.url);
  if(url.origin!==location.origin || url.pathname.includes("/api/"))return;

  if(request.mode==="navigate" || request.destination==="document"){
    event.respondWith(
      fetch(request).then(async response=>{
        const patched=await patchDocument(response);
        const copy=patched.clone();
        caches.open(CACHE).then(cache=>cache.put(request,copy));
        return patched;
      }).catch(async()=>patchDocument(await caches.match(request).then(cached=>cached||caches.match("./index.html"))))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached=>cached||fetch(request).then(response=>{
      const copy=response.clone();
      caches.open(CACHE).then(cache=>cache.put(request,copy));
      return response;
    }))
  );
});