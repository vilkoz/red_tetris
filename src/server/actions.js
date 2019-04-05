import debug from 'debug'
const loginfo = debug('tetris:info')

import {
  SERVER_CREATE_GAME,
  SERVER_GET_FIGURE,
  SERVER_SET_FIGURE,
  SERVER_GET_GAME_LIST,
  CLIENT_CREATE_GAME,
  CLIENT_ERROR,
  CLIENT_NEW_PLAYER,
  CLIENT_GET_FIGURE,
  CLIENT_SET_FIGURE,
  CLIENT_UPDATE_COMPETITOR_SPECTRE,
  CLIENT_COMPETITOR_DISCONNECTED,
  CLIENT_UPDATE_GAME_LIST,
} from '../common/action_index'

class ActionManager {
  constructor(gameManager, io) {
    this.gameManager = gameManager
    this.io = io
    this.actionMap = {
      [SERVER_CREATE_GAME]: this.createGame,
      [SERVER_GET_FIGURE]: this.getFigure,
      [SERVER_SET_FIGURE]: this.setFigure,
      [SERVER_GET_GAME_LIST]: this.getGameList,
    }
    this.gameListSubscribers = {}
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

  verifyRequiredActionArgs = (action, requiredArgsList) => {
    for (const argNum in requiredArgsList) {
      const arg = requiredArgsList[argNum]
      if (!(arg in action)) {
        const argStr = requiredArgsList.join(', ')
        throw Error(`You must provide following arguments: ${argStr}; but ${arg} wasn't found`)
      }
    }
    return action
  }

  createGame = ({ action, socket }) => {
    const { roomName, playerName } = this.verifyRequiredActionArgs(action, ['roomName', 'playerName'])
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
    for (const id in this.gameListSubscribers) {
      const s = this.io.of('/').connected[id]
      s.emit('action', { type: CLIENT_UPDATE_GAME_LIST,
        gameList: this.gameManager.getGameList() })
    }
  }

  getFigure = ({ action, socket }) => {
    const { roomName, playerName } = this.verifyRequiredActionArgs(action, ['roomName', 'playerName'])
    const figure = this.gameManager.getFigure(roomName, playerName)
    socket.emit('action', { type: CLIENT_GET_FIGURE,
      message: 'Success',
      figure,
    })
  }

  setFigure = ({ action, socket }) => {
    const { roomName, playerName, figure } = this.verifyRequiredActionArgs(
      action,
      ['roomName', 'playerName', 'figure']
    )
    const { field, score } = this.gameManager.setFigure(roomName, playerName, figure)
    socket.emit('action', { type: CLIENT_SET_FIGURE,
      message: 'Success',
      field,
      score,
    })
    this.roomCheckDisconnected(roomName)
    this.roomForEachSocket(roomName, socket.id, (s) => {
      s.emit('action', { type: CLIENT_UPDATE_COMPETITOR_SPECTRE,
        message: `Player ${playerName} placed figure`,
        name: playerName,
        spectre: this.gameManager.getSpectre(roomName, playerName),
        score,
      })
    })
  }

  roomCheckDisconnected = (roomName) => {
    if (!this.gameManager.isGameExists(roomName)) {
      throw Error(`Game with name ${roomName} doesn't exist`)
    }
    const disconnectedPlayers = []

    this.roomForEachSocket(roomName, -1, (s, player) => {
      if (!s) {
        disconnectedPlayers.push(player)
        console.log('removing player', player)
        this.gameManager.roomRemovePlayer(roomName, player)
      }
    })
    for (const i in disconnectedPlayers) {
      const player = disconnectedPlayers[i]
      this.roomForEachSocket(roomName, -1, (s) => {
        s.emit('action', { type: CLIENT_COMPETITOR_DISCONNECTED,
          message: `Player ${player} placed figure`,
          name: player,
        })
      })
    }
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

  getGameList = ({ socket }) => {
    const gameList = this.gameManager.getGameList()
    this.gameListSubscribers[socket.id] = true
    socket.emit('action', { type: CLIENT_UPDATE_GAME_LIST,
      message: 'Success',
      gameList,
    })
  }

  usubscribeGameListUpdate = ({ socket }) => {
    delete this.gameListSubscribers[socket.id]
  }
}

module.exports = {
  ActionManager,
};
