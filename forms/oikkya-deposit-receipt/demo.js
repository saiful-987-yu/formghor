G.demo.set('oikkya-deposit-receipt', 1, function () {
var d = {
receipt_no: '০০১',
receipt_date: '০৮/১১/২০২৬',
member_name: 'সাইফুল ইসলাম',
member_id: 'OBG-001',
installment_no: '০২',
amount: '১০,০০০/-',
medium: 'বিকাশ'
};
var fields = {};
Object.keys(d).forEach(function (k) {
fields[k] = d[k];
fields['o_' + k] = d[k];
});
fields.amount_words = 'দশ হাজার টাকা মাত্র।';
return { fields: fields, photos: {} };
});

G.demo.set('oikkya-deposit-receipt', 2, function () {
var d = {
receipt_no: '০০২',
receipt_date: '০৯/১১/২০২৬',
member_name: 'নুসরাত জাহান',
member_id: 'OBG-002',
installment_no: '০১',
amount: '৫,০০০/-',
medium: 'নগদ'
};
var fields = {};
Object.keys(d).forEach(function (k) {
fields[k] = d[k];
fields['o_' + k] = d[k];
});
fields.amount_words = 'পাঁচ হাজার টাকা মাত্র।';
return { fields: fields, photos: {} };
});

G.demo.set('oikkya-deposit-receipt', 3, function () {
var d = {
receipt_no: '০০৩',
receipt_date: '১০/১১/২০২৬',
member_name: 'তানভীর হাসান',
member_id: 'OBG-003',
installment_no: '০৩',
amount: '১৫,০০০/-',
medium: 'ব্যাংক'
};
var fields = {};
Object.keys(d).forEach(function (k) {
fields[k] = d[k];
fields['o_' + k] = d[k];
});
fields.amount_words = 'পনেরো হাজার টাকা মাত্র।';
return { fields: fields, photos: {} };
});
