import React, { useState, useEffect, useRef } from "react";
import { Stack, Button } from 'react-bootstrap';

import socketIOClient from "socket.io-client";
import { Players, Chat } from '../components';

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
   "ArrowUp": directions.up,
   "ArrowLeft": directions.left,
   "ArrowRight": directions.right,
   "ArrowDown": directions.down,
   //wasd
   "KeyW": directions.up,
   "KeyA": directions.left,
   "KeyD": directions.right,
   "KeyS": directions.down,
}



let defaultHeldDirections = {
   [directions.up]: false,
   [directions.left]: false,
   [directions.right]: false,
   [directions.down]: false,
}

let heldDirections = {...defaultHeldDirections};

const Game = ({
	provider,
	loadWeb3Modal,
	logoutOfWeb3Modal,
	account,
	chain,
   ensName
}) => {
   const [playerdata, setPlayerData] = useState(null);
   const [socketId, setSocketId] = useState(null);
   const [socket, setSocket] = useState(null);

   const camera = useRef(null);
   const map = useRef(null);

   function handleFocusOut(){
      heldDirections = {...defaultHeldDirections};
      socket.emit("move",heldDirections)
   }

   function handleKeyDown(e){
      updateMovement(e.code, true);
   }

   function handleKeyUp(e){
      updateMovement(e.code, false);
   }

   function updateMovement(keyCode, isPressed) {
      if (socket == null || playerdata == null) {
         return;
      }
      let direction = keys[keyCode];
      if (direction == null) {
         return;
      }
      if (heldDirections[direction] === isPressed) {
         //sono già nella situazione giusta, non c'è bisogno di inviare nulla al server
         return;
      } else {
         //devo dire al server che sono cambiati i tasti premuti
         heldDirections[direction] = isPressed;
         
         socket.emit("move", heldDirections);
      }
   }

   useEffect(() => {
		if (provider !== undefined) {
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
         setTimeout(() => camera.current.focus(), 2000);
      }

   }, [account]);

   useEffect(() => {
      const placeCharacters = () => {
         let pixelSize = parseInt(
            getComputedStyle(document.documentElement).getPropertyValue('--pixel-size')
         );

         let camera_left = pixelSize * 66;
         let camera_top = pixelSize * 42;

         map.current.style.transform = `translate3d( ${-x * pixelSize + camera_left}px, ${-y * pixelSize + camera_top}px, 0 )`;

         for (const [currentSocketId] of Object.entries(playerdata)) {
            let [x, y] = playerdata[currentSocketId]["xy"];
            let facingDirection = playerdata[currentSocketId]["fd"];
            let walking = playerdata[currentSocketId]["wa"];
            let player = document.getElementById(currentSocketId);
            if (player) {
               player.style.transform = `translate3d( ${x * pixelSize}px, ${y * pixelSize}px, 0 )`;
               player.style.zIndex = y;
               player.setAttribute("facing", facingDirection);
               player.setAttribute("walking", walking);
            }
         }
      }

      let x, y;
      if (playerdata) {
         x = playerdata[socketId]["xy"][0];
         y = playerdata[socketId]["xy"][1];
      }

      if (map && playerdata && map.current) {
         placeCharacters();
      }

   }, [playerdata, map, socketId])

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

               <div onKeyDown={handleKeyDown} onKeyUp={handleKeyUp} onBlur={handleFocusOut} ref={camera} tabIndex="0" className="camera mt-5">
                  <div className="map pixel-art" ref={map}>
                     <Players playerdata={playerdata} localsocket={socketId} />
                  </div>
               </div>
            <Chat socket={socket} camera={camera} />
         </div>
      )
   } else {
      return (
         <div className="App-body">
            {"Loading..."}
         </div>
      )
   }

};
export default Game;
