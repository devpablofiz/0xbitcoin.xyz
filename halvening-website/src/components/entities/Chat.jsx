import '../../Game.css';
import React, { forwardRef } from "react";
import { renderMessages } from '../../utils';
import { ChatButton } from '../../components'

const Chat = forwardRef(({socket, chatData, focusCamera, identifier}, chatRef) => {
    if (!chatData) {
        return null;
    } else {
        return (
            <div className='chat-container'>
                <div className='chat'>
                    <div>
                        {renderMessages(chatData)}
                    </div>
                </div>
                <ChatButton socket={socket} focusCamera={focusCamera} identifier={identifier} ref={chatRef}/>
            </div>
        );
    }
})

export default Chat;
