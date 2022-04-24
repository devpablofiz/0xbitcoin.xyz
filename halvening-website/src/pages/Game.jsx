import React, { useState, useEffect, useRef } from "react";
import {Stack,Button} from 'react-bootstrap';

import socketIOClient from "socket.io-client";
import { Enemies,Chat } from '../components';

import '../Game.css';
import '../App.css';

//const ENDPOINT = "http://localhost:4001";

const ENDPOINT = "https://0xbitcoin.xyz:4001";

/* Direction key state */
const directions = {
   up: "up",
   down: "down",
   left: "left",
   right: "right"
}

const keys = {
   //arrows
   // 38: directions.up,
   // 37: directions.left,
   // 39: directions.right,
   // 40: directions.down,
   "ArrowUp": directions.up,
   "ArrowLeft": directions.left,
   "ArrowRight": directions.right,
   "ArrowDown": directions.down,
   //wasd
   // 87: directions.up,
   // 65: directions.left,
   // 68: directions.right,
   // 83: directions.down,
   "KeyW": directions.up,
   "KeyA": directions.left,
   "KeyD": directions.right,
   "KeyS": directions.down,
}

function updateMovement(keyCode, isPressed, socket, playerdata) {
   //console.log(keyCode+"-"+isPressed+"-"+JSON.stringify(heldDirections));
   //console.log(socket);
   //console.log(playerdata);
   if (socket == null || playerdata == null) {
      return;
   }
   let direction = keys[keyCode];
   //console.log(direction+"-"+heldDirections[direction]+"-"+keyCode);
   //console.log(direction);
   if (direction == null) {
      return;
   }
   if (heldDirections[direction] === isPressed) {
      //sono già nella situazione giusta, non c'è bisogno di inviare nulla al server
      return;
   } else {
      // if (isPressed === true) {
      //    facingDirection = direction;
      // }
      // walking = heldDirections[directions.up] !== heldDirections[directions.down] || heldDirections[directions.left] !== heldDirections[directions.right];
      //devo dire al server che sono cambiati i tasti premuti
      heldDirections[direction] = isPressed;
      
      socket.emit("move", heldDirections);
   }
}



let defaultHeldDirections = {
   [directions.up]: false,
   [directions.left]: false,
   [directions.right]: false,
   [directions.down]: false,
}

// let held_directions = []; //State of which arrow keys we are holding down
let heldDirections = {...defaultHeldDirections};


