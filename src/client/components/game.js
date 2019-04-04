import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import GameField from './game_field'
import CompetitorSpectre from './competitor_spectre'
import { getFigureAction, setFigureAction } from '../actions/figure'

const Game = ({ message, playerName, roomName, field, figure, getFigure, gameUrl, moveFigureListener,
  fallFigureInterval, spectres,
  history, moveFigure, setFigure, fallFigure }) => {
  moveFigure(figure, moveFigureListener)
  fallFigure(figure, fallFigureInterval)
  if (!gameUrl) {
    history.push('/')
  }
  console.log('render game')
  const spectreArr = []
  for (const name in spectres) {
    spectreArr.push({ field: spectres[name], name })
  }
  return (
    <div>
      <h1>Game</h1>
      <span>{message}</span>
      <br/>
      <span>{playerName && roomName && playerName + roomName}</span>
      <br/>
      <div>
        <GameField field={field} figure={figure}/>
        <button onClick={() => getFigure(roomName, playerName)}>Get Figure</button>
        <button onClick={() => setFigure(roomName, playerName, figure)}>set figure</button>
      </div>
      <div>{figure ? figure.x : 'x'}&nbsp;{figure ? figure.y : 'y'}</div>
      <div>
        {
          spectres && spectreArr.map((el, competitorKey) => (
            <CompetitorSpectre field={el.field} key={competitorKey} name={el.name}/>
          ))
        }
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
    figure: state.figure,
    message: state.message,
    moveFigureListener: state.moveFigureListener,
    fallFigureInterval: state.fallFigureInterval,
    spectres: state.spectres,
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
            event.preventDefault()
            const directions = {
              38: 'ROTATE',
              37: 'LEFT',
              39: 'RIGHT',
              40: 'DOWN',
            }
            if (!(event.keyCode in directions)) {
              return
            }
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
  }
)

export default connect(mapStateToProps, mapDispatchToProps)(Game)
