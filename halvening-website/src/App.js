import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css'
import {Navbar, Container, Row, Col} from 'react-bootstrap'
import {DiscordCard, OneInchCard, Tokens} from './components'

function App() {
  return (
    <div className="App">  
      <Navbar sticky="top" bg="success" variant="dark">
        <Container>
          <Navbar.Brand href="#home">
            <img
            alt=""
            src="/0xbitcoin-logo.svg"
            width="30"
            height="30"
            className="d-inline-block align-top"
           />{' '}
           0xBitcoin Halvening
          </Navbar.Brand>
        </Container>
      </Navbar>
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
    </div>
  );
}

export default App;
