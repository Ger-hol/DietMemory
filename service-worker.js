const CACHE_NAME = "dietmemory-v1";

const PLIKI_APLIKACJI = [
    "./",
    "./index.html",
    "./style.css",
    "./app.js",
    "./manifest.json",
    "./icon-192.png",
    "./icon-512.png"
];

self.addEventListener("install", function (event) {

    event.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            return cache.addAll(PLIKI_APLIKACJI);
        })
    );

    self.skipWaiting();

});

self.addEventListener("activate", function (event) {

    event.waitUntil(
        caches.keys().then(function (nazwyCache) {

            return Promise.all(
                nazwyCache.map(function (nazwa) {

                    if (nazwa !== CACHE_NAME) {
                        return caches.delete(nazwa);
                    }

                })
            );

        })
    );

    self.clients.claim();

});

self.addEventListener("fetch", function (event) {

    if (event.request.method !== "GET") {
        return;
    }

    event.respondWith(
        caches.match(event.request).then(function (odpowiedzCache) {

            if (odpowiedzCache) {
                return odpowiedzCache;
            }

            return fetch(event.request);

        })
    );

});