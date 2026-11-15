(function () {
var G = window.G = window.G || {};
var KEY = 4827;
function pad(n) {
return n < 10 ? '0' + n : String(n);
}
function pins() {
var d = new Date(Date.now() + 6 * 3600000);
var y = d.getUTCFullYear();
var mo = d.getUTCMonth() + 1;
var da = d.getUTCDate();
var h = d.getUTCHours();
var yy = y % 100;
return [
String(Number(String(y) + '00') + KEY),
String(Number(String(y) + pad(mo)) + KEY),
String(Number(String(y) + pad(mo) + pad(da)) + KEY),
String(Number(pad(yy) + pad(mo) + pad(da) + pad(h)) + KEY)
];
}
G.lock = {
verify: function (slug, code) {
var c = String(code || '').trim();
return !!c && pins().indexOf(c) !== -1;
}
};
})();
