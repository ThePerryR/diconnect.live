import React, { Component } from 'react'
import DocumentTitle from 'react-document-title'
import styled from 'styled-components'

import Button from '../../elements/Button'

const Wrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  padding: 16px;
  box-sizing: border-box;
`
const Centered = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
`

class Landing extends Component {
  constructor (props) {
    super(props)
    this.state = {
      voted: false,
      votes: {},
      viewers: 0
    }
  }

  componentDidMount () {
    this.socket = window.io.connect(window.location.origin, { secure: true, transports: ['websocket'] })
    this.socket.on('update', ({ votes, viewers }) => this.setState({ votes, viewers }))
  }

  vote = type => {
    this.socket.emit('vote', type)
    this.setState({ voted: true })
  }

  render () {
    const scores = Object.keys(this.state.votes).map(type => ({
      type,
      votes: this.state.votes[type]
    })).sort((a, b) => b.votes - a.votes)
    return (
      <DocumentTitle title="What is it???">
        <Wrapper>
          <Centered>
            <h3 style={{ maxWidth: 500 }}>
              Hey guys, I&apos;m going to go get dinner, then I&apos;ll start working on what you guys vote for!
            </h3>

            {!this.state.voted &&
            <div>
              <h5>What type of website should this be?</h5>
              <Button label='Social Media' onClick={() => this.vote('social')}/>
              <Button label='Video Streaming App/Service' onClick={() => this.vote('streaming')}/>
              <Button label='Web Game' onClick={() => this.vote('game')}/>
              <Button label='Utility App (to-do list, notes)' onClick={() => this.vote('utility')}/>
              <Button label='Just weird randomness' onClick={() => this.vote('random')}/>
            </div>
            }
            <div>
              {scores.map((score, i) => (
                <div key={i}>{score.type}: {score.votes}</div>
              ))}
            </div>
            <p>Once we vote on the general type, we&apos;ll go more into the specific genres</p>
          </Centered>
        </Wrapper>
      </DocumentTitle>
    )
  }
}

export default Landing
