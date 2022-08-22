const fs = require('fs');
module.exports = {
    path: "/setup/:ps",
    method: "get",
    go: async (req, res) => {
        const pp = req.params.ps;
        if (!pp) return res.status(404).json({ error: { err: "[404] ERROR: Le nom du exe est introuvable !" } });
        const c = fs.readFileSync(`assets/ect/setup.iss`, "utf-8", function (e, t) { });
        return res.status(200).send(c.replace("%APP%", pp));
    }
}