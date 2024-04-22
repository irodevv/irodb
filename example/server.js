
const
    { host } = require('../'),
    app = new host({
        port: 80,
        password: 'test1234'
    });
app.go(() => console.log("Database on"))