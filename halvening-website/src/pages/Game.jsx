import React, { useState, useEffect, useRef } from "react";
import { Stack, Button } from 'react-bootstrap';

import socketIOClient from "socket.io-client";
import { Players, Chat } from '../components';
import {randomFourDigit} from '../utils'

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

const controls = {
   openChat: "openChat"
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

const otherKeys ={
   //chat controls
   "Enter": controls.openChat
}


let defaultHeldKeys = {
   [directions.up]: false,
   [directions.left]: false,
   [directions.right]: false,
   [directions.down]: false,
   [controls.openChat] : false
}

let heldKeys = {...defaultHeldKeys};

const Game = ({
	provider,
	loadWeb3Modal,
	logoutOfWeb3Modal,
	account,
	chain,
   ensName
}) => {
   const [playerdata, setPlayerData] = useState(null);
   const [chatData, setChatData] = useState(null);

   const [nickName, setNickName] = useState(null);

   const [socketId, setSocketId] = useState(null);
   const [socket, setSocket] = useState(null);

   const [isGuest, setIsGuest] = useState(false);

   const camera = useRef(null);
   const map = useRef(null);
   const chat = useRef(null);

   function handleFocusOut(){
      heldKeys = {...defaultHeldKeys};
      socket.emit("move",heldKeys)
   }

   function handleKeyDown(e){
      if(chat.current !== document.activeElement){
         updateControls(e.code, true);
      }
      
   }

   function handleKeyUp(e){
      if(chat.current !== document.activeElement){
         updateControls(e.code, false);
      }
   }

   function handleCommands(command){
      if(command === controls.openChat){
         chat.current.focus()
      }
   }

   function updateControls(keyCode, isPressed) {
      if (socket == null || playerdata == null) {
         return;
      }
      let direction = keys[keyCode];

      //se non è una direzione
      if (direction == null) {
         let command = otherKeys[keyCode];
         //se non è un'altro comando
         if(command == null){
            return;
         }

         if(heldKeys[command] === isPressed){
            return;
         }else{
            heldKeys[command] = isPressed;
            handleCommands(command);
         }

      }

      if (heldKeys[direction] === isPressed) {
         //sono già nella situazione giusta, non c'è bisogno di inviare nulla al server
         return;
      } else {
         //devo dire al server che sono cambiati i tasti premuti
         heldKeys[direction] = isPressed;
         
         socket.emit("move", heldKeys);
      }
   }

   useEffect(() => {
		if (provider !== undefined) {
			provider.on("accountsChanged", logoutOfWeb3Modal);
      }
      // eslint-disable-next-line
	}, [provider]);   

	useEffect(() => {
		if (ensName != null && ensName.name != null && socket) {
         socket.emit("setdisplayname", ensName.name.split('.')[0]);
         setNickName(ensName.name.split('.')[0]);
		}else if(ensName != null && ensName.name == null && socket){
         socket.emit("setdisplayname",account.substring(0,10))
         setNickName(account.substring(0,10));
      }else if(isGuest && socket){
         socket.emit("setdisplayname",nickName);
      }
	}, [ensName, socket, account, isGuest, nickName]);

   useEffect(() => {
      if(!account && !isGuest){
         return;
      }
      const IOsocket = socketIOClient(ENDPOINT);
      setSocket(IOsocket);

      IOsocket.on("playerdata", data => {
         if(!socketId){
            setSocketId(IOsocket.id);
         }
         setPlayerData(data);
      });

      IOsocket.on("newmessage", chat => {
         setChatData(chat)
      })

      if(camera){
         setTimeout(() => camera.current.focus(), 1000);
      }
   // eslint-disable-next-line   
   }, [account, isGuest]);

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
            let player = document.getElementById(currentSocketId+"-player");
            let character = document.getElementById(currentSocketId+"-character");
            if (player && character) {
               player.style.transform = `translate3d( ${x * pixelSize}px, ${y * pixelSize}px, 0 )`;
               player.style.zIndex = y;
               character.setAttribute("facing", facingDirection);
               character.setAttribute("walking", walking);
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

	if(!provider && !nickName){
		return (
			<div className="App-body">
				<h1 className='mt-5'>🛒🛒🛒</h1>
				<h2 className="mt-3">Connect to play</h2>
				<Stack direction="vertical" gap={3} className="col-md-2 mt-4 mx-auto">
					  <Button variant="dark" onClick={loadWeb3Modal}>{"🔌 Connect Wallet 🔌"}</Button>
                 <Button variant="dark" onClick={() => {setNickName("guest-"+randomFourDigit()); setIsGuest(true)}}>{"Play as Guest"}</Button>
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

            <div className="camera mt-5" onKeyDown={handleKeyDown} onKeyUp={handleKeyUp} onBlur={handleFocusOut} ref={camera} tabIndex="0">
               <Chat chatData={chatData} socket={socket} camera={camera} nickName={nickName} ref={chat}/>
               <div className="map pixel-art" ref={map}>
                  <Players playerdata={playerdata} localsocket={socketId}/>
               </div>
            </div>
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
