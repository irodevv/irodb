module.exports = {
    path: "/parser",
    method: "get",
    go: async (req, res) => {
        return res.sendFile("parser.html", { root: "./views" });
    }
}