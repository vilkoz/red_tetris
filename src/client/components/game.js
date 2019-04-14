import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import GameField from './game_field'
import CompetitorSpectre from './competitor_spectre'
import { getFigureAction, setFigureAction } from '../actions/figure'
import { changeRouteByState } from '../routes'
import { switchGameUrlAction } from '../actions/route'
import _ from "lodash";

const Game = ({ message, playerName, roomName, field, figure, getFigure, gameUrl, gameState,
  score, theme, errorMessage, isGameOver,
  spectres, scores, switchGameUrl, history, moveFigure, setFigure, fallFigure
}) => {
  moveFigure(figure, isGameOver)
  fallFigure(figure, isGameOver)
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
      <span className="roomname">{_.truncate((roomName), {
        'length': 24,
        'separator': ' '
      })}</span>
      <br/>
      {
        isGameOver &&
          <h1 className="errorGamemessage">{message}</h1>
      }
      <div className="gameContent">
        <div className='fieldLeft'>
          <div className="spectres">
            {
              spectres && spectreArr.map((el, competitorKey) => (
                competitorKey < 3 && <CompetitorSpectre field={el.field} key={competitorKey} name={el.name} score={el.score} />
              ))
            }
          </div>
        </div>
        <div className='fieldCenter'>
          <div className='gameField'>
            <GameField field={field} figure={figure}/>
          </div>
        </div>
        <div className="fieldRight">
          <div className="leaderbord">
            <h3>Leaderboard:</h3>
            <h4>My score: {score ? score : '0'} pts</h4>
            {
              spectreArr.map((el, i) => (
                <div className="leader" key={i}>{_.truncate((el.name), {
                  'length': 14,
                  'separator': ' '
                })}: {el.score ? el.score : '0'} pts</div>
              ))
            }
          </div>
        </div>
      </div>
      <span className="errorGamemessage">{errorMessage}</span>
    </div>
  )
}

export const mapStateToProps = (state) => (
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
    scores: state.scores,
    isGameOver: state.isGameOver,
  }
)
export const mapDispatchToProps = (dispatch) => (
  {
    getFigure: (roomName, playerName) => {
      console.log('roomName:', roomName, 'playerName:', playerName)
      dispatch(getFigureAction(roomName, playerName))
    },
    moveFigure: (figure, isGameOver) => {
      useEffect(() => {
        if (figure && !isGameOver) {
          const input = event => {
            console.log(event.keyCode);
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
            const dir = directions[event.keyCode]
            dispatch({type: `GAME_MOVE_FIGURE_${dir}`})
          };
          console.log('add event')
          window.addEventListener('keydown', input);
          return () => {
            console.log('remove event list')
            window.removeEventListener('keydown', input);
          };
        }
      });
    },
    fallFigure: (figure, isGameOver) => {
      useEffect(() => {
        if (figure && !isGameOver) {
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
      dispatch(setFigureAction(roomName, playerName, figure))
    },
    switchGameUrl: (url) => {
      dispatch(switchGameUrlAction(url))
    },
  }
)

export default connect(mapStateToProps, mapDispatchToProps)(Game)
