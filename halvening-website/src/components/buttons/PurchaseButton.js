import React, { useState, useEffect } from "react";
import { Contract } from "@ethersproject/contracts";
import { addresses, abis } from "../../contracts/src";
import { Web3Provider } from "@ethersproject/providers";
import Loader from "react-loader-spinner";
import { useAlert } from "react-alert";
import {Button,Modal} from 'react-bootstrap';
import { Link } from "react-router-dom";


const PurchaseButton = ({ 
	provider, 
	subdomain,
	domain, 
	disabled,
	loading,
	account
}) => {
	const [txStatus, setTxStatus] = useState(null);
	const alert = useAlert();

	const [show, setShow] = useState(false);

	useEffect(() => {
		setTxStatus(null);
    }, [domain, provider, subdomain]);

	const handleClose = () => setShow(false);
	const handleShow = () => setShow(true);
	
	const [price, setPrice] = useState("...");
	const [bal, setBal] = useState(0)
	const [popupButtonEnabled, setPopupButtonEnabled] = useState(true);

	useEffect(() => {
		const fetchData = async() =>{
			const storeContract = new Contract(
				addresses.store,
				abis.store,
				new Web3Provider(provider).getSigner(),
			);
			
			let encodedLabel = await storeContract.encodeLabel(domain);
			let price = await storeContract.getPrice(encodedLabel);
			setPrice(price/Math.pow(10,8));

			const xbtcContract = new Contract(
				addresses.xbtc,
				abis.xbtc,
				new Web3Provider(provider).getSigner(),
			);

			let balance = await xbtcContract.balanceOf(account)
			setBal(balance)
		}

		if(provider && account){
			fetchData();
		}
		
    }, [domain, provider, subdomain, account]);	

	const setAsPrimary = async () => {
		if (!provider){
			return;
		}
		const resolverContract = new Contract(
			addresses.rinkebyReverse,
			abis.resolver,
			new Web3Provider(provider).getSigner(),
		);
		let txhash, error;
		await resolverContract
			.setName(subdomain+"."+domain+".eth")
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
			setTxStatus("promptReload");
		} else {
			let msg;
			if(error.error){
				msg = error.error.message.toString().substring(0,50);
				alert.error(msg);
			}
		}
	}

	const purchaseSubdomain = async () => {
		setPopupButtonEnabled(false);
		document.querySelector(".form-control").disabled = true;
		document.querySelector(".btn-secondary").disabled = true;

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
		setPopupButtonEnabled(true);
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
		document.querySelector(".form-control").disabled = false;
		document.querySelector(".btn-secondary").disabled = false;
		return (
			<Button variant="primary" onClick={setAsPrimary}>
				{"Set this as my primary name!"}
			</Button>
		);
	}

	if (txStatus === "promptReload") {
		return (
			<Button variant="dark" onClick={() => window.location.reload()}>
				{"Reload the page to see your ENS or keep browsing"}
			</Button>
		);
	}

	return (
		<>
			<Button disabled = {disabled || loading || (price > bal)} variant="dark" onClick={handleShow}>
				{disabled ? "Not Available" : ((price > bal) ? price+" 0xBTC Required" : "Purchase")}
			</Button>
			<Button variant="dark" hidden = {disabled || (bal > price)} target='_blank' href="https://app.1inch.io/#/1/swap/ETH/0xBTC">Buy 0xBTC</Button> 
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
				  	<p>{"You are about to buy "+subdomain+"."+domain+".eth for a one time fee of "+price+" 0xBTC"}</p>
					<p>{"You will receive full ownership of the subdomain"}</p>
					<p>{"There will be an option to set this as your primary ENS name"}</p>
	  			</Modal.Body>
	  			<Modal.Footer>
					<Button variant="dark" disabled={!popupButtonEnabled} onClick={purchaseSubdomain} >Confirm</Button>
	  			</Modal.Footer>
			</Modal>		
		</>
	);
};

export default PurchaseButton;
