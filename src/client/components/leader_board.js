import React from 'react'
import { connect } from 'react-redux';
import _ from 'lodash'
import { switchGameUrlAction } from '../actions/route'
import {
  reStartGameAction
} from '../actions/server'
import { changeRouteByState } from '../routes'

const LeaderBoard = ({ message, playerName, roomName, gameUrl, errorMessage, gameState, scores, isOwner,
  history, switchGameUrl, toggleReadyState, reStartGame
}) => {
  changeRouteByState({ roomName, playerName, history, gameUrl, gameState, switchGameUrl })
  return (
    <div>
      <h1> LeaderBoard {roomName} </h1>
      { message && <b>{message}</b>}
      <ul>
        { scores &&
          scores.map((el) => (
            <li key={el.player}>
              <span>name: {el.player}</span><span>score: {el.score}</span>
            </li>
          ))
        }
      </ul>
      {isOwner &&
        <button onClick={() => isOwner ? reStartGame(roomName) : console.log('gopa')}>
          ReStart Game
        </button>
      }
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
    scores: state.scores,
    isOwner: state.isOwner,
  }
)

const mapDispatchToProps = (dispatch) => (
  {
    switchGameUrl: (url) => {
      dispatch(switchGameUrlAction(url))
    },
    reStartGame: (roomName) => {
      dispatch(reStartGameAction(roomName))
    }
  }
)

export default connect(mapStateToProps, mapDispatchToProps)(LeaderBoard)
