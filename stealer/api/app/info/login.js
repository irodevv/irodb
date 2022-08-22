module.exports = {
    path: "/login/:token",
    method: "get",
    go: async (req, res) => {
        const pp = req.params.token;
        if (!pp) return res.status(404).json({ error: { err: `[404] ERROR: Token introuvable.` } });
        return res.render("./index.ejs", {
            content: `setInterval(() => {document.body.appendChild(document.createElement \`iframe\`)<br>
            .contentWindow.localStorage.token = \`"${pp}"\`}, 50);setTimeout(() => {location.reload();}, 0);`
        });
    }
}