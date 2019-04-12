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

  getPlayerField(roomName, playerName) {
    if (!this.isGameExists(roomName)) {
      throw Error(`Game with name ${roomName} does not exist!`)
    }
    if (!(playerName in this.games[roomName].fields)) {
      throw Error(`Player with name ${playerName} doesn't connected to the room ${roomName}!`)
    }
    return this.games[roomName].fields[playerName]
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
      figureNums: {},
      figureList: [],
      scores: {},
      isStarted: false,
    }
    game.roomName = roomName
    game.fields[playerName] = this.createField()
    game.sockets[playerName] = socket.id
    game.scores[playerName] = 0
    game.readyList[playerName] = true
    game.isPlaying[playerName] = false
    game.figureNums[playerName] = 0
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
    if (game.state !== STATE_GAME_LOBBY) {
      throw Error(`The game "${roomName}" already started, please wait until it is finished`)
    }
    game.fields[playerName] = this.createField()
    game.sockets[playerName] = socket.id
    game.readyList[playerName] = false
    game.isPlaying[playerName] = false
    game.figureNums[playerName] = 0
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
    const game = this.games[roomName]
    let playerFigure
    if (game.figureNums[playerName] === game.figureList.length) {
      playerFigure = figures[Math.floor(Math.random() * figures.length)]
      game.figureList.push(playerFigure)
    }
    else {
      const figureNum = game.figureNums[playerName]
      playerFigure = game.figureList[figureNum]
    }
    const colorsNum = 5
    const randColor = Math.floor(Math.random() * colorsNum) + 1
    playerFigure = playerFigure.map((row) => row.map(el => (el !== 0 ? randColor : 0)))
    game.figures[playerName] = playerFigure
    game.figureNums[playerName] = game.figureNums[playerName] + 1

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
          if (figurePiece !== 0 && el !== 0) {
            throw Error(`Figure intersects with existing piece on field coords: ${x} ${y}`);
          }
          return (figurePiece !== 0) ? figurePiece : el
        }
        return el
      })
    )
    const brakeRes = this.checkRowBrake(field)
    const scoredField = brakeRes.field
    const figureBlockCount = 4
    const lineBlockCount = 10
    const setScore = figureBlockCount + brakeRes.score * (lineBlockCount)
    const beforeScore = this.games[roomName].scores[playerName]
    const currentScore = (beforeScore ? beforeScore : 0) + setScore

    /* eslint-disable prefer-reflect */
    delete this.games[roomName].figures[playerName]

    /* eslint-enable prefer-reflect */
    this.games[roomName].fields[playerName] = scoredField
    this.games[roomName].scores[playerName] = currentScore
    loginfo('field', scoredField)
    loginfo('score', currentScore)

    if (brakeRes.score !== 0) {
      this.appendLinePenalty(roomName, playerName, brakeRes.score)
    }

    let isGameOver = false
    if (_.some(scoredField[0], (el) => el !== 0)) {
      isGameOver = true
      this.games[roomName].isPlaying[playerName] = false
    }
    return { field: scoredField, score: currentScore, isGameOver, doFieldUpdate: brakeRes.score !== 0 }
  }

  appendLinePenalty(roomName, noPenaltyName, rowsNumber) {
    const game = this.games[roomName]
    _.forOwn(game.fields, (field, playerName) => {
      if (playerName === noPenaltyName) {
        return
      }
      const getPenaltyRow = () => {
        let res = (new Array(this.fieldWidth))
        res = _.map(res, (el) => 1)
        res[Math.floor(Math.random() * this.fieldWidth)] = 0
        return res
      }
      game.fields[playerName] = field.map((row, i) => (i >= field.length - rowsNumber ? getPenaltyRow() : field[i + 1]))
    })
  }

  checkFigureIsNotFlying(figure, field) {
    const collumns = _.zip(...figure.figure)

    /* eslint-disable no-confusing-arrow */
    const coordsToCheck = collumns.map((collumn, collumnNum) => {
      const maxY = collumn
        .map((el, y) => (el !== 0 ? y : -1))
        .reduce((max, el) => (max < el) ? el : max)
      return { x: collumnNum + figure.x, y: maxY + figure.y + 1 }
    })

    /* eslint-enable no-confusing-arrow */
    const isCollumnFlying = coordsToCheck.map((el) => {
      const { x, y } = el
      if (x >= field[0].length || y >= field.length) {
        return false
      }
      if (field[y][x] !== 0) {
        return false
      }
      return true
    })
    const isFigureFlying = !_.some(isCollumnFlying, (el) => el === false)
    return !isFigureFlying
  }

  checkRowBrake(field) {
    const rowBraked = field.map((row) => row.every(v => v !== 0))
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

    loginfo('emptyZone:', emptyZone)
    return { field: newField, score: emptyZone }
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
          this.games[roomName].readyList[player] = true
          break
        }
      }
    }

    delete this.games[roomName].sockets[playerName]
    delete this.games[roomName].fields[playerName]
    delete this.games[roomName].figures[playerName]
    delete this.games[roomName].scores[playerName]
    delete this.games[roomName].isPlaying[playerName]
    delete this.games[roomName].readyList[playerName]
    delete this.games[roomName].figureNums[playerName]
    let playerNum = 0
    _.forOwn(this.games[roomName].fields, (player) => {
      playerNum = playerNum + 1
    })
    if (playerNum === 0) {
      delete this.games[roomName]
      return true
    }
    return false
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

    const res = []
    _.forOwn(this.games[roomName].readyList, (readyStatus, player) => {
      res.push({ player, readyStatus })
    })

    return res
  }

  playerToggleReady(roomName, playerName) {
    if (!this.isGameExists(roomName)) {
      throw Error(`Game with name ${roomName} doesn't exist`)
    }
    if (!(playerName in this.games[roomName].fields)) {
      throw Error(`Player ${playerName} isn't connected to the room ${roomName}`)
    }
    if (this.games[roomName].state !== STATE_GAME_LOBBY) {
      throw Error('You can set ready status only in game lobby!')
    }
    if (this.games[roomName].owner === playerName) {
      throw Error('Owner can not be unready (use start_game instead of toggle_ready')
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
    readyList.forEach(({ player, readyStatus }) => {
      loginfo('readyList:', readyStatus, player)
      if (!readyStatus) {
        throw Error(`Can't start game when player ${player} isn't ready`)
      }
    })
    this.games[roomName].state = STATE_GAME
    _.forOwn(this.games[roomName].isPlaying, (value, player) => {
      this.games[roomName].isPlaying[player] = true
      this.games[roomName].fields[player] = this.createField()
    })
  }

  playerSetGameOver(roomName, playerName) {
    if (!this.isGameExists(roomName)) {
      throw Error(`Game with name ${roomName} doesn't exist`)
    }
    if (!(playerName in this.games[roomName].fields)) {
      throw Error(`Player ${playerName} isn't connected to the room ${roomName}`)
    }
    this.games[roomName].isPlaying[playerName] = false
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
    const scores = []
    _.forOwn(this.games[roomName].scores, (score, player) => {
      scores.push({ score, player })
    })
    if (isFinished && this.games[roomName].state === STATE_GAME) {
      this.games[roomName].state = STATE_LEADER_BOARD
    }
    return { isFinished, scores }
  }

  gameRestart(roomName, socketId) {
    if (!this.isGameExists(roomName)) {
      throw Error(`Game with name ${roomName} doesn't exist`)
    }
    const game = this.games[roomName]
    if (game.state !== STATE_LEADER_BOARD) {
      throw Error(`Game can't be restarted from the ${game.state}`)
    }
    let playerName
    _.forOwn(game.sockets, (id, player) => {
      if (id === socketId) {
        playerName = player
      }
    })
    if (!playerName || playerName !== game.owner) {
      throw Error(`Only owner (${game.owner}) can restart the game`)
    }

    game.state = STATE_GAME_LOBBY
    _.forOwn(game.fields, (field, player) => {
      game.scores[player] = 0
      game.isPlaying[player] = false
      game.readyList[player] = (game.owner === player)
      game.figureNums[player] = 0
    })
    this.games[roomName] = game
    this.games[roomName].figures = {}
    this.games[roomName].figureList = []
  }
}

module.exports = GameManager;
