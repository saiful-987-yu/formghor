(function () {
G.form.init();
var holdBox = document.querySelector('[data-hold]');
if (holdBox) {
var holdInput = holdBox.querySelector('input[type="file"]');
var holdLayer = holdBox.querySelector('.ib-asset');
var allowing = false;
var downAt = 0;
var downX = 0;
var downY = 0;
var moved = false;
var readyTimer = 0;
var probe = new Image();
probe.onload = function () {
holdLayer.style.backgroundImage = 'url("' + probe.src + '")';
holdBox.classList.add('has-asset');
};
probe.src = 'assets/back-image.png';
function cancelHold() {
window.clearTimeout(readyTimer);
holdBox.classList.remove('hold-ready');
}
holdBox.addEventListener('click', function (e) {
if (allowing) {
return;
}
e.preventDefault();
e.stopPropagation();
}, true);
holdBox.addEventListener('contextmenu', function (e) {
e.preventDefault();
});
holdBox.addEventListener('pointerdown', function (e) {
downAt = Date.now();
downX = e.clientX;
downY = e.clientY;
moved = false;
window.clearTimeout(readyTimer);
readyTimer = window.setTimeout(function () {
holdBox.classList.add('hold-ready');
}, 600);
});
holdBox.addEventListener('pointermove', function (e) {
if (Math.abs(e.clientX - downX) > 12 || Math.abs(e.clientY - downY) > 12) {
moved = true;
cancelHold();
}
});
holdBox.addEventListener('pointerup', function () {
var long = downAt > 0 && Date.now() - downAt >= 600 && !moved;
downAt = 0;
cancelHold();
if (long && holdInput) {
allowing = true;
holdInput.click();
allowing = false;
}
});
holdBox.addEventListener('pointercancel', function () {
downAt = 0;
cancelHold();
});
holdBox.addEventListener('pointerleave', function () {
downAt = 0;
cancelHold();
});
}
var GROUPS = {};
var LIMITS = [
{ name: 'address', max: 3 }
];
var items = [];
var byGroup = {};
function resize(node) {
node.style.height = 'auto';
var h = node.scrollHeight;
node.style.height = h > 0 ? h + 'px' : '';
}
function lineCount(node) {
if (node.value === '') {
return 1;
}
var cs = window.getComputedStyle(node);
var lh = parseFloat(cs.lineHeight);
if (!(lh > 0)) {
lh = parseFloat(cs.fontSize) * 1.2;
}
var pad = (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0);
var prev = node.style.height;
node.style.height = 'auto';
var h = node.scrollHeight - pad;
node.style.height = prev;
if (!(lh > 0) || !(h > 0)) {
return 0;
}
return Math.max(1, Math.round(h / lh));
}
function allowed(item) {
var cap = item.max;
if (item.group) {
var list = byGroup[item.group];
var rest = 0;
for (var i = 0; i < list.length; i++) {
if (list[i] !== item) {
rest += Math.max(1, lineCount(list[i].node));
}
}
cap = Math.min(cap, GROUPS[item.group] - rest);
}
return Math.max(1, cap);
}
function fits(item) {
var n = lineCount(item.node);
return n === 0 || n <= allowed(item);
}
function enforce(item) {
var node = item.node;
if (fits(item)) {
item.last = node.value;
resize(node);
return;
}
var cur = node.value;
var old = item.last;
var lim = Math.min(cur.length, old.length);
var p = 0;
while (p < lim && cur.charAt(p) === old.charAt(p)) {
p++;
}
var s = 0;
while (s < lim - p && cur.charAt(cur.length - 1 - s) === old.charAt(old.length - 1 - s)) {
s++;
}
var head = cur.slice(0, p);
var mid = cur.slice(p, cur.length - s);
var tail = cur.slice(cur.length - s);
var lo = 0;
var hi = mid.length;
while (lo < hi) {
var m = Math.ceil((lo + hi) / 2);
node.value = head + mid.slice(0, m) + tail;
if (fits(item)) {
lo = m;
} else {
hi = m - 1;
}
}
node.value = head + mid.slice(0, lo) + tail;
var caret = head.length + lo;
if (!fits(item)) {
var whole = node.value;
var a = 0;
var b = whole.length;
while (a < b) {
var k = Math.ceil((a + b) / 2);
node.value = whole.slice(0, k);
if (fits(item)) {
a = k;
} else {
b = k - 1;
}
}
node.value = whole.slice(0, a);
caret = a;
}
try {
node.setSelectionRange(caret, caret);
} catch (e) {}
item.last = node.value;
resize(node);
}
function bindItem(item) {
var node = item.node;
node.addEventListener('input', function (e) {
if (e.isComposing) {
return;
}
enforce(item);
});
node.addEventListener('compositionend', function () {
enforce(item);
});
node.addEventListener('blur', function () {
enforce(item);
});
node.addEventListener('g:filled', function () {
item.last = '';
enforce(item);
});
}
for (var i = 0; i < LIMITS.length; i++) {
var node = document.querySelector('[name="' + LIMITS[i].name + '"]');
if (!node) {
continue;
}
var item = { node: node, max: LIMITS[i].max, group: LIMITS[i].group || '', last: node.value };
items.push(item);
if (item.group) {
byGroup[item.group] = byGroup[item.group] || [];
byGroup[item.group].push(item);
}
bindItem(item);
}
window.addEventListener('load', function () {
for (var j = 0; j < items.length; j++) {
items[j].last = '';
enforce(items[j]);
}
});
})();
