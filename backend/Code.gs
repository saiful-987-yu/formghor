var TZ = 'Asia/Dhaka';
var PROPS = PropertiesService.getScriptProperties();
var PROFILE_KEYS = ['father', 'mother', 'birth', 'gender', 'blood', 'religion', 'nationality', 'marital', 'occupation', 'nid', 'birthreg', 'passport', 'address_perm'];
var USERS_HEAD = ['phone', 'name', 'email', 'address', 'photo_file_id', 'salt', 'pass_hash', 'created', 'updated'].concat(PROFILE_KEYS);
var SESSIONS_HEAD = ['token_hash', 'phone', 'created'];
var HISTORY_HEAD = ['time', 'ref', 'form', 'phone', 'data', 'photo_ids'];
var SAVES_HEAD = ['time', 'save_id', 'form', 'phone', 'name', 'data', 'photo_ids', 'client_ms'];
var FAVS_HEAD = ['phone', 'form', 'time'];

function setup() {
spreadsheet_();
photosFolder_();
sheet_('Users', USERS_HEAD);
sheet_('Sessions', SESSIONS_HEAD);
sheet_('History', HISTORY_HEAD);
sheet_('Saves', SAVES_HEAD);
sheet_('Favorites', FAVS_HEAD);
return 'ok';
}

function doGet() {
return json_({ ok: true, service: 'formghor' });
}

function doPost(e) {
var req;
try {
req = JSON.parse(e.postData.contents);
} catch (err) {
return json_({ ok: false, error: 'bad_request' });
}
if (!req || typeof req !== 'object') {
return json_({ ok: false, error: 'bad_request' });
}
var lock = LockService.getScriptLock();
try {
lock.waitLock(20000);
} catch (err) {
return json_({ ok: false, error: 'server' });
}
try {
return json_(route_(req));
} catch (err) {
console.error(err);
return json_({ ok: false, error: 'server' });
} finally {
lock.releaseLock();
}
}

function route_(req) {
switch (req.action) {
case 'ping':
return { ok: true };
case 'register':
return register_(req);
case 'login':
return login_(req);
case 'saveProfile':
return saveProfile_(req);
case 'history':
return history_(req);
case 'saveForm':
return saveForm_(req);
case 'listSaves':
return listSaves_(req);
case 'listAllSaves':
return listAllSaves_(req);
case 'deleteSave':
return deleteSave_(req);
case 'favorites':
return favorites_(req);
default:
return { ok: false, error: 'bad_request' };
}
}

function register_(req) {
var phone = normPhone_(req.phone);
var pass = typeof req.password === 'string' ? req.password : '';
if (!validPhone_(phone) || pass.length < 6 || pass.length > 64) {
return { ok: false, error: 'bad_request' };
}
var users = sheet_('Users', USERS_HEAD);
if (findRow_(users, 1, phone)) {
return { ok: false, error: 'phone_exists' };
}
var p = req.profile && typeof req.profile === 'object' ? req.profile : {};
var salt = Utilities.getUuid();
var fileId = typeof p.photo === 'string' && p.photo ? saveImage_(p.photo, 'profile_' + phone + '.jpg') : '';
var now = now_();
appendRow_(users, [phone, str_(p.name, 100), str_(p.email, 100), str_(p.address, 300), fileId, salt, hashPass_(salt, pass), now, now].concat(profileExtra_(p)));
return { ok: true, phone: phone, token: newSession_(phone) };
}

function login_(req) {
var phone = normPhone_(req.phone);
var pass = typeof req.password === 'string' ? req.password : '';
if (!validPhone_(phone) || !pass) {
return { ok: false, error: 'bad_credentials' };
}
var cache = CacheService.getScriptCache();
var failKey = 'fail_' + phone;
var fails = Number(cache.get(failKey) || 0);
if (fails >= 5) {
return { ok: false, error: 'too_many' };
}
var users = sheet_('Users', USERS_HEAD);
var row = findRow_(users, 1, phone);
var rec = row ? users.getRange(row, 1, 1, USERS_HEAD.length).getValues()[0] : null;
if (!rec || hashPass_(String(rec[5]), pass) !== String(rec[6])) {
cache.put(failKey, String(fails + 1), 900);
return { ok: false, error: 'bad_credentials' };
}
cache.remove(failKey);
var profile = {
phone: phone,
name: String(rec[1]),
email: String(rec[2]),
address: String(rec[3]),
photo: rec[4] ? imageData_(String(rec[4])) : ''
};
for (var i = 0; i < PROFILE_KEYS.length; i++) {
profile[PROFILE_KEYS[i]] = String(rec[9 + i] || '');
}
return { ok: true, token: newSession_(phone), profile: profile };
}

