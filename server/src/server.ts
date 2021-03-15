const express = require('express');
import { Server } from "socket.io";
import * as dotenv from 'dotenv';
import { SocketHandler } from "./sockets/handler.socket";

dotenv.config()
const port = process.env.PORT || 3000;
const app = express();
app.set("port", port);
const http = require("http").Server(app);
const io = new Server(
  http, 
  {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  }
);

SocketHandler.init(io);
const server = http.listen(port, function() {
  console.log(`listening on *:${port}`);
});
