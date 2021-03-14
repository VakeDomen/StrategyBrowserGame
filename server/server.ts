const express = require('express');
import { Server } from "socket.io";
import * as path from "path";
import * as dotenv from 'dotenv';

dotenv.config()
const port = process.env.PORT || 3000;

const app = express();
app.set("port", port);
const http = require("http").Server(app);
const io = new Server(http);

// whenever a user connects on port via
// a websocket, log that a user has connected
io.on("connection", function(socket: any) {
  console.log("a user connected");
});

const server = http.listen(port, function() {
  console.log(`listening on *:${port}`);
});