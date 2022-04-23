const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");

let playerdata = {};
let speed = 5;

const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.get('/', (req, res) => {
  res.send('<h1>Hello world</h1>');
});

io.on("connection", (socket) => {
  console.log("New client connected");

  playerdata[socket.id] = {};
  playerdata[socket.id]["xy"] = [90,34];
  console.log(JSON.stringify(playerdata))

  io.emit("playerdata", playerdata);
  console.log(playerdata)

  socket.on("move", async (arg) => {
    let [x,y] = playerdata[socket.id]["xy"];

    const held_direction = arg;
    if (held_direction) {
       if (held_direction === 39) {x += speed;}
       if (held_direction === 37) {x -= speed;}
       if (held_direction === 40) {y += speed;}
       if (held_direction === 38) {y -= speed;}
    }
    
    //Limits (gives the illusion of walls)
    var leftLimit = -8;
    var rightLimit = (16 * 11)+8;
    var topLimit = -8 + 32;
    var bottomLimit = (16 * 7);
    if (x < leftLimit) { x = leftLimit; }
    if (x > rightLimit) { x = rightLimit; }
    if (y < topLimit) { y = topLimit; }
    if (y > bottomLimit) { y = bottomLimit; }
    console.log(socket.id+" moved to "+[x,y]);
    playerdata[socket.id]["xy"] = [x,y];
    io.emit("playerdata", playerdata);
  });

  socket.on("stop", () => {

  });

  socket.on("disconnect", () => {
    delete playerdata[socket.id]
    io.emit("playerdata", playerdata);
    console.log("Client disconnected");
  });
});

server.listen(4001, () => {
  console.log('listening on *:4001');
});