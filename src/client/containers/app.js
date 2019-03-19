import React from 'react'
import { connect } from 'react-redux'

const App = ({ message, sendPing, playerName, roomName, updateGameName, updatePlayerName, createGame }) => {
  return (
    <div>
    <h1>Kos pidoras</h1>
    <button onClick={sendPing}>PUP</button>
    <span>{message}</span>
    <br/>
    <input type='text' onChange={updateGameName}/>
    <br/>
    <input type='text' onChange={updatePlayerName}/>
    <br/>
    <button onClick={() => createGame(roomName, playerName)}>Create Game</button>
    </div>
  )
}

const mapStateToProps = (state, ownProps) => {
  console.log('state:', state)
  console.log('ownProps:', ownProps)
  return {
    message: state.message,
    roomName: state.roomName,
    playerName: state.playerName,
  }
}
const mapDispatchToProps = (dispatch, ownProps) => {
  console.log('dispatch:', dispatch)
  console.log('ownProps:', ownProps)
  return {
    sendPing: () => dispatch({ type: 'server/ping', message: 'test' }),
    updateGameName: (e) => {
      const roomName = e.target.value
      console.log(roomName)
      dispatch({ type: 'SAVE_GAME_NAME', roomName })
    },
    updatePlayerName: (e) => {
      const playerName = e.target.value
      console.log(e)
      dispatch({ type: 'SAVE_PLAYER_NAME', playerName })
    },
    createGame: (roomName, playerName) => {
      console.log('roomName:', roomName, 'playerName:', playerName)
      dispatch({
        type: 'server/create_game',
        'roomName': roomName,
        'playerName': playerName,
      })
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
