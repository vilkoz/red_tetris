import React from 'react'
import { connect } from 'react-redux';
import { Router, Route, Link } from 'react-router-dom';
import _ from 'lodash'
import {
  getGameListAction,
  createGameAction,
} from '../actions/server'

const GameLobby = ({ message, playerName, roomName, gameUrl, errorMessage,
  history
}) => {
  if (gameUrl) {
    history.push(gameUrl)
  }
  return (
    <div>
      <h1> Game lobby {roomName} </h1>
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
  }
)

const mapDispatchToProps = (dispatch) => (
  {
  }
)

export default connect(mapStateToProps, mapDispatchToProps)(GameLobby)
