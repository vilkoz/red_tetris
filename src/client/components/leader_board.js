import React from 'react'
import { connect } from 'react-redux';
import _ from 'lodash'
import { switchGameUrlAction } from '../actions/route'
import {
  reStartGameAction
} from '../actions/server'
import { changeRouteByState } from '../routes'

const LeaderBoard = ({ message, playerName, roomName, gameUrl, errorMessage, gameState, scores, isOwner, theme,
  history, switchGameUrl, toggleReadyState, reStartGame
}) => {
  changeRouteByState({ roomName, playerName, history, gameUrl, gameState, switchGameUrl })
  let LeaderArr = _.orderBy(scores, ['score'], ['desc'])
  return (
    <div className={`finalLeaderbord ${theme}`}>
      <div className="information">
        <h1>{_.truncate((roomName), {
          'length': 24,
          'separator': ' '
        })}</h1>
        <div className="errorMessage">
          {message}
        </div>
        <div className="errorMessage">
          {errorMessage}
        </div>
      </div>
      <div className="bord">
        { LeaderArr &&
          LeaderArr.map((el) => (
            <div className="place" key={el.player}>
              <span>{_.truncate((el.player), {
                'length': 24,
                'separator': ' '
              })}</span><span>: {el.score} pts</span>
            </div>
          ))
        }
      </div>
      <div className="restart">
        {isOwner &&
        <a className='button' href='#' onClick={() => isOwner ? reStartGame(roomName) : console.log('gopa')}>
          ReStart Game
        </a>
        }
      </div>
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
    theme: state.theme,
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
