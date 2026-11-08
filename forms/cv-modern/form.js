(function () {
G.form.init();
var boxes = document.querySelectorAll('.f-cv-modern .autow');
function sync(box) {
var input = box.querySelector('input');
box.setAttribute('data-v', input.value || input.placeholder);
}
for (var i = 0; i < boxes.length; i++) {
(function (box) {
var input = box.querySelector('input');
input.addEventListener('input', function () {
sync(box);
});
input.addEventListener('g:filled', function () {
sync(box);
});
sync(box);
})(boxes[i]);
}
var date = document.querySelector('[name="sign_date"]');
if (date && !date.value) {
var now = new Date();
var d = ('0' + now.getDate()).slice(-2);
var m = ('0' + (now.getMonth() + 1)).slice(-2);
date.value = d + '/' + m + '/' + now.getFullYear();
}
})();
