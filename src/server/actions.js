import debug from 'debug'
const loginfo = debug('tetris:info')

const SERVER_CREATE_GAME = 'server/create_game'

const SERVER_GET_FIGURE = 'server/get_figure'

const SERVER_SET_FIGURE = 'server/set_figure'

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
      socket.emit('action', { type: 'client/error', message: `action ${action.type} is not supported!` })
      return
    }
    const actionFunc = this.actionMap[action.type]
    try {
      actionFunc({ action, socket })
    }
    catch (e) {
      socket.emit('action', { type: 'client/error', message: e.message })
    }
  }

  createGame = ({ action, socket }) => {
    const { roomName, playerName } = action
    if (this.gameManager.isGameExists(roomName)) {
      const game = this.gameManager.connectGame(roomName, playerName, socket)
      socket.emit('action', { type: 'client/create_game',
        message: `You are connected to the game now, to connect redirect to: \
                 http://host:port/#${action.roomName}${action.playerName}`,
        field: game.fields[playerName] })
      this.roomForEachSocket(roomName, socket.id, (s) => (
            s.emit('action', { type: 'client/new_player',
              message: `Player ${playerName} connected`,
              name: playerName,
              spectre: this.gameManager.getSpectre(roomName, playerName),
            })
      ))
    }
    else {
      const game = this.gameManager.createGame(roomName, playerName, socket)
      socket.emit('action', { type: 'client/create_game',
        message: `game crated, to connect redirect to: \
                 http://host:port/#${roomName}${playerName}`,
        field: game.fields[playerName] })
    }
  }

  getFigure = ({ action, socket }) => {
    const figure = this.gameManager.getFigure(action.roomName, action.playerName)
    socket.emit('action', { type: 'client/get_figure',
      message: 'Success',
      figure,
    })
  }

  setFigure = ({ action, socket }) => {
    const { roomName, playerName, figure } = action
    const field = this.gameManager.setFigure(roomName, playerName, figure)
    socket.emit('action', { type: 'client/set_figure',
      message: 'Success',
      field,
    })
    this.roomForEachSocket(roomName, socket.id, (s, player) => (
        s.emit('action', { type: 'client/update_competitor_spectre',
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
  SERVER_CREATE_GAME,
  SERVER_GET_FIGURE,
  SERVER_SET_FIGURE,
  ActionManager,
};
