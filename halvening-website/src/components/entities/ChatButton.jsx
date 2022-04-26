import React, { useEffect, forwardRef } from 'react'
import '../../Game.css';
import {InputGroup,FormControl} from 'react-bootstrap';

const ChatButton = forwardRef((props, ref) => {

    const send = () =>{
        if(ref.current.value === ""){
            props.camera.current.focus();
            return;
        }

        props.socket.emit("sendmessage",[props.nickName, ref.current.value]);

        ref.current.value = "";
        props.camera.current.focus();
    }

    useEffect(()=>{
        if(props.nickName != null){
            document.addEventListener("keyup", async (e) => {
                if (e.code === "Enter") {
                    send();
                }
            });
        }
        // eslint-disable-next-line
    },[props.nickName])

    return (
        <div className='chat-button mt-2'  >
			<InputGroup >
  			  	<FormControl
  			  		placeholder="Say something"
					id="message"
					type="text"
                    maxLength={64}
                    ref={ref}
  			  	/>
  			</InputGroup>            
        </div>
    )
})

export default ChatButton
