import React, { useRef,useEffect } from 'react'
import '../../Game.css';
import {InputGroup,FormControl} from 'react-bootstrap';

const ChatButton = ({socket, camera, nickName}) => {

    const message = useRef(null);

    const send = () =>{
        if(message.current.value === ""){
            return;
        }

        socket.emit("sendmessage",[nickName,message.current.value]);

        message.current.value = "";
        camera.current.focus();
    }

    useEffect(()=>{
        if(nickName != null){
            document.addEventListener("keyup", async (e) => {
                if (e.code === "Enter") {
                    send();
                }
            });
        }
        // eslint-disable-next-line
    },[nickName])


    return (
        <div className='chat-button mt-2'>
			<InputGroup >
  			  	<FormControl
  			  		placeholder="Say something"
					id="message"
					type="text"
                    maxLength={64}
                    ref={message}
  			  	/>
  			</InputGroup>            
        </div>
    )
}

export default ChatButton
