import * as chai from 'chai'
import _ from 'lodash'
import {
  STATE_GAME_LOBBY,
  STATE_GAME,
  STATE_LEADER_BOARD,
} from '../src/common/game_states.js'

// import { startServer, configureStore } from './helpers/server'

// import params from '../params'

import GameManager from '../src/server/GameManager'

chai.should()

describe('GameManager.js', () => {
  let gameManager
  const socket = {
    emit: (args) => { console.log(args) },
    id: 1,
  }
  const socket1 = {
    emit: (args) => { console.log(args) },
    id: 1,
  }
  const emptyField = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ]

  beforeEach((cb) => {
    gameManager = new GameManager()
    cb()
  })

  afterEach((cb) => {
    gameManager = undefined
    cb()
  })

  test('should create game', (done) => {
    const expectedGame = {
      state: STATE_GAME_LOBBY,
      owner: 'playerName1',
      readyList: { 'playerName1': true },
      isPlaying: { 'playerName1': false },
      sockets: { 'playerName1': 1 },
      fields: { 'playerName1': emptyField },
      figures: {},
      roomName: 'roomName1',
      scores: { 'playerName1': 0 },
      isStarted: false,
    }
    const game = gameManager.createGame('roomName1', 'playerName1', socket)
    expect(game).toEqual(expectedGame)
    expect(gameManager.games['roomName1']).toEqual(expectedGame)
    done()
  })

  test('createGame should throw exception when room exists', (done) => {
    gameManager.createGame('roomName1', 'playerName1', socket)
    chai.expect(() => { gameManager.createGame('roomName1', 'playerName1', socket) }).to.throw(Error);
    done()
  })

  test('connectGame should connect to game', (done) => {
    gameManager.createGame('roomName1', 'playerName1', socket)
    const game = gameManager.connectGame('roomName1', 'playerName2', socket1)
    chai.expect(gameManager.games['roomName1']).to.deep.equal(game)
    chai.expect(game.fields).to.have.property('playerName2')
    chai.expect(game.fields['playerName2']).to.deep.equal(emptyField)
    chai.expect(game.sockets).to.have.property('playerName2')
    chai.expect(game.sockets['playerName2']).to.equal(socket1.id)
    chai.expect(
      () => gameManager.connectGame('non existing room', 'playerName2', socket1)
    ).to.throw(Error)
    done()
  })

  test(
    'createGame should throw when user with equal username already connected',
    (done) => {
      gameManager.createGame('roomName1', 'playerName1', socket)
      const game = gameManager.connectGame('roomName1', 'playerName2', socket1)
      chai.expect(() => gameManager.connectGame('roomName1', 'playerName2', socket1)).to.throw(Error)
      done()
    }
  )

  test('createField should create field 20x10', (done) => {
    const field = gameManager.createField()
    chai.expect(field).to.deep.equal(emptyField)
    done()
  })

  test('getFigure should throw when game not exist', (done) => {
    chai.expect(() => gameManager.getFigure('roomName1', 'playerName1')).to.throw(Error)
    done()
  })

  test('getFigure should throw when player not connected to game', (done) => {
    gameManager.createGame('roomName1', 'playerName1', socket)
    chai.expect(() => gameManager.getFigure('roomName1', 'playerName2')).to.throw(Error)
    done()
  })

  test(
    'getFigure should throw on double call without call to setFigure in between',
    (done) => {
      gameManager.createGame('roomName1', 'playerName1', socket)
      gameManager.getFigure('roomName1', 'playerName1')
      chai.expect(() => gameManager.getFigure('roomName1', 'playerName1')).to.throw(Error)
      done()
    }
  )

  test('getFigure should save figure to game', (done) => {
    gameManager.createGame('roomName1', 'playerName1', socket)
    const figure = gameManager.getFigure('roomName1', 'playerName1')
    chai.expect(figure).to.equal(gameManager.games['roomName1'].figures['playerName1'])
    done()
  })

  test('rotateFigure should rotate figure by 90 deg', (done) => {
    const figure = [
      [1, 1, 1, 1],
      [0, 0, 1, 0],
    ]
    const rotatedFigure = [
      [0, 1],
      [0, 1],
      [1, 1],
      [0, 1],
    ]
    const rotatedTwiceFigure = [
      [0, 1, 0, 0],
      [1, 1, 1, 1],
    ]
    let testFigure
    testFigure = gameManager.rotateFigure(figure)
    chai.expect(testFigure).to.deep.equal(rotatedFigure)
    testFigure = gameManager.rotateFigure(rotatedFigure)
    chai.expect(testFigure).to.deep.equal(rotatedTwiceFigure)
    done()
  })

  test('setFigure should throw when room does not exist', (done) => {
    chai.expect(() => gameManager.setFigure('roomName1', 'playerName1', [])).to.throw(Error)
    done()
  })

  test('setFigure should throw when player not connected to game', (done) => {
    gameManager.createGame('roomName1', 'playerName1', socket)
    chai.expect(() => gameManager.setFigure('roomName1', 'playerName2', [])).to.throw(Error)
    done()
  })

  test(
    'setFigure should throw when player hasn\'t called getFigure before setFigure',
    (done) => {
      gameManager.createGame('roomName1', 'playerName1', socket)
      chai.expect(() => gameManager.setFigure('roomName1', 'playerName1', [])).to.throw(Error)
      done()
    }
  )

  test(
    'setFigure should throw when player provie invalid figure loaction',
    (done) => {
      gameManager.createGame('roomName1', 'playerName1', socket)
      gameManager.getFigure('roomName1', 'playerName1')
      chai.expect(() => gameManager.setFigure('roomName1', 'playerName1', { x: -1, y: 0 })).to.throw(Error)
      chai.expect(() => gameManager.setFigure('roomName1', 'playerName1', { x: 0, y: -1 })).to.throw(Error)
      chai.expect(() => gameManager.setFigure('roomName1', 'playerName1', { x: 10, y: 0 })).to.throw(Error)
      chai.expect(() => gameManager.setFigure('roomName1', 'playerName1', { x: 0, y: 20 })).to.throw(Error)
      done()
    }
  )

  test('setFigure should rotate and insert figure', (done) => {
    gameManager.createGame('roomName1', 'playerName1', socket)
    gameManager.games['roomName1'].figures['playerName1'] = [
      [1, 1, 1]
    ]
    gameManager.startGame('roomName1', socket.id)
    gameManager.setFigure('roomName1', 'playerName1', { x: 0, y: 17, rotations: 1 })
    chai.expect(gameManager.games['roomName1'].fields['playerName1']).to.deep.equal(
      [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      ]
    )
    done()
  })

  test('setFigure should delete saved figure when placed', (done) => {
    gameManager.createGame('roomName1', 'playerName1', socket)
    gameManager.games['roomName1'].figures['playerName1'] = [
      [1, 1, 1]
    ]
    gameManager.startGame('roomName1', socket.id)
    gameManager.setFigure('roomName1', 'playerName1', { x: 0, y: 17, rotations: 1 })
    chai.expect(gameManager.games['roomName1'].figures).to.not.have.property('playerName1')
    done()
  })

  test(
    'setFigure should throw when figure intersects with existing figures on field',
    (done) => {
      gameManager.createGame('roomName1', 'playerName1', socket)
      gameManager.games['roomName1'].figures['playerName1'] = [
        [1, 1, 1]
      ]
      gameManager.startGame('roomName1', socket.id)
      gameManager.setFigure('roomName1', 'playerName1', { x: 0, y: 17, rotations: 1 })
      gameManager.games['roomName1'].figures['playerName1'] = [
        [1, 1, 1]
      ]
      chai.expect(() => gameManager.setFigure('roomName1', 'playerName1', { x: 0, y: 15, rotations: 1 })).to.throw(Error)
      chai.expect(() => gameManager.setFigure('roomName1', 'playerName1', { x: 0, y: 19, rotations: 0 })).to.throw(Error)

      done()
    }
  )

  test('setFigure should throw when figure is flying', (done) => {
    gameManager.createGame('roomName1', 'playerName1', socket)
    gameManager.games['roomName1'].figures['playerName1'] = [
      [1, 1, 1]
    ]
    gameManager.startGame('roomName1', socket.id)
    gameManager.setFigure('roomName1', 'playerName1', { x: 0, y: 17, rotations: 1 })
    gameManager.games['roomName1'].figures['playerName1'] = [
      [1, 1, 1]
    ]
    chai.expect(() => gameManager.setFigure('roomName1', 'playerName1', { x: 0, y: 13, rotations: 1 })).to.throw(Error)
    chai.expect(() => gameManager.setFigure('roomName1', 'playerName1', { x: 1, y: 18, rotations: 0 })).to.throw(Error)

    done()
  })

  test(
    'checkFigureIsNotFlying should return false if figure is flying',
    (done) => {
      chai.expect(gameManager.checkFigureIsNotFlying({ x: 0, y: 18, figure: [[1, 1, 1]] }, emptyField)).to.equal(false)

      gameManager.createGame('roomName1', 'playerName1', socket)
      gameManager.games['roomName1'].figures['playerName1'] = [
        [1, 1, 1]
      ]
      gameManager.startGame('roomName1', socket.id)
      gameManager.setFigure('roomName1', 'playerName1', { x: 0, y: 17, rotations: 1 })
      const field = gameManager.games['roomName1'].fields['playerName1']
      chai.expect(gameManager.checkFigureIsNotFlying({ x: 0, y: 15, figure: [[1, 1, 1]] }, field)).to.equal(false)
      chai.expect(gameManager.checkFigureIsNotFlying({ x: 0, y: 16, figure: [[1, 1, 1]] }, field)).to.equal(true)
      chai.expect(gameManager.checkFigureIsNotFlying({ x: 1, y: 19, figure: [[1, 1, 1]] }, field)).to.equal(true)
      done()
    }
  )

  test('getSpectre roomName and playerName check', (done) => {
    gameManager.createGame('roomName1', 'playerName1', socket)
    gameManager.startGame('roomName1', socket.id)
    chai.expect(() => gameManager.getSpectre('roomName2', 'playerName1')).to.throw(Error)
    chai.expect(() => gameManager.getSpectre('roomName1', 'playerName2')).to.throw(Error)
    done()
  })

  test('getSpectre roomName and playerName check', (done) => {
    gameManager.createGame('roomName1', 'playerName1', socket)
    gameManager.startGame('roomName1', socket.id)
    gameManager.games['roomName1'].figures['playerName1'] = [
      [1, 1, 1],
      [0, 1, 0],
      [0, 1, 0],
    ]
    gameManager.setFigure('roomName1', 'playerName1', { x: 0, y: 17, rotations: 0 })
    chai.expect(gameManager.getSpectre('roomName1', 'playerName1')).to.deep.equal(
      [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
      ]
    )
    done()
  })

  test('getConnectedSockets', (done) => {
    gameManager.createGame('roomName1', 'playerName1', socket)
    gameManager.connectGame('roomName1', 'playerName2', socket1)
    const sockets = gameManager.getConnectedSockets('roomName1')
    chai.expect(sockets.playerName1).to.equal(socket.id)
    chai.expect(sockets.playerName2).to.equal(socket1.id)
    chai.expect(
      () => gameManager.getConnectedSockets('non existing name')
    ).to.throw(Error)
    done()
  })

  test('getUsers should return users fields', (done) => {
    gameManager.createGame('roomName1', 'playerName1', socket)
    gameManager.connectGame('roomName1', 'playerName2', socket1)
    const users = gameManager.getUsers('roomName1')
    chai.expect(users).to.have.property('playerName1')
    chai.expect(users.playerName1).to.deep.equal(emptyField)
    chai.expect(users).to.have.property('playerName2')
    chai.expect(users.playerName2).to.deep.equal(emptyField)
    done()
  })

  test('getUsers should throw on non-existing room', (done) => {
    chai.expect(() => gameManager.getUsers('non existing room')).to.throw(Error)
    done()
  })

  test('checkRowBrake test', (done) => {
    const inputField = [
      [0, 1, 1, 0, 0],
      [1, 0, 0, 1, 0],
      [1, 1, 1, 1, 1],
      [0, 1, 1, 1, 0],
      [1, 1, 1, 1, 1],
    ]
    const expected = [
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 1, 1, 0, 0],
      [1, 0, 0, 1, 0],
      [0, 1, 1, 1, 0],
    ]
    const numRowsBraked = 2
    const { field, score } = gameManager.checkRowBrake(inputField)
    chai.expect(field).to.deep.equal(expected)
    chai.expect(score).to.equal(numRowsBraked)
    done()
  })

  test('figureCropFreeLines test', (done) => {
    const figureYCrop = [
      [0, 0, 0],
      [1, 1, 1],
      [0, 1, 0],
    ]
    const croppedY = [
      [1, 1, 1],
      [0, 1, 0],
    ]
    const shiftCroppedY = { x: 0, y: 1 }

    let res = gameManager.figureCropFreeLines(figureYCrop)
    chai.expect(res.figure).to.deep.equal(croppedY)
    chai.expect(res.shift).to.deep.equal(shiftCroppedY)

    const figureXCrop = [
      [0, 1, 0],
      [0, 1, 1],
      [0, 1, 0],
    ]
    const croppedX = [
      [1, 0],
      [1, 1],
      [1, 0],
    ]
    const shiftCroppedX = { x: 1, y: 0 }

    res = gameManager.figureCropFreeLines(figureXCrop)
    chai.expect(res.figure).to.deep.equal(croppedX)
    chai.expect(res.shift).to.deep.equal(shiftCroppedX)
    done()
  })

  test('figureCropFreeLines no shift test', (done) => {
    const figureYCrop = [
      [1, 1, 0, 0],
      [1, 1, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]
    const croppedY = [
      [1, 1],
      [1, 1],
    ]
    const shiftCroppedY = { x: 0, y: 0 }

    let res = gameManager.figureCropFreeLines(figureYCrop)
    chai.expect(res.figure).to.deep.equal(croppedY)
    chai.expect(res.shift).to.deep.equal(shiftCroppedY)
    done()
  })

  test('roomRemovePlayer', (done) => {
    gameManager.createGame('room', 'player', socket)

    const resGames = {
      'room': {
        fields: {},
        figures: {},
        isPlaying: {
          player: false,
        },
        isStarted: false,
        owner: 'player',
        readyList: {
          player: true,
        },
        roomName: 'room',
        scores: {},
        sockets: {},
        state: 'game_lobby',
      },
    }

    gameManager.roomRemovePlayer('room', 'player')

    expect(gameManager.games).toEqual(resGames)

    chai.expect(
      () => gameManager.roomRemovePlayer('room1', 'player')
    ).to.throw(Error)

    done()
  })

  test('getGameList should return list of games', (done) => {
    const expected = [
      {
        name: 'roomName1',
        playerCount: 1,
        isStarted: false,
      },
      {
        name: 'roomName2',
        playerCount: 1,
        isStarted: false,
      },
    ]
    gameManager.createGame('roomName1', 'playerName1', socket)
    gameManager.createGame('roomName2', 'playerName1', socket)
    const ret = gameManager.getGameList()
    expect(ret).toEqual(expected)
    done()
  })

  test('getPlayerReadyList', (done) => {

    const expected = {
      'playerName1': true,
      'playerName2': false,
    }

    gameManager.createGame('roomName1', 'playerName1', socket)
    gameManager.connectGame('roomName1', 'playerName2', socket)
    const readyList = gameManager.getPlayerReadyList('roomName1')
    expect(readyList).toEqual(expected)
    done()
  })
})
