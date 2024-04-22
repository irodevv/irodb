const
    fs = require('fs').promises,
    fetch = require('cross-fetch');

module.exports = class {
    constructor(host) {
        this.host = host;
    }

    async execute(type, data) {
        if (this.host) {
            const res = await fetch(this.host.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': Buffer.from(this.host.password).toString('base64')
                },
                body: JSON.stringify({
                    type,
                    data
                })
            });
            if (res.ok) {
                return (await res.json()).result
            } else {
                throw new Error('Network response was not ok.')
            }
        } else {
            if (type === 'existsSync') {
                return fs.access(data.path, fs.constants.F_OK)
                    .then(() => true)
                    .catch(() => false);
            } else if (type === 'writeFileSync') {
                return await fs.writeFile(data.path, data.data, { encoding: data.type })
            } else if (type === 'readFileSync') {
                return await fs.readFile(data.path, { encoding: data.type })
            } else if (type === 'mkdirSync') {
                return await fs.mkdir(data.path)
            } else {
                throw new Error('Unsupported operation.')
            }
        }
    }

    async existsSync(path) {
        return await this.execute('existsSync', { path })
    }

    async writeFileSync(path, data, type) {
        return await this.execute('writeFileSync', { path, data, type })
    }

    async readFileSync(path, type) {
        return await this.execute('readFileSync', { path, type })
    }

    async mkdirSync(path) {
        return await this.execute('mkdirSync', { path })
    }
};
