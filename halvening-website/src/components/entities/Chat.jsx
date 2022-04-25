import '../../Game.css';
import React from "react";

function renderMessages(chatData) {
    let toRender = [];

    for (const message of chatData) {
        toRender.push(
            <p key={toRender.length}>{<span>{message[0] + ":"}</span>}{" " + message[1]}</p>
        )
    }
    return toRender;
}

const Chat = ({ chatData }) => {
    if(!chatData){
        return null;
    }

    return (
        <div className='chat'>
            {renderMessages(chatData)}
        </div>
    )
}

export default Chat
