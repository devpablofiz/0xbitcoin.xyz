import React, { useEffect, forwardRef } from 'react'
import '../../Game.css';
import { Button, FormControl,InputGroup } from 'react-bootstrap';

const ChatButton = forwardRef(({socket, identifier, focusCamera}, chatRef) => {

    function sendMsg() {
        if (chatRef.current.value.trim() !== "") {
            socket.emit("sendmessage", chatRef.current.value);
        }
        chatRef.current.value = ""
        focusCamera();
    }

    useEffect(() => {

        function resetText() {
            chatRef.current.value = ""
        }

        function unFocusChat() {
            focusCamera();
        }

        function send() {
            if (chatRef.current.value.trim() !== "") {
                socket.emit("sendmessage", chatRef.current.value);
            }
            resetText();
            unFocusChat();
        }

        if (identifier != null) {
            chatRef.current.addEventListener("keyup", async (e) => {
                if (e.code === "Enter") {
                    send();
                } else if (e.code === "Escape") {
                    unFocusChat();
                }
            });
        }
    }, [identifier, chatRef, socket])

    return (
        <div className='chat-button' >
            <InputGroup>
                <FormControl
                    placeholder="Say something"
                    id="message"
                    type="text"
                    maxLength={100}
                    ref={chatRef}
                />
                <Button className="mobile-only" onClick={sendMsg}> Send </Button>
            </InputGroup>
        </div>
    )
})

export default ChatButton;
