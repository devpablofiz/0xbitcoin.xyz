import React, { useState, useEffect} from "react";
import '../App.css';
import 'bootstrap/dist/css/bootstrap.min.css'
import {Stack,Button,InputGroup, DropdownButton, Dropdown, FormControl} from 'react-bootstrap';
import {PurchaseButton} from '../components'
import ENS, { getEnsAddress } from "@ensdomains/ensjs";
import { addresses } from "../contracts/src";

function delay(time) {
	return new Promise(resolve => setTimeout(resolve, time));
}

const EnsStore = ({
	provider,
	loadWeb3Modal,
	logoutOfWeb3Modal,
	account,
	chain
}) => {

	const [selectedDomain, setSelectedDomain] = useState("not0xbitcoin");
	const [selectedSubdomain, setSelectedSubdomain] = useState("");
	const [disabled, setDisabled] = useState(true);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const giveTimeToFetch = async () =>{
			setLoading(true)
			checkAvailable(selectedSubdomain);
			await delay(500)
			setLoading(false)
		}
		if(provider){
			giveTimeToFetch();
		}
    }, [selectedDomain, provider, selectedSubdomain]);

	const checkAvailable = async (subdomain) => {
		setLoading(true);

		setSelectedSubdomain(subdomain);

		if(subdomain.length === 0 || subdomain.includes(".")){
			setDisabled(true);
			setLoading(false);
			return;
		}

		const ens = new ENS({
			provider,
			networkId: 4,
			ensAddress: getEnsAddress("4"),
		});

		try{
			let add = await ens.name(subdomain+"."+selectedDomain+".eth").getResolver()
			if(add === addresses.null){
				setDisabled(false);
			}else{
				setDisabled(true);
			}
		}catch {
			setDisabled(true);
		}

		setLoading(false);
	}

	if(!provider){
		return (
			<div className="App-body">
				<h1 className='mt-5'>🛒🛒🛒</h1>
				<h2 className="mt-3">Connect to purchase a subdomain</h2>
				<Stack direction="vertical" gap={3} className="col-md-2 mt-4 mx-auto">
					  <Button variant="dark" onClick={!provider ? loadWeb3Modal : logoutOfWeb3Modal}>{!account ? "🔌 Connect Wallet 🔌" : "Disconnect Wallet"}</Button>
				</Stack>
				<div className="bottom-element mb-1">
					<h6 className="mt-2"><a variant="dark" target='_blank' rel="noreferrer" href={"https://etherscan.io/address/"+addresses.store}> Store Contract </a></h6>
					<h6>20% of the revenue is shared with <a target='_blank' rel="noreferrer" href='https://guild.0xbtc.io/'>The Guild</a></h6>
				</div>
			</div>
		)
	}

	if(chain !== 4){
		return (
			<div className="App-body">
				<h1 className='mt-5'>🛒🛒🛒</h1>
				<h2>Switch to Rinkeby</h2>
			</div>		
		)
	}

    return (
        <div className="App-body">
    		<h1 className='mt-5'>🛒🛒🛒</h1>
    		<Stack direction="vertical" gap={3} className="col-md-4 mt-4 mx-auto ">
				<h2>Purchase your own subdomain</h2>
					<InputGroup >
  					  	<FormControl
  					  		placeholder="🔍 Search names here"
							id="subdomain"
							type="text"
							onChange={(event) => checkAvailable((event.target.value).toLowerCase())}
  					  	/>
						<DropdownButton variant="secondary" title={"."+selectedDomain+".eth"}>
							<Dropdown.Item onClick={() => setSelectedDomain("not0xbitcoin")}>.not0xbitcoin.eth</Dropdown.Item>
							<Dropdown.Item onClick={() => setSelectedDomain("rubberface")}>.rubberface.eth</Dropdown.Item>
        				</DropdownButton>
  					</InputGroup>
					<PurchaseButton provider={provider} subdomain={selectedSubdomain} domain={selectedDomain} disabled={disabled} loading={loading} account={account}></PurchaseButton>
    		</Stack>
			<div className="bottom-element mb-1">
				<h6 className="mt-2"><a variant="dark" target='_blank' rel="noreferrer" href={"https://etherscan.io/address/"+addresses.store}> Store Contract </a></h6>
				<h6>20% of the revenue is shared with <a target='_blank' rel="noreferrer" href='https://guild.0xbtc.io/'>The Guild</a></h6>
			</div>
        </div>
    )
}

export default EnsStore
