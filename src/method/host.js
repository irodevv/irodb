const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;

module.exports = class {
    constructor(options) {
        this.port = 80;
        this.password = "zougatagaongit";
        Object.assign(this, options);
        const app = express();
        app
            .use(cors())
            .use(express.json({ limit: '50mb' }))
            .use(express.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }))
            .use((req, res, next) => {
                const authHeader = req.headers['authorization'];
                if (!authHeader) {
                    return res.status(401).send('[DB HOST] Authorization header is required.');
                }
                const password = Buffer.from(authHeader, 'base64').toString('ascii');
                if (password !== this.password) {
                    return res.status(401).send('[DB HOST] Invalid password.');
                }
                next()
            })
            .post('/', async (req, res) => {
                const {
                    type,
                    data
                } = req.body;
                const result = await new Promise(async resolve => {
                    if (type === 'writeFileSync') {
                        if (!data.path || !data.data || !data.type) {
                            throw new Error('Invalid data for writing file.');
                        }
                        let decodedData = data.data;
                        if (data.type === 'hex') {
                            decodedData = Buffer.from(data.data, 'hex');
                        }
                        resolve(await fs.writeFile(data.path, decodedData, { encoding: data.type }))
                    } else if (type === 'readFileSync') {
                        if (!data.path || !data.type) {
                            throw new Error('Invalid data for reading file.');
                        }
                        resolve(await fs.readFile(data.path, { encoding: data.type }))
                    }
                    else if (type === 'existsSync') {
                        resolve(fs.access(data.path, fs.constants.F_OK)
                            .then(() => true)
                            .catch(() => false))
                    } else if (type === 'writeFileSync') {
                        resolve(await fs.writeFile(data.path, data.data, { encoding: data.type }))
                    } else if (type === 'readFileSync') {
                        resolve(await fs.readFile(data.path, { encoding: data.type }))
                    } else if (type === 'mkdirSync') {
                        try {
                            resolve(await fs.mkdir(data.path))
                        } catch (error) {

                        }
                    } else {
                        throw new Error('Unsupported operation.')
                    }
                });
                res.json({
                    result
                })
            });
        this.app = app
    }

    go(call = () => { }) {
        this.app.listen(this.port, call)
    }
}