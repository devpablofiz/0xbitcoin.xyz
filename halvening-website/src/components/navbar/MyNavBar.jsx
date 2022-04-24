import React,{ useState, useEffect} from 'react'
import '../../App.css';
import {Navbar,Container, DropdownButton, Dropdown} from 'react-bootstrap'
import { Link } from "react-router-dom";
import unscroll from "unscroll"

const MyNavBar = ({
	provider,
	loadWeb3Modal,
	logoutOfWeb3Modal,
	account,
	ensName,
}) => {	
  const [stateEnsName, setEnsName] = useState(ensName);
	let foundEns = null;

	if (stateEnsName != null && stateEnsName.name != null) {
		foundEns = 123;
	}

	useEffect(() => {
		if (ensName != null) {
			setEnsName(ensName);
		}
	}, [ensName]);
  
  const [theme, setTheme] = useState(false);

  const handleClick = () => switchMode(!theme);

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
    unscroll('#root > nav')
    //first time loading?
    if(localTheme !== "dark" && localTheme !== "white"){
      localStorage.setItem("theme","dark");
    }

    if(localTheme === "white"){
      switchMode(true);
      setTheme(true);
    }else{
      switchMode(false);
      setTheme(false);
    }

  }, [theme]);

  return (
    <Navbar className="color-nav" variant="dark">
      <Container fluid>
        <Navbar.Brand>
         <Link style={{ color: "white", textDecoration: 'none' }} to="/home">
            <img
             alt=""
             src="/0xbitcoin-logo.svg"
             width="30"
             height="30"
             className="d-inline-block align-top"
            />{' '}
            0xBitcoin
          </Link>
        </Navbar.Brand>
        <DropdownButton align="end" variant="light" title={account ? (foundEns ? stateEnsName.name : account.substring(0,12)) : "⚙️ Menu"}>
          <Dropdown.Item onClick={!provider ? loadWeb3Modal : logoutOfWeb3Modal}>{!account ? "🔌 Connect Wallet" : "🔌 Disconnect Wallet"}</Dropdown.Item>
          <Dropdown.Divider/>
          <Link className='dropdown-item' to="/home">🏠 Home</Link>
          <Link className='dropdown-item' to="/ens">🛒 Buy a Subdomain</Link>
          <Link className='dropdown-item' to="/halvening">⛏️ Watch The Halvening</Link>
          <Link className='dropdown-item disabled' to="/">🔜 Subdomain Marketplace</Link>
          <Dropdown.Divider />
          <Dropdown.Item onClick={handleClick}>🔄 Toggle Theme</Dropdown.Item>
        </DropdownButton>
      </Container>
    </Navbar>
  )
}

export default MyNavBar
