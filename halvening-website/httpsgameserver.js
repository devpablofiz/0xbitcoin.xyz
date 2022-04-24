const express = require('express');
const app = express();
const https = require('https');
const fs = require('fs');

const privateKey = fs.readFileSync('/etc/letsencrypt/live/halvening.0xbitcoin.xyz/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/halvening.0xbitcoin.xyz/fullchain.pem', 'utf8');
const server = https.createServer({
    key: privateKey,
    cert: certificate
}, app);


let playerdata = {};
let playerHeldDirections = {};
let speed = 3;

const directions = {
    up: "up",
    down: "down",
    left: "left",
    right: "right"
}

const io = require("socket.io")(server, {
    cors: {
        origin: "https://www.0xbitcoin.xyz",
        methods: ["GET", "POST"]
    }
});

app.get('/', (req, res) => {
    res.send('<h1>Hello world</h1>');
});

io.on("connection", (socket) => {
    console.log("New client connected: " + socket.id);

    playerdata[socket.id] = {};
    playerdata[socket.id]["xy"] = [90, 34];
    playerdata[socket.id]["fd"] = directions.down;
    playerdata[socket.id]["wa"] = false;
    playerdata[socket.id]["nm"] = socket.id;
    let heldDirections = {
        [directions.up]: false,
        [directions.left]: false,
        [directions.right]: false,
        [directions.down]: false,
    }
    playerHeldDirections[socket.id] = heldDirections;

    socket.on("setdisplayname", (nickname)=>{
        playerdata[socket.id]["nm"] = nickname;
    })

    socket.on("sendmessage", (msg)=>{
        playerdata[socket.id]["msg"] = msg;
    })

    // io.emit("playerdata", playerdata);
    socket.on("move", (heldDirections) => {
        playerHeldDirections[socket.id] = heldDirections;

        // const held_direction = arg;
        // if (held_direction) {
        //     if (held_direction === 39) { x += speed; }
        //     if (held_direction === 37) { x -= speed; }
        //     if (held_direction === 40) { y += speed; }
        //     if (held_direction === 38) { y -= speed; }
        // }

        // const heldDirections = arg;
        // const walking = heldDirections[directions.up] != heldDirections[directions.down] || heldDirections[directions.left] != heldDirections[directions.right];
        // if (heldDirections && walking) {
        //     if (heldDirections[directions.up] == true) { x += speed; facingDirection = directions.up }
        //     if (heldDirections[directions.left] == true) { x -= speed; facingDirection = directions.left }
        //     if (heldDirections[directions.right] == true) { y += speed; facingDirection = directions.right }
        //     if (heldDirections[directions.down] == true) { y -= speed; facingDirection = directions.down }
        // }

        // //Limits (gives the illusion of walls)
        // var leftLimit = -8;
        // var rightLimit = (16 * 11) + 8;
        // var topLimit = -8 + 32;
        // var bottomLimit = (16 * 7);
        // if (x < leftLimit) { x = leftLimit; }
        // if (x > rightLimit) { x = rightLimit; }
        // if (y < topLimit) { y = topLimit; }
        // if (y > bottomLimit) { y = bottomLimit; }
        // console.log(socket.id + " moved to " + [x, y]);
        // playerdata[socket.id]["xy"] = [x, y];
        // playerdata[socket.id]["fd"] = facingDirection;
        // playerdata[socket.id]["wa"] = walking;
        // io.emit("playerdata", playerdata);
    });

    // socket.on("stop", () => {
    // });

    socket.on("disconnect", () => {
        delete playerdata[socket.id];
        delete playerHeldDirections[socket.id];
        // io.emit("playerdata", playerdata);
        console.log("Client disconnected: " + socket.id);
    });
});

server.listen(4001, () => {
    console.log('listening on *:4001');
});

function gameLoop() {
    for (const [currentSocketId, value] of Object.entries(playerdata)) {
        let [x, y] = playerdata[currentSocketId]["xy"];
        let facingDirection = playerdata[currentSocketId]["fd"];
        let heldDirections = playerHeldDirections[currentSocketId];
        if (heldDirections == null) {
            continue;
        }
        const walking = heldDirections[directions.up] != heldDirections[directions.down] || heldDirections[directions.left] != heldDirections[directions.right];
        if (heldDirections && walking) {
            if (heldDirections[directions.up] == true) { y -= speed; facingDirection = directions.up }
            if (heldDirections[directions.left] == true) { x -= speed; facingDirection = directions.left }
            if (heldDirections[directions.right] == true) { x += speed; facingDirection = directions.right }
            if (heldDirections[directions.down] == true) { y += speed; facingDirection = directions.down }
        }

        //Limits (gives the illusion of walls)
        var leftLimit = -8;
        var rightLimit = (16 * 11) + 8;
        var topLimit = -8 + 32;
        var bottomLimit = (16 * 7);
        if (x < leftLimit) { x = leftLimit; }
        if (x > rightLimit) { x = rightLimit; }
        if (y < topLimit) { y = topLimit; }
        if (y > bottomLimit) { y = bottomLimit; }
        //console.log(currentSocketId + " moved to " + [x, y]);

        playerdata[currentSocketId]["xy"] = [x, y];
        playerdata[currentSocketId]["fd"] = facingDirection;
        playerdata[currentSocketId]["wa"] = walking;
    }
    console.log(playerdata);
    io.emit("playerdata", playerdata);
}

const ticksPerSecond = 20.0;
const tickrate = (1.0 / ticksPerSecond) * 1000;
let intervalId = setInterval(gameLoop, tickrate);


