import React from 'react'
import '../../Game.css';
import { renderRocks } from '../../utils';

const Rocks = ({ rockData }) => {

    if(!rockData){
        return null
    }

    return (
        <>
            {renderRocks(rockData)}
        </>
    )
}

export default Rocks
