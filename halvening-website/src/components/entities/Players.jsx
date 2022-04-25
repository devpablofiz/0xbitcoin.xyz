import React from 'react'
import '../../Game.css';
import Player from './Player'

function renderCharacters(playerdata) {
    let divs = [];
    for (const [key] of Object.entries(playerdata)) {
        divs.push(
            <Player socketId={key} playerdata={playerdata}/>
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
