import React, { useEffect } from 'react'
import { StyleSheet, css } from 'aphrodite'
import {connect} from "react-redux";

const styles = StyleSheet.create({
  fieldElem: {
    display: 'inline-block',
    fontFamily: 'monospaced',
  },
})

const Game = ({ message, playerName, roomName, field, figure, getFigure, gameUrl, history }) => {
  useEffect(() => {
    console.log('moun')
    return () => {
      console.log('unmo')
    };
  });
  if (!gameUrl) {
    history.push('/')
  }
  useEffect(() => { console.log('mount'); return () => console.log('unmount') })
  return (
    <div>
      <h1>Game</h1>
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
        <br/>
        <button onClick={() => moveFigure('LEFT')}>&larr;</button>
        <button onClick={() => moveFigure('RIGHT')}>&rarr;</button>
        <button onClick={() => moveFigure('DOWN')}>&darr;</button>
        <button onClick={() => moveFigure('ROTATE')}>rotate</button>
        <br/>
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
    moveFigure: (dir) => {
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
    // check: () => {
      // useEffect(() => {
      //   // key handler hook
      //   const input = event => {
      //     console.log(event.keyCode);
      //   };
      //   window.addEventListener('keydown', input);
      //   return () => {
      //     window.removeEventListener('keydown', input);
      //   };
      // });
      // const input = event => {
      //   console.log(event.keyCode);
      //   switch (event.key) {
      //     case 'ArrowUp':
      //       console.log('up')
      //       break
      //     case 'ArrowLeft':
      //       console.log('left')
      //       break
      //     case 'ArrowRight':
      //       console.log('right')
      //       break
      //     case 'ArrowDown':
      //       console.log('down')
      //       break
      //   }
      // };
      // window.removeEventListener('keydown', input);
      // window.addEventListener('keydown', input);
      // window.addEventListener("keydown", event => {
      //
      //   console.log(event.key)
      //   window.removeEventListener("keydown", event)
      //
      //   if (event.key == 'ArrowUp'){
      //     console.log('up');
      //     window.removeEventListener("keydown", event)
      //
      //     dispatch({ type: `GAME_MOVE_FIGURE_ROTATE`})
      //   }
      //   else if (event.key == 'ArrowRight'){
      //     console.log('right');
      //     window.removeEventListener("keydown", event)
      //     moveFigure('RIGHT')
      //   }
      //   else if (event.key == 'ArrowLeft'){
      //     console.log('left');
      //     window.removeEventListener("keydown", event)
      //
      //     dispatch({ type: `GAME_MOVE_FIGURE_LEFT`})
      //   }
      //   else if (event.key == 'ArrowDown'){
      //     console.log('down');
      //     window.removeEventListener("keydown", event)
      //
      //     dispatch({ type: `GAME_MOVE_FIGURE_DOWN`})
      //   }
      //   window.removeEventListener("keydown", event)
        // switch (event.key) {
        //   case 'ArrowUp':
        //     console.log('up')
        //     break
        //   case 'ArrowLeft':
        //     console.log('left')
        //     break
        //   case 'ArrowRight':
        //     console.log('right')
        //     break
        //   case 'ArrowDown':
        //     console.log('down')
        //     break
        // }
      // });
    // }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Game)
