import React, { useState, useEffect } from "react";
import { Contract } from "@ethersproject/contracts";
import { addresses, abis } from "../../contracts/src";
import { Web3Provider } from "@ethersproject/providers";
import Loader from "react-loader-spinner";
import { useAlert } from "react-alert";
import {Button,Modal} from 'react-bootstrap';


const PurchaseButton = ({ 
	provider, 
	subdomain,
	domain, 
	disabled,
	loading
}) => {
	const [txStatus, setTxStatus] = useState(null);
	const alert = useAlert();

	const [show, setShow] = useState(false);
	const [price, setPrice] = useState(null);

	useEffect(() => {
		const fetchPrice = async() => {
			const storeContract = new Contract(
				addresses.store,
				abis.store,
				new Web3Provider(provider).getSigner(),
			);
	
			let encodedLabel = await storeContract.encodeLabel(domain);
			let price = await storeContract.getPrice(encodedLabel);
			setPrice(price/Math.pow(10,8));
		}
		fetchPrice();
		setTxStatus(null);
    }, [domain,provider,subdomain]);

	const handleClose = () => setShow(false);
	const handleShow = () => setShow(true);

	const purchaseSubdomain = async () => {
		if (provider === null) {
			return;
		}

		const storeContract = new Contract(
			addresses.store,
			abis.store,
			new Web3Provider(provider).getSigner(),
		);

		const xbtcContract = new Contract(
			addresses.xbtc,
			abis.xbtc,
			new Web3Provider(provider).getSigner(),
		);

		let txhash, error;

		let encodedLabel = await storeContract.encodeLabel(domain);
		let encodedData = await storeContract.encodeData(encodedLabel, subdomain, addresses.rinkebyResolver);
		let price = await storeContract.getPrice(encodedLabel);

		await xbtcContract
			.approveAndCall(addresses.store, price, encodedData)
			.then((res) => {
				txhash = res.hash;
			})
			.catch((err) => (error = err));
		if (!error) {
			setTxStatus("waiting");
			const web3provider = new Web3Provider(provider);
			let txn = await web3provider.waitForTransaction(txhash);
			if (txn.status) {
				alert.success("Transaction executed succesfully");
			} else {
				alert.error("There was an error in the transaction");
			}
			setTxStatus("done");
		} else {
			let msg;
			if(error.error){
				msg = error.error.message.toString().substring(0,50);
				alert.error(msg);
			}
		}
		setShow(false);
	};

	if (txStatus === "waiting") {
		return (
			<div className='mating-spin'>
				<Loader
					type='Rings'
					color='#FF0000'
					height={70}
					width={70}
					timeout={300000} //300 secs
				/>
			</div>
		);
	}

	if (txStatus === "done") {
		return (
			<Button disabled = {true} variant="dark" onClick={handleShow}>
				{disabled ? "Not Available" : "Purchased Correctly!"}
			</Button>
		);
	}

	return (
		<>
		<Button disabled = {disabled || loading} variant="dark" onClick={handleShow}>
			{disabled ? "Not Available" : "Purchase"}
		</Button>
      	<Modal
	  		show={show}
	  		onHide={handleClose}
	  		backdrop="static"
	  		keyboard={false}
			centered={true}
		>
	  		<Modal.Header closeButton>
				<Modal.Title>Confirm Screen</Modal.Title>
	  		</Modal.Header>
	  		<Modal.Body>
				{"Do you really want to purchase "+subdomain+"."+domain+".eth for "+price+" 0xBTC"}
	  		</Modal.Body>
	  		<Modal.Footer>
			<Button variant="dark"onClick={purchaseSubdomain}>Confirm</Button>
	  		</Modal.Footer>
		</Modal>		
		</>
	);
};

export default PurchaseButton;
