import '../App.css';
import 'bootstrap/dist/css/bootstrap.min.css'
import {Container, Row, Col} from 'react-bootstrap'
import {DiscordCard, OneInchCard, Tokens} from '../components'
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';

//<video id="background-video" autoPlay loop muted poster="https://i3.ytimg.com/vi/XF3miCJcTS4/maxresdefault.jpg">
//<source src="https://cdn.discordapp.com/attachments/513191271377141773/960130356831473664/videoplayback.mp4" type="video/mp4"/>
//</video>

function Halvening() {
  return (
    <>
      <div className="App-body">
        <Tokens/>        
        <Container>
          <Row xs={1} md={2} className="g-4 justify-content-evenly" >
            <Col style={{width:"30rem"}}><DiscordCard/></Col>
            <Col style={{width:"30rem"}}><OneInchCard/></Col>
            <Col><AudioPlayer src="https://cdn.discordapp.com/attachments/513191271377141773/960119274297503744/pumpItUp.ogg" loop={true} volume = {0.1}/></Col>
          </Row>
        </Container>
        <h6 style={{color:"gray"}} className='mt-3'>*time estimation based on the average between target reward time and current average reward time</h6>
      </div>
    </>
  );
}

export default Halvening;
