(function () {
var G = window.G = window.G || {};
var KEY = 'g.favs';
var SYN = 'g.favs.syn';
var DEL = 'g.favs.del';
var MAX = 200;
var busy = false;
var again = 0;
function valid(slug) {
return typeof slug === 'string' && /^[a-z0-9-]{1,60}$/.test(slug);
}
function readList(key) {
try {
var raw = localStorage.getItem(key);
var arr = raw ? JSON.parse(raw) : [];
return Array.isArray(arr) ? arr.filter(valid) : [];
} catch (e) {
return [];
}
}
function writeList(key, list) {
try {
localStorage.setItem(key, JSON.stringify(list.slice(0, MAX)));
return true;
} catch (e) {
return false;
}
}
function notify() {
document.dispatchEvent(new CustomEvent('g:favschange'));
}
function without(list, item) {
return list.filter(function (x) {
return x !== item;
});
}
function has(slug) {
return readList(KEY).indexOf(slug) !== -1;
}
function run() {
if (busy || !G.sync || !G.sync.enabled() || navigator.onLine === false) {
return;
}
var session = G.sync.getSession();
if (!session) {
return;
}
var local = readList(KEY);
var syn = readList(SYN);
var del = readList(DEL);
var addList = local.filter(function (x) {
return syn.indexOf(x) === -1;
});
busy = true;
G.sync.post({ action: 'favorites', token: session.token, add: addList.slice(0, 100), remove: del.slice(0, 100) }).then(function (res) {
busy = false;
if (!res || !res.ok || !Array.isArray(res.favs)) {
return;
}
var server = res.favs.filter(valid);
var before = readList(KEY);
var goneElsewhere = syn.filter(function (x) {
return server.indexOf(x) === -1;
});
var newDel = readList(DEL).filter(function (x) {
return del.indexOf(x) === -1;
});
var next = before.filter(function (x) {
return goneElsewhere.indexOf(x) === -1;
});
server.forEach(function (x) {
if (next.indexOf(x) === -1 && newDel.indexOf(x) === -1) {
next.push(x);
}
});
writeList(KEY, next);
writeList(SYN, server);
writeList(DEL, newDel);
if (JSON.stringify(before) !== JSON.stringify(next)) {
notify();
}
var pending = newDel.length || next.some(function (x) {
return server.indexOf(x) === -1;
});
if (pending && again < 2) {
again++;
window.setTimeout(run, 300);
}
});
}
function sync() {
again = 0;
run();
}
function add(slug) {
if (!valid(slug)) {
return false;
}
var list = readList(KEY);
if (list.indexOf(slug) === -1) {
list.push(slug);
if (!writeList(KEY, list)) {
return false;
}
}
writeList(DEL, without(readList(DEL), slug));
notify();
sync();
return true;
}
function remove(slug) {
var list = readList(KEY);
if (list.indexOf(slug) === -1) {
return false;
}
writeList(KEY, without(list, slug));
if (readList(SYN).indexOf(slug) !== -1) {
var del = readList(DEL);
if (del.indexOf(slug) === -1) {
del.push(slug);
writeList(DEL, del);
}
}
notify();
sync();
return true;
}
function clearLocal() {
try {
localStorage.removeItem(KEY);
localStorage.removeItem(SYN);
localStorage.removeItem(DEL);
} catch (e) {}
notify();
}
G.favs = {
has: has,
add: add,
remove: remove,
list: function () {
return readList(KEY);
},
sync: sync,
clearLocal: clearLocal
};
document.addEventListener('DOMContentLoaded', function () {
window.setTimeout(sync, 1200);
});
window.addEventListener('online', sync);
})();
