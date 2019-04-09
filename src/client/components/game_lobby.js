import React from 'react'
import { connect } from 'react-redux';
import { Router, Route, Link } from 'react-router-dom';
import _ from 'lodash'
import {
  getGameListAction,
  createGameAction,
} from '../actions/server'
import { switchGameUrlAction } from '../actions/route'
import { changeRouteByState } from '../routes'

const GameLobby = ({ message, playerName, roomName, gameUrl, errorMessage, gameState, playerReadyList,
  history, switchGameUrl
}) => {
  changeRouteByState({ roomName, playerName, history, gameUrl, gameState, switchGameUrl })
  return (
    <div>
      <h1> Game lobby {roomName} </h1>
      <ul>
        { playerReadyList &&
          playerReadyList.map((el) => (
            <li key={el.player}><span>name: {el.player}</span><span>ready: {el.readyStatus}</span></li>
          ))
        }
      </ul>
      <button>Set ready / Start game</button>
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
  }
)

const mapDispatchToProps = (dispatch) => (
  {
    switchGameUrl: (url) => {
      dispatch(switchGameUrlAction(url))
    }
  }
)

export default connect(mapStateToProps, mapDispatchToProps)(GameLobby)
