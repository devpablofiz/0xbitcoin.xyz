import React, { useRef,useEffect } from 'react'
import '../../Game.css';
import {Button,InputGroup,FormControl} from 'react-bootstrap';

const Chat = ({socket,camera}) => {

    const message = useRef(null);

    const send = () =>{
        if(message.current.value === ""){
            return;
        }

        socket.emit("sendmessage",message.current.value);

        message.current.value = "";
        camera.current.focus();
        setTimeout(() => socket.emit("sendmessage",""), 2000);
    }

    useEffect(()=>{
        document.addEventListener("keyup", async (e) => {
            if (e.code === "Enter") {
                console.log("enter pressed");
                send();
            }
        });
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

export default Chat
