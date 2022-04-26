import React, { useEffect, forwardRef } from 'react'
import '../../Game.css';
import { FormControl } from 'react-bootstrap';

const ChatButton = forwardRef((props, ref) => {

    useEffect(() => {

        function send() {
            if (ref.current.value === "") {
                props.camera.current.focus();
                return;
            }

            props.socket.emit("sendmessage", [props.nickName, ref.current.value]);

            ref.current.value = "";
            props.camera.current.focus();
        }

        if (props.nickName != null) {
            ref.current.addEventListener("keyup", async (e) => {
                if (e.code === "Enter") {
                    send();
                }
            });
        }
    }, [props.nickName, ref, props.camera, props.socket])

    return (
        <div className='chat-button' >
            <FormControl
                placeholder="Say something"
                id="message"
                type="text"
                maxLength={64}
                ref={ref}
            />
        </div>
    )
})

export default ChatButton
