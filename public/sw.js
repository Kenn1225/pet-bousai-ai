const CACHE_NAME = 'pet-bousai-v1'
const urlsToCache = [
  '/',
  '/manifest.json',
  '/offline.html',
]

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache).catch(() => {})
    })
  )
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') {
    return
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) return response
        return fetch(event.request).then(response => {
          if (!response || response.status !== 200 || response.type === 'error') {
            return response
          }
          const responseToCache = response.clone()
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache)
          })
          return response
        })
      })
      .catch(() => {
        return caches.match('/offline.html').catch(() => {
          return new Response('オフラインです。インターネット接続をご確認ください。')
        })
      })
  )
})
