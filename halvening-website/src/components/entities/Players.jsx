import React from 'react'
import '../../Game.css';

function renderCharacters(playerdata) {
    let divs = [];
    for (const [key] of Object.entries(playerdata)) {
        divs.push(
            <div key={key} id={key} className="character" facing="down" walking="false">
                <div className="msg">{playerdata[key]["msg"] ? (playerdata[key]["msg"]).substring(0,42) : ""}</div>
                <div className="nickname">{playerdata[key]["nm"] ? (playerdata[key]["nm"]).substring(0,17) : ""}</div>
                <div className="shadow pixel-art"></div>
                <div className="character_spritesheet pixel-art"></div>
            </div>
        )
    }
    return divs;
}

const Players = ({ playerdata }) => {
    return (
        <>
            {renderCharacters(playerdata)}
        </>
    )
}

export default Players
