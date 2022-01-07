import React from 'react'
import {Button, Card} from 'react-bootstrap'

const OneInchCard = () => {
    return (
        <Card variant="top" bg={'dark'}>
          <Card.Img src="https://media.discordapp.net/attachments/446738496971866133/929100201141104711/1inch-coin-1200x675_1.jpg"/>
          <Card.Body>
            <Card.Title as="h2">
              Trade on 1inch
            </Card.Title>
            <Card.Text>
              Get the best rates via routing
            </Card.Text>
            <Button target='_blank' href="https://app.1inch.io/#/1/swap/DAI/0xBTC" variant="success" size="lg">Trade it</Button>
          </Card.Body>
        </Card>
    )
}

export default OneInchCard
