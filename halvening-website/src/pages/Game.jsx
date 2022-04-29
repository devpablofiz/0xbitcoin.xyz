import React, { useState, useEffect, useRef } from "react";
import { Stack, Button } from 'react-bootstrap';

import { Web3Provider } from "@ethersproject/providers";
import socketIOClient from "socket.io-client";
import { Chat, Camera } from '../components';
import { randomFourDigit } from '../utils'

import '../Game.css';
import '../App.css';

//const ENDPOINT = "http://localhost:4001";

const ENDPOINT = "https://0xbitcoin.xyz:4001";

const Game = ({
   provider,
   loadWeb3Modal,
   logoutOfWeb3Modal,
   account,
   chain,
   ensName
}) => {

   const [chatData, setChatData] = useState(null);
   const [identifier, setIdentifier] = useState(null);
   const [socket, setSocket] = useState(null);

   const [isConnected, setIsConnected] = useState(null)

   const [isGuest, setIsGuest] = useState(false);

   const chatRef = useRef(null);
   const cameraRef = useRef(null);

   function focusChat() {
      chatRef.current.focus();
   }

   function focusCamera() {
      cameraRef.current.focus();
   }

   useEffect(() => {
      if (provider !== undefined) {
         provider.on("accountsChanged", logoutOfWeb3Modal);
      }
   }, [provider]);

   useEffect(()=>{
      let IOsocket;
      const authenticate = async (msg, address) => {
         IOsocket = socketIOClient(ENDPOINT,{
            auth:{
               signature: msg,
               address: address
            }
         });
         setSocket(IOsocket);
         setIdentifier(msg)
         
         IOsocket.on("newmessage", chat => {
            setChatData(chat);
         })
   
         IOsocket.on("connect", () => {
            setIsConnected(true)
         })
   
         IOsocket.on("disconnect", () => {
            setIsConnected(false)
         })
      }

      if(isGuest){
         authenticate("guest-"+randomFourDigit(),"Guest")
      }

      return () => {
         if(IOsocket){
            IOsocket.disconnect()
         }
      }

   },[isGuest])

   useEffect(()=>{
      let IOsocket;
      const authenticate = async (msg, address) => {
         const web3Provider = new Web3Provider(provider).getSigner();
         
         let signedMsg = await web3Provider.signMessage(msg, address)

         IOsocket = socketIOClient(ENDPOINT,{
            auth:{
               signature: signedMsg,
               address: address
            }
         });
         setSocket(IOsocket);
         setIdentifier(address)

         IOsocket.on("newmessage", chat => {
            setChatData(chat);
         })
   
         IOsocket.on("connect", () => {
            setIsConnected(true)
         })
   
         IOsocket.on("disconnect", () => {
            setIsConnected(false)
         })
      }

      if(account){
         setIsGuest(false)
         authenticate("By signing this message I confirm that this is my own address", account)
      }

      return () => {
         if(IOsocket){
            IOsocket.disconnect()
         }
      }

   },[account])

   if (!provider && !isGuest) {
      return (
         <div className="Game-body">
            <h1 className='mt-5'>🛒🛒🛒</h1>
            <h2 className="mt-3">Connect to play</h2>
            <Stack direction="vertical" gap={3} className="col-md-2 mt-4 mx-auto">
               <Button variant="dark" onClick={loadWeb3Modal}>{"🔌 Connect Wallet 🔌"}</Button>
               <Button variant="dark" onClick={() => { setIsGuest(true) }}>{"Play as Guest"}</Button>
            </Stack>
         </div>
      )
   }

   if (socket && !isConnected) {
      return (
         <div className="App-body">
            <div className="pixel-font mt-5">
               <p>{"There was an error while connecting to the game servers"}</p>
            </div>
         </div>
      )
   } else if(socket && isConnected){
      return (
         <div className="Game-body">
            <div className="container-game">
               <Camera socket={socket} focusChat={focusChat} identifier={identifier} isConnected={isConnected} ref={cameraRef} />
               <Chat socket={socket} chatData={chatData} focusCamera={focusCamera} ref={chatRef} />
            </div>
         </div>
      )
   }else {
      return (
         <div className="App-body">
            <div className="pixel-font mt-5">
               <p>{"Loading..."}</p>
            </div>
         </div>
      )
   }

};

export default Game;
