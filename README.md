## IroDB

[![irodb on npm](https://img.shields.io/npm/v/irodb.svg)](https://www.npmjs.com/package/irodb)

## Installation

```python
npm i irodb
```

## Example

```js
const { db } = require('irodb');
(async () => {
    const {
        table
    } = await new db({
        cryptData: true,
        path: './database'
        // host: {
        //     url: "http://localhost",
        //     password: 'test1234'
        // }
    });
    const
        userDb = new table("user"),
        userDb2 = new table("test.user2", { cryptData: false });
    await userDb.set('test', 2332323321);
    await userDb2.set('test2', 233232);
    console.log(await userDb.get('test'));
    console.log(await userDb2.get('test'))
})()
```
