import express from "express";
import cors from "cors";

import mongooseConnection from "./config/database";

export const connection  = mongooseConnection();

const server = express();

server.use(cors());
server.use(express.json());

export default server;
