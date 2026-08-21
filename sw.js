const CACHE="momoirobara-shell-v2";
const ASSETS=["./","./index.html","./manifest.json","./icon.svg"];

self.addEventListener("install",event=>event.waitUntil(
  caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())
));

self.addEventListener("activate",event=>event.waitUntil(
  caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())
));

self.addEventListener("fetch",event=>{
  const request=event.request;
  const url=new URL(request.url);
  if(url.origin!==location.origin || url.pathname.includes("/api/")) return;

  // Always try the network first for HTML/navigation so GitHub Pages does not
  // get stuck serving an old cached app after a deployment.
  if(request.mode==="navigate" || request.destination==="document"){
    event.respondWith(
      fetch(request).then(response=>{
        const copy=response.clone();
        caches.open(CACHE).then(cache=>cache.put(request,copy));
        return response;
      }).catch(()=>caches.match(request).then(cached=>cached||caches.match("./index.html")))
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