import debug from 'debug'
const loginfo = debug('tetris:info')
import _ from 'lodash'
import {
  STATE_GAME_LOBBY,
  STATE_GAME,
  STATE_LEADER_BOARD,
} from '../common/game_states.js'

class GameManager {
  constructor() {
    this.games = {};
    this.fieldWidth = 10
    this.fieldHeight = 20
  }

  isGameExists(roomName) {
    return roomName in this.games
  }

  getUsers(roomName) {
    if (!this.isGameExists(roomName)) {
      throw Error(`Game with name ${roomName} does not exist!`)
    }
    return this.games[roomName].fields
  }

  getConnectedSockets(roomName) {
    if (!this.isGameExists(roomName)) {
      throw Error(`Game with name ${roomName} does not exist!`)
    }
    return this.games[roomName].sockets
  }

  createGame(roomName, playerName, socket) {
    if (this.isGameExists(roomName)) {
      throw Error(`Game with name ${roomName} already exists!`)
    }
    let game = this.games[roomName]
    game = {
      state: STATE_GAME_LOBBY,
      readyList: {},
      owner: playerName,
      isPlaying: {},
      sockets: {},
      fields: {},
      figures: {},
      scores: {},
      isStarted: false,
    }
    game.roomName = roomName
    game.fields[playerName] = this.createField()
    game.sockets[playerName] = socket.id
    game.scores[playerName] = 0
    game.readyList[playerName] = true
    game.isPlaying[playerName] = false
    this.games[roomName] = game
    return game
  }

  connectGame(roomName, playerName, socket) {
    if (!this.isGameExists(roomName)) {
      throw Error(`Game with name ${roomName} does not exist!`)
    }
    const game = this.games[roomName]
    if (playerName in game.fields) {
      throw Error(`Player with name ${playerName} already connected to the room ${roomName}!`)
    }
    game.fields[playerName] = this.createField()
    game.sockets[playerName] = socket.id
    game.readyList[playerName] = false
    game.isPlaying[playerName] = false
    return game
  }

  createField() {
    const fieldHeight = 20
    const fieldWidth = 10
    const arr = new Array(fieldHeight)
    for (let i = 0; i < fieldHeight; i = i + 1) {
      arr[i] = Array(fieldWidth)
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
    if (playerName in this.games[roomName].figures) {
      throw Error(`Player with name ${playerName} already has a figure`)
    }
    const figures = [
      [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
      [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0],
      ],
      [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0],
      ],
      [
        [1, 1],
        [1, 1],
      ],
      [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0],
      ],
      [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0],
      ],
      [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0],
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

  figureCropFreeLines(figure) {
    const shift = {
      x: 0,
      y: 0,
    }

    shift.y = _.findIndex(figure, (row) => _.some(row, el => el !== 0))
    let res = _.filter(figure, (row) => _.some(row, el => el !== 0))

    res = _.zip(...res)

    shift.x = _.findIndex(res, (column) => _.some(column, el => el !== 0))
    res = _.filter(res, (column) => _.some(column, el => el !== 0))

    res = _.zip(...res)

    return { shift, figure: res }
  }

  setFigure(roomName, playerName, figure) {
    if (!(roomName in this.games)) {
      throw Error(`Game with name ${roomName} doesn't exist!`)
    }
    if (!(playerName in this.games[roomName].fields)) {
      throw Error(`Player with name ${playerName} is not connected to the game ${roomName}`)
    }
    if (!(playerName in this.games[roomName].figures)) {
      throw Error(`Player with name ${playerName} doesn't have any figures to place!`)
    }
    if (!this.games[roomName].isPlaying[playerName]) {
      throw Error(`For player ${playerName} game is over!`)
    }
    let rotatedFigure = this.games[roomName].figures[playerName]

    for (let i = 0; i < figure.rotations; i = i + 1) {
      rotatedFigure = this.rotateFigure(rotatedFigure)
    }
    loginfo('rotatedFigure', rotatedFigure)

    const croppedFigure = this.figureCropFreeLines(rotatedFigure)
    rotatedFigure = croppedFigure.figure
    figure.x = figure.x + croppedFigure.shift.x
    figure.y = figure.y + croppedFigure.shift.y

    const h = rotatedFigure.length;
    const w = rotatedFigure[0].length;
    let field = this.games[roomName].fields[playerName]
    if (figure.x < 0 || figure.x + w - 1 >= field[0].length ||
        figure.y < 0 || figure.y + h - 1 >= field.length) {
      throw Error(`Wrong figure location: ${figure.x} ${figure.y}`);
    }
    if (!this.checkFigureIsNotFlying({ x: figure.x, y: figure.y, figure: rotatedFigure }, field)) {
      throw Error(`Can't set figure in the air: ${figure.x} ${figure.y}`)
    }
    field = field.map((line, y) =>
      line.map((el, x) => {
        if (y >= figure.y && y < figure.y + rotatedFigure.length &&
            x >= figure.x && x < figure.x + rotatedFigure[0].length) {
          const figurePiece = rotatedFigure[y - figure.y][x - figure.x]
          if (figurePiece === 1 && el === 1) {
            throw Error(`Figure intersects with existing piece on field coords: ${x} ${y}`);
          }
          return (figurePiece !== 0) ? figurePiece : el
        }
        return el
      })
    )
    const brakeRes = this.checkRowBrake(field)
    const scoredField = brakeRes.field
    const score = brakeRes.score

    /* eslint-disable prefer-reflect */
    delete this.games[roomName].figures[playerName]

    /* eslint-enable prefer-reflect */
    this.games[roomName].fields[playerName] = scoredField
    this.games[roomName].scores[playerName] = score
    loginfo('field', scoredField)
    loginfo('score', score)
    let isGameOver = false
    if (_.some(scoredField, (row) => row[0] !== 0)) {
      isGameOver = true
      this.games[roomName].isPlaying[playerName] = false
    }
    return { field: scoredField, score, isGameOver }
  }

