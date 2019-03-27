import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import GameField from './game_field'

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
      <span>{playerName && roomName && playerName + roomName}</span>
      <br/>
      <div>
        <GameField field={field} figure={figure}/>
        <button onClick={() => getFigure(roomName, playerName)}>Get Figure</button>
      </div>
    </div>
  )
}

const mapStateToProps = (state, ownProps) => {
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
  return {
    getFigure: (roomName, playerName) => {
      console.log('roomName:', roomName, 'playerName:', playerName)
      dispatch({
        type: 'server/get_figure',
        roomName,
        playerName,
      })
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Game)
