import '../../Game.css';
import React from "react";

function renderMessages(chatData){
    let toRender = [];

    for (const message of chatData) {
        toRender.push(
            <p key={toRender.length}>{<span>{message[0] + ":"}</span>}{" " + message[1]}</p>
        )
    }

    return (
        <div className='chat'>
            <div>
            {toRender}
            </div>
        </div>
    )
}

const Chat = ({ chatData }) => {

    if(!chatData){
        return null;
    }else{
        return renderMessages(chatData);
    }


}

export default Chat
