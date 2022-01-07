import React from 'react'
import {Button, Card} from 'react-bootstrap'

const DiscordCard = () => {
    return (
        <Card variant="top" bg={'dark'}>
          <Card.Img src="https://cdn.discordapp.com/attachments/439217061475123200/672894367002001409/gif10C.gif"/>
          <Card.Body>
            <Card.Title as="h2">
              Join our Discord!
            </Card.Title>
            <Card.Text>
              Come hang with us
            </Card.Text>
            <Button target='_blank' href="https://discord.gg/ZvHeGsZCxP" variant="success" size="lg">Let me in</Button>
          </Card.Body>
        </Card>
    )
}

export default DiscordCard
