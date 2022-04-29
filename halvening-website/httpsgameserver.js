const express = require('express');
const app = express();
const https = require('https');
const fs = require('fs');
const Filter = require('bad-words');
const ethSigUtil = require("eth-sig-util");
const { AlchemyProvider } = require("@ethersproject/providers");
const config = require("./config.json");

const randomFourDigit = () => {
    const val = Math.floor(1000 + Math.random() * 9000);
    
    return val;
}

const provider = new AlchemyProvider("homestead", config.alchemyKey);

const privateKey = fs.readFileSync('/etc/letsencrypt/live/halvening.0xbitcoin.xyz/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/halvening.0xbitcoin.xyz/fullchain.pem', 'utf8');
const server = https.createServer({
    key: privateKey,
    cert: certificate
}, app);

function checkSignature(nonce, signature) {
    const msgParams = {
        data: nonce,
        sig: signature
    };
    return ethSigUtil.recoverPersonalSignature(msgParams);
}

let playerdata = {};
let needsUpdating = {}
let rockData = { 1:{'xy':[100,40]}, 2:{'xy':[109,80]}};
let filter = new Filter();
let chatMessages = [];
let playerHeldDirections = {};
let speed = 5;

const handleMessage = (socket, msg) => {
    playerdata[socket]["msg"] = msg;
    if(!needsUpdating[socket]){
        needsUpdating[socket] = true;
    }
    setTimeout(() => {
        if(playerdata[socket] && playerdata[socket]["msg"] === msg){
            playerdata[socket]["msg"] = "";
            if(!needsUpdating[socket]){
                needsUpdating[socket] = true;
            }
        }
    }, 2000);
}

const directions = {
    up: "up",
    down: "down",
    left: "left",
    right: "right"
}

const io = require("socket.io")(server, {
    cors: {
        origins: ["https://www.0xbitcoin.xyz","https://0xbitcoin.xyz","https://halvening.0xbitcoin.xyz","188.217.53.60"],
        methods: ["GET", "POST"]
    }
});

app.get('/', (req, res) => {
    res.send('<h1>Hello world</h1>');
});

io.on("connection", (socket) => {
    let authData = socket.handshake.auth;

    let entryKey;

    if(authData.address !== "Guest"){
        let sigAddress = checkSignature("By signing this message I confirm that this is my own address",authData.signature)

        if(sigAddress !== authData.address){
            console.log("Auth failed: " + socket.id);
            socket.disconnect();
        }else{
            console.log("Auth as "+sigAddress+": " + socket.id);
            entryKey = sigAddress;
        }
    }else if (authData.address === "Guest"){
        console.log("Auth as guest: " + socket.id);
        entryKey = authData.signature;
    }

    if(playerdata[entryKey]){
        console.log("User already logged in: " + entryKey);
        socket.disconnect();       
    }

    playerdata[entryKey] = {};
    
    playerdata[entryKey]["xy"] = [90, 34];
    playerdata[entryKey]["fd"] = directions.down;
    playerdata[entryKey]["wa"] = false;
    playerdata[entryKey]["nm"] = entryKey;

    let heldDirections = {
        [directions.up]: false,
        [directions.left]: false,
        [directions.right]: false,
        [directions.down]: false,
    }
    playerHeldDirections[entryKey] = heldDirections;

    socket.on("ready", () => {
        socket.emit("newmessage", chatMessages)
        socket.emit("rockdata", rockData);
        socket.emit("playerdata", playerdata);
    
        if(!needsUpdating[entryKey]){
            needsUpdating[entryKey] = true;
        }
    })

    socket.on("sendmessage", ([nm,msg])=>{
        if(msg.length > 64){
            console.log(entryKey+"sent a very long message")
            return
        }

        if(chatMessages.length >= 16){
            chatMessages.shift()
        }

        let message = filter.clean(msg)
        chatMessages.push([nm, message])
        handleMessage(entryKey, message);
        io.emit("newmessage", chatMessages)
    })

    socket.on("move", (heldDirections) => {
        playerHeldDirections[entryKey] = heldDirections;
        //console.log(socket.id+" requested movement");
    });

    socket.on("disconnect", () => {
        delete playerdata[entryKey];
        delete playerHeldDirections[entryKey];
        delete needsUpdating[entryKey]
        io.emit("playerdata", playerdata);
        console.log("Client disconnected: " + socket.id);
    });
});

server.listen(4001, () => {
    console.log('listening on *:4001');
});

let debugPrint = 0;

function gameLoop() {
    for (const [currentSocketId, value] of Object.entries(playerdata)) {
        let oldData = JSON.stringify(playerdata[currentSocketId]);

        let [x, y] = playerdata[currentSocketId]["xy"];
        let facingDirection = playerdata[currentSocketId]["fd"];
        let heldDirections = playerHeldDirections[currentSocketId];

        if (heldDirections == null) {
            continue;
        }

        const walkingUD = heldDirections[directions.up] != heldDirections[directions.down];
        const walkingLR = heldDirections[directions.left] != heldDirections[directions.right];
        const walking = walkingUD || walkingLR;
        if (heldDirections && walking) {
            if (walkingUD) {
                if (heldDirections[directions.up] == true) { y -= speed; }
                if (heldDirections[directions.down] == true) { y += speed; }
            } 
            if (walkingLR) {
                if (heldDirections[directions.left] == true) { x -= speed; facingDirection = directions.left }
                if (heldDirections[directions.right] == true) { x += speed; facingDirection = directions.right }
            }
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

        let newData = JSON.stringify(playerdata[currentSocketId]);
        if(oldData !== newData){
            if(!needsUpdating[currentSocketId]){
                needsUpdating[currentSocketId] = true;
            }
        }
    }

    if(debugPrint > ticksPerSecond*10){
        console.log(playerdata);
        io.emit("playerdata", playerdata);
        debugPrint = 0;
    }

    let toUpdate = {}
    for(const [socketID] of Object.entries(needsUpdating)){
        if(needsUpdating[socketID]){
            toUpdate[socketID] = playerdata[socketID];
            needsUpdating[socketID] = false;
        }
    }
    
    if(Object.keys(toUpdate).length > 0){
        io.emit("playerdataupdate", toUpdate)
    }

    debugPrint++;
}

const ticksPerSecond = 20.0;
const tickrate = (1.0 / ticksPerSecond) * 1000;
let intervalId = setInterval(gameLoop, tickrate);


