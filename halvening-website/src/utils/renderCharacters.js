import { Player } from '../components'

const renderCharacters = (playerdata) => {
    let divs = [];

    for (const [key] of Object.entries(playerdata)) {
        divs.push(
            <Player key={key} socketId={key} playerdata={playerdata}/>
        )
    }
    
    return divs;
}

export default renderCharacters;
