import React from 'react'
import { connect } from 'react-redux'
import { StyleSheet, css } from 'aphrodite'

const styles = StyleSheet.create({
  fieldElem: {
    display: 'inline-block',
    fontFamily: 'monospaced',
  },
})

const App = ({
  message, playerName, roomName, field, figure, moveFigure, setFigure,
  sendPing, updateRoomName, updatePlayerName, createGame, getFigure
}) => {
  return (
    <div>
      <h1>Kos pidoras</h1>
      <button onClick={sendPing}>PUP</button>
      <span>{message}</span>
      <br/>
      <span>{playerName}</span>
      <span>&nbsp;</span>
      <span>{roomName}</span>
      <br/>
      <label htmlFor="#roomName">Game name: </label>
      <input id="roomName" type='text' onChange={updateRoomName}/>
      <br/>
      <label htmlFor="#playerName">Player name: </label>
      <input id="playerName"type='text' onChange={updatePlayerName}/>
      <br/>
      <button onClick={() => createGame(roomName, playerName)}>Create/Connect Game</button>
      { field ? (
      <div>
        {((field, figure) => {
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
        <button onClick={() => moveFigure('LEFT')}>&lt;</button>
        <button onClick={() => moveFigure('RIGHT')}>&gt;</button>
        <button onClick={() => moveFigure('DOWN')}>V</button>
        <button onClick={() => moveFigure('ROTATE')}>rot</button>
        <br/>
        <button onClick={() => setFigure(roomName, playerName, figure)}>set figure</button>
      </div>
      ) : <div></div>
      }
      <div>{figure ? figure.x : 'x'}&nbsp;{figure ? figure.y : 'y'}</div>
    </div>
  )
}

const mapStateToProps = (state, ownProps) => {
  console.log('state:', state)
  console.log('ownProps:', ownProps)
  return {
    message: state.message,
    roomName: state.roomName,
    playerName: state.playerName,
    field: state.field,
    figure: state.figure,
  }
}
const mapDispatchToProps = (dispatch, ownProps) => {
  console.log('dispatch:', dispatch)
  console.log('ownProps:', ownProps)

  const moveFigure = (dir) => {
    const directions = {
      'LEFT': 1,
      'RIGHT': 1,
      'DOWN': 1,
      'ROTATE': 1,
    }
    if (!(dir in directions)) {
      throw Error(`Direction ${dir} is not allowed in moveFigure!`)
    }
    dispatch({ type: `GAME_MOVE_FIGURE_${dir}` });
  }

  return {
    sendPing: () => dispatch({ type: 'server/ping', message: 'test' }),
    updateRoomName: (e) => {
      const roomName = e.target.value
      console.log(roomName)
      dispatch({ type: 'SAVE_GAME_NAME', roomName })
    },
    updatePlayerName: (e) => {
      const playerName = e.target.value
      console.log(e)
      dispatch({ type: 'SAVE_PLAYER_NAME', playerName })
    },
    createGame: (roomName, playerName) => {
      console.log('roomName:', roomName, 'playerName:', playerName)
      dispatch({
        type: 'server/create_game',
        'roomName': roomName,
        'playerName': playerName,
      })
    },
    getFigure: (roomName, playerName) => {
      console.log('roomName:', roomName, 'playerName:', playerName)
      dispatch({
        type: 'server/get_figure',
        'roomName': roomName,
        'playerName': playerName,
      })
    },
    moveFigure: moveFigure,
    setFigure: (roomName, playerName, figure) => {
      console.log('setFigure')
      dispatch({
        type: 'server/set_figure',
        'roomName': roomName,
        'playerName': playerName,
        'figure': figure,
      })
      console.log('getFigure')
      dispatch({
        type: 'server/get_figure',
        'roomName': roomName,
        'playerName': playerName,
      })
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
