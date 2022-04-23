import React, { useState, useEffect} from "react";
import socketIOClient from "socket.io-client";
import {Enemies} from '../components'

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
   38: directions.up,
   37: directions.left,
   39: directions.right,
   40: directions.down,
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
         console.log(JSON.stringify(data));
         console.log("socket: "+JSON.stringify(socket.id));
         setSocketId(socket.id);
         setPlayerData(data);
      });
   },[]);

   let held_directions = []; //State of which arrow keys we are holding down

   document.onkeydown = startMovement;
   document.onkeyup = stopMovement;

   function startMovement(e) {
      e = e || window.event;
      socket.emit("move",e.keyCode);
   }

   function stopMovement(e) {
      e = e || window.event;
      socket.emit("stop",e.keyCode);
   }

   document.addEventListener("keydown", (e) => {
      let dir = keys[e.which];
      if (dir && held_directions.indexOf(dir) === -1) {
         held_directions.unshift(dir)
      }
   })
   
   document.addEventListener("keyup", (e) => {
      let dir = keys[e.which];
      let index = held_directions.indexOf(dir);
      if (index > -1) {
         held_directions.splice(index, 1)
      }
   });

	useEffect(() => {
      if(!character || !map){
         setCharacter(document.querySelector(".character"));
         //setNpcCharacter(document.querySelector(".npc-character"));
         setMap(document.querySelector(".map"));
      }
      
      const animateMovement = () => {
         const held_direction = held_directions[0];
         if (held_direction) {
            character.setAttribute("facing", held_direction);
         }
         character.setAttribute("walking", held_direction ? "true" : "false");
      }


      //Set up the game loop
      const step = () => {
         animateMovement();
         window.requestAnimationFrame(() => {
            step();
         })
      }

      if(character && map){
         step(); //kick off the first step!
      }

   },[character, map]);
   
   useEffect(()=>{
      if(!character || !map){
         setCharacter(document.querySelector(".character"));
         //setNpcCharacter(document.querySelector(".npc-character"));
         setMap(document.querySelector(".map"));
      }
      let x,y;
      if(!playerdata){
         
      }else{
         console.log(JSON.stringify(playerdata))
         x = playerdata[socketId]["xy"][0];
         y = playerdata[socketId]["xy"][1];
      }

      const placeCharacters = () => {
         let pixelSize = parseInt(
            getComputedStyle(document.documentElement).getPropertyValue('--pixel-size')
         );

         //Limits (gives the illusion of walls)
         let leftLimit = -8;
         let rightLimit = (16 * 11)+8;
         let topLimit = -8 + 32;
         let bottomLimit = (16 * 7);
         if (x < leftLimit) { x = leftLimit; }
         if (x > rightLimit) { x = rightLimit; }
         if (y < topLimit) { y = topLimit; }
         if (y > bottomLimit) { y = bottomLimit; }
   
         let camera_left = pixelSize * 66;
         let camera_top = pixelSize * 42;
   
         map.style.transform = `translate3d( ${-x*pixelSize+camera_left}px, ${-y*pixelSize+camera_top}px, 0 )`;
         character.style.transform = `translate3d( ${x*pixelSize}px, ${y*pixelSize}px, 0 )`;  
         for (const [key,value] of Object.entries(playerdata)){
            if(key !== socketId){
               let [x,y] = playerdata[key];
               let enemy = document.getElementById(key);
               if(enemy){
                  enemy.style.transform = `translate3d( ${x*pixelSize}px, ${y*pixelSize}px, 0 )`; 
               }
            }
        }
      }

      if(character && map && playerdata){
         placeCharacters();
      }

   },[playerdata, character, map])


   if(socketId && playerdata){
      return (
         <div className="game-body">
            <div className="frame">
               <div className="corner_topleft"></div>
               <div className="corner_topright"></div>
               <div className="corner_bottomleft"></div>
               <div className="corner_bottomright"></div>
               <div className="camera">
                  <div className="map pixel-art">          
                     <Enemies playerdata={playerdata} localsocket={socketId}/>    
                     <div className="character" facing="down" walking="true">
                        <div className="shadow pixel-art"></div>
                        <div className="character_spritesheet pixel-art"></div>
                     </div>
                  </div>    
               </div>
            </div>
         </div>
      )
   }else{
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
