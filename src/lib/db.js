const cipher = require('./cipher');

module.exports = class {
    constructor({
        path = "./zougataga.db",
        cryptData = true,
        fs
    } = {}) {
        this.path = path;
        this.cryptData = cryptData;
        this.fs = fs;
        (async () => {
            if (!await this.fs.existsSync(this.path)) {
                await this.#setAllData({})
            }
        })()
    }
    async getAll() {
        const data = await this.#getAllData();
        const all = [];
        for (let [key, value] of Object.entries(data)) {
            all.push({ id: key, data: value });
        }
        return all;
    }

    async deleteAll() {
        await this.#setAllData({});
        return {};
    }

    async set(id, dataToSet) {
        if (!id) {
            throw new TypeError("No id specified");
        }
        if (typeof id !== "string") {
            throw new TypeError(`ID: "${id}" IS NOT a string`);
        }
        if (dataToSet === undefined) {
            throw new TypeError(`Data @ ID: "${id}" IS NOT specified`);
        }
        return await this.#setData(id, dataToSet);
    }

    async get(id) {
        if (!id) {
            throw new TypeError("No id specified");
        }
        if (typeof id !== "string") {
            throw new TypeError(`ID: "${id}" IS NOT a string`);
        }
        return await this.#getData(id);
    }

    async delete(id) {
        if (!id) {
            throw new TypeError("No id specified");
        }
        if (typeof id !== "string") {
            throw new TypeError(`ID: "${id}" IS NOT a string`);
        }
        return await this.#deleteData(id);
    }

    async push(id, dataToPush) {
        if (!id) {
            throw new TypeError("No id specified");
        }
        if (typeof id !== "string") {
            throw new TypeError(`ID: "${id}" IS NOT a string`);
        }
        if (dataToPush === undefined) {
            throw new TypeError(`Data @ ID: "${id}" IS NOT specified`);
        }
        let data = await this.#getData(id);
        if (!Array.isArray(data)) data = [];
        data.push(dataToPush);
        await this.#setData(id, data);
        return await this.#getData(id);
    }

    async pull(id, dataToFind) {
        if (!id) {
            throw new TypeError("No id specified");
        }
        if (typeof id !== "string") {
            throw new TypeError(`ID: "${id}" IS NOT a string`);
        }
        if (dataToFind === undefined) {
            throw new TypeError(`Data @ ID: "${id}" IS NOT specified`);
        }
        const data = await this.#getData(id) || [];
        if (!Array.isArray(data)) {
            throw new TypeError(`ID: "${id}" IS NOT an array`);
        }
        return data.filter(dataToFind);
    }

    async pullDelete(id, condition) {
        if (!id) {
            throw new TypeError("No id specified");
        }
        if (typeof id !== "string") {
            throw new TypeError(`ID: "${id}" IS NOT a string`);
        }
        if (condition === undefined) {
            throw new TypeError(`Condition @ ID: "${id}" IS NOT specified`);
        }
        const
            newd = [],
            data = await this.#getData(id) || [];
        if (!Array.isArray(data)) {
            throw new TypeError(`ID: "${id}" IS NOT an array`);
        }
        for (const d of data) {
            if (!condition(d)) {
                newd.push(d);
            }
        }
        await this.#setData(id, newd);
        return await this.#getData(id);
    }

    async add(id, number) {
        if (!id) {
            throw new TypeError("No id specified");
        }
        if (typeof id !== "string") {
            throw new TypeError(`ID: "${id}" IS NOT a string`);
        }
        if (!number) {
            throw new TypeError(`Data @ ID: "${id}" IS NOT specified`);
        }
        const data = Number(await this.#getData(id)) || 0;
        const rnumber = Number(number);
        if (!rnumber || isNaN(rnumber)) {
            throw new Error(`[zougatagaDb] Data @ ID: "${id}" IS NOT A number.\nFOUND: ${number}\nEXPECTED: number`);
        }
        return await this.#setData(id, Number(data + rnumber));
    }

    async subtract(id, number) {
        if (!id) {
            throw new TypeError("No id specified");
        }
        if (typeof id !== "string") {
            throw new TypeError(`ID: "${id}" IS NOT a string`);
        }
        if (!number) {
            throw new TypeError(`Data @ ID: "${id}" IS NOT specified`);
        }
        const data = Number(await this.#getData(id)) || 0;
        const rnumber = Number(number);
        if (!rnumber || isNaN(rnumber)) {
            throw new Error(`[zougatagaDb] Data @ ID: "${id}" IS NOT A number.\nFOUND: ${number}\nEXPECTED: number`);
        }
        return await this.#setData(id, Number(data - rnumber));
    }

    async #setData(id, dataToSet) {
        try {
            const data = await this.#getAllData();
            data[id] = dataToSet;
            await this.#setAllData(data);
            return await this.#getData(id);
        } catch (error) {
            console.log(error);
            return;
        }
    }

    async #deleteData(id) {
        try {
            const data = await this.#getAllData();
            delete data[id];
            await this.#setAllData(data);
            return await this.#getData(id);
        } catch (error) {
            return;
        }
    }

    async #getData(id, defaultData) {
        try {
            const fetched = (await this.#getAllData())[id];
            if (!fetched && defaultData) await this.#setData(id, defaultData);
            return fetched;
        } catch (error) {
            return;
        }
    }

    async #setAllData(obj) {
        try {
            let d = JSON.stringify(obj);
            if (this.cryptData) d = cipher.encryptData(d);
            await this.fs.writeFileSync(this.path, d, this.cryptData ? "hex" : "utf-8");
        } catch (error) {
            throw error;
        }
    }

    async #getAllData() {
        try {
            if (!this.fs.existsSync(this.path)) await this.#setAllData({});
            let d = await this.fs.readFileSync(this.path, this.cryptData ? "hex" : "utf-8");
            if (this.cryptData) d = cipher.decryptData(d);
            if (d) d = JSON.parse(d);
            return d;
        } catch (error) {
            await this.#setAllData({});
            return {};
        }
    }
};
