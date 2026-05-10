const CryptoJS = require('crypto-js');
const KEY = process.env.ENCRYPTION_KEY || 'fallback_key_32_chars___________';
exports.encrypt = (text) => CryptoJS.AES.encrypt(text, KEY).toString();
exports.decrypt = (cipher) => CryptoJS.AES.decrypt(cipher, KEY).toString(CryptoJS.enc.Utf8);
