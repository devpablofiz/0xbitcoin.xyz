const socketIOClient = require("socket.io-client");
const ENDPOINT = "https://0xbitcoin.xyz:4001";

const randomFourDigit = () => {
    const val = Math.floor(1000 + Math.random() * 9000);

    return val;
}

const directions = {
    up: "up",
    down: "down",
    left: "left",
    right: "right"
}

let defaultHeldKeys = {
    [directions.up]: false,
    [directions.left]: false,
    [directions.right]: false,
    [directions.down]: false
}
let i;

const authenticate = (msg, address) => {

    function moveRandom(socket) {
        let heldKeys = { ...defaultHeldKeys };
        for (const [directions] of Object.entries(heldKeys)) {
            if (Math.round(Math.random() * 1)) {
                heldKeys[directions] = Math.round(Math.random() * 1)
            }
        }
        socket.emit("move", heldKeys);
        if (Math.round(Math.random() * 1)) {
            socket.emit("sendmessage","Beep to the boop mfer")
        }
        
    }

    const IOsocket = socketIOClient(ENDPOINT, {
    });

    IOsocket.on("connect", () => {
        console.log("connected " + IOsocket.id);
    })

    IOsocket.on("authenticate", () => {
        let auth = { signature: msg, address: address }
        console.log(JSON.stringify(auth));
        IOsocket.emit("authentication", auth)
        setInterval(() => moveRandom(IOsocket), 1000);
    })

    //IOsocket.on("err", err => {
    //   setError(err);
    //})
    //
    //IOsocket.on("newmessage", chat => {
    //   setChatData(chat);
    //})
    //

    //
    //IOsocket.on("disconnect", (err) => {
    //   setIsConnected(false)
    //})
}

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

async function test() {
    for(i = 0; i < 100; i++){
        await delay(1000);
        authenticate("bot-" + i, "Guest");
    }
}

test()





