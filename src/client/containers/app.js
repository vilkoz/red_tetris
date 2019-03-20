import React from 'react'
import { connect } from 'react-redux'
import { StyleSheet, css } from 'aphrodite'

const styles = StyleSheet.create({
  fieldElem: {
    display: 'inline-block',
    fontFamily: 'monospaced',
  },
})

const App = ({ message, playerName, roomName, field, figure, sendPing, updateRoomName, updatePlayerName, createGame, getFigure }) => {
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
      </div>
      ) : <div></div>
      }
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
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
