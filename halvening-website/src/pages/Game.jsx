import React, { useState, useEffect } from "react";
import socketIOClient from "socket.io-client";
import { Enemies } from '../components'

import '../Game.css';

const ENDPOINT = "http://localhost:4001";

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
   "w": directions.up,
   "a": directions.left,
   "s": directions.right,
   "d": directions.down,
}

const Game = () => {
   const [character, setCharacter] = useState(null);
   const [map, setMap] = useState(null);

   const [playerdata, setPlayerData] = useState(null);
   const [socketId, setSocketId] = useState(null);
   const [socket, setSocket] = useState(null);

   useEffect(() => {
      const socket = socketIOClient(ENDPOINT);
      setSocket(socket);
      socket.on("playerdata", data => {
         setSocketId(socket.id);
         setPlayerData(data);
      });
   }, []);

   // let held_directions = []; //State of which arrow keys we are holding down
   let heldDirections = {
      [directions.up]: false,
      [directions.left]: false,
      [directions.right]: false,
      [directions.down]: false,
   }
   let facingDirection = directions.down;
   let walking = false;


   // document.onkeydown = startMovement;
   // document.onkeyup = stopMovement;

   // function startMovement(e) {
   //    e = e || window.event;
   //    socket.emit("move",e.keyCode);
   // }

   // function stopMovement(e) {
   //    e = e || window.event;
   //    socket.emit("stop",e.keyCode);
   // }

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
         // if (isPressed === true) {
         //    facingDirection = direction;
         // }
         // walking = heldDirections[directions.up] !== heldDirections[directions.down] || heldDirections[directions.left] !== heldDirections[directions.right];
         //devo dire al server che sono cambiati i tasti premuti
         heldDirections[direction] = isPressed;
         socket.emit("move", heldDirections);
      }
   }

   document.addEventListener("keydown", (e) => {
      updateMovement(e.code, true);

      // if (held_directions.indexOf(dir) === -1) {
      //    held_directions.unshift(dir);
      // }
   })

   document.addEventListener("keyup", (e) => {
      updateMovement(e.code, false);

      // let dir = keys[e.code];
      // let index = held_directions.indexOf(dir);
      // if (index > -1) {
      //    held_directions.splice(index, 1)
      // }
   });

   useEffect(() => {
      if (!character || !map) {
         setCharacter(document.querySelector(".character"));
         //setNpcCharacter(document.querySelector(".npc-character"));
         setMap(document.querySelector(".map"));
      }

      const animateMovement = () => {
         // character.setAttribute("facing", facingDirection);
         // character.setAttribute("walking", walking);

         // const held_direction = held_directions[0];
         // if (held_direction) {
         // }
      }


      //Set up the game loop
      const step = () => {
         animateMovement();
         window.requestAnimationFrame(() => {
            step();
         });
      }

      if (character && map) {
         step(); //kick off the first step!
      }

   }, [character, map]);

   useEffect(() => {
      if (!character || !map) {
         setCharacter(document.querySelector(".character"));
         //setNpcCharacter(document.querySelector(".npc-character"));
         setMap(document.querySelector(".map"));
      }
      let x, y;
      if (!playerdata) {

      } else {
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
         character.setAttribute("facing", playerdata[socketId]["fd"]);
         character.setAttribute("walking", playerdata[socketId]["wa"]);
         for (const [currentSocketId, value] of Object.entries(playerdata)) {
            if (currentSocketId !== socketId) {
               let [x, y] = playerdata[currentSocketId]["xy"];
               let facingDirection = playerdata[currentSocketId]["fd"];
               let walking = playerdata[currentSocketId]["wa"];
               let enemy = document.getElementById(currentSocketId);
               if (enemy) {
                  enemy.style.transform = `translate3d( ${x * pixelSize}px, ${y * pixelSize}px, 0 )`;
                  enemy.setAttribute("facing", facingDirection);
                  enemy.setAttribute("walking", walking);
               }
            }
         }
      }

      if (character && map && playerdata) {
         placeCharacters();
      }

   }, [playerdata, character, map])


   if (socketId && playerdata) {
      return (
         <div className="game-body">
            <div className="frame">
               <div className="corner_topleft"></div>
               <div className="corner_topright"></div>
               <div className="corner_bottomleft"></div>
               <div className="corner_bottomright"></div>
               <div className="camera">
                  <div className="map pixel-art">
                     <Enemies playerdata={playerdata} localsocket={socketId} />
                     <div className="character" facing="down" walking="true" id={socketId}>
                        <div className="shadow pixel-art"></div>
                        <div className="character_spritesheet pixel-art"></div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      )
   } else {
      return (
         <div className="game-body">
            <div className="frame">
               <div className="corner_topleft"></div>
               <div className="corner_topright"></div>
               <div className="corner_bottomleft"></div>
               <div className="corner_bottomright"></div>
               <div className="camera">
                  <div className="map pixel-art">
                  </div>
               </div>
            </div>
         </div>
      )
   }

};
export default Game;
