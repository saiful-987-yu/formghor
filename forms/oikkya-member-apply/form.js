(function () {
G.form.init();
var id = document.querySelector('[name="membership_id"]');
id.addEventListener('input', function () {
this.value = this.value.replace(/[^A-Za-z0-9-]/g, '').toUpperCase();
});
})();
