import React, { useState } from 'react'
import '../../Game.css';
import {Button,InputGroup,FormControl} from 'react-bootstrap';

const Chat = ({socket}) => {

    const [currentMessage,setCurrentMessage] = useState("");

    const send = () =>{
        socket.emit("sendmessage",currentMessage);

        setTimeout(() => socket.emit("sendmessage",""), 2000);
    }

    return (
        <div className='chat mt-2'>
			<InputGroup >
  			  	<FormControl
  			  		placeholder="Say something"
					id="subdomain"
					type="text"
					onChange={(event) => setCurrentMessage((event.target.value))}
  			  	/>
                <Button onClick={send}>Send</Button>
  			</InputGroup>            
        </div>
    )
}

export default Chat
