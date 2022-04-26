import React from 'react'
import '../../Game.css';
import { renderCharacters } from '../../utils';

const Players = ({ playerData }) => {
    return (
        <>
            {playerData ? renderCharacters(playerData) : <></>}
        </>
    )
}

export default Players
