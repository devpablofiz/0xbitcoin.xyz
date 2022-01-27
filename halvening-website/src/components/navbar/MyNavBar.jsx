import React,{ useState, useEffect} from 'react'
import '../../App.css';
import BootstrapSwitchButton from 'bootstrap-switch-button-react'
import {Navbar,Container} from 'react-bootstrap'



const MyNavBar = () => {
  const [theme, setTheme] = useState(true);

  function switchMode(checked) {
    let r = document.querySelector(':root');
  
    //button starts checked and white theme on
    if(!checked){
      //set to dark theme
      setTheme(false);
      localStorage.setItem("theme","dark")
      r.style.setProperty('--main-bg-color','#13161f')
      r.style.setProperty('--secondary-color','#F7931A')
      r.style.setProperty('--font-color','white')
    }else{
      //set to white theme
      setTheme(true);
      localStorage.setItem("theme","white")
      r.style.setProperty('--main-bg-color','white')
      r.style.setProperty('--secondary-color','#F7931A')
      r.style.setProperty('--font-color','#1C1F30')
    }
  }

  useEffect(() => {
    let localTheme = localStorage.getItem("theme");

    //first time loading?
    if(localTheme !== "dark" && localTheme !== "white"){
      localStorage.setItem("theme","white");
    }

    if(localTheme === "dark"){
      switchMode(false);
      setTheme(false);
    }else{
      switchMode(true);
      setTheme(true);
    }

  }, [theme]);

  return (
    <Navbar className="color-nav" variant="dark">
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
      <Container className="justify-content-end">
        <Navbar.Brand target='_blank' href="https://github.com/fappablo/halvening-website">
          <img
          alt=""
          src="/GitHub-Mark-Light-64px.png"
          width="30"
          height="30"
          className="d-inline-block align-top"
         />{' '}
        </Navbar.Brand>
        <BootstrapSwitchButton checked={theme} onlabel='☀️' offlabel='🌙' onstyle='warning' offstyle='dark' onChange={(checked)=>switchMode(checked)}/>
      </Container>
    </Navbar>
  )
}

export default MyNavBar
