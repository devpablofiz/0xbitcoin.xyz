import React, { useEffect, forwardRef } from 'react'
import '../../Game.css';
import { FormControl } from 'react-bootstrap';

const ChatButton = forwardRef((props, chatRef) => {

    useEffect(() => {

        function resetText() {
            chatRef.current.value = ""
        }

        function unFocusChat() {
            props.focusCamera();
        }

        function send() {
            if (chatRef.current.value.trim() !== "") {
                props.socket.emit("sendmessage", [props.nickName, chatRef.current.value]);
            }
            resetText();
            unFocusChat();
        }

        if (props.nickName != null) {
            chatRef.current.addEventListener("keyup", async (e) => {
                if (e.code === "Enter") {
                    send();
                } else if (e.code === "Escape") {
                    unFocusChat();
                }
            });
        }
    }, [props.nickName, chatRef, props.socket])

    return (
        <div className='chat-button' >
            <FormControl
                placeholder="Say something"
                id="message"
                type="text"
                maxLength={64}
                ref={chatRef}
            />
        </div>
    )
})

export default ChatButton;
