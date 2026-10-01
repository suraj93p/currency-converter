/// <reference lib="webworker" />

const serviceWorker =
  /** @type {ServiceWorkerGlobalScope} */ (
    /** @type {unknown} */ (self)
  );
const CACHE_NAME =
  "currency-converter-v2";

const APP_FILES = [
  "./",
  "./index.html",
  "./app.js",
  "./config.js",
  "./styles.css",
  "./manifest.json",
  "./icon-180.png",
  "./icon-192.png",
  "./icon-512.png"
];


/**
 * @param {ExtendableEvent} event
 */
function handleInstall (event) {
  serviceWorker.skipWaiting();

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(
          APP_FILES
        );
      })
  );
}


serviceWorker.addEventListener(
  "install",
  handleInstall
);


/**
 * @param {ExtendableEvent} event
 */
function handleActivate (event) {
  event.waitUntil(
    caches
      .keys()
      .then(keys => {
        return Promise.all(
          keys
            .filter(
              key =>
                key !== CACHE_NAME
            )
            .map(
              key =>
                caches.delete(key)
            )
        );
      })
      .then(() => serviceWorker.clients.claim())
  );
}


serviceWorker.addEventListener(
  "activate",
  handleActivate
);


/**
 * @param {FetchEvent} event
 */
function handleFetch (event) {
  const request =
    event.request;

  /*
    Do not cache the Frankfurter API.
    API data is handled separately using
    localStorage.
  */

  if (
    request.url.includes(
      "api.frankfurter.dev"
    )
  ) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then(response => {
        const copy =
          response.clone();

        caches
          .open(CACHE_NAME)
          .then(cache => {
            cache.put(
              request,
              copy
            );
          });

        return response;
      })
      .catch(async () => {
        const cachedResponse =
          await caches.match(
            request
          );

        return (
          cachedResponse ??
          Response.error()
        );
      })
  );
}


serviceWorker.addEventListener(
  "fetch",
  handleFetch
);
