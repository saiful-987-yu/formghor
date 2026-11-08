(function () {
G.form.init();
var date = document.getElementById('school-apply-date');
if (date && !date.value) {
var now = new Date();
var d = ('0' + now.getDate()).slice(-2);
var m = ('0' + (now.getMonth() + 1)).slice(-2);
date.value = d + '/' + m + '/' + now.getFullYear();
}
})();
