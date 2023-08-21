const cacheName = "note24-cache-3";
const staticAssets = [
    "./",
    "./index.html",
    "./logo256x256.png",
    "./manifest.json",
    "./views/defaultStyle.css",
    "./views/fa-regular-400.ttf",
    "./views/fa-solid-900.ttf",
    "./views/notePage.html",
    "./views/notePageStyle.css",
    "./views/OpenSans-Light.ttf",
    "./views/OpenSans-Regular.ttf",
    "./models/generalDataModel.js",
    "./controllers/notePageController.js"
];

const ignoreQueriesForThesePages = [
    "notePage.html"
];

self.addEventListener("install", async e => {
    const cache = await caches.open(cacheName);
    await cache.addAll(staticAssets);
    return self.skipWaiting();
});
self.addEventListener("activate", e => {
    self.clients.claim();
});

self.addEventListener("fetch", async e => {
    //console.log("Fetch Request:" + e.request.url);
    //Get the requested URL
    let urlString = e.request.url;

    //Check if the query string should be ignored for this page
    for (i = 0; i < ignoreQueriesForThesePages.length; i++) {
        if ( urlString.indexOf(ignoreQueriesForThesePages[i]) > -1) {
            urlString = urlString.split(ignoreQueriesForThesePages[i])[0] + ignoreQueriesForThesePages[i];
            break;
        }
    }

    //Create a new request based on the original request
    var requestToFetch = new Request(urlString, {
        body: e.request.body,
        method: e.request.method,
        headers: e.request.headers,
        mode: "same-origin",
        credentials: e.request.credentials,
        redirect: e.request.redirect
    });
    
    //console.log("Fetch After:" + requestToFetch.url);
    const url = new URL(urlString);

    //Serve a response from cache or network
    if (url.origin == location.origin) {
        e.respondWith(cacheFirst(requestToFetch));
    } else {
        e.respondWith(networkAndCache(requestToFetch));
    }
});

async function cacheFirst(req) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(req);
    return cached || fetch(req);
}

async function networkAndCache(req) {
    const cache = await caches.open(cacheName);
    try {
        const fresh = await fetch(req);
        await cache.put(req, fresh.clone());
        return fresh;
    } catch (e) {
        const cached = await cache.match(req);
        return cached;
    }
}
