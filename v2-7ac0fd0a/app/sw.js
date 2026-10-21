// Versión web instalable: guarda los archivos de la app para que abra sin internet.
// Siempre intenta la red primero (así cada publicación llega al instante) y usa la copia si no hay conexión.
// Solo toca archivos de la propia app: nunca las llamadas a Supabase ni a la tasa BCV.
const CACHE = 'contabol-web'

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()))

self.addEventListener('fetch', (e) => {
  const req = e.request
  const url = new URL(req.url)
  if (req.method !== 'GET' || url.origin !== self.location.origin) return
  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)) }
        return res
      })
      .catch(() => caches.match(req).then((hit) => hit || (req.mode === 'navigate' ? caches.match('./') : Response.error()))),
  )
})
