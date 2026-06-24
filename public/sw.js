const CACHE_NAME = 'watchknot-media-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // We only want to intercept if we are looking for downloaded media.
  // The offline manager will fetch the media and store it in cache.
  // When the video player requests the media URL, we intercept it here.
  
  // Skip cross-origin non-GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Handle Range requests for video playback
        const rangeHeader = event.request.headers.get('range');
        if (rangeHeader) {
          return cachedResponse.blob().then((blob) => {
            const parts = rangeHeader.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : blob.size - 1;
            const chunksize = (end - start) + 1;
            const slicedBlob = blob.slice(start, end + 1, blob.type);
            
            return new Response(slicedBlob, {
              status: 206,
              statusText: 'Partial Content',
              headers: {
                'Content-Range': `bytes ${start}-${end}/${blob.size}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize.toString(),
                'Content-Type': blob.type || 'video/mp4',
              }
            });
          });
        }
        return cachedResponse;
      }
      return fetch(event.request);
    })
  );
});
