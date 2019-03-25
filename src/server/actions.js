import debug from 'debug'
const loginfo = debug('tetris:info')

import {
  SERVER_CREATE_GAME,
  SERVER_GET_FIGURE,
  SERVER_SET_FIGURE,
  CLIENT_CREATE_GAME,
  CLIENT_ERROR,
  CLIENT_NEW_PLAYER,
  CLIENT_GET_FIGURE,
  CLIENT_SET_FIGURE,
  CLIENT_UPDATE_COMPETITOR_SPECTRE,
} from '../common/action_index'

class ActionManager {
  constructor(gameManager, io) {
    this.gameManager = gameManager
    this.io = io
    this.actionMap = {
      [SERVER_CREATE_GAME]: this.createGame,
      [SERVER_GET_FIGURE]: this.getFigure,
      [SERVER_SET_FIGURE]: this.setFigure,
    }
  }

  dispatch = (action, socket) => {
    if (!(action.type in this.actionMap)) {
      loginfo('actionMap', this.actionMap)
      socket.emit('action', { type: CLIENT_ERROR, message: `action ${action.type} is not supported!` })
      return
    }
    const actionFunc = this.actionMap[action.type]
    try {
      actionFunc({ action, socket })
    }
    catch (e) {
      socket.emit('action', { type: CLIENT_ERROR, message: e.message })
    }
  }

  createGame = ({ action, socket }) => {
    const { roomName, playerName } = action
    if (this.gameManager.isGameExists(roomName)) {
      const game = this.gameManager.connectGame(roomName, playerName, socket)
      socket.emit('action', { type: CLIENT_CREATE_GAME,
        message: `You are connected to the game now, to connect redirect to: \
                 http://host:port/#${action.roomName}${action.playerName}`,
        field: game.fields[playerName] })
      this.roomForEachSocket(roomName, socket.id, (s) => (
            s.emit('action', { type: CLIENT_NEW_PLAYER,
              message: `Player ${playerName} connected`,
              name: playerName,
              spectre: this.gameManager.getSpectre(roomName, playerName),
            })
      ))
    }
    else {
      const game = this.gameManager.createGame(roomName, playerName, socket)
      socket.emit('action', { type: CLIENT_CREATE_GAME,
        message: `game crated, to connect redirect to: \
                 http://host:port/#${roomName}${playerName}`,
        field: game.fields[playerName] })
    }
  }

  getFigure = ({ action, socket }) => {
    const figure = this.gameManager.getFigure(action.roomName, action.playerName)
    socket.emit('action', { type: CLIENT_GET_FIGURE,
      message: 'Success',
      figure,
    })
  }

  setFigure = ({ action, socket }) => {
    const { roomName, playerName, figure } = action
    const field = this.gameManager.setFigure(roomName, playerName, figure)
    socket.emit('action', { type: CLIENT_SET_FIGURE,
      message: 'Success',
      field,
    })
    this.roomForEachSocket(roomName, socket.id, (s, player) => (
        s.emit('action', { type: CLIENT_UPDATE_COMPETITOR_SPECTRE,
          message: `Player ${playerName} placed figure`,
          name: player,
          spectre: this.gameManager.getSpectre(roomName, player),
        })
    ))
  }

  roomForEachSocket = (roomName, currentSocketId, cb) => {
    if (!this.gameManager.isGameExists(roomName)) {
      throw Error(`Game with name ${roomName} doesn't exist`)
    }
    const connected = this.gameManager.getConnectedSockets(roomName)
    for (const playerName in connected) {
      const id = connected[playerName]
      if (id !== currentSocketId) {
        const s = this.io.of('/').connected[id]
        return cb(s, playerName)
      }
    }
  }
}

module.exports = {
  ActionManager,
};
