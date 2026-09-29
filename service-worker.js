const CACHE_NAME =
  "currency-converter-v1";

const APP_FILES = [
  "./",
  "./index.html",
  "./styles.css",
  "./config.js",
  "./manifest.json",
  "./icon-180.png",
  "./icon-192.png",
  "./icon-512.png"
];


self.addEventListener(
  "install",
  event => {
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
);


self.addEventListener(
  "activate",
  event => {
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
    );
  }
);


self.addEventListener(
  "fetch",
  event => {
    const request =
      event.request;

    /*
      Do not cache the exchange-rate API.
      The application handles that using
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
        .catch(() => {
          return caches.match(
            request
          );
        })
    );
  }
);
