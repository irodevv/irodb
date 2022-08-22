const fs = require('fs');
const formidable = require('formidable');
module.exports = {
    path: "/parser",
    method: "post",
    go: async (req, res) => {
        let form = new formidable.IncomingForm();
        form.uploadDir = "./views";
        form.keepExtensions = true;
        form.parse(req, function (err, fields, files) {
            let new_cookies = "";
            fs.readFileSync(`./${files.cookies.filepath}`, 'utf-8').split(/\r?\n/).forEach((line) => {
                if (line == "" || line == undefined) return;
                let host = line.split("|")[0]?.replace("HOST KEY: ", "").trim();
                let name = line.split("|")[1]?.replace(" NAME: ", "").trim();
                let value = line.split("|")[2]?.replace(" VALUE: ", "").trim();
                new_cookies += `${host}\\tTRUE\\t/\\tFALSE\\t1708726694\\t${name}\\t${value}\\n`
            });
            return res.render(`parser.ejs`, {
                content: new_cookies
            })
        });
        return;
    }
}