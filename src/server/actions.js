import debug from 'debug'
const loginfo = debug('tetris:info')

const ACTION_SERVER_CREATE_GAME = 'server/create_game'

const createGameAction = ({ action, socket, gameManager, io }) => {
  const { roomName, playerName } = action
  if (gameManager.isGameExists(roomName)) {
    const game = gameManager.connectGame(roomName, playerName, socket)
    socket.emit('action', { type: 'client/create_game',
      message: `You are connected to the game now, to connect redirect to: \
               http://host:port/#${action.roomName}${action.playerName}`,
      field: game.fields[action.playerName] })
    for (const player in game.sockets) {
      const id = game.sockets[player]
      loginfo(io.of('/').connected)
      const s = io.of('/').connected[id]
      s.emit('action', { type: 'client/new_player',
        message: `Player ${playerName} connected`,
        name: playerName,
        spectre: gameManager.getSpectre(roomName, playerName),
      })
    }
  }
  else {
    const game = gameManager.createGame(roomName, playerName, socket)
    socket.emit('action', { type: 'client/create_game',
      message: `game crated, to connect redirect to: \
               http://host:port/#${action.roomName}${action.playerName}`,
      field: game.fields[action.playerName] })
  }
}

const ACTION_SERVER_GET_FIGURE = 'server/get_figure'

const getFigureAction = ({ action, socket, gameManager }) => {
  const figure = gameManager.getFigure(action.roomName, action.playerName)
  socket.emit('action', { type: 'client/get_figure',
    message: 'Success',
    figure,
  })
}

const ACTION_SERVER_SET_FIGURE = 'server/set_figure'

const setFigureAction = ({ action, socket, gameManager }) => {
  const field = gameManager.setFigure(action.roomName, action.playerName, action.figure)
  socket.emit('action', { type: 'client/set_figure',
    message: 'Success',
    field,
  })
}

const actionMap = {
  ACTION_SERVER_CREATE_GAME: createGameAction,
  ACTION_SERVER_GET_FIGURE: getFigureAction,
  ACTION_SERVER_SET_FIGURE: setFigureAction,
}

module.exports = {
  ACTION_SERVER_CREATE_GAME,
  createGameAction,
  ACTION_SERVER_GET_FIGURE,
  getFigureAction,
  ACTION_SERVER_SET_FIGURE,
  setFigureAction,
  actionMap,
};