  checkFigureIsNotFlying(figure, field) {
    const collumns = _.zip(...figure.figure)

    /* eslint-disable no-confusing-arrow */
    const coordsToCheck = collumns.map((collumn, collumnNum) => {
      const maxY = collumn
        .map((el, y) => (el === 1 ? y : -1))
        .reduce((max, el) => (max < el) ? el : max)
      return { x: collumnNum + figure.x, y: maxY + figure.y + 1 }
    })

    /* eslint-enable no-confusing-arrow */
    const isCollumnFlying = coordsToCheck.map((el) => {
      const { x, y } = el
      if (x >= field[0].length || y >= field.length) {
        return false
      }
      if (field[y][x] === 1) {
        return false
      }
      return true
    })
    const isFigureFlying = !_.some(isCollumnFlying, (el) => el === false)
    return !isFigureFlying
  }

  checkRowBrake(field) {
    const rowBraked = field.map((row) => row.every(v => v === 1))
    const newField = field.map(row => row.map(e => e))

    rowBraked.forEach((isBraked, y) => {
      if (isBraked) {
        for (let i = y; i > 0; i = i - 1) {
          newField[i] = newField[i].map((unused, j) => newField[i - 1][j])
        }
      }
    })

    const emptyZone = (_.filter(rowBraked, (el) => el === true)).length
    for (let i = 0; i < emptyZone; i = i + 1) {
      newField[i] = newField[i].map(() => 0)
    }

    const arrayDiff = _.filter(rowBraked, (el) => el === true)
    return { field: newField, score: arrayDiff.length }
  }

  getSpectre(roomName, playerName) {
    if (!(roomName in this.games)) {
      throw Error(`Game with name ${roomName} doesn't exist!`)
    }
    if (!(playerName in this.games[roomName].fields)) {
      throw Error(`Player with name ${playerName} is not connected to the game ${roomName}`)
    }

    const field = this.games[roomName].fields[playerName].map((row) => row.map(el => el))

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

  roomRemovePlayer(roomName, playerName) {
    if (!this.isGameExists(roomName)) {
      throw Error(`Game with name ${roomName} doesn't exist`)
    }

    if (this.games[roomName].owner === playerName) {
      for (const player in this.games[roomName].fields) {
        if (player !== playerName) {
          this.games[roomName].owner = player
          break
        }
      }
    }

    delete this.games[roomName].sockets[playerName]
    delete this.games[roomName].fields[playerName]
    delete this.games[roomName].figures[playerName]
    delete this.games[roomName].scores[playerName]
  }

  getGameList() {
    const res = []
    for (const name in this.games) {
      const game = this.games[name]
      let playerCount = 0
      for (const playerName in game.fields) {
        playerCount = playerCount + 1
      }
      res.push({ name, playerCount, isStarted: game.isStarted })
    }
    return res
  }

  getPlayerReadyList(roomName) {
    if (!this.isGameExists(roomName)) {
      throw Error(`Game with name ${roomName} doesn't exist`)
    }

    return this.games[roomName].readyList
  }

  playerToggleReady(roomName, playerName) {
    if (!this.isGameExists(roomName)) {
      throw Error(`Game with name ${roomName} doesn't exist`)
    }
    if (!(playerName in this.games[roomName])) {
      throw Error(`Player ${playerName} isn't connected to the room ${roomName}`)
    }

    const current = this.games[roomName].readyList[playerName]
    this.games[roomName].readyList[playerName] = current === false
    return this.games[roomName].readyList[playerName]
  }

  startGame(roomName, socketId) {
    if (!this.isGameExists(roomName)) {
      throw Error(`Game with name ${roomName} doesn't exist`)
    }
    if (this.games[roomName].state !== STATE_GAME_LOBBY) {
      throw Error(`Game can't be started from the ${this.games[roomName].state}`)
    }
    let playerName
    _.forOwn(this.games[roomName].sockets, (id, player) => {
      if (id === socketId) {
        playerName = player
      }
    })
    if (!playerName || playerName !== this.games[roomName].owner) {
      throw Error(`Only owner (${this.games[roomName].owner}) can start the game`)
    }

    const readyList = this.getPlayerReadyList(roomName)
    _.forOwn(readyList, (ready, player) => {
      if (!ready) {
        throw Error(`Can't start game when player ${player} isn't ready`)
      }
    })
    this.games[roomName].state = STATE_GAME
    _.forOwn(this.games[roomName].isPlaying, (value, player) => {
      this.games[roomName].isPlaying[player] = true
    })
  }

  checkGameFinished(roomName) {
    if (!this.isGameExists(roomName)) {
      throw Error(`Game with name ${roomName} doesn't exist`)
    }
    let isFinished = true
    _.forOwn(this.games[roomName].isPlaying, (isPlaying) => {
      if (isPlaying) {
        isFinished = false
      }
    })
    const scores = this.games[roomName].scores
    return { isFinished, scores }
  }
}

module.exports = GameManager;
