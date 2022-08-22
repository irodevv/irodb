const ipinfo = require("../../assets/function/web/ipinfo.js");
module.exports = {
    path: "/ip/:ip",
    method: "get",
    go: async (req, res) => {
        const pp = req.params.ip;
        if (!pp) return res.status(404).json({ error: { err: "[404] ERROR: Ip introuvavle." } });
        let i = await ipinfo(pp);
        if (i.status !== "success") return res.json({ error: { err: "[404] ERROR: Ip invalide." } });
        return res.render("content.ejs", {
            content: `<div class="content">
            <p>
            <h1>${pp}</h1>
            </p><span>
                Position: ${i.country} (${i.countryCode}) | ${i.regionName} (${i.region}) | ${i.city} (${i.zip})<br>
                Fournisseur: ${i.org} | ${i.isp} | ${i.as}}<br> </span>
            <form action="https://www.google.com/maps/search/google+map++${i.lat},${i.lon}" method="get"><input
                    type="submit" id="parse-btn" value="GoogleMap"></form>
        </div>`
        });
    }
}