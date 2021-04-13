const {default: axios} = require("axios");

const users = [
    {
        username: "iambenkay",
        pin: "0000",
        role: "ADMIN",
    },
    {
        username: "benjamin",
        pin: "0000",
        role: "SUPPORT_AGENT",
    },
    {
        username: "kayode",
        pin: "0000",
        role: "CUSTOMER",
    },
];

const port = process.argv[2];

if (!port){
    console.log("Usage node scripts/seed.js <PORT_OF_SERVER>");
    process.exit();
}

const SERVICE_URL = `http://localhost:${port}/api/v1`

for (const user of users){
    axios.post(`${SERVICE_URL}/users`, user).then((resp) => {
        console.log(resp.data);
    }).catch(err => {
        console.log(err.response.data);
    });
}