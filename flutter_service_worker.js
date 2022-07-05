'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "assets/FontManifest.json": "dc3d03800ccca4601324923c0b1d6d57",
"assets/assets/3.jpg": "467f0965695e32d8e10ab5269b6e34bc",
"assets/assets/scalebgg.png": "3a9ace171b7d79c4becc4d061649e1fe",
"assets/assets/footsteps.png": "5eaa2f69957bda1db65ee110a46d9d0f",
"assets/assets/contactus.png": "a9128c51af80d2636c1dd9a867984c36",
"assets/assets/osborne_large.png": "9914093e6e66fdf5bda8b455c498bbb3",
"assets/assets/scalebg.png": "cca2ca9c6d6ba53b72308f23fd44338e",
"assets/assets/legalor.png": "e4efd5f84adf643380d0b3ee0b485f62",
"assets/assets/4.jpg": "cba1d29c2dad2bf0034b2bfeb169fa43",
"assets/assets/11.jpeg": "246ca6dbed943730201779185c6c80df",
"assets/assets/laww.gif": "6cb5cc3c36e6c0a443ce432e0aa00016",
"assets/assets/legalpruclarge.png": "c0fe2086d0ccf9cc94f6570c16bd5f96",
"assets/assets/5.jpg": "10c1297a0f91acf47985f34f9930f381",
"assets/assets/mail-206-512.png": "462755b1d81a2bb236d235d670aa9024",
"assets/assets/vision.png": "8351bae0a994c9692278869386923e03",
"assets/assets/books.png": "6b4d6b29ce531bf42a58dd614de95b59",
"assets/assets/phone-106-512.png": "104e4dcd1f41c8528abe0a06563cefc1",
"assets/assets/facebook.png": "97f5b0a2f8d0333744f41a4f38f498a0",
"assets/assets/scaleofjustice.png": "58fff4a962a59bb96451efc761e6a5f3",
"assets/assets/12.jpeg": "a6124bcb65b9354098facc35efe1d5a3",
"assets/assets/9.jpeg": "1061c9a6ade329a445795b36189f40ea",
"assets/assets/titleline.png": "1f967c128fd320e9504bed5b29303ea5",
"assets/assets/8.jpeg": "9c61356313875cb1f46184fe2d97c5c7",
"assets/assets/maps.jpg": "29dede6be2fd2be11b2fa976801e2374",
"assets/assets/1.jpg": "16e5f207585aef6c20ecc6500d748326",
"assets/assets/twitter.png": "5c8962d313784c0252e2256be896883d",
"assets/assets/2.jpg": "b93cf7e74121818bafae16c6135ef8a6",
"assets/assets/insta.png": "b60114488a0eb3bea81fbd3831ed8249",
"assets/assets/logo1.png": "6a34ae08e93b21c345769a099dd32892",
"assets/fonts/MaterialIcons-Regular.otf": "95db9098c58fd6db106f1116bae85a0b",
"assets/NOTICES": "89fbff9a2d656f2861a72231ffcf4b2a",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"assets/AssetManifest.json": "8affad4aba8c73841d751a36c8b98eda",
"main.dart.js": "51cfe2c864e26bf8504001e36a77d4f2",
"version.json": "4e30e135e65c32f6926780247e31127d",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"manifest.json": "aefc77addeb77a7b0533536000bac97e",
"index.html": "87eb94f19551c074dbf7cd63da1fbc37",
"/": "87eb94f19551c074dbf7cd63da1fbc37",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"icons/Icon-maskable-192.png": "c457ef57daa1d16f64b27b786ec2ea3c",
"icons/Icon-maskable-512.png": "301a7604d45b3e739efc881eb04896ea"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
