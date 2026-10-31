// Планер: офлайн-кэш и открытие приложения по нажатию на уведомление.
// Свой сайт — сначала сеть (всегда сверяется с GitHub, без 10-минутного кэша), без сети — из кэша. Запросы к GitHub API не кэшируются.
const CACHE="planer-v10";
const ASSETS=["./","./index.html","./manifest.webmanifest","./icon-192.png","./icon-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));self.skipWaiting()});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=="GET"||u.origin!==location.origin)return;
  const req=new Request(e.request.url,{cache:"no-cache",credentials:"same-origin",redirect:e.request.mode==="navigate"?"manual":"follow"});
  e.respondWith(fetch(req).then(r=>{if(r.ok&&r.type==="basic"){const cp=r.clone();caches.open(CACHE).then(c=>c.put(e.request,cp))}return r})
    .catch(()=>caches.match(e.request,{ignoreSearch:true}).then(r=>r||caches.match("./index.html"))));
});
self.addEventListener("notificationclick",e=>{
  e.notification.close();
  e.waitUntil(self.clients.matchAll({type:"window",includeUncontrolled:true}).then(cs=>{
    for(const c of cs){if("focus" in c)return c.focus()}
    return self.clients.openWindow((e.notification.data&&e.notification.data.url)||"./");
  }));
});
