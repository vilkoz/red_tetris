import debug from 'debug'
const logerror = debug('tetris:error'), loginfo = debug('tetris:info')
import _ from 'lodash'

import * as actions from '../common/action_index'

class ActionManager {
  constructor(gameManager, io) {
    this.gameManager = gameManager
    this.io = io
    this.actionMap = {
      [actions.SERVER_CREATE_GAME]: this.createGame,
      [actions.SERVER_GET_FIGURE]: this.getFigure,
      [actions.SERVER_SET_FIGURE]: this.setFigure,
      [actions.SERVER_GET_GAME_LIST]: this.getGameList,
      [actions.SERVER_UNSUBSCRIBE_GAME_LIST]: this.usubscribeGameListUpdate,
      [actions.SERVER_GET_PLAYER_READY_LIST]: this.getPlayerReadyList,
      [actions.SERVER_TOGGLE_READY]: this.playerToggleReady,
      [actions.SERVER_START_GAME]: this.startGame,
      [actions.SERVER_EXIT_GAME]: this.playerExitGame,
      [actions.SERVER_GAME_RESTART]: this.gameRestart,
      [actions.SERVER_DISCONNECT_GAME]: this.disconnectPlayer,
      [actions.SERVER_GAME_OVER]: this.playerGameOver,
    }
    this.gameListSubscribers = {}
  }

  dispatch = (action, socket) => {
    if (action.roomName) {
      loginfo('game:', this.gameManager.games[action.roomName])
    }
    if (!(action.type in this.actionMap)) {
      socket.emit('action', { type: actions.CLIENT_ERROR, message: `action ${action.type} is not supported!` })
      return
    }
    const actionFunc = this.actionMap[action.type]
    try {
      actionFunc({ action, socket })
    }
    catch (e) {
      socket.emit('action', { type: actions.CLIENT_ERROR, message: e.message })
      logerror(e.message)
      logerror(e.stack)
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
      socket.emit('action', { type: actions.CLIENT_CREATE_GAME,
        message: `You are connected to the game now, to connect redirect to: \
                 http://host:port/#${action.roomName}${action.playerName}`,
        field: game.fields[playerName] })
      this.roomForEachSocket(roomName, socket.id, (s) => {
        s.emit('action', { type: actions.CLIENT_NEW_PLAYER,
          message: `Player ${playerName} connected`,
          name: playerName,
          spectre: this.gameManager.getSpectre(roomName, playerName),
        })
        const playerReadyList = this.gameManager.getPlayerReadyList(roomName)
        s.emit('action', { type: actions.CLIENT_GET_PLAYER_READY_LIST,
          message: `Player ${playerName} connected`,
          playerReadyList,
        })
      })
    }
    else {
      const game = this.gameManager.createGame(roomName, playerName, socket)
      socket.emit('action', { type: actions.CLIENT_CREATE_GAME,
        message: `game crated, to connect redirect to: \
                 http://host:port/#${roomName}${playerName}`,
        field: game.fields[playerName],
        isOwner: true,
      })
    }
    _.forOwn(this.gameListSubscribers, (value, id) => {
      const s = this.io.of('/').connected[id]
      s.emit('action', { type: actions.CLIENT_UPDATE_GAME_LIST,
        gameList: this.gameManager.getGameList() })
    })
  }

  getFigure = ({ action, socket }) => {
    const { roomName, playerName } = this.verifyRequiredActionArgs(action, ['roomName', 'playerName'])
    const figure = this.gameManager.getFigure(roomName, playerName)
    socket.emit('action', { type: actions.CLIENT_GET_FIGURE,
      message: 'Success',
      figure,
    })
  }

