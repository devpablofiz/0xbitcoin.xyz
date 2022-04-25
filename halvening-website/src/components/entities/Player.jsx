import '../../Game.css';
import React, { useState, useEffect} from "react";

const Player = ({ socketId, playerdata }) => {

    if(!playerdata || !socketId){
        return
    }

    return (
        <div className='player' id={socketId}>
            <div className="nickname">{playerdata[socketId]["nm"] ? (playerdata[socketId]["nm"]).substring(0,17) : ""}</div>
            <div className="character" facing="down" walking="false">
                <div className="shadow pixel-art"></div>
                <div className="character_spritesheet pixel-art"></div>
            </div>
            <div className="msg">{playerdata[socketId]["msg"] ? (playerdata[socketId]["msg"]).substring(0,42) : ""}</div>
        </div>
    )
}

export default Player
