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
    <h1 className='mt-4'>Welcome to 0xBitcoin.xyz</h1>
    <Stack direction="vertical" gap={3} className="col-md-3 mt-4 mx-auto">
      <Button variant="dark" onClick={!provider ? loadWeb3Modal : logoutOfWeb3Modal}>{!account ? "Connect Wallet" : "Disconnect Wallet"}</Button>
      <Link className='btn btn-dark' to="/ens">Subdomain Store</Link>
      <Link className='btn btn-dark' to="/halvening">Halvening Watcher</Link> 
    </Stack>
</div>
  );
}

export default Home;
