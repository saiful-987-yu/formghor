var VERSION = 'v1';
var CACHE = 'formghor-' + VERSION;
var SHELL = [
'./',
'index.html',
'offline.html',
'manifest.webmanifest',
'forms/index.html',
'forms/registry.js',
'favorites/index.html',
'saved/index.html',
'profile/index.html',
'assets/icons/logo.svg',
'assets/icons/icon-192.png',
'assets/icons/icon-512.png',
'assets/demo.photo.man.png',
'core/clock.js',
'core/config.js',
'core/demo.js',
'core/favs.js',
'core/footer.js',
'core/form.css',
'core/form.js',
'core/global.css',
'core/global.js',
'core/home.css',
'core/home.js',
'core/i18n.js',
'core/lists.css',
'core/lock.js',
'core/modal.js',
'core/nav.js',
'core/profile-page.js',
'core/profile.css',
'core/profile.js',
'core/qr.js',
'core/saved-page.js',
'core/saves.js',
'core/share.js',
'core/suggest-data.js',
'core/suggest.js',
'core/sync.js',
'core/theme-init.js'
];
var EXTRA = [
'forms/business-card/assets/logo.svg'
];
var FORM_FILES = ['index.html', 'form.css', 'form.js', 'demo.js'];
self.window = self;
try {
importScripts('forms/registry.js');
} catch (e) {}
function precacheList() {
var urls = SHELL.concat(EXTRA);
var forms = self.G_FORMS || [];
for (var i = 0; i < forms.length; i++) {
var slug = forms[i] && forms[i].slug;
if (!/^[a-z0-9-]+$/.test(slug || '')) {
continue;
}
var base = 'forms/' + slug + '/';
urls.push(base);
for (var k = 0; k < FORM_FILES.length; k++) {
urls.push(base + FORM_FILES[k]);
}
urls.push('assets/previews/' + slug + '.webp');
}
return urls;
}
function precache() {
return caches.open(CACHE).then(function (cache) {
return Promise.all(precacheList().map(function (u) {
return fetch(new Request(u, { cache: 'reload' })).then(function (res) {
if (res && res.ok) {
return cache.put(u, res);
}
}).catch(function () {});
}));
});
}
function clean(res) {
if (!res.redirected) {
return Promise.resolve(res);
}
return res.blob().then(function (b) {
return new Response(b, { status: res.status, statusText: res.statusText, headers: res.headers });
});
}
function store(req, res) {
if (res && (res.ok || res.type === 'opaque')) {
var copy = res.clone();
caches.open(CACHE).then(function (c) {
c.put(req, copy);
});
}
return res;
}
function fromCache(req) {
return caches.match(req, { ignoreSearch: true });
}
function networkFirst(req) {
var net = fetch(req.url, { cache: 'no-cache', credentials: 'same-origin' }).then(function (res) {
return clean(store(req, res));
});
var wait = new Promise(function (resolve) {
setTimeout(resolve, 4000);
}).then(function () {
return fromCache(req).then(function (hit) {
return hit || net;
});
});
return Promise.race([net, wait]).catch(function () {
return fromCache(req).then(function (hit) {
if (hit) {
return hit;
}
return req.mode === 'navigate' ? caches.match('offline.html') : Response.error();
});
});
}
function staleWhileRevalidate(req) {
return caches.match(req).then(function (hit) {
var net = fetch(req).then(function (res) {
return store(req, res);
}).catch(function () {
return hit || Response.error();
});
return hit || net;
});
}
self.addEventListener('install', function (e) {
e.waitUntil(precache().then(function () {
return self.skipWaiting();
}));
});
self.addEventListener('activate', function (e) {
e.waitUntil(caches.keys().then(function (keys) {
return Promise.all(keys.filter(function (k) {
return k.indexOf('formghor-') === 0 && k !== CACHE;
}).map(function (k) {
return caches.delete(k);
}));
}).then(function () {
return self.clients.claim();
}));
});
self.addEventListener('fetch', function (e) {
var req = e.request;
if (req.method !== 'GET') {
return;
}
var url = new URL(req.url);
if (url.origin !== self.location.origin) {
if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
e.respondWith(staleWhileRevalidate(req));
}
return;
}
if (req.mode === 'navigate' || /\.(?:html|js|css|json|webmanifest)$/.test(url.pathname) || /\/$/.test(url.pathname)) {
e.respondWith(networkFirst(req));
return;
}
e.respondWith(staleWhileRevalidate(req));
});
