(function () {
G.form.init();
var mirrors = document.querySelectorAll('[data-mirror]');
function syncAll() {
for (var m = 0; m < mirrors.length; m++) {
var src = document.querySelector('[name="' + mirrors[m].getAttribute('data-mirror') + '"]');
var v = src ? src.value.trim() : '';
mirrors[m].textContent = v || '\u200b';
}
}
for (var i = 0; i < mirrors.length; i++) {
var source = document.querySelector('[name="' + mirrors[i].getAttribute('data-mirror') + '"]');
if (source) {
source.addEventListener('input', syncAll);
source.addEventListener('g:filled', syncAll);
}
}
syncAll();
})();
