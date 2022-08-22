const axios = require("axios");
const ipinfo = async (ip) => {
    const info = (await axios.get(`http://ip-api.com/json/${ip}`)).data;
    return info;
};
module.exports = ipinfo;