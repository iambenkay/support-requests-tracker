require("dotenv").config();
require('module-alias/register')

import server from "./server";
import http from "http";

import "src/loader";

const { PORT = 3000 } = process.env;

http.createServer(server).listen(PORT, () => {
  console.log(`Fliqpay test started on port ${PORT} 🍻`);
});
