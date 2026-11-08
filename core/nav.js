(function () {
var script = document.currentScript;
if (!script) {
var all = document.getElementsByTagName('script');
for (var i = 0; i < all.length; i++) {
if (/core\/nav\.js(\?|$)/.test(all[i].src || '')) {
script = all[i];
}
}
}
if (!script || !script.src || !window.history || !history.pushState) {
return;
}
if (location.protocol !== 'http:' && location.protocol !== 'https:') {
return;
}
var HOME = '';
var homeUrl = null;
try {
homeUrl = new URL('../', script.src);
HOME = homeUrl.href;
} catch (e) {
return;
}
if (homeUrl.origin !== location.origin) {
return;
}
var isHome = location.pathname.replace(/index\.html$/, '') === homeUrl.pathname;
var EVENTS = ['pointerup', 'touchend', 'keydown', 'click'];
var waiting = [];
var node = null;
var timer = null;
var atBottom = false;
function onAct(e) {
if (e && e.isTrusted === false) {
return;
}
for (var i = 0; i < EVENTS.length; i++) {
document.removeEventListener(EVENTS[i], onAct, true);
}
var list = waiting;
waiting = [];
for (var j = 0; j < list.length; j++) {
list[j]();
}
}
function whenActive(fn) {
var ua = navigator.userActivation;
if (ua && ua.hasBeenActive) {
fn();
return;
}
waiting.push(fn);
if (waiting.length === 1) {
for (var i = 0; i < EVENTS.length; i++) {
document.addEventListener(EVENTS[i], onAct, true);
}
}
}
function fromOutside() {
var ref = document.referrer;
if (!ref) {
return true;
}
try {
var r = new URL(ref);
if (r.origin !== location.origin || r.pathname.indexOf(homeUrl.pathname) !== 0) {
return true;
}
} catch (e) {
return true;
}
return history.length <= 1;
}
function arm() {
try {
var cur = location.href;
if (isHome) {
history.replaceState({ g: 'h0' }, '', cur);
history.pushState({ g: 'h1' }, '', cur);
} else {
history.replaceState({ g: 'h0' }, '', HOME);
history.pushState({ g: 'h1' }, '', HOME);
history.pushState({ g: 'c' }, '', cur);
}
} catch (e) {}
}
function rearm() {
if (!atBottom) {
return;
}
atBottom = false;
try {
history.pushState({ g: 'h1' }, '', location.href);
} catch (e) {}
}
function showExit() {
atBottom = true;
if (!node) {
node = document.getElementById('g-nav-toast');
}
if (!node) {
node = document.createElement('div');
node.id = 'g-nav-toast';
node.className = 'g-toast';
node.setAttribute('role', 'status');
node.setAttribute('aria-live', 'polite');
document.body.appendChild(node);
}
var en = document.documentElement.getAttribute('lang') === 'en';
node.textContent = en ? 'Press back again to exit' : 'বের হতে আবার ব্যাক চাপুন';
node.classList.add('g-toast--show');
window.clearTimeout(timer);
timer = window.setTimeout(function () {
node.classList.remove('g-toast--show');
whenActive(rearm);
}, 2500);
}
function hideExit() {
atBottom = false;
window.clearTimeout(timer);
if (node) {
node.classList.remove('g-toast--show');
}
}
window.addEventListener('popstate', function (e) {
var s = e.state;
if (!s || !s.g) {
return;
}
if (isHome) {
if (s.g === 'h0') {
showExit();
} else {
hideExit();
}
} else if (s.g === 'h0' || s.g === 'h1') {
window.location.replace(HOME);
}
});
var st = history.state;
if (st && st.g) {
if (isHome && st.g === 'h0') {
if (document.body) {
showExit();
} else {
document.addEventListener('DOMContentLoaded', showExit);
}
}
} else if (fromOutside()) {
whenActive(arm);
}
})();
