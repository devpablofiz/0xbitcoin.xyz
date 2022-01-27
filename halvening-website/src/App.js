import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css'
import {Container, Row, Col} from 'react-bootstrap'
import BootstrapSwitchButton from 'bootstrap-switch-button-react'
import {DiscordCard, OneInchCard, Tokens, MyNavBar} from './components'
/*
:root {
  --main-bg-color: #13161f;
  --secondary-color: #F7931A;
  --font-color: white;
}

:root {
  --main-bg-color: white;
  --secondary-color: #F7931A;
  --font-color-dark: #1C1F30;
}
*/

function switchMode(checked) {
  let r = document.querySelector(':root');

  //button starts checked and white theme on
  if(!checked){
    //set to dark theme
    r.style.setProperty('--main-bg-color','#13161f')
    r.style.setProperty('--secondary-color','#F7931A')
    r.style.setProperty('--font-color','white')
  }else{
    //set to white theme
    r.style.setProperty('--main-bg-color','white')
    r.style.setProperty('--secondary-color','#F7931A')
    r.style.setProperty('--font-color','#1C1F30')
  }
}

function App() {
  return (
    <>
      <MyNavBar/>
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

export default App;