function saveProfile_(req) {
var phone = phoneFromToken_(req.token);
if (!phone) {
return { ok: false, error: 'unauthorized' };
}
var p = req.profile && typeof req.profile === 'object' ? req.profile : null;
if (!p) {
return { ok: false, error: 'bad_request' };
}
var users = sheet_('Users', USERS_HEAD);
var row = findRow_(users, 1, phone);
if (!row) {
return { ok: false, error: 'unauthorized' };
}
users.getRange(row, 2, 1, 3).setValues([[str_(p.name, 100), str_(p.email, 100), str_(p.address, 300)]]);
var extra = users.getRange(row, 10, 1, PROFILE_KEYS.length);
extra.setNumberFormat('@');
extra.setValues([profileExtra_(p)]);
if (typeof p.photo === 'string') {
var oldId = String(users.getRange(row, 5).getValue());
var newId = p.photo ? saveImage_(p.photo, 'profile_' + phone + '.jpg') : '';
if (newId || !p.photo) {
users.getRange(row, 5).setValue(newId);
if (oldId) {
trash_(oldId);
}
}
}
users.getRange(row, 9).setValue(now_());
return { ok: true };
}

function history_(req) {
var slug = typeof req.slug === 'string' ? req.slug : '';
var ref = typeof req.ref === 'string' ? req.ref : '';
if (!/^[a-z0-9-]{1,60}$/.test(slug) || !/^[a-z0-9]{6,40}$/.test(ref)) {
return { ok: false, error: 'bad_request' };
}
var fields = {};
var src = req.fields && typeof req.fields === 'object' ? req.fields : {};
var keys = Object.keys(src).slice(0, 80);
for (var i = 0; i < keys.length; i++) {
if (/^[a-z0-9_]{1,40}$/.test(keys[i]) && typeof src[keys[i]] === 'string') {
fields[keys[i]] = src[keys[i]].slice(0, 3000);
}
}
var data = JSON.stringify(fields);
if (data.length > 45000) {
return { ok: false, error: 'bad_request' };
}
var sheet = sheet_('History', HISTORY_HEAD);
if (recentRefExists_(sheet, ref)) {
return { ok: true, duplicate: true };
}
var photos = {};
var photoSrc = req.photos && typeof req.photos === 'object' ? req.photos : {};
var photoKeys = Object.keys(photoSrc).slice(0, 4);
for (var j = 0; j < photoKeys.length; j++) {
if (/^[a-z0-9_]{1,40}$/.test(photoKeys[j]) && typeof photoSrc[photoKeys[j]] === 'string') {
var id = saveImage_(photoSrc[photoKeys[j]], slug + '_' + ref + '_' + photoKeys[j] + '.jpg');
if (id) {
photos[photoKeys[j]] = id;
}
}
}
var phone = phoneFromToken_(req.token);
appendRow_(sheet, [now_(), ref, slug, phone, data, JSON.stringify(photos)]);
return { ok: true };
}

function cleanFields_(src) {
var out = {};
var obj = src && typeof src === 'object' ? src : {};
var keys = Object.keys(obj).slice(0, 80);
for (var i = 0; i < keys.length; i++) {
if (/^[a-z0-9_]{1,40}$/.test(keys[i]) && typeof obj[keys[i]] === 'string') {
out[keys[i]] = obj[keys[i]].slice(0, 3000);
}
}
return out;
}

