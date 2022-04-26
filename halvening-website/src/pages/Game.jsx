import React, { useState, useEffect, useRef } from "react";
import { Stack, Button } from 'react-bootstrap';

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
   const [nickName, setNickName] = useState(null);
   const [socket, setSocket] = useState(null);
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

   useEffect(() => {
      if (ensName != null && ensName.name != null && socket) {
         socket.emit("setdisplayname", ensName.name.split('.')[0]);
         setNickName(ensName.name.split('.')[0]);
      } else if (ensName != null && ensName.name == null && socket) {
         socket.emit("setdisplayname", account.substring(0, 10))
         setNickName(account.substring(0, 10));
      } else if (isGuest && socket) {
         socket.emit("setdisplayname", nickName);
      }
   }, [ensName, socket, account, isGuest, nickName]);

   useEffect(() => {
      if (!account && !isGuest) {
         return;
      }
      const IOsocket = socketIOClient(ENDPOINT);
      setSocket(IOsocket);

      IOsocket.on("newmessage", chat => {
         setChatData(chat)
      })

   }, [account, isGuest]);

   if (!provider && !nickName) {
      return (
         <div className="App-body">
            <h1 className='mt-5'>🛒🛒🛒</h1>
            <h2 className="mt-3">Connect to play</h2>
            <Stack direction="vertical" gap={3} className="col-md-2 mt-4 mx-auto">
               <Button variant="dark" onClick={loadWeb3Modal}>{"🔌 Connect Wallet 🔌"}</Button>
               <Button variant="dark" onClick={() => { setNickName("guest-" + randomFourDigit()); setIsGuest(true) }}>{"Play as Guest"}</Button>
            </Stack>
         </div>
      )
   }

   if (socket) {
      return (
         <div className="App-body">
            <div className="corner_topleft"></div>
            <div className="corner_topright"></div>
            <div className="corner_bottomleft"></div>
            <div className="corner_bottomright"></div>
            <div className="container-game">
               <Camera socket={socket} focusChat={focusChat} ref={cameraRef} />
               <Chat socket={socket} chatData={chatData} nickName={nickName} focusCamera={focusCamera} ref={chatRef} />
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
