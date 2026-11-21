(function () {
var G = window.G = window.G || {};
var GLOBAL_KEY = 9876;
function pad(n) {
return n < 10 ? '0' + n : String(n);
}
function pins(key) {
var d = new Date(Date.now() + 6 * 3600000);
var y = d.getUTCFullYear();
var mo = d.getUTCMonth() + 1;
var da = d.getUTCDate();
var h = d.getUTCHours();
var yy = y % 100;
return [
String(Number(String(y) + '00') + key),
String(Number(String(y) + pad(mo)) + key),
String(Number(String(y) + pad(mo) + pad(da)) + key),
String(Number(pad(yy) + pad(mo) + pad(da) + pad(h)) + key)
];
}
function formKey(slug) {
var list = window.G_FORMS || [];
for (var i = 0; i < list.length; i++) {
if (list[i].slug === slug) {
var n = Number(String(list[i].id || '').replace(/\D/g, ''));
return n > 0 ? n : 0;
}
}
return 0;
}
G.lock = {
verify: function (slug, code) {
var c = String(code || '').trim();
if (!c) {
return false;
}
if (pins(GLOBAL_KEY).indexOf(c) !== -1) {
return true;
}
var key = formKey(slug);
return key > 0 && pins(key).indexOf(c) !== -1;
}
};
})();
