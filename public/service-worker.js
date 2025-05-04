// Service Worker for Employee Management App
const CACHE_NAME = 'emp-mgmt-cache-v3';

// For Vite, the assets are different from Create React App
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/offline.html'
  // Vite generates hashed filenames, so we'll cache them dynamically
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // Caching static assets

        // First, add the offline.html page which is critical
        return cache.add('/offline.html')
          .then(() => {
            // Successfully cached offline.html

            // Then try to cache other assets, but don't fail if they're missing
            const cachePromises = STATIC_ASSETS.filter(url => url !== '/offline.html')
              .map(url => {
                return fetch(url, { cache: 'no-store' })
                  .then(response => {
                    if (response.ok) {
                      return cache.put(url, response);
                    }
                    // Failed to cache asset, but continue
                    return Promise.resolve(); // Continue even if this asset fails
                  })
                  .catch(error => {
                    // Failed to fetch asset for caching, but continue
                    return Promise.resolve(); // Continue even if this asset fails
                  });
              });

            return Promise.all(cachePromises);
          })
          .catch(error => {
            // Failed to cache offline.html, but continue installation
            // Continue installation even if offline.html caching fails
            return Promise.resolve();
          });
      })
      .then(() => {
        // Service Worker installation complete
        return self.skipWaiting();
      })
      .catch(error => {
        // Service Worker installation failed, but still skip waiting
        // Still skip waiting to activate the service worker even if caching fails
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheWhitelist.indexOf(cacheName) === -1) {
              // Delete old cache silently
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests and browser extensions
  if (event.request.method !== 'GET' ||
      !event.request.url.startsWith('http')) {
    return;
  }

  // Handle API requests differently from static assets
  if (event.request.url.includes('/api/')) {
    // Network-first strategy for API requests
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Clone the response to store in cache
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              // Only cache successful responses
              if (response.status === 200) {
                cache.put(event.request, responseToCache);
              }
            })
            .catch(error => {
              // Failed to cache API response, but continue
              // Continue even if caching fails
            });

          return response;
        })
        .catch((error) => {
          // Network request failed, trying cache

          // If network fails, try to serve from cache
          return caches.match(event.request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                // Serving API request from cache
                // Add a custom header to indicate this is from cache
                const headers = new Headers(cachedResponse.headers);
                headers.append('X-From-Cache', 'true');

                return new Response(cachedResponse.body, {
                  status: cachedResponse.status,
                  statusText: cachedResponse.statusText,
                  headers: headers
                });
              }

              // No cached response available, returning offline response
              // If not in cache, return a custom offline response for API
              return new Response(
                JSON.stringify({
                  error: 'You are offline',
                  offline: true,
                  timestamp: new Date().toISOString()
                }),
                {
                  status: 503,
                  statusText: 'Service Unavailable',
                  headers: {
                    'Content-Type': 'application/json',
                    'X-From-Cache': 'true',
                    'X-Offline': 'true'
                  }
                }
              );
            })
            .catch(cacheError => {
              // Cache match failed
              // Return a basic error response if even the cache lookup fails
              return new Response(
                JSON.stringify({
                  error: 'Service unavailable',
                  offline: true,
                  timestamp: new Date().toISOString()
                }),
                {
                  status: 503,
                  statusText: 'Service Unavailable',
                  headers: {
                    'Content-Type': 'application/json',
                    'X-Error': 'true'
                  }
                }
              );
            });
        })
    );
  } else {
    // Cache-first strategy for static assets
    event.respondWith(
      caches.match(event.request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }

          // If not in cache, fetch from network
          return fetch(event.request)
            .then((response) => {
              // Clone the response to store in cache
              const responseToCache = response.clone();

              caches.open(CACHE_NAME)
                .then((cache) => {
                  // Only cache successful responses
                  if (response.status === 200) {
                    cache.put(event.request, responseToCache);
                  }
                })
                .catch(error => {
                  // Failed to cache response, but continue
                  // Continue even if caching fails
                });

              return response;
            })
            .catch((error) => {
              // Network request failed for static asset

              // If both cache and network fail for non-HTML requests, return a fallback
              if (!event.request.url.includes('.html')) {
                return new Response(
                  'Network error occurred',
                  {
                    status: 503,
                    statusText: 'Service Unavailable',
                    headers: {
                      'Content-Type': 'text/plain',
                      'X-Offline': 'true'
                    }
                  }
                );
              }

              // Serving offline.html as fallback
              // For HTML requests, return the offline page
              return caches.match('/offline.html')
                .then(offlineResponse => {
                  if (offlineResponse) {
                    return offlineResponse;
                  }

                  // If offline.html is not in cache, return a simple message
                  return new Response(
                    '<html><body><h1>Offline</h1><p>You are offline and the offline page is not available.</p></body></html>',
                    {
                      status: 503,
                      statusText: 'Service Unavailable',
                      headers: {
                        'Content-Type': 'text/html',
                        'X-Offline': 'true'
                      }
                    }
                  );
                });
            });
        })
        .catch(error => {
          // Cache match failed, try network as a last resort
          // Try network as a last resort
          return fetch(event.request)
            .catch(() => {
              // If everything fails, return a simple offline message
              return new Response(
                'All attempts to serve this request have failed.',
                {
                  status: 503,
                  statusText: 'Service Unavailable',
                  headers: {
                    'Content-Type': 'text/plain',
                    'X-Offline': 'true'
                  }
                }
              );
            });
        })
    );
  }
});

// Handle messages from the client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
