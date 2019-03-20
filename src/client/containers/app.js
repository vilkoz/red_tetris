import React from 'react'
import { connect } from 'react-redux'

const App = ({ message, sendPing, playerName, roomName, updateRoomName, updatePlayerName, createGame }) => {
  return (
    <div>
    <h1>Kos pidoras</h1>
    <button onClick={sendPing}>PUP</button>
    <span>{message}</span>
    <br/>
    <span>{playerName}</span>
    <span>&nbsp;</span>
    <span>{roomName}</span>
    <br/>
    <label htmlFor="#roomName">Game name: </label>
    <input id="roomName" type='text' onChange={updateRoomName}/>
    <br/>
    <label htmlFor="#playerName">Player name: </label>
    <input id="playerName"type='text' onChange={updatePlayerName}/>
    <br/>
    <button onClick={() => createGame(roomName, playerName)}>Create/Connect Game</button>
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
    updateRoomName: (e) => {
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
