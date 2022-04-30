const express = require('express');
const app = express();
const https = require('https');
const fs = require('fs');
const Filter = require('bad-words');
const ethSigUtil = require("eth-sig-util");
const { AlchemyProvider } = require("@ethersproject/providers");

const config = require("./config.json");
const provider = new AlchemyProvider("mainnet", config.alchemyKey);

//const ens = new (ENS.default)({
//    signer,
//    ensAddress: getEnsAddress("1")
//});


/**
 * Dichiarazione server HTTPS
 */
const privateKey = fs.readFileSync('/etc/letsencrypt/live/halvening.0xbitcoin.xyz/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/halvening.0xbitcoin.xyz/fullchain.pem', 'utf8');
const server = https.createServer({
    key: privateKey,
    cert: certificate
}, app);


/**
 * Dichiarazione server Http (localhost test)
 */
// const http = require('http');
// const server = http.createServer(app);



function checkSignature(nonce, signature) {
    const msgParams = {
        data: nonce,
        sig: signature
    };

    let res;

    try {
        res = ethSigUtil.recoverPersonalSignature(msgParams);
    } catch (error) {
        res = error
    }

    return res;
}

let playerdata = {};
//world bodies that need to get deleted after disconnection
let toDelete = []
let needsUpdating = {}
let filter = new Filter();
let chatMessages = [];
let playerHeldDirections = {};

