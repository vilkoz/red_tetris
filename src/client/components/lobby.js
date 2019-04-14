import React from 'react'
import { connect } from 'react-redux';
import { Router, Route, Link } from 'react-router-dom';
import _ from 'lodash'
import {
  getGameListAction,
  createGameAction,
} from '../actions/server'
import { switchGameUrlAction } from '../actions/route'
import { changeRouteByState } from '../routes'

const Lobby = ({ message, playerName, roomName, field, gameUrl, gameList, errorMessage, gameState,
  updateRoomName, updatePlayerName, createGame, history, getGameList, switchGameUrl
}) => {
  changeRouteByState({ roomName, playerName, history, gameUrl, gameState, switchGameUrl })
  if (!gameList) {
    getGameList()
  }
  return (
    <div className='findGame'>
      <div className='createGame'>
        <div>
          <h1>Create a Game</h1>
          { errorMessage &&
            (<div className='errorMessage'>{errorMessage}</div>)
          }
          <div>
            <label htmlFor='#roomName'>Game name: </label>
            <input id='roomName' onChange={updateRoomName} type='text' value={roomName}/>
          </div>
          <div>
            <label htmlFor='#playerName'>Player name: </label>
            <input id='playerName' onChange={updatePlayerName} type='text' value={playerName}/>
          </div>
          <a className='button' href='#' onClick={() => createGame(roomName, playerName)}>
            { (gameList && _.some(gameList, (el) => el.name === roomName)) ? 'Connect' : 'Create' }
          </a>
        </div>
      </div>
      <div className='listLobby'>
        <div className='lobby'>
          <div className='gameName'><h3>Game Name</h3></div>
          <div className='count'><h3>Player Count</h3></div>
        </div>
        { (gameList && gameList.length > 0) ?
          gameList.map((game, i) => (
            <div className='lobby' key={i} onClick={() => updateRoomName({ target: { value: game.name } })}>
              <div className='gameName'>{game.name}</div>
              <div className='count'>{game.playerCount}</div>
            </div>
          )) : (
            <div className='lobby'>
              <div className='gameName'>No games yet</div>
            </div>
          )
        }
      </div>
    </div>
  )
}

export const mapStateToProps = (state) => (
  {
    message: state.message,
    roomName: state.roomName,
    playerName: state.playerName,
    field: state.field,
    gameUrl: state.gameUrl,
    gameList: state.gameList,
    errorMessage: state.errorMessage,
    gameState: state.gameState,
  }
)

export const mapDispatchToProps = (dispatch) => (
  {
    updateRoomName: (e) => {
      const roomName = e.target.value
      dispatch({ type: 'SAVE_GAME_NAME', roomName })
    },
    updatePlayerName: (e) => {
      const playerName = e.target.value
      dispatch({ type: 'SAVE_PLAYER_NAME', playerName })
    },
    createGame: (roomName, playerName) => {
      const sendRoomName = (roomName === '') ? undefined : roomName
      const sendPlayerName = (playerName === '') ? undefined : playerName
      dispatch(createGameAction(sendRoomName, sendPlayerName))
    },
    getGameList: () => {
      dispatch(getGameListAction())
    },
    switchGameUrl: (url) => {
      dispatch(switchGameUrlAction(url))
    }
  }
)

export default connect(mapStateToProps, mapDispatchToProps)(Lobby)
