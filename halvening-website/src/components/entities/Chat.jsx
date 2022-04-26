import '../../Game.css';
import React, { forwardRef } from "react";
import {renderMessages} from '../../utils';
import {ChatButton} from '../../components'

const Chat = forwardRef((props, ref) => {

    if(!props.chatData){
        return null;
    }else{
        return (
            <div className='chat'>
                <ChatButton ref={ref} {...props}/>
                <div>
                    {renderMessages(props.chatData)}
                </div>
            </div>
        );
    }
})

export default Chat