const handleMessage = (socket, msg) => {
    playerdata[socket]["msg"] = msg;
    if (!needsUpdating[socket]) {
        needsUpdating[socket] = true;
    }
    setTimeout(() => {
        if (playerdata[socket] && playerdata[socket]["msg"] === msg) {
            playerdata[socket]["msg"] = "";
            if (!needsUpdating[socket]) {
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






//physics setup - planck.js
const planck = require('planck');
//player speed
let speed = 1.2;
let scale = 10;

//world setup
const gravity = planck.Vec2(0.0, 0.0);
const world = planck.World({
    //gravity: gravity,
    allowSleep: true
});
//timestep
const ticksPerSecond = 20.0;
const timeStep = 1.0 / ticksPerSecond;
const velocityIterations = 20;
const positionIterations = 20;

// var leftLimit = -8;
// var rightLimit = (16 * 11) + 8;
// var topLimit = -8 + 32;
// var bottomLimit = (16 * 7);

//map chain edge shape
const mapGridSize = 16 / scale;
const mapGridBaseLength = -0.5;
const mapGridBaseHeigth = 2.9375;
const mapGridLength = 12;
const mapGridHeigth = 6.1875;
//const mapEdgeVertices = [
//    planck.Vec2((mapGridBaseLength)                 * mapGridSize, (mapGridBaseHeigth)                 * mapGridSize),    //top left
//    planck.Vec2((mapGridBaseLength + mapGridLength) * mapGridSize, (mapGridBaseHeigth)                 * mapGridSize),   //top right
//    planck.Vec2((mapGridBaseLength + mapGridLength) * mapGridSize, (mapGridBaseHeigth + mapGridHeigth) * mapGridSize),   //bottom right
//    planck.Vec2((mapGridBaseLength)                 * mapGridSize, (mapGridBaseHeigth + mapGridHeigth) * mapGridSize)     //bottom left
//];
const mapEdgeVertices = [
    planck.Vec2(-8.0 / scale, 20.0 / scale),    //top left
    planck.Vec2(184.0 / scale, 20.0 / scale),   //top right
    planck.Vec2(184.0 / scale, 120.0 / scale),   //bottom right
    planck.Vec2(-8.0 / scale, 120.0 / scale)     //bottom left
];
const mapChain = planck.Chain(mapEdgeVertices, true);
const mapBody = world.createBody({
    type: 'static', //should be moved only applying velocity
    position: planck.Vec2(0, 0), //setup initial position
    angle: 0, //setup initial angle in radians
});
const maxFixiture = mapBody.createFixture({
    shape: mapChain,
    friction: 0,
    restitution: 0
});

//body fixiture initialization
const playerCollisionGroupIndex = -1; //all fixitures of bodies that are in the same negative group wont collide
const rockCollisionGroupIndex = -2; //all fixitures of bodies that are in the same negative group wont collide

const playerCollisionCategoryBits = 0x0002; //category of collision
const rockCollisionCategoryBits = 0x0004; //category of collision

//const collideWithAllMask = 0xFFFF;
//const collideWithAllGroup = 1;

const playerCollisionMaskBits = 0xFFFF ^ playerCollisionCategoryBits; //categories to collide with (all except players themselves)
const rockCollisionMaskBits = 0xFFFF ^ rockCollisionCategoryBits; //categories to collide with (all except rock themselves)


//bodies pointers
const playerBodies = {};
const rockBodies = {};

const rockData = { 1: { 'xy': [100, 40] }, 2: { 'xy': [109, 80] } };
//create rock body
for(const [rockIndex, rockValue] of Object.entries(rockData)) {
    const [x, y] = rockValue["xy"];
    //planck body definition
    const rockBody = world.createBody({
        type: 'static', //should be moved only applying velocity
        position: planck.Vec2(x / scale, y / scale), //setup initial position
        angle: 0.0 * Math.PI, //setup initial angle in radians
        linearDamping: 0, //set to 0 because causes bodies to float
        angularDamping: 0, //set to 0 because causes bodies to float
        gravityScale: 0, //does not apply gravity
        allowSleep: true, //allows the server to remove from calculation when needed
        awake: true, //starts awake
        fixedRotation: true, //disables rotation movement
        bullet: false, //if true increases checks for collisions
        active: true, //if false collisions with this body are completely disabled
        userData: entryKey, //free pointer to use
    });
    //optional mass configuration
    // rockBody.setMassData({
    //     I: 0, //0 disables rotation: 1 rotates normally, 0.1 rotates fast, 1000 rotates slowly
    //     mass: 1, //cannot be 0 for dynamic bodies
    //     center: planck.Vec2(0, 0), //defaults to center of body
    // });
    rockBodies[rockIndex] = rockBody;
    //body shape initialization
    const rockShape = planck.Box(mapGridSize / 2, mapGridSize / 2); //created with half extents

    const rockFixiture = rockBody.createFixture({ //non importa salvare playerFixiture
        shape: rockShape,
        density: 0, //density of the body, used with mass data to calculate weight, with 0 density behaves like it has 0 mass
        friction: 0, //no friction
        restitution: 0, //no restitution when colliding
        isSensor: false, //this is not a sensor
        filterGroupIndex: rockCollisionGroupIndex,
        filterCategoryBits: rockCollisionCategoryBits,
        filterMaskBits: rockCollisionMaskBits
    });

    const rockPosition = rockBody.getPosition();
    rockData[rockIndex]["xy"] = [Math.round(rockPosition.x * scale) , Math.round(rockPosition.y * scale)];
}









const io = require("socket.io")(server, {
    cors: {
        origins: ["https://www.0xbitcoin.xyz", "https://0xbitcoin.xyz", "https://halvening.0xbitcoin.xyz", "http://localhost:3000"],
        methods: ["GET", "POST"]
    }
});

app.get('/', (req, res) => {
    res.send('<h1>Hello world</h1>');
});

io.on("connection", (socket) => {
    let nonce = Math.floor(Math.random() * 1000000000000) + 1;

    socket.emit("authenticate", nonce);

    socket.on("authentication", authData => {
        let entryKey;

        if (authData.address !== "Guest") {
            let sigAddress = checkSignature("By signing this message I confirm that this is my own address\n"+nonce, authData.signature)
    
            if (sigAddress !== authData.address) {
                console.log("Auth failed: " + socket.id);
                socket.emit("err","Signature does not match")
                socket.disconnect();
                return;
            }
            
            console.log("Auth as " + sigAddress + ": " + socket.id);
            entryKey = sigAddress;
    
            const fetchEns = async () => {
                let name = await provider.lookupAddress(entryKey);
                if(name){
                    return name.split('.')[0];
                }else{
                    return false;
                }
                
            }
    
            fetchEns().then((res) => {
                if(res){
                    playerdata[entryKey]["nm"] = res;
                
                    if (!needsUpdating[entryKey]) {
                        needsUpdating[entryKey] = true;
                    }
                }
            });
            
        } else if (authData.address === "Guest") {
            console.log("Auth as guest: " + socket.id);
            entryKey = authData.signature;
        }
    
        if (playerdata[entryKey]) {
            console.log("User already logged in: " + entryKey);
            socket.emit("err","You are already logged in")
            socket.disconnect();
            return;
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
    
        if (!needsUpdating[entryKey]) {
            needsUpdating[entryKey] = true;
        }
            
        //planck body definition
        const playerBody = world.createBody({
            type: 'dynamic', //should be moved only applying velocity
            position: planck.Vec2(
                ((mapGridBaseLength + mapGridLength) * mapGridSize / 2.0), 
                ((mapGridBaseHeigth + mapGridHeigth) * mapGridSize / 2.0)
            ), //setup initial position
            angle: 0.0 * Math.PI, //setup initial angle in radians
            linearDamping: 0, //set to 0 because causes bodies to float
            angularDamping: 0, //set to 0 because causes bodies to float
            gravityScale: 0, //does not apply gravity
            allowSleep: true, //allows the server to remove from calculation when needed
            awake: true, //starts awake
            fixedRotation: true, //disables rotation movement
            bullet: false, //if true increases checks for collisions
            active: true, //if false collisions with this body are completely disabled
            userData: entryKey, //free pointer to use
        });
        //optional mass configuration
        // playerBody.setMassData({
        //     I: 0, //0 disables rotation: 1 rotates normally, 0.1 rotates fast, 1000 rotates slowly
        //     mass: 1, //cannot be 0 for dynamic bodies
        //     center: planck.Vec2(0, 0), //defaults to center of body
        // });
        playerBodies[entryKey] = playerBody;
        //body shape initialization
        const playerShape = planck.Box(mapGridSize / 2, mapGridSize / 2); //created with half extents

        const playerFixiture = playerBody.createFixture({ //non importa salvare playerFixiture
            shape: playerShape,
            density: 0, //density of the body, used with mass data to calculate weight, with 0 density behaves like it has 0 mass
            friction: 0, //no friction
            restitution: 0, //no restitution when colliding
            isSensor: false, //this is not a sensor
            filterGroupIndex: playerCollisionGroupIndex,
            filterCategoryBits: playerCollisionCategoryBits,
            filterMaskBits: playerCollisionMaskBits
        });


        socket.on("ready", () => {
            socket.emit("newmessage", chatMessages);
            socket.emit("rockdata", rockData);
            socket.emit("playerdata", playerdata);

            if (!needsUpdating[entryKey]) {
                needsUpdating[entryKey] = true;
            }
        })

        socket.on("sendmessage", (msg) => {
            if(!msg){
                return;
            }
            
            if (msg.length > 64) {
                console.log(entryKey + "sent a very long message")
                return;
            }

            if (chatMessages.length >= 16) {
                chatMessages.shift()
            }

            let message = filter.clean(msg)
            chatMessages.push([playerdata[entryKey]["nm"], message])
            handleMessage(entryKey, message);
            io.emit("newmessage", chatMessages)
        })

        socket.on("move", (heldDirections) => {
            playerHeldDirections[entryKey] = heldDirections;
        });

        socket.on("disconnect", () => {
            delete playerdata[entryKey];
            delete playerHeldDirections[entryKey];
            delete needsUpdating[entryKey];
            toDelete.push(playerBodies[entryKey])
            delete playerBodies[entryKey];
            io.emit("playerdata", playerdata);
            console.log("Client disconnected: " + socket.id);
        });
    })
});

server.listen(4001, () => {
    console.log('listening on *:4001');
});

let debugPrint = 0;

function gameLoop() {
    for (const [entryKey, value] of Object.entries(playerdata)) {
        const oldData = JSON.stringify(playerdata[entryKey]);
        
        let facingDirection = playerdata[entryKey]["fd"];
        const heldDirections = playerHeldDirections[entryKey];
        const playerBody = playerBodies[entryKey];

        if (heldDirections == null) {
            continue;
        }

        const walkingUD = heldDirections[directions.up] != heldDirections[directions.down];
        const walkingLR = heldDirections[directions.left] != heldDirections[directions.right];
        const walking = walkingUD || walkingLR;
        if (heldDirections && walking) {
            let directionAngle = 0.0;
            if (walkingLR) {
                if (!walkingUD) {
                    if (heldDirections[directions.right] == true) { directionAngle = 0; facingDirection = directions.right }
                    else if (heldDirections[directions.left] == true) { directionAngle = Math.PI; facingDirection = directions.left }
                } else if (walkingUD) {
                    if (heldDirections[directions.right] == true) {
                        if (heldDirections[directions.down] == true) {directionAngle = Math.PI * 1 / 4; facingDirection = directions.right}
                        else if (heldDirections[directions.up] == true) {directionAngle = Math.PI * 7 / 4; facingDirection = directions.right}
                    } 
                    else if (heldDirections[directions.left] == true) {
                        if (heldDirections[directions.down] == true) {directionAngle = Math.PI * 3 / 4; facingDirection = directions.left}
                        else if (heldDirections[directions.up] == true) {directionAngle = Math.PI * 5 / 4; facingDirection = directions.left}
                    }
                }
            } else if (walkingUD) {
                if (heldDirections[directions.down] == true) { directionAngle = Math.PI / 2 }
                else if (heldDirections[directions.up] == true) { directionAngle = Math.PI * 3 / 2 }
            }

            const movementVector = planck.Vec2(Math.cos(directionAngle), Math.sin(directionAngle));
            movementVector.mul(speed*scale);
            playerBody.setLinearVelocity(movementVector); //qui è possibile inizializzare movementVector a player.getLinearVelocity, sommarci i valori e poi fare set
        } else if (!walking) {
            const movementVector = planck.Vec2(0, 0);
            playerBody.setLinearVelocity(movementVector); //qui è possibile inizializzare movementVector a player.getLinearVelocity, sommarci i valori e poi fare set
        }

        // let [x, y] = playerdata[entryKey]["xy"];

        //Limits (gives the illusion of walls)
        // var leftLimit = -8;
        // var rightLimit = (16 * 11) + 8;
        // var topLimit = -8 + 32;
        // var bottomLimit = (16 * 7);
        // if (x < leftLimit) { x = leftLimit; }
        // if (x > rightLimit) { x = rightLimit; }
        // if (y < topLimit) { y = topLimit; }
        // if (y > bottomLimit) { y = bottomLimit; }
        //console.log(entryKey + " moved to " + [x, y]);
        const playerPosition = playerBody.getPosition();
        playerdata[entryKey]["xy"] = [Math.round(playerPosition.x * scale) , Math.round(playerPosition.y * scale)];
        playerdata[entryKey]["fd"] = facingDirection;
        playerdata[entryKey]["wa"] = walking;

        const newData = JSON.stringify(playerdata[entryKey]);
        if (oldData !== newData) {
            if (!needsUpdating[entryKey]) {
                needsUpdating[entryKey] = true;
            }
        }
    }

    if (debugPrint > ticksPerSecond * 1) {
        //console.log(playerdata);
        io.emit("playerdata", playerdata);
        debugPrint = 0;
    }

    let toUpdate = {}
    for (const [entry] of Object.entries(needsUpdating)) {
        if (needsUpdating[entry]) {
            toUpdate[entry] = playerdata[entry];
            needsUpdating[entry] = false;
        }
    }

    if (Object.keys(toUpdate).length > 0) {
        io.emit("playerdataupdate", toUpdate)
    }

    debugPrint++;


    //planck timestep
    world.step(timeStep, velocityIterations, positionIterations);
    //planck clearForces clear forces applied to bodies
    world.clearForces();

    for(const entry of toDelete){
        world.destroyBody(entry);
    }
    toDelete = []

    //TODO: https://github.com/shakiba/planck.js/wiki/World#exploring-the-world
    //fare l'esplorazione al posto del gameloop per aggiornare i playerData (FATTO SOPRA DOVE AGGIORNA LA POSIZIONE DEL PLAYER)

    //TODO: AABB Query per rilevare chi sta in una regione, così gli attacchi che fanno danno ad area vengono rilevati
    //      Un'alterativa potrebbe essere creare un corpo rotate per l'attacco unito al body e rilevare le collisioni per applicare il danno

}

const tickrate = timeStep * 1000;
let intervalId = setInterval(gameLoop, tickrate);


