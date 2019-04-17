import React from 'react'
import { connect } from 'react-redux';
import _ from 'lodash'
import Confetti from 'react-confetti'
import { switchGameUrlAction } from '../actions/route'
import {
  reStartGameAction
} from '../actions/server'
import { changeRouteByState } from '../routes'

const LeaderBoard = ({ message, playerName, roomName, gameUrl, errorMessage, gameState, scores, isOwner, theme,
  history, switchGameUrl, toggleReadyState, reStartGame
}) => {
  changeRouteByState({ roomName, playerName, history, gameUrl, gameState, switchGameUrl })
  const LeaderArr = _.orderBy(scores, ['score'], ['desc'])
  return (
    <div className={`finalLeaderBoard ${theme}`}>
      <div className='information'>
        <h1>{_.truncate((roomName), {
          'length': 24,
          'separator': ' ',
        })}</h1>
        <div className='errorMessage'>
          {errorMessage && errorMessage}
        </div>
        <div className='errorMessage'>
          {message && message !== errorMessage && message}
        </div>
      </div>
      <div className='board'>
        { LeaderArr &&
          LeaderArr.map((el) => (
            <div className='place' key={el.player}>
              <span>{_.truncate((el.player), {
                'length': 24,
                'separator': ' ',
              })}</span><span>: {el.score} pts</span>
            </div>
          ))
        }
        <Confetti/>
      </div>
      <div className='restart'>
        { isOwner &&
          <a className='button' href='#' onClick={() => reStartGame(roomName)}>
            ReStart Game
          </a>
        }
      </div>
    </div>
  )
}

export const mapStateToProps = (state) => (
  {
    message: state.message,
    roomName: state.roomName,
    playerName: state.playerName,
    gameUrl: state.gameUrl,
    errorMessage: state.errorMessage,
    gameState: state.gameState,
    scores: state.scores,
    isOwner: state.isOwner,
    theme: state.theme,
  }
)

export const mapDispatchToProps = (dispatch) => (
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
