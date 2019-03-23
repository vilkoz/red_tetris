import debug from 'debug'
const logerror = debug('tetris:error'), loginfo = debug('tetris:info')

class GameManager {
  constructor() {
    this.games = {};
  }

  isGameExists(roomName) {
    return roomName in this.games
  }

  getUsers(roomName) {
    return this.games[roomName].fields
  }

  createGame(roomName, playerName, socket) {
    if (roomName in this.games) {
      throw Error(`Game with name ${roomName} already exists!`)
    }
    let game = this.games[roomName]
    game = {
      sockets: {},
      fields: {},
      figures: {},
    }
    game['roomName'] = roomName
    game.fields[playerName] = this.createField()
    game.sockets[playerName] = socket.id
    this.games[roomName] = game
    return game
  }

  connectGame(roomName, playerName, socket) {
    // if (!(roomName in this.games)) {
    //   return this.createGame(roomName, playerName)
    // }
    const game = this.games[roomName]
    if (playerName in game.fields) {
      throw Error(`Player with name ${playerName} already connected to the room ${roomName}!`)
    }
    game.fields[playerName] = this.createField()
    game.sockets[playerName] = socket.id
    return game
  }

  createField() {
    const fieldHeight = 20
    const fieldWidth = 10
    const arr = new Array(fieldHeight)
    for (let i = 0; i < fieldHeight; i = i + 1) {
      arr[i] = Array(fieldWidth)
    }
    for (let i = 0; i < fieldHeight; i = i + 1) {
      for (let j = 0; j < fieldWidth; j = j + 1) {
        arr[i][j] = 0
      }
    }
    return arr
  }

  getFigure(roomName, playerName) {
    if (!(roomName in this.games)) {
      throw Error(`Game with name ${roomName} doesn't exist!`)
    }
    if (!(playerName in this.games[roomName].fields)) {
      throw Error(`Player with name ${playerName} is not connected to the game ${roomName}`)
    }
    const figures = [
      [
        [1, 1, 1, 1],
      ],
      [
        [1, 1],
        [1, 0],
        [1, 0],
      ],
      [
        [1, 1],
        [0, 1],
        [0, 1],
      ],
      [
        [1, 1],
        [1, 1],
      ],
      [
        [0, 1, 1],
        [1, 1, 0],
      ],
      [
        [1, 1, 0],
        [0, 1, 1],
      ],
      [
        [1, 1, 1],
        [0, 1, 0],
      ],
    ]
    const playerFigure = figures[Math.floor(Math.random() * figures.length)]
    this.games[roomName].figures[playerName] = playerFigure
    return playerFigure
  }

  rotateFigure(figure) {
    const h = figure.length
    const w = figure[0].length
    const res = new Array(w)

    for (let i = 0; i < w; i = i + 1) {
      res[i] = new Array(h)
      for (let j = 0; j < h; j = j + 1) {
        res[i][h - j - 1] = figure[j][i]
      }
    }
    return res
  }

  setFigure(roomName, playerName, figure) {
    if (!(roomName in this.games)) {
      throw Error(`Game with name ${roomName} doesn't exist!`)
    }
    if (!(playerName in this.games[roomName].fields)) {
      throw Error(`Player with name ${playerName} is not connected to the game ${roomName}`)
    }
    let rotatedFigure = this.games[roomName].figures[playerName]

    for (let i = 0; i < figure.rotations; i = i + 1) {
      rotatedFigure = this.rotateFigure(rotatedFigure)
    }
    loginfo('rotatedFigure', rotatedFigure)

    const h = rotatedFigure.length;
    const w = rotatedFigure[0].length;
    let field = this.games[roomName].fields[playerName]
    if (figure.x < 0 || figure.x + w - 1 >= field[0].length ||
        figure.y < 0 || figure.y + h - 1 >= field.length) {
      throw Error(`Wrong figure location: ${figure.x} ${figure.y}`);
    }
    field = field.map((line, y) =>
      line.map((el, x) => {
        if (y >= figure.y && y < figure.y + rotatedFigure.length &&
            x >= figure.x && x < figure.x + rotatedFigure[0].length) {
          const figurePiece = rotatedFigure[y - figure.y][x - figure.x]
          if (figurePiece === 1 && el === 1) {
            throw Error(`Figure intersects with existing piece on field coords: ${x} ${y}`);
          }
          return figurePiece
        }
        return el
      })
    )
    delete this.games[roomName].figures[playerName]
    this.games[roomName].fields[playerName] = field
    loginfo('field', field)
    return field
  }

  getSpectre(roomName, playerName) {
    if (!(roomName in this.games)) {
      throw Error(`Game with name ${roomName} doesn't exist!`)
    }
    if (!(playerName in this.games[roomName].fields)) {
      throw Error(`Player with name ${playerName} is not connected to the game ${roomName}`)
    }

    const field = this.games[roomName].fields[playerName]

    for (let x = 0; x < field[0].length; x = x + 1) {
      let draw = false

      for (let y = 0; y < field.length; y = y + 1) {
        if (field[y][x] !== 0) {
          draw = true
        }
        if (draw) {
          field[y][x] = 1
        }
      }
    }
    return field
  }
}

module.exports = GameManager;