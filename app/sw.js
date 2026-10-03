// El panel web se mudó a /panel/: este service worker reemplaza al viejo de /app/ y se da de baja solo.
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => e.waitUntil((async () => {
  await self.registration.unregister()
  for (const c of await self.clients.matchAll({ type: 'window' })) c.navigate(c.url.replace('/app/', '/panel/'))
})()))
