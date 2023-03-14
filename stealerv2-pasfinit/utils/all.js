const fetch = require("cross-fetch");
function base64toJson(base64String) {
    try {
        const jsonString = Buffer.from(base64String, 'base64').toString()
        return JSON.parse(jsonString)
    } catch (err) {
        return false
    }
}
exports.base64toJson = base64toJson;

function jsonToBase64(jsonObj) {
    try {
        const jsonString = JSON.stringify(jsonObj)
        return Buffer.from(jsonString).toString('base64')
    } catch (error) {
        return false
    }
}
exports.jsonToBase64 = jsonToBase64;

function createId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
}
exports.createId = createId;

function cipher(salt) {
    const textToChars = text => text.split('').map(c => c.charCodeAt(0));
    const byteHex = n => ("0" + Number(n).toString(16)).substr(-2);
    const applySaltToChar = code => textToChars(salt).reduce((a, b) => a ^ b, code);

    return text => text.split('')
        .map(textToChars)
        .map(applySaltToChar)
        .map(byteHex)
        .join('');
}
exports.cipher = cipher;

function decipher(salt) {
    const textToChars = text => text.split('').map(c => c.charCodeAt(0));
    const applySaltToChar = code => textToChars(salt).reduce((a, b) => a ^ b, code);
    return encoded => encoded.match(/.{1,2}/g)
        .map(hex => parseInt(hex, 16))
        .map(applySaltToChar)
        .map(charCode => String.fromCharCode(charCode))
        .join('');
}
exports.decipher = decipher;

function getrsize(size) { const i = Math.floor(Math.log(size) / Math.log(1024)); return (size / Math.pow(1024, i)).toFixed(2) * 1 + " " + ['B', 'KB', 'MB', 'GB', 'TB'][i] };
exports.getrsize = getrsize;

async function checkKey(token, chatId) {
    try {
        const
            resToken = await fetch(`https://api.telegram.org/bot${token}/getMe`),
            dataToken = await resToken.json();
        if (!dataToken) return { token: false, chat: false };
        const
            resChat = await fetch(`https://api.telegram.org/bot${token}/getChat?chat_id=${chatId}`),
            dataChat = await resChat.json();
        return dataChat.ok ? { token: true, chat: true } : (dataToken?.ok ? { token: true, chat: false } : { token: false, chat: false });
    } catch (error) {
        return { token: false, chat: false }
    }
}
exports.checkKey = checkKey;
