import React from 'react'
import {connect} from "react-redux";
import { Router, Route, Link} from 'react-router-dom';

const Lobby = ({ message, playerName, roomName, field, updateRoomName, updatePlayerName, createGame, history, gameUrl }) => {
  if (gameUrl)
    history.push(gameUrl)
  return (
    <div>
      <h1>Lobby</h1>
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
    field: state.field,
    gameUrl: state.gameUrl,
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  console.log('dispatch:', dispatch)
  console.log('ownProps:', ownProps)
  return {
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

export default connect(mapStateToProps, mapDispatchToProps)(Lobby)
