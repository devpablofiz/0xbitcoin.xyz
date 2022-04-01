import '../App.css';
import 'bootstrap/dist/css/bootstrap.min.css'
import {Container, Row, Col} from 'react-bootstrap'
import {DiscordCard, OneInchCard, Tokens} from '../components'

function Halvening() {
  return (
    <>
      <div className="App-body">
        <Tokens/>        
        <Container>
          <Row xs={1} md={2} className="g-4 justify-content-evenly" >
            <Col style={{width:"30rem"}}><DiscordCard/></Col>
            <Col style={{width:"30rem"}}><OneInchCard/></Col>
          </Row>
        </Container>
        <h6 style={{color:"gray"}} className='mt-3'>*time estimation based on the average between target reward time and current average reward time</h6>
      </div>
    </>
  );
}

export default Halvening;
