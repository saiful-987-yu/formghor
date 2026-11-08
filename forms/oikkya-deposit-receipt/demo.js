G.demo.set('oikkya-deposit-receipt', function () {
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
return { fields: fields, photos: {} };
});
