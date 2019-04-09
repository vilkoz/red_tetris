import React from 'react'
import { connect } from 'react-redux';
import _ from 'lodash'
import { switchGameUrlAction } from '../actions/route'
import {
  toggleReadyStateAction,
  startGameAction
} from '../actions/server'
import { changeRouteByState } from '../routes'

const GameLobby = ({ message, playerName, roomName, gameUrl, errorMessage, gameState, playerReadyList, isOwner,
  history, switchGameUrl, toggleReadyState, startGame
}) => {
  changeRouteByState({ roomName, playerName, history, gameUrl, gameState, switchGameUrl })
  return (
    <div>
      <h1> Game lobby {roomName} </h1>
      { message && <b>{message}</b>}
      <ul>
        { playerReadyList &&
          playerReadyList.map((el) => (
            <li key={el.player}>
              <span>name: {el.player}</span><span>ready: {el.readyStatus ? 'true' : 'false'}</span>
            </li>
          ))
        }
      </ul>
      <button onClick={() => isOwner ? startGame(roomName) : toggleReadyState(roomName, playerName)}>
        {isOwner ? 'Start game' : 'Toggle ready' }
    </button>
    </div>
  )
}

const mapStateToProps = (state) => (
  {
    message: state.message,
    roomName: state.roomName,
    playerName: state.playerName,
    gameUrl: state.gameUrl,
    errorMessage: state.errorMessage,
    gameState: state.gameState,
    playerReadyList: state.playerReadyList,
    isOwner: state.isOwner,
  }
)

const mapDispatchToProps = (dispatch) => (
  {
    switchGameUrl: (url) => {
      dispatch(switchGameUrlAction(url))
    },
    toggleReadyState: (roomName, playerName) => {
      dispatch(toggleReadyStateAction(roomName, playerName))
    },
    startGame: (roomName, playerName) => {
      dispatch(startGameAction(roomName, playerName))
    }
  }
)

export default connect(mapStateToProps, mapDispatchToProps)(GameLobby)
