import '../../Game.css';
import React, { forwardRef } from "react";
import {renderMessages} from '../../utils';
import {ChatButton} from '../../components'

const Chat = forwardRef((props, ref) => {

    if(!props.chatData){
        return null;
    }else{
        return (
             <div className='chat-container'>
                <div className='chat'>
                    <div>
                        {renderMessages(props.chatData)}
                    </div>
                </div>
                <ChatButton ref={ref} {...props}/>
            </div>
        );
    }
})

export default Chat
