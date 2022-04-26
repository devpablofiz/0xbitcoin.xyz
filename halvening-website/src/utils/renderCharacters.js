import { Player } from '../components'

const renderCharacters = (playerData) => {
    let divs = [];

    for (const [key] of Object.entries(playerData)) {
        divs.push(
            <Player key={key} socketId={key} playerData={playerData}/>
        )
    }
    
    return divs;
}

export default renderCharacters;