function saveForm_(req) {
var phone = phoneFromToken_(req.token);
if (!phone) {
return { ok: false, error: 'unauthorized' };
}
var slug = typeof req.slug === 'string' ? req.slug : '';
var id = typeof req.id === 'string' ? req.id : '';
if (!/^[a-z0-9-]{1,60}$/.test(slug) || !/^[a-z0-9]{6,40}$/.test(id)) {
return { ok: false, error: 'bad_request' };
}
var data = JSON.stringify(cleanFields_(req.fields));
if (data.length > 45000) {
return { ok: false, error: 'bad_request' };
}
var sheet = sheet_('Saves', SAVES_HEAD);
var ms = Number(req.t);
var stamp = String(ms > 0 ? Math.floor(ms) : Date.now());
var row = findRow_(sheet, 2, id);
var rec = null;
if (row) {
rec = sheet.getRange(row, 1, 1, SAVES_HEAD.length).getValues()[0];
if (String(rec[3]) !== phone) {
return { ok: false, error: 'bad_request' };
}
if (Number(stamp) <= Number(rec[7])) {
return { ok: true, duplicate: true };
}
}
var photos = {};
var photoSrc = req.photos && typeof req.photos === 'object' ? req.photos : {};
var photoKeys = Object.keys(photoSrc).slice(0, 4);
for (var i = 0; i < photoKeys.length; i++) {
if (/^[a-z0-9_]{1,40}$/.test(photoKeys[i]) && typeof photoSrc[photoKeys[i]] === 'string') {
var fileId = saveImage_(photoSrc[photoKeys[i]], 'save_' + id + '_' + photoKeys[i] + '.jpg');
if (fileId) {
photos[photoKeys[i]] = fileId;
}
}
}
if (rec) {
var oldIds = {};
try {
oldIds = JSON.parse(String(rec[6]));
} catch (err) {
console.error(err);
}
Object.keys(oldIds).forEach(function (k) {
if (oldIds[k]) {
trash_(String(oldIds[k]));
}
});
var range = sheet.getRange(row, 1, 1, SAVES_HEAD.length);
range.setNumberFormat('@');
range.setValues([[now_(), id, slug, phone, str_(req.name, 60), data, JSON.stringify(photos), stamp]]);
return { ok: true, updated: true };
}
appendRow_(sheet, [now_(), id, slug, phone, str_(req.name, 60), data, JSON.stringify(photos), stamp]);
return { ok: true };
}

function listSaves_(req) {
var phone = phoneFromToken_(req.token);
if (!phone) {
return { ok: false, error: 'unauthorized' };
}
var slug = typeof req.slug === 'string' ? req.slug : '';
if (!/^[a-z0-9-]{1,60}$/.test(slug)) {
return { ok: false, error: 'bad_request' };
}
var have = {};
var haveSrc = Array.isArray(req.have) ? req.have.slice(0, 30) : [];
for (var h = 0; h < haveSrc.length; h++) {
if (typeof haveSrc[h] === 'string') {
have[haveSrc[h]] = true;
}
}
var sheet = sheet_('Saves', SAVES_HEAD);
var last = sheet.getLastRow();
if (last < 2) {
return { ok: true, saves: [] };
}
var start = Math.max(2, last - 1499);
var vals = sheet.getRange(start, 1, last - start + 1, SAVES_HEAD.length).getValues();
var mine = [];
for (var i = 0; i < vals.length; i++) {
if (String(vals[i][3]) === phone && String(vals[i][2]) === slug) {
mine.push(vals[i]);
}
}
mine.sort(function (a, b) {
return Number(b[7]) - Number(a[7]);
});
mine = mine.slice(0, 10);
var saves = [];
for (var j = 0; j < mine.length; j++) {
var row = mine[j];
if (have[String(row[1])]) {
continue;
}
var fields = {};
var ids = {};
try {
fields = JSON.parse(String(row[5]));
ids = JSON.parse(String(row[6]));
} catch (err) {
console.error(err);
}
var photos = {};
var keys = Object.keys(ids);
for (var k = 0; k < keys.length; k++) {
var url = imageData_(String(ids[keys[k]]));
if (url) {
photos[keys[k]] = url;
}
}
saves.push({ id: String(row[1]), name: String(row[4]), t: Number(row[7]), fields: fields, photos: photos });
}
return { ok: true, saves: saves };
}

