(function () {
G.form.init();
var id = document.querySelector('[name="member_id"]');
id.addEventListener('input', function () {
this.value = this.value.replace(/[^A-Za-z0-9-]/g, '').toUpperCase();
});
var list = document.querySelectorAll('[data-mirror]');
Array.prototype.forEach.call(list, function (to) {
var from = document.querySelector('[name="' + to.getAttribute('data-mirror') + '"]');
function copy() {
to.value = from.value;
}
from.addEventListener('input', copy);
from.addEventListener('g:filled', copy);
copy();
});
})();
