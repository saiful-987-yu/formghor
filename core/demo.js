(function () {
var G = window.G = window.G || {};
var store = {};
var cache = {};
var base = 'assets/';
(function () {
var node = document.currentScript;
if (!node) {
var list = document.getElementsByTagName('script');
for (var i = 0; i < list.length; i++) {
if (/core\/demo\.js/.test(list[i].src)) {
node = list[i];
}
}
}
if (node && node.src) {
base = node.src.replace(/core\/demo\.js.*$/, 'assets/');
}
})();
function pad(n) {
return n < 10 ? '0' + n : String(n);
}
function warn(name) {
if (window.console && console.warn) {
console.warn('demo photo not loaded: assets/' + name);
}
}
function load(name) {
if (Object.prototype.hasOwnProperty.call(cache, name)) {
return;
}
cache[name] = '';
var img = new Image();
img.onload = function () {
try {
var ratio = Math.min(1, 600 / Math.max(img.width, img.height));
var canvas = document.createElement('canvas');
canvas.width = Math.round(img.width * ratio);
canvas.height = Math.round(img.height * ratio);
var ctx = canvas.getContext('2d');
ctx.fillStyle = '#ffffff';
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
cache[name] = canvas.toDataURL('image/jpeg', 0.88);
} catch (e) {
warn(name);
}
};
img.onerror = function () {
warn(name);
};
img.src = base + encodeURIComponent(name);
}
function eachPhoto(data, fn) {
var photos = data && data.photos && typeof data.photos === 'object' ? data.photos : null;
if (!photos) {
return;
}
Object.keys(photos).forEach(function (key) {
if (typeof photos[key] === 'string' && !/^data:/.test(photos[key])) {
fn(photos, key, photos[key]);
}
});
}
function preload(build) {
try {
eachPhoto(build(), function (photos, key, name) {
load(name);
});
} catch (e) {}
}
G.demo = {
photo: 'data:image/jpeg;base64,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',
today: function () {
var d = new Date();
return pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + d.getFullYear();
},
set: function (slug, a, b) {
var n = typeof a === 'function' ? 1 : Number(a);
var build = typeof a === 'function' ? a : b;
if (typeof build !== 'function' || !(n >= 1)) {
return;
}
store[slug] = store[slug] || {};
store[slug][n] = build;
preload(build);
},
has: function (slug, n) {
return !!(store[slug] && typeof store[slug][n || 1] === 'function');
},
get: function (slug, n) {
if (!G.demo.has(slug, n)) {
return null;
}
var data = store[slug][n || 1]();
eachPhoto(data, function (photos, key, name) {
if (cache[name]) {
photos[key] = cache[name];
} else {
delete photos[key];
}
});
return data;
}
};
})();
