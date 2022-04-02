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
    <Stack direction="vertical" gap={3} className="col-md-2 mt-4 mx-auto">
      <Button variant="dark" onClick={!provider ? loadWeb3Modal : logoutOfWeb3Modal}>{!account ? "Connect Wallet" : "Disconnect Wallet"}</Button>
      <Link className='btn btn-dark' to="/halvening">Halvening Watcher</Link> 
      <Link className='btn btn-dark' to="/ens">Buy a Subdomain</Link>
      <Button variant="dark" disabled>Subdomain Marketplace</Button>
    </Stack>
</div>
  );
}

export default Home;
