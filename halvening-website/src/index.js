import React from 'react';
import ReactDOM from 'react-dom';
import App from "./App";
import { positions, Provider } from "react-alert";
import AlertTemplate from "react-alert-template-basic";

const options = {
  timeout: 5000,
  position: positions.BOTTOM_CENTER
};

ReactDOM.render(
  <Provider template={AlertTemplate} {...options}>
  <App/>
  </Provider>,
  document.getElementById('root')
);

