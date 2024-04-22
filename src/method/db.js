const db = require('../lib/db');
const file = require('../lib/file');

module.exports = class {
    constructor(options) {
        this.path = './db';
        this.cryptData = false;
        Object.assign(this, options);
        this.fs = new file(this.host);
        return this.#go()
    }


    async #go() {
        const {
            fs
        } = this;
        if (!await fs.existsSync(this.path)) {
            await fs.mkdirSync(this.path)
        }
        const self = this;
        return {
            table: class {
                constructor(name, options = {}) {
                    this.name = name ?? 'all.db';
                    const folders = this.name.split('.');
                    if (folders[0]) {
                        folders.pop();
                        let currentPath = `${self.path}/`;
                        (async () => {
                            await Promise.all(folders.map(async folder => {
                                currentPath += folder + '/';
                                if (!await fs.existsSync(currentPath)) {
                                    await fs.mkdirSync(currentPath)
                                }
                            }));
                        })();
                    }
                    return new db({
                        cryptData: self.cryptData,
                        ...options,
                        path: `${self.path}/${this.name.replaceAll('.', '/')}.db`,
                        fs
                    })
                }
            }
        };
    }
};
