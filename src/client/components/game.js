import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import GameField from './game_field'

const Game = ({ message, playerName, roomName, field, figure, getFigure, gameUrl,
  history, moveFigure, setFigure, moveFigurebutton, fallFigure }) => {
  moveFigure(figure)
  fallFigure(figure)
  if (!gameUrl) {
    history.push('/')
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
  }
)
const mapDispatchToProps = (dispatch) => (
  {
    getFigure: (roomName, playerName) => {
      console.log('roomName:', roomName, 'playerName:', playerName)
      dispatch({
        type: 'server/get_figure',
        roomName,
        playerName,
      })
    },
    moveFigure: (figure) => {
      useEffect(() => {
        if (figure) {
          const input = event => {
            console.log(event.keyCode);
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
          return () => {
            console.log('remove event list')
            window.removeEventListener('keydown', input);
          };
        }
      });
    },
    fallFigure: (figure) => {
      useEffect(() => {
        if (figure) {
          const oneSecondInterval = 1000
          const interval = window.setInterval(() => {
            dispatch({type: `GAME_MOVE_FIGURE_DOWN`})
          }, oneSecondInterval);
          return () => {
            console.log('clear interval')
            window.clearInterval(interval);
          };
        }
      });
    },
    setFigure: (roomName, playerName, figure) => {
      console.log('setFigure')
      dispatch({
        type: 'server/set_figure',
        roomName,
        playerName,
        figure,
      })
    },
  }
)

export default connect(mapStateToProps, mapDispatchToProps)(Game)
