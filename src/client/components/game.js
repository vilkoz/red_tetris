import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import GameField from './game_field'
import CompetitorSpectre from './competitor_spectre'
import { getFigureAction, setFigureAction } from '../actions/figure'
import './style.css'
import { changeRouteByState } from '../routes'
import { switchGameUrlAction } from '../actions/route'

const Game = ({ message, playerName, roomName, field, figure, getFigure, gameUrl, moveFigureListener, gameState,
  score, theme, errorMessage,
  fallFigureInterval, spectres, scores, switchGameUrl, history, moveFigure, setFigure, fallFigure
}) => {
  moveFigure(figure, moveFigureListener)
  fallFigure(figure, fallFigureInterval)
  changeRouteByState({ roomName, playerName, history, gameUrl, gameState, switchGameUrl })
  let spectreArr = []
  _.forOwn(spectres, (el, name) => {
    spectreArr.push({ field: el.field, name, score: el.score })
  })
  console.log(spectres)
  spectreArr = _.orderBy(spectreArr, ['score'], ['desc'])
  console.log(spectreArr)
  return (
    <div className={`game ${theme}`}>
      <span className="roomname">{roomName}</span>
      <br/>
      <span className="errorGamemessage">{errorMessage}</span>
      <div className="gameContent">
        <div className="spectres">
          {
            spectres && spectreArr.map((el, competitorKey) => (
              competitorKey < 3 && <CompetitorSpectre field={el.field} key={competitorKey} name={el.name} score={el.score} />
            ))
          }
        </div>
        <div className='gameField'>
          <GameField field={field} figure={figure}/>
        </div>
        <div className="leaderbord">
          <h3>Leaderboard:</h3>
          <h4>My score: {score ? score : '0'} pts</h4>
          {
            spectreArr.map((el, i) => (
              <div className="leader" key={i}>{el.name}: {el.score ? el.score : '0'} pts</div>
            ))
          }
        </div>
      </div>
    </div>
  )
}

const mapStateToProps = (state) => (
  {
    roomName: state.roomName,
    playerName: state.playerName,
    field: state.field,
    gameUrl: state.gameUrl,
    gameState: state.gameState,
    figure: state.figure,
    message: state.message,
    errorMessage: state.errorMessage,
    moveFigureListener: state.moveFigureListener,
    fallFigureInterval: state.fallFigureInterval,
    spectres: state.spectres,
    score: state.score,
    theme: state.theme,
    scores: state.scores
  }
)
const mapDispatchToProps = (dispatch) => (
  {
    getFigure: (roomName, playerName) => {
      console.log('roomName:', roomName, 'playerName:', playerName)
      dispatch(getFigureAction(roomName, playerName))
    },
    moveFigure: (figure, moveFigureListener) => {
      if (figure && !moveFigureListener) {
        useEffect(() => {
          const input = event => {
            const directions = {
              38: 'ROTATE',
              37: 'LEFT',
              39: 'RIGHT',
              40: 'DOWN',
              32: 'MAX_DOWN',
            }
            if (!(event.keyCode in directions)) {
              return
            }
            event.preventDefault()
            const dir = directions[event.keyCode]
            dispatch({ type: `GAME_MOVE_FIGURE_${dir}` })
          };
          window.addEventListener('keydown', input);
          dispatch({ type: 'GAME_SET_MOVE_LISTENER', moveFigureListener: input })
          return () => {};
        });
      }
      else if (!figure && moveFigureListener) {
        window.removeEventListener('keydown', moveFigureListener);
        dispatch({ type: 'GAME_CLEAR_MOVE_LISTENER' })
      }
    },
    fallFigure: (figure, fallFigureInterval) => {
      console.log('interval:', figure, fallFigureInterval)
      if (figure && !fallFigureInterval) {
        const oneSecondInterval = 1000
        const intervalCb = window.setInterval(() => {
          dispatch({ type: 'GAME_MOVE_FIGURE_DOWN' })
        }, oneSecondInterval);
        dispatch({ type: 'GAME_SET_FALL_INTERVAL', fallFigureInterval: intervalCb })
        return () => {};
      }
      else if (!figure && fallFigureInterval) {
        window.clearInterval(fallFigureInterval);
        dispatch({ type: 'GAME_CLEAR_FALL_INTERVAL' })
      }
    },
    setFigure: (roomName, playerName, figure) => {
      dispatch(setFigureAction(roomName, playerName, figure))
    },
    switchGameUrl: (url) => {
      dispatch(switchGameUrlAction(url))
    },
  }
)

export default connect(mapStateToProps, mapDispatchToProps)(Game)
