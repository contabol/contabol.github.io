// Versión web instalable: guarda los archivos de la app para que abra sin internet.
// Siempre intenta la red primero (así cada publicación llega al instante) y usa la copia si no hay conexión.
// Solo toca archivos de la propia app: nunca las llamadas a Supabase ni a la tasa BCV.
const CACHE = 'countup-web'

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

// CountÜp 2.0.44: lo que quedó sin subir al cerrar la ventana (lib/background.js lo deja en IndexedDB). Cuando vuelve la
// conexión, Chrome y Edge despiertan este service worker aunque CountÜp esté cerrado y aquí se manda con la llave del equipo.
function bgOpen() {
  return new Promise((ok, fail) => {
    const req = indexedDB.open('countup-bg', 1)
    req.onupgradeneeded = () => req.result.createObjectStore('outbox')
    req.onsuccess = () => ok(req.result)
    req.onerror = () => fail(req.error)
  })
}
async function bgSend() {
  const db = await bgOpen()
  const item = await new Promise((ok) => { const r = db.transaction('outbox').objectStore('outbox').get('pendiente'); r.onsuccess = () => ok(r.result); r.onerror = () => ok(null) })
  if (!item) return
  const res = await fetch(item.url, { method: 'POST', headers: item.headers, body: item.body })
  // 2xx: subido. 4xx (llave borrada, permiso): no se reintenta; la app lo vuelve a subir al abrirse. 5xx o sin red: reintenta.
  if (res.status >= 500) throw new Error('Servidor ocupado')
  await new Promise((ok) => { const tx = db.transaction('outbox', 'readwrite'); tx.objectStore('outbox').delete('pendiente'); tx.oncomplete = ok; tx.onerror = ok })
}
self.addEventListener('sync', (e) => { if (e.tag === 'countup-subir') e.waitUntil(bgSend()) })
