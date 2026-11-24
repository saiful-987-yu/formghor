(function () {
var G = window.G = window.G || {};
var OUT_KEY = 'g.outbox';
var SES_KEY = 'g.session';
var MAX_ITEMS = 20;
var flushing = false;
function api() {
return (G.config && G.config.api) || '';
}
function readJson(key, fallback) {
try {
var raw = localStorage.getItem(key);
return raw ? JSON.parse(raw) : fallback;
} catch (e) {
return fallback;
}
}
function writeJson(key, value) {
try {
localStorage.setItem(key, JSON.stringify(value));
return true;
} catch (e) {
return false;
}
}
function deviceInfo(done) {
var nav = window.navigator || {};
var scr = window.screen || {};
var size = (scr.width || 0) + 'x' + (scr.height || 0);
var ua = String(nav.userAgent || '').slice(0, 110);
var finished = false;
function finish(model, os) {
if (finished) {
return;
}
finished = true;
done([model, os, size, ua].filter(Boolean).join(' | '));
}
var hints = nav.userAgentData;
if (hints && hints.getHighEntropyValues) {
window.setTimeout(function () {
finish('', '');
}, 800);
hints.getHighEntropyValues(['model', 'platformVersion']).then(function (v) {
finish(v.model || '', ((hints.platform || '') + ' ' + (v.platformVersion || '')).trim());
}, function () {
finish('', '');
});
} else {
finish('', '');
}
}
function uid() {
return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}
function getSession() {
var s = readJson(SES_KEY, null);
return s && typeof s.token === 'string' && typeof s.phone === 'string' ? s : null;
}
function setSession(s) {
writeJson(SES_KEY, s);
}
function clearSession() {
try {
localStorage.removeItem(SES_KEY);
} catch (e) {}
}
function post(payload) {
return new Promise(function (resolve) {
var ctrl = typeof AbortController === 'function' ? new AbortController() : null;
var timer = window.setTimeout(function () {
if (ctrl) {
ctrl.abort();
}
}, 25000);
fetch(api(), {
method: 'POST',
headers: { 'Content-Type': 'text/plain;charset=utf-8' },
body: JSON.stringify(payload),
signal: ctrl ? ctrl.signal : undefined
}).then(function (r) {
return r.json();
}).then(function (json) {
window.clearTimeout(timer);
var out = json && typeof json === 'object' ? json : { ok: false, error: 'network' };
if (out.error === 'unauthorized') {
clearSession();
}
resolve(out);
}).catch(function () {
window.clearTimeout(timer);
resolve({ ok: false, error: 'network' });
});
});
}
function removeItem(id) {
var list = readJson(OUT_KEY, []).filter(function (item) {
return item.id !== id;
});
writeJson(OUT_KEY, list);
}
function flush() {
if (flushing || !api() || navigator.onLine === false) {
return;
}
var list = readJson(OUT_KEY, []);
if (!list.length) {
return;
}
flushing = true;
var item = list[0];
post(item.payload).then(function (res) {
flushing = false;
var retry = !res.ok && (res.error === 'network' || res.error === 'server');
if (retry) {
return;
}
if (res.error === 'unauthorized') {
clearSession();
}
removeItem(item.id);
flush();
});
}
function shrinkPhoto(url, done) {
var img = new Image();
img.onerror = function () {
done(url);
};
img.onload = function () {
var ratio = Math.min(1, 400 / Math.max(img.width, img.height));
var canvas = document.createElement('canvas');
canvas.width = Math.max(1, Math.round(img.width * ratio));
canvas.height = Math.max(1, Math.round(img.height * ratio));
var ctx = canvas.getContext('2d');
ctx.fillStyle = '#ffffff';
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
done(canvas.toDataURL('image/jpeg', 0.7));
};
img.src = url;
}
function stripPhotos(payload) {
var copy = JSON.parse(JSON.stringify(payload));
delete copy.photos;
if (copy.profile) {
delete copy.profile.photo;
}
return copy;
}
function enqueue(kind, payload) {
if (!api()) {
return false;
}
var list = readJson(OUT_KEY, []);
if (kind === 'profile') {
list = list.filter(function (item) {
return item.kind !== 'profile';
});
}
list.push({ id: uid(), kind: kind, payload: payload });
while (list.length > MAX_ITEMS) {
list.shift();
}
if (!writeJson(OUT_KEY, list)) {
list[list.length - 1].payload = stripPhotos(payload);
while (list.length > 1 && !writeJson(OUT_KEY, list)) {
list.shift();
}
}
window.setTimeout(flush, 50);
return true;
}
G.sync = {
post: post,
enabled: function () {
return !!api();
},
getSession: getSession,
register: function (phone, password, profile) {
return post({ action: 'register', phone: phone, password: password, profile: profile }).then(function (res) {
if (res.ok) {
setSession({ phone: res.phone, token: res.token });
if (G.favs) {
G.favs.sync();
}
}
return res;
});
},
login: function (phone, password) {
return post({ action: 'login', phone: phone, password: password }).then(function (res) {
if (res.ok) {
setSession({ phone: res.profile.phone, token: res.token });
if (G.favs) {
G.favs.sync();
}
}
return res;
});
},
logout: function () {
var s = getSession();
if (s) {
enqueue('logout', { action: 'logout', token: s.token });
}
clearSession();
if (G.favs) {
G.favs.clearLocal();
}
},
phones: function () {
return post({ action: 'phones' });
},
changePassword: function (oldPassword, newPassword) {
var s = getSession();
if (!s) {
return Promise.resolve({ ok: false, error: 'unauthorized' });
}
return post({ action: 'changePassword', token: s.token, oldPassword: oldPassword, newPassword: newPassword });
},
pushProfile: function (profile) {
var s = getSession();
if (s) {
enqueue('profile', { action: 'saveProfile', token: s.token, profile: profile });
}
},
pushDelete: function (slug, id) {
var s = getSession();
if (s) {
enqueue('delete', { action: 'deleteSave', token: s.token, slug: slug, id: id });
}
},
queueHistory: function (data) {
var s = getSession();
var payload = {
action: 'history',
ref: uid(),
slug: data.slug,
fields: data.fields,
photos: {},
token: s ? s.token : '',
clientTime: new Date().toISOString()
};
var go = function () {
var names = Object.keys(data.photos || {});
var left = names.length;
if (!left) {
enqueue('history', payload);
return;
}
names.forEach(function (name) {
shrinkPhoto(data.photos[name], function (small) {
payload.photos[name] = small;
left--;
if (left === 0) {
enqueue('history', payload);
}
});
});
};
deviceInfo(function (text) {
payload.device = text;
go();
});
return true;
},
flush: flush
};
document.addEventListener('DOMContentLoaded', function () {
window.setTimeout(flush, 1500);
window.setInterval(flush, 60000);
});
window.addEventListener('online', flush);
})();
