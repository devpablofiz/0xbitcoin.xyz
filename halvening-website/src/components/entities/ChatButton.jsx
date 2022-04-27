import React, { useEffect, forwardRef } from 'react'
import '../../Game.css';
import { Button, FormControl,InputGroup } from 'react-bootstrap';

const ChatButton = forwardRef((props, chatRef) => {

    function sendMsg() {
        if (chatRef.current.value.trim() !== "") {
            props.socket.emit("sendmessage", [props.nickName, chatRef.current.value]);
        }
        chatRef.current.value = ""
        props.focusCamera();
    }

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
            <InputGroup>
                <FormControl
                    placeholder="Say something"
                    id="message"
                    type="text"
                    maxLength={64}
                    ref={chatRef}
                />
                <Button className="mobile-only" onClick={sendMsg}> Send </Button>
            </InputGroup>
        </div>
    )
})

export default ChatButton;