function listAllSaves_(req) {
var phone = phoneFromToken_(req.token);
if (!phone) {
return { ok: false, error: 'unauthorized' };
}
var have = {};
var haveSrc = Array.isArray(req.have) ? req.have.slice(0, 400) : [];
for (var h = 0; h < haveSrc.length; h++) {
if (typeof haveSrc[h] === 'string') {
have[haveSrc[h]] = true;
}
}
var sheet = sheet_('Saves', SAVES_HEAD);
var last = sheet.getLastRow();
if (last < 2) {
return { ok: true, saves: [], more: false };
}
var start = Math.max(2, last - 1499);
var vals = sheet.getRange(start, 1, last - start + 1, SAVES_HEAD.length).getValues();
var mine = [];
for (var i = 0; i < vals.length; i++) {
if (String(vals[i][3]) === phone) {
mine.push(vals[i]);
}
}
mine.sort(function (a, b) {
return Number(b[7]) - Number(a[7]);
});
var perForm = {};
var missing = [];
for (var j = 0; j < mine.length; j++) {
var slug = String(mine[j][2]);
perForm[slug] = (perForm[slug] || 0) + 1;
if (perForm[slug] > 10) {
continue;
}
if (!have[String(mine[j][1])]) {
missing.push(mine[j]);
}
}
var part = missing.slice(0, 12);
var saves = [];
for (var m = 0; m < part.length; m++) {
var row = part[m];
var fields = {};
var ids = {};
try {
fields = JSON.parse(String(row[5]));
ids = JSON.parse(String(row[6]));
} catch (err) {
console.error(err);
}
var photos = {};
var keys = Object.keys(ids);
for (var k = 0; k < keys.length; k++) {
var url = imageData_(String(ids[keys[k]]));
if (url) {
photos[keys[k]] = url;
}
}
saves.push({ id: String(row[1]), slug: String(row[2]), name: String(row[4]), t: Number(row[7]), fields: fields, photos: photos });
}
return { ok: true, saves: saves, more: missing.length > part.length };
}

function deleteSave_(req) {
var phone = phoneFromToken_(req.token);
if (!phone) {
return { ok: false, error: 'unauthorized' };
}
var id = typeof req.id === 'string' ? req.id : '';
if (!/^[a-z0-9]{6,40}$/.test(id)) {
return { ok: false, error: 'bad_request' };
}
var sheet = sheet_('Saves', SAVES_HEAD);
var row = findRow_(sheet, 2, id);
if (!row) {
return { ok: true };
}
var rec = sheet.getRange(row, 1, 1, SAVES_HEAD.length).getValues()[0];
if (String(rec[3]) !== phone) {
return { ok: false, error: 'bad_request' };
}
var ids = {};
try {
ids = JSON.parse(String(rec[6]));
} catch (err) {
console.error(err);
}
Object.keys(ids).forEach(function (k) {
if (ids[k]) {
trash_(String(ids[k]));
}
});
sheet.deleteRow(row);
return { ok: true };
}

function slugList_(src) {
var out = [];
var arr = Array.isArray(src) ? src.slice(0, 100) : [];
for (var i = 0; i < arr.length; i++) {
if (typeof arr[i] === 'string' && /^[a-z0-9-]{1,60}$/.test(arr[i]) && out.indexOf(arr[i]) === -1) {
out.push(arr[i]);
}
}
return out;
}

function favorites_(req) {
var phone = phoneFromToken_(req.token);
if (!phone) {
return { ok: false, error: 'unauthorized' };
}
var add = slugList_(req.add);
var remove = slugList_(req.remove);
var sheet = sheet_('Favorites', FAVS_HEAD);
var last = sheet.getLastRow();
var vals = last > 1 ? sheet.getRange(2, 1, last - 1, 2).getValues() : [];
var mine = [];
var gone = [];
for (var i = 0; i < vals.length; i++) {
if (String(vals[i][0]) !== phone) {
continue;
}
var slug = String(vals[i][1]);
if (remove.indexOf(slug) !== -1) {
gone.push(i + 2);
} else if (mine.indexOf(slug) === -1) {
mine.push(slug);
}
}
for (var g = gone.length - 1; g >= 0; g--) {
sheet.deleteRow(gone[g]);
}
for (var j = 0; j < add.length; j++) {
if (remove.indexOf(add[j]) === -1 && mine.indexOf(add[j]) === -1 && mine.length < 200) {
appendRow_(sheet, [phone, add[j], now_()]);
mine.push(add[j]);
}
}
return { ok: true, favs: mine };
}

function profileExtra_(p) {
return PROFILE_KEYS.map(function (k) {
return str_(p[k], k === 'address_perm' ? 300 : 100);
});
}

