import '../../Game.css';
import React from "react";

const Player = ({ socketId, playerData }) => {

    if(!playerData || !socketId){
        return
    }

    return (
        <div className='player' id={socketId+"-player"}>
            <div className="nickname">{playerData[socketId]["nm"] ? (playerData[socketId]["nm"]).substring(0, 17) : ""}
                <div className='bar'></div>
            </div>
            <div className="character" facing="down" walking="false" id={socketId+"-character"}>
                <div className="shadow pixel-art"></div>
                <div className="character_spritesheet pixel-art"></div>
            </div>
            <div className="msg">{playerData[socketId]["msg"] ? playerData[socketId]["msg"] : ""}</div>
        </div>
    )
}

export default Player
