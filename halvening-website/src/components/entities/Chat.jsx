import '../../Game.css';
import React from "react";
import {renderMessages} from '../../utils';
import {ChatButton} from '../../components'

const Chat = ({ chatData, socket, camera, nickName }) => {

    if(!chatData){
        return null;
    }else{
        return (
            <div className='chat'>
                <ChatButton socket={socket} camera={camera} nickName={nickName}/>
                <div>
                    {renderMessages(chatData)}
                </div>
            </div>
        );
    }
}

export default Chat
