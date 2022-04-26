import React from 'react'
import '../../Game.css';
import { renderCharacters } from '../../utils';

const Players = ({ playerdata }) => {
    return (
        <>
            {renderCharacters(playerdata)}
        </>
    )
}

export default Players
