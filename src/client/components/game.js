import React, { useEffect } from 'react'
import { StyleSheet, css } from 'aphrodite'
import {connect} from "react-redux";

const styles = StyleSheet.create({
  fieldElem: {
    display: 'inline-block',
    fontFamily: 'monospaced',
  },
})

const Game = ({ message, playerName, roomName, field, figure, getFigure, gameUrl,
                history, moveFigure, setFigure, moveFigurebutton, fallFigure }) => {
  moveFigure(figure)
  fallFigure(figure, moveFigurebutton)
  // if (figure){
  // useEffect(() => {
  //   const interval = window.setInterval(() => {
  //     moveFigurebutton('DOWN')
  //   }, 1000);
  //   return () => {
  //     window.clearInterval(interval);
  //   };
  // }, []);
  // }
  if (!gameUrl) {
    history.push('/')
  }
  return (
    <div>
      <h1>Game1</h1>
      <span>{message}</span>
      <br/>
      <span>{playerName+roomName}</span>
      <br/>
      <div>
        {field && ((field, figure) => {
          if (!figure)
            return field
          return field.map((line, y) => {
            return line.map((el, x) => {
              if (x >= figure.x && x - figure.x < figure.figure[0].length &&
                y >= figure.y && y - figure.y < figure.figure.length) {
                return figure.figure[y - figure.y][x - figure.x]
              }
              return el
            })
          })
        })(field, figure).map((line) => {
          const a = line.map((el) => (<div className={css(styles.fieldElem)}>{el}</div>))
          a.push(<br/>)
          return a
        })
        }
        <button onClick={() => getFigure(roomName, playerName)}>Get Figure</button>
        {/*<br/>*/}
        {/*<button onClick={() => moveFigure('LEFT')}>&larr;</button>*/}
        {/*<button onClick={() => moveFigure('RIGHT')}>&rarr;</button>*/}
        {/*<button onClick={() => moveFigure('DOWN')}>&darr;</button>*/}
        {/*<button onClick={() => moveFigure('ROTATE')}>rotate</button>*/}
        {/*<br/>*/}
        <button onClick={() => setFigure(roomName, playerName, figure)}>set figure</button>
      </div>
        <div>{figure ? figure.x : 'x'}&nbsp;{figure ? figure.y : 'y'}</div>
    </div>
  )
}

const mapStateToProps = (state, ownProps) => {
  console.log('state:', state)
  console.log('ownProps:', ownProps)
  return {
    roomName: state.roomName,
    playerName: state.playerName,
    field: state.field,
    gameUrl: state.gameUrl,
    figure: state.figure,
    message: state.message,
  }
}
const mapDispatchToProps = (dispatch, ownProps) => {
  console.log('dispatch:', dispatch)
  console.log('ownProps:', ownProps)
  return {
    getFigure: (roomName, playerName) => {
      console.log('roomName:', roomName, 'playerName:', playerName)
      dispatch({
        type: 'server/get_figure',
        'roomName': roomName,
        'playerName': playerName,
      })
    },
    moveFigurebutton: (dir) => {
      console.log(dir)
      const directions = {
        'LEFT': 1,
        'RIGHT': 1,
        'DOWN': 1,
        'ROTATE': 1,
      }
      if (!(dir in directions)) {
        throw Error(`Direction ${dir} is not allowed in moveFigure!`)
      }
      dispatch({ type: `GAME_MOVE_FIGURE_${dir}`})
    },
    moveFigure: (figure) => {
      if (figure) {
        useEffect((figure) => {
          const input = event => {
            console.log(event.keyCode);
            switch (event.keyCode) {
              case 38:
                console.log('up')
                dispatch({type: `GAME_MOVE_FIGURE_ROTATE`})
                break
              case 37:
                console.log('left')
                dispatch({type: `GAME_MOVE_FIGURE_LEFT`})
                break
              case 39:
                console.log('right')
                dispatch({type: `GAME_MOVE_FIGURE_RIGHT`})
                break
              case 40:
                console.log('down')
                dispatch({type: `GAME_MOVE_FIGURE_DOWN`})
                break
            }
          };
          window.addEventListener('keydown', input);
          return () => {
            window.removeEventListener('keydown', input);
          };
        });
      }
    },
    fallFigure: (figure, moveFigurebutton) => {
      if (figure){
        useEffect(() => {
          const interval = window.setInterval(() => {
            moveFigurebutton('DOWN');
          }, 1000);
          return () => {
            window.clearInterval(interval);
          };
        }, []);
      }
    },
    setFigure: (roomName, playerName, figure) => {
      console.log('setFigure')
      dispatch({
        type: 'server/set_figure',
        'roomName': roomName,
        'playerName': playerName,
        'figure': figure,
      })
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Game)
