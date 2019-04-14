import React from 'react'
import { connect } from 'react-redux';
import _ from 'lodash'
import { switchGameUrlAction } from '../actions/route'
import {
  toggleReadyStateAction,
  startGameAction
} from '../actions/server'
import { changeRouteByState } from '../routes'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCat, faCrow, faDog, faDove, faDragon, faFeather,
  faFish, faFrog, faHippo, faHorse, faOtter, faPaw, faSpider,
} from '@fortawesome/free-solid-svg-icons'
library.add(
  faCat, faCrow, faDog, faDove, faDragon, faFeather,
  faFish, faFrog, faHippo, faHorse, faOtter, faPaw, faSpider
)

const images = [
  'cat', 'crow', 'dog', 'dove', 'dragon', 'feather', 'fish',
  'frog', 'hippo', 'horse', 'otter', 'paw', 'spider',
]

const themeStyles = {
  default: 'default'
}

const GameLobby = ({ message, playerName, roomName, gameUrl, errorMessage, gameState, playerReadyList, isOwner, theme,
  history, switchGameUrl, toggleReadyState, startGame, changeTheme
}) => {
  changeRouteByState({ roomName, playerName, history, gameUrl, gameState, switchGameUrl })
  return (
    <div className='gameLobby'>
      <div className={`playerLobby ${theme}`}>
        <h1> Game lobby '{roomName}' </h1>
        <div className='errorMessage'>{ errorMessage && <b>{errorMessage}</b>}</div>
        <div className='playerList'>
          { playerReadyList &&
            playerReadyList.map((el, readyListKey) => (
              <div className={el.readyStatus ? 'player ready' : 'player' } key={readyListKey}>
                <FontAwesomeIcon icon={_.sample(images)}/>
                <div className='container'>
                  <p>{el.player}</p>
                </div>
              </div>
            ))
          }
        </div>
      </div>
      <div className='preferences'>
        <button onClick={() => isOwner ? startGame(roomName) : toggleReadyState(roomName, playerName)}>
          {isOwner ? 'Start game' : 'Toggle ready' }
        </button>
        <div className='styled-select'>
          <h3>Choose theme:</h3>
          <select value={theme} onChange={changeTheme}>
            <option value='default'>Default</option>
            <option value='magic'>Magic</option>
            <option value='podval'>Podval</option>
          </select>
        </div>
      </div>
    </div>
  )
}

export const mapStateToProps = (state) => (
  {
    message: state.message,
    roomName: state.roomName,
    playerName: state.playerName,
    gameUrl: state.gameUrl,
    errorMessage: state.errorMessage,
    gameState: state.gameState,
    playerReadyList: state.playerReadyList,
    isOwner: state.isOwner,
    theme: state.theme,
  }
)

export const mapDispatchToProps = (dispatch) => (
  {
    switchGameUrl: (url) => {
      dispatch(switchGameUrlAction(url))
    },
    toggleReadyState: (roomName, playerName) => {
      dispatch(toggleReadyStateAction(roomName, playerName))
    },
    startGame: (roomName) => {
      dispatch(startGameAction(roomName))
    },
    changeTheme: (e) => {
      dispatch({ type: 'CHANGE_THEME', theme: e.target.value })
    }
  }
)

export default connect(mapStateToProps, mapDispatchToProps)(GameLobby)
