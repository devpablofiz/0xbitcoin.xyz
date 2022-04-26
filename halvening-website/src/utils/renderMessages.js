import {stc} from './'

const renderMessages = (chatData) => {
    let toRender = [];

    for (const message of chatData) {
        if(message[0]){
            toRender.push(
                <p key={toRender.length}>{<span style={{color: '#'+stc(message[0])}}>{message[0] + ":"}</span>}{" " + message[1]}</p>
            )
        }
    }
    
    return toRender;
}

export default renderMessages;
