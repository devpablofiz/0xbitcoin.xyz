import '../App.css';
import 'bootstrap/dist/css/bootstrap.min.css'
import {Stack,Button} from 'react-bootstrap';
import { Link } from "react-router-dom";


function Home({
	provider,
	loadWeb3Modal,
	logoutOfWeb3Modal,
	account,
	ensName,
}) {
  return (
    <div className="App-body">
    <h1 className='mt-5'>Welcome to 0xBitcoin.xyz</h1>
    <Stack direction="vertical" gap={3} className="col-md-3 mt-4 mx-auto">
      <Button variant="dark" onClick={!provider ? loadWeb3Modal : logoutOfWeb3Modal}>{!account ? "🔌 Connect Wallet 🔌" : "🔌 Disconnect Wallet 🔌"}</Button>
      <Link className='btn btn-dark' to="/store">🛒 Buy a Subdomain 🛒</Link>
      <Link className='btn btn-dark' to="/halvening">⛏️ Watch The Halvening ⛏️</Link> 
      <Button variant="dark" disabled>🔜 Subdomain Marketplace 🔜</Button>
    </Stack>
			<h6 className="mb-3 mt-2 bottom-element">
        <a variant="dark" target='_blank' rel="noreferrer" href={"https://0xk.medium.com/the-what-the-why-and-the-how-of-0xbitcoin-5c635fe2df6b"}>
          Why 0xBTC 
        </a>
      </h6>
    </div>
  );
}

export default Home;