const Game = ({
	provider,
	loadWeb3Modal,
	logoutOfWeb3Modal,
	account,
	chain,
   ensName
}) => {
   const [character, setCharacter] = useState(null);
   const [map, setMap] = useState(null);

   const [playerdata, setPlayerData] = useState(null);
   const [socketId, setSocketId] = useState(null);
   const [socket, setSocket] = useState(null);

   const camera = useRef(null);

   useEffect(() => {
		if (provider !== undefined) {
			provider.on("chainChanged", logoutOfWeb3Modal);
			provider.on("accountsChanged", logoutOfWeb3Modal);
      }
	}, [provider]);   

	useEffect(() => {
		if (ensName != null && ensName.name != null && socket) {
         socket.emit("setdisplayname", ensName.name);
		}
	}, [ensName,socket]);

   useEffect(() => {
      if(!account){
         return;
      }
      const IOsocket = socketIOClient(ENDPOINT);
      setSocket(IOsocket);
      IOsocket.emit("setdisplayname",account.substring(0,10))
      IOsocket.on("playerdata", data => {
         if(!socketId){
            setSocketId(IOsocket.id);
         }
         setPlayerData(data);
      });

      if(camera){
         setTimeout(() => camera.current.focus(), 300);
      }

   }, [account]);

   useEffect(()=>{
      if(camera == null || socket == null || playerdata == null){
         return;
      }

      camera.current.addEventListener("focusout", (e) => {
         //console.log("keydown")
         heldDirections = {...defaultHeldDirections};
         socket.emit("move",heldDirections)
      });

      camera.current.addEventListener("keydown", (e) => {
         //console.log("keydown")
         updateMovement(e.code, true, socket, playerdata);
      });
   
      camera.current.addEventListener("keyup", (e) => {
         //console.log("keyup")
         updateMovement(e.code, false, socket, playerdata);
      });
   },[camera, socket, playerdata])

   useEffect(() => {
      if (!character || !map) {
         setCharacter(document.getElementById(socketId));
         setMap(document.querySelector(".map"));
      }
      let x, y;
      if (playerdata) {
         x = playerdata[socketId]["xy"][0];
         y = playerdata[socketId]["xy"][1];
      }

      const placeCharacters = () => {
         let pixelSize = parseInt(
            getComputedStyle(document.documentElement).getPropertyValue('--pixel-size')
         );

         //Limits (gives the illusion of walls)
         let leftLimit = -8;
         let rightLimit = (16 * 11) + 8;
         let topLimit = -8 + 32;
         let bottomLimit = (16 * 7);
         if (x < leftLimit) { x = leftLimit; }
         if (x > rightLimit) { x = rightLimit; }
         if (y < topLimit) { y = topLimit; }
         if (y > bottomLimit) { y = bottomLimit; }

         let camera_left = pixelSize * 66;
         let camera_top = pixelSize * 42;

         map.style.transform = `translate3d( ${-x * pixelSize + camera_left}px, ${-y * pixelSize + camera_top}px, 0 )`;
         character.style.transform = `translate3d( ${x * pixelSize}px, ${y * pixelSize}px, 0 )`;
         character.style.zIndex = y;
         character.setAttribute("facing", playerdata[socketId]["fd"]);
         character.setAttribute("walking", playerdata[socketId]["wa"]);
         for (const [currentSocketId] of Object.entries(playerdata)) {
            if (currentSocketId !== socketId) {
               let [x, y] = playerdata[currentSocketId]["xy"];
               let facingDirection = playerdata[currentSocketId]["fd"];
               let walking = playerdata[currentSocketId]["wa"];
               let enemy = document.getElementById(currentSocketId);
               if (enemy) {
                  enemy.style.transform = `translate3d( ${x * pixelSize}px, ${y * pixelSize}px, 0 )`;
                  enemy.style.zIndex = y;
                  enemy.setAttribute("facing", facingDirection);
                  enemy.setAttribute("walking", walking);
               }
            }
         }
      }

      if (character && map && playerdata) {
         placeCharacters();
      }

   }, [playerdata, character, map, socketId])

	if(!provider){
		return (
			<div className="App-body">
				<h1 className='mt-5'>🛒🛒🛒</h1>
				<h2 className="mt-3">Connect to play</h2>
				<Stack direction="vertical" gap={3} className="col-md-2 mt-4 mx-auto">
					  <Button variant="dark" onClick={!provider ? loadWeb3Modal : logoutOfWeb3Modal}>{!account ? "🔌 Connect Wallet 🔌" : "Disconnect Wallet"}</Button>
				</Stack>
			</div>
		)
	}

   if (socketId && playerdata) {
      return (
         <div className="App-body">
               <div className="corner_topleft"></div>
               <div className="corner_topright"></div>
               <div className="corner_bottomleft"></div>
               <div className="corner_bottomright"></div>

               <div id="camera" autoFocus ref={camera} tabIndex="0" className="camera mt-5">
                  <div className="map pixel-art">
                     <Enemies playerdata={playerdata} localsocket={socketId} />
                     <div className="character" facing="down" walking="true" id={socketId}>
                        <div className="msg ">{playerdata[socketId]["msg"] ? (playerdata[socketId]["msg"]).substring(0,42) : ""}</div>
                        <div className="nickname g-4">{playerdata[socketId]["nm"] ? (playerdata[socketId]["nm"]).substring(0,17) : ""}</div>
                        <div className="shadow pixel-art"></div>
                        <div className="character_spritesheet pixel-art"></div>
                     </div>
                  </div>
               </div>
               <Chat socket={socket} camera={camera}/>
         </div>
      )
   } else {
      return (
         <div className="App-body">
            <div className="frame">
               <div className="corner_topleft"></div>
               <div className="corner_topright"></div>
               <div className="corner_bottomleft"></div>
               <div className="corner_bottomright"></div>
               <div id="camera" className="camera mt-5">
                  <div className="map pixel-art">
                  </div>
               </div>
            </div>
         </div>
      )
   }

};
export default Game;
