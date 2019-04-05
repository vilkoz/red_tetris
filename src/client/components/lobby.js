import React from 'react'
import { connect } from 'react-redux';
import { Router, Route, Link } from 'react-router-dom';

const Lobby = ({ message, playerName, roomName, field, gameUrl,
  updateRoomName, updatePlayerName, createGame, history
}) => {
  if (gameUrl) {
    history.push(gameUrl)
  }
  return (
    <div className="findGame">
      <div className="createGame">
        <div>
          <h1>Create a Game</h1>
          <div>
            <label htmlFor='#roomName'>Game name: </label>
            <input id='roomName' onChange={updateRoomName} type='text'/>
          </div>
          <div>
            <label htmlFor='#playerName'>Player name: </label>
            <input id='playerName' onChange={updatePlayerName} type='text'/>
          </div>
          <a href="#" onClick={() => createGame(roomName, playerName)} className="button">Create</a>
        </div>
      </div>
      <div className="listLobby">
        <div className="lobby">
          <div className="gameName"><h3>Game Name</h3></div>
          <div className="count"><h3>Player Count</h3></div>
        </div>
        <div className="lobby">
          <div className="gameName">pidarov</div>
          <div className="count">3</div>
        </div>
        <div className="lobby">
          <div className="gameName">lorem dlya pidarovpidarovpidarovpidarovpidarovpidarovpidarovpidarov</div>
          <div className="count">3</div>
        </div>
        <div className="lobby">
          <div className="gameName">lorem dlya pidarovpidarovpidarovpidarovpidarovpidarovpidarovpidarov</div>
          <div className="count">3</div>
        </div>


        <div className="lobby">
          <div className="gameName">lorem dlya pidarovpidarovpidarovpidarovpidarovpidarovpidarovpidarov</div>
          <div className="count">3</div>
        </div>
      </div>
    </div>
  )
}

const mapStateToProps = (state) => (
  {
    message: state.message,
    roomName: state.roomName,
    playerName: state.playerName,
    field: state.field,
    gameUrl: state.gameUrl,
  }
)

const mapDispatchToProps = (dispatch) => (
  {
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
      dispatch({ type: 'server/create_game', roomName, playerName })
    },
  }
)

export default connect(mapStateToProps, mapDispatchToProps)(Lobby)
