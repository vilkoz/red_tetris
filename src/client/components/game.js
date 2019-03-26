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
      </div>
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
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Game)
