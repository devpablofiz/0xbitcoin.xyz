import React, { useRef,useEffect } from 'react'
import '../../Game.css';
import {Button,InputGroup,FormControl} from 'react-bootstrap';

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
        document.addEventListener("keyup", async (e) => {
            if (e.code === "Enter") {
                send();
            }
        });
        // eslint-disable-next-line
    },[])


    return (
        <div className='chat mt-2'>
			<InputGroup >
  			  	<FormControl
  			  		placeholder="Say something"
					id="message"
					type="text"
                    maxLength={42}
                    ref={message}
  			  	/>
                <Button id="send" onClick={send}>Send</Button>
  			</InputGroup>            
        </div>
    )
}

export default ChatButton
