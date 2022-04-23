import React,{ useState, useEffect} from 'react'
import {EnsStore, Home, Halvening, NotFound, Game} from './pages/'
import {MyNavBar} from './components'
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import useWeb3Modal from "./hooks/useWeb3Modal";
import ENS, { getEnsAddress } from "@ensdomains/ensjs";
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css' 
import "@fontsource/titillium-web/400.css";

function App() {
	const [provider, loadWeb3Modal, logoutOfWeb3Modal] = useWeb3Modal();

	const [account, setAccount] = useState(null);
	const [ensName, setEnsName] = useState(null);
	const [chain, setChain] = useState(null);
	// Subscribe to accounts change

	const handleAccountsChanged = async (accounts) => {
		setAccount(accounts[0]);
	};

	const handleChainChanged = (_chainId) => {
		// We recommend reloading the page, unless you must do otherwise
		if (parseInt(_chainId) === 1) {
			setChain(1);
		} else {
			setChain(-1);
		}
	};

	useEffect(() => {
		if (provider !== undefined) {
			provider
				.request({ method: "eth_chainId" })
				.then(handleChainChanged)
				.catch((err) => {
					// Some unexpected error.
					// For backwards compatibility reasons, if no accounts are available,
					// eth_accounts will return an empty array.
					console.error(err);
				});
			provider
				.request({ method: "eth_accounts" })
				.then(handleAccountsChanged)
				.catch((err) => {
					// Some unexpected error.
					// For backwards compatibility reasons, if no accounts are available,
					// eth_accounts will return an empty array.
					console.error(err);
				});
			provider.on("chainChanged", handleChainChanged);
			provider.on("accountsChanged", handleAccountsChanged);
			if (account != null) {
				const ens = new ENS({
					provider,
					ensAddress: getEnsAddress("1"),
				});
				ens.getName(account).then((res) => setEnsName(res));
			}
		}
	}, [provider, account]);

  return (
    <Router>
        <MyNavBar 
            provider={provider}
            loadWeb3Modal={loadWeb3Modal}
            logoutOfWeb3Modal={logoutOfWeb3Modal}
            account={account}
            ensName={ensName}
        />
        <Switch>
            <Route exact path="/">
                <Home
                    provider={provider} 
                    loadWeb3Modal={loadWeb3Modal}
                    logoutOfWeb3Modal={logoutOfWeb3Modal}
                    account={account} 
                    chain={chain}
                />
            </Route>
			<Route path="/game">
                <Game
                    provider={provider} 
                    loadWeb3Modal={loadWeb3Modal}
                    logoutOfWeb3Modal={logoutOfWeb3Modal}
                    account={account} 
                    ensName={ensName}
                />
            </Route>
            <Route path="/home">
              <Home
                    provider={provider} 
                    loadWeb3Modal={loadWeb3Modal}
                    logoutOfWeb3Modal={logoutOfWeb3Modal}
                    account={account} 
                    chain={chain}
              />
            </Route>
            <Route path="/store">
                <EnsStore 
                    provider={provider} 
                    loadWeb3Modal={loadWeb3Modal}
                    logoutOfWeb3Modal={logoutOfWeb3Modal}
                    account={account}
                    chain={chain}
                />
            </Route>
            <Route path="/halvening">
                <Halvening/>
            </Route>
            <Route component={NotFound} />
        </Switch>
    </Router>
  )
}

export default App;
