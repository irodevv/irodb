const config = require("../../../config.json");
const profil = async (pp) => {
    let web = false;
    config.profil.forEach(e => {
        if (pp === e.ps) web = e.web
    })
    if (!web) return profil("base31");
    else return web.split("/");
};
module.exports = profil;