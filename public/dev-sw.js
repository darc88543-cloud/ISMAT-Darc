// Fallback self-unregistering script for stale dev-sw.js registrations
self.addEventListener('install', function() {
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    self.registration.unregister().then(function() {
      return self.clients.claim();
    })
  );
});
