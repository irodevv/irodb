module.exports = {
    path: "/copy/:text",
    method: "get",
    go: async (req, res) => {
        const pp = req.params.text;
        if (!pp) return res.redirect("/");
        return res.render("index.ejs", { content: pp })
    }
}