function recentRefExists_(sheet, ref) {
var last = sheet.getLastRow();
if (last < 2) {
return false;
}
var start = Math.max(2, last - 299);
var vals = sheet.getRange(start, 2, last - start + 1, 1).getValues();
for (var i = 0; i < vals.length; i++) {
if (String(vals[i][0]) === ref) {
return true;
}
}
return false;
}

function newSession_(phone) {
var token = Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, '');
appendRow_(sheet_('Sessions', SESSIONS_HEAD), [hash_(token), phone, now_()]);
return token;
}

function phoneFromToken_(token) {
if (typeof token !== 'string' || token.length < 40) {
return '';
}
var sessions = sheet_('Sessions', SESSIONS_HEAD);
var row = findRow_(sessions, 1, hash_(token));
return row ? String(sessions.getRange(row, 2).getValue()) : '';
}

function spreadsheet_() {
var id = PROPS.getProperty('SS_ID');
if (id) {
try {
return SpreadsheetApp.openById(id);
} catch (err) {
console.error(err);
}
}
var ss = SpreadsheetApp.create('FormGhor Data');
PROPS.setProperty('SS_ID', ss.getId());
ss.getSheets()[0].setName('Users');
return ss;
}

function sheet_(name, head) {
var ss = spreadsheet_();
var sh = ss.getSheetByName(name);
if (!sh) {
sh = ss.insertSheet(name);
}
if (sh.getLastRow() === 0) {
sh.getRange(1, 1, 1, head.length).setValues([head]);
sh.setFrozenRows(1);
}
return sh;
}

function photosFolder_() {
var id = PROPS.getProperty('PHOTO_FOLDER_ID');
if (id) {
try {
return DriveApp.getFolderById(id);
} catch (err) {
console.error(err);
}
}
var folder = DriveApp.createFolder('FormGhor Photos');
PROPS.setProperty('PHOTO_FOLDER_ID', folder.getId());
return folder;
}

function appendRow_(sheet, values) {
sheet.appendRow(values);
var range = sheet.getRange(sheet.getLastRow(), 1, 1, values.length);
range.setNumberFormat('@');
range.setValues([values]);
}

function findRow_(sheet, col, value) {
var last = sheet.getLastRow();
if (last < 2) {
return 0;
}
var vals = sheet.getRange(2, col, last - 1, 1).getValues();
for (var i = 0; i < vals.length; i++) {
if (String(vals[i][0]) === value) {
return i + 2;
}
}
return 0;
}

function saveImage_(dataUrl, name) {
var m = /^data:image\/jpeg;base64,([A-Za-z0-9+\/=]+)$/.exec(dataUrl);
if (!m || m[1].length > 600000) {
return '';
}
var blob = Utilities.newBlob(Utilities.base64Decode(m[1]), 'image/jpeg', name);
return photosFolder_().createFile(blob).getId();
}

function imageData_(id) {
try {
return 'data:image/jpeg;base64,' + Utilities.base64Encode(DriveApp.getFileById(id).getBlob().getBytes());
} catch (err) {
console.error(err);
return '';
}
}

function trash_(id) {
try {
DriveApp.getFileById(id).setTrashed(true);
} catch (err) {
console.error(err);
}
}

function hash_(s) {
var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, s, Utilities.Charset.UTF_8);
return bytes.map(function (b) {
return ('0' + (b & 255).toString(16)).slice(-2);
}).join('');
}

function hashPass_(salt, pass) {
var h = salt + ':' + pass;
for (var i = 0; i < 300; i++) {
h = hash_(h + salt);
}
return h;
}

function normPhone_(v) {
var s = String(v || '').replace(/[০-৯]/g, function (d) {
return '০১২৩৪৫৬৭৮৯'.indexOf(d);
}).replace(/[\s-]/g, '');
if (/^\+?880/.test(s)) {
s = '0' + s.replace(/^\+?880/, '');
}
return s;
}

function validPhone_(p) {
return /^01[3-9][0-9]{8}$/.test(p);
}

function str_(v, max) {
return typeof v === 'string' ? v.slice(0, max) : '';
}

function now_() {
return Utilities.formatDate(new Date(), TZ, 'dd/MM/yyyy HH:mm:ss');
}

function json_(obj) {
return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
