module.exports = {
    path: "/",
    method: "get",
    go: async (req, res) => {
       return res.sendfile("index.html", { root: "./views" });
    }
}