  setFigure = ({ action, socket }) => {
    const { roomName, playerName, figure } = this.verifyRequiredActionArgs(
      action,
      ['roomName', 'playerName', 'figure']
    )
    const { field, score, isGameOver } = this.gameManager.setFigure(roomName, playerName, figure)
    socket.emit('action', { type: actions.CLIENT_SET_FIGURE,
      message: 'Success',
      field,
      score,
    })
    this.roomCheckDisconnected(roomName)
    if (isGameOver) {
      const { isFinished, scores } = this.gameManager.checkGameFinished(roomName)
      if (isFinished) {
        this.roomForEachSocket(roomName, -1, (s) => {
          s.emit('action', { type: actions.CLIENT_GAME_FINISHED, scores })
        })
        return
      }

      socket.emit('action', { type: actions.CLIENT_GAME_OVER, message: 'Game is over for you' })
      return
    }
    this.roomForEachSocket(roomName, socket.id, (s) => {
      s.emit('action', { type: actions.CLIENT_UPDATE_COMPETITOR_SPECTRE,
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
        s.emit('action', { type: actions.CLIENT_COMPETITOR_DISCONNECTED,
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
    _.forOwn(connected, (id, playerName) => {
      if (id !== currentSocketId) {
        const s = this.io.of('/').connected[id]
        return cb(s, playerName)
      }
    })
  }

  getGameList = ({ socket }) => {
    const gameList = this.gameManager.getGameList()
    this.gameListSubscribers[socket.id] = true
    socket.emit('action', { type: actions.CLIENT_UPDATE_GAME_LIST,
      message: 'Success',
      gameList,
    })
  }

  usubscribeGameListUpdate = ({ socket }) => {
    delete this.gameListSubscribers[socket.id]
  }

  getPlayerReadyList = ({ action, socket }) => {
    const { roomName } = this.verifyRequiredActionArgs(action, ['roomName'])
    const playerReadyList = this.gameManager.getPlayerReadyList(roomName)
    socket.emit('action', { type: actions.CLIENT_GET_PLAYER_READY_LIST,
      message: 'Success get player ready list',
      playerReadyList,
    })
  }

  playerToggleReady = ({ action, socket }) => {
    const { roomName, playerName } = this.verifyRequiredActionArgs(action, ['roomName', 'playerName'])
    const currentReadyStatus = this.gameManager.playerToggleReady(roomName, playerName)
    const playerReadyList = this.gameManager.getPlayerReadyList(roomName)
    // socket.emit('action', { type: actions.CLIENT_TOGGLE_READY,
    //   message: 'Success playerToggleReady',
    //   currentReadyStatus,
    // })
    this.roomForEachSocket(roomName, -1, (s) => {
      s.emit('action', { type: actions.CLIENT_GET_PLAYER_READY_LIST,
        message: 'Player ready list was updated',
        playerReadyList,
      })
    })
  }

  startGame = ({ action, socket }) => {
    const { roomName } = this.verifyRequiredActionArgs(action, ['roomName'])
    this.gameManager.startGame(roomName, socket.id)
    this.roomForEachSocket(roomName, -1, (s, player) => {
      s.emit('action', { type: actions.CLIENT_START_GAME,
        message: 'Success starting game',
        field: this.gameManager.getPlayerField(roomName, player),
      })
    })
  }

  playerExitGame = ({ action, socket }) => {
    const { roomName, playerName } = this.verifyRequiredActionArgs(action, ['roomName', 'playerName'])
    this.gameManager.roomRemovePlayer(roomName, playerName)
    socket.emit('action', { type: actions.CLIENT_EXIT_GAME,
      message: 'Success exiting game',
    })
    this.roomForEachSocket(roomName, -1, (s) => {
      s.emit('action', { type: actions.CLIENT_PLAYER_EXITED,
        message: `Player ${playerName} exited`,
        playerName,
      })
    })
  }

  gameRestart = ({ action, socket }) => {
    const { roomName } = this.verifyRequiredActionArgs(action, ['roomName'])
    this.gameManager.gameRestart(roomName, socket.id)
    const playerReadyList = this.gameManager.getPlayerReadyList(roomName)
    this.roomForEachSocket(roomName, -1, (s) => {
      s.emit('action', { type: actions.CLIENT_GAME_RESTART,
        message: 'Success restarting game',
        playerReadyList,
      })
    })
  }

  disconnectPlayer = ({ action, socket }) => {
    let disconnectedPlayerGame
    let playerName
    for (const game in this.gameManager.games) {
      const sockets = this.gameManager.getConnectedSockets(game)
      for (const player in sockets) {
        if (socket.id === sockets[player]) {
          disconnectedPlayerGame = game
          playerName = player
          break
        }
      }
      if (disconnectedPlayerGame && playerName) {
        break
      }
    }
    loginfo(`free: ${disconnectedPlayerGame}  ${playerName}`)
    if (!disconnectedPlayerGame || !playerName) {

      /* player hasn't been connected to any game */
      return
    }

    const deleteRoom = this.gameManager.roomRemovePlayer(disconnectedPlayerGame, playerName)
    if (deleteRoom) {
      for (const id in this.gameListSubscribers) {
        const s = this.io.of('/').connected[id]
        s.emit('action', { type: actions.CLIENT_UPDATE_GAME_LIST,
          gameList: this.gameManager.getGameList() })
      }
    }
  }

  playerGameOver = ({ action, socket }) => {
    const { roomName, playerName } = this.verifyRequiredActionArgs(action, ['roomName', 'playerName'])
    socket.emit('action', { type: actions.CLIENT_GAME_OVER, message: 'Game is over for you' })
    this.gameManager.playerSetGameOver(roomName, playerName)
    const { isFinished, scores } = this.gameManager.checkGameFinished(roomName)
    console.log('game over isFinished: ', isFinished)
    if (isFinished) {
      this.roomForEachSocket(roomName, -1, (s) => {
        s.emit('action', { type: actions.CLIENT_GAME_FINISHED, scores })
      })
      return
    }
  }
}

module.exports = {
  ActionManager,
};
