import React from 'react'
import {Navbar,Container} from 'react-bootstrap'

const MyNavBar = () => {
    return (
      <Navbar sticky="top" bg="success" variant="dark">
        <Container>
          <Navbar.Brand href="#home">
            <img
            alt=""
            src="/0xbitcoin-logo.svg"
            width="30"
            height="30"
            className="d-inline-block align-top"
           />{' '}
           0xBitcoin Halvening
          </Navbar.Brand>
          <Navbar.Brand target='_blank' href="https://github.com/fappablo/halvening-website">
            <img
            alt=""
            src="/GitHub-Mark-Light-64px.png"
            width="30"
            height="30"
            className="d-inline-block align-top"
           />{' '}
          </Navbar.Brand>
        </Container>
      </Navbar>
    )
}

export default MyNavBar
