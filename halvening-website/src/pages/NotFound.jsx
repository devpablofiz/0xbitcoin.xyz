import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => (
	<div className='lost'>
		<h1>404 - Not Found!</h1>
		<Link to='/'>Go Back Home</Link>
	</div>
);

export default NotFound;
