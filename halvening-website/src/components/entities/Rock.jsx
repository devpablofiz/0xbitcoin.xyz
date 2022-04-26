import '../../Game.css';
import React from "react";

const Rock = ({id, rockData}) => {

    if(!rockData){
        return
    }

    return (
        <div className='rock' id={id+"-rock"}>
            <div className="rock_spritesheet pixel-art"></div>
        </div>
    )
}

export default Rock
