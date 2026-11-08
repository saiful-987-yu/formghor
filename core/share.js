(function () {
var G = window.G = window.G || {};
var timer = null;
function toast(message) {
var node = document.getElementById('g-toast');
if (!node) {
node = document.createElement('div');
node.id = 'g-toast';
node.className = 'g-toast';
node.setAttribute('role', 'status');
node.setAttribute('aria-live', 'polite');
document.body.appendChild(node);
}
node.textContent = message;
node.classList.add('g-toast--show');
window.clearTimeout(timer);
timer = window.setTimeout(function () {
node.classList.remove('g-toast--show');
}, 2800);
}
function legacyCopy(text) {
try {
var area = document.createElement('textarea');
area.value = text;
area.setAttribute('readonly', '');
area.style.position = 'fixed';
area.style.top = '0';
area.style.opacity = '0';
document.body.appendChild(area);
area.select();
area.setSelectionRange(0, text.length);
var ok = document.execCommand('copy');
document.body.removeChild(area);
return ok;
} catch (e) {
return false;
}
}
function copyText(text) {
if (navigator.clipboard && navigator.clipboard.writeText && window.isSecureContext) {
return navigator.clipboard.writeText(text).then(function () {
return true;
}, function () {
return legacyCopy(text);
});
}
return Promise.resolve(legacyCopy(text));
}
function firstLine(btn) {
var key = btn.getAttribute('data-share');
if (key) {
return G.t(key);
}
if (typeof G.shareTitle === 'function') {
return G.shareTitle();
}
return document.title;
}
function copyFallback(text, url) {
copyText(text + '\n' + url).then(function (ok) {
toast(G.t(ok ? 'share.copied' : 'share.failed'));
});
}
function share(btn) {
var first = firstLine(btn);
var text = first + '\n' + G.t('site.name');
var url = window.location.href.split('#')[0];
if (navigator.share) {
navigator.share({ title: first, text: text, url: url }).catch(function (err) {
if (err && err.name === 'AbortError') {
return;
}
copyFallback(text, url);
});
return;
}
copyFallback(text, url);
}
document.addEventListener('click', function (e) {
var btn = e.target && e.target.closest ? e.target.closest('.g-share') : null;
if (!btn) {
return;
}
e.preventDefault();
share(btn);
});
G.share = { open: share };
})();
