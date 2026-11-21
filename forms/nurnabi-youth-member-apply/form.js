(function () {
G.form.init();
var logo = document.querySelector('.f-nurnabi-youth-member-apply .logo');
var img = logo ? logo.querySelector('img') : null;
if (img) {
var list = ['assets/logo.png', 'assets/logo.jpg', 'assets/logo.jpeg', 'assets/logo.webp', 'assets/logo.svg'];
var at = 0;
img.addEventListener('error', function () {
at++;
if (at < list.length) {
img.src = list[at];
} else {
logo.classList.add('empty');
}
});
img.src = list[0];
}
var one = document.querySelector('[name="address_1"]');
var two = document.querySelector('[name="address_2"]');
function over(node) {
return node.scrollWidth > node.clientWidth + 1;
}
function reflow() {
var moved = 0;
var guard = 0;
while (over(one) && one.value.length > 1 && guard < 500) {
var v = one.value.replace(/\s+$/, '');
var cut = v.lastIndexOf(' ');
if (cut <= 0) {
cut = v.length - 1;
}
var piece = v.slice(cut).replace(/^\s+/, '');
one.value = v.slice(0, cut).replace(/\s+$/, '');
var rest = two.value.replace(/^\s+/, '');
two.value = piece + (rest ? ' ' + rest : '');
moved += piece.length + (rest ? 1 : 0);
guard++;
}
guard = 0;
while (over(two) && two.value.length > 0 && guard < 500) {
two.value = two.value.slice(0, -1);
guard++;
}
return moved;
}
if (one && two) {
one.addEventListener('input', function (e) {
if (e.isComposing) {
return;
}
var moved = reflow();
if (moved > 0 && document.activeElement === one) {
two.focus();
try {
var at2 = Math.min(moved, two.value.length);
two.setSelectionRange(at2, at2);
} catch (err) {}
}
});
one.addEventListener('compositionend', reflow);
one.addEventListener('g:filled', function () {
two.value = '';
reflow();
});
one.addEventListener('blur', reflow);
two.addEventListener('input', function (e) {
if (e.isComposing) {
return;
}
var guard = 0;
while (over(two) && two.value.length > 0 && guard < 500) {
two.value = two.value.slice(0, -1);
guard++;
}
});
window.addEventListener('load', reflow);
}
})();
