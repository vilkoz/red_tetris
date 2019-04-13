import * as chai from 'chai'

import * as actions from '../src/server/actions.js'
import {
  SERVER_CREATE_GAME,
  SERVER_GET_FIGURE,
  SERVER_SET_FIGURE,
  SERVER_GET_GAME_LIST,
  SERVER_UNSUBSCRIBE_GAME_LIST,
  SERVER_GAME_OVER,
  SERVER_DISCONNECT_GAME,
  CLIENT_GAME_OVER,
  CLIENT_GAME_FINISHED,
  CLIENT_CREATE_GAME,
  CLIENT_ERROR,
  CLIENT_NEW_PLAYER,
  CLIENT_GET_FIGURE,
  CLIENT_SET_FIGURE,
  CLIENT_UPDATE_COMPETITOR_SPECTRE,
  CLIENT_UPDATE_GAME_LIST,
  CLIENT_GAME_RESTART,
  SERVER_GAME_RESTART,
  SERVER_EXIT_GAME,
  CLIENT_EXIT_GAME,
  CLIENT_PLAYER_EXITED,
  SERVER_START_GAME,
  CLIENT_START_GAME,
  SERVER_TOGGLE_READY,
  CLIENT_GET_PLAYER_READY_LIST,
} from '../src/common/action_index'

import * as gameStates from '../src/common/game_states'

import GameManager from '../src/server/GameManager'

chai.should()

describe('server/actions.js', () => {
  let actionManager
  let io

  beforeEach((cb) => {
    io = {}
    actionManager = new actions.ActionManager({}, io)
    cb()
  })

  test('Dispatch createGame with new game', (done) => {
    let fakeSocket1Data
    const fakeSocket1 = {
      emit: (unused, arg) => {
        fakeSocket1Data = arg
      },
      id: 1,
    }
    const fakeField = 'this is fake field'
    const fakeGame = {
      fields: {
        'playerName1': fakeField,
      },
    }
    actionManager = new actions.ActionManager({
      isGameExists: () => false,
      createGame: () => fakeGame,
      games: {
        'roomName1': fakeGame,
      },
    }, io)

    actionManager.dispatch({
      type: SERVER_CREATE_GAME,
      playerName: 'playerName1',
      roomName: 'roomName1',
    }, fakeSocket1)
    const emmited = fakeSocket1Data
    chai.expect(emmited.type).to.equal(CLIENT_CREATE_GAME)
    chai.expect(emmited.field).to.equal(fakeField)
    chai.expect(emmited).to.have.property('message')
    done()
  })

  test('Dispatch createGame with existing game', (done) => {
    const fakeSocket1Data = []
    const fakeSocket1 = {
      emit: (unused, args) => { fakeSocket1Data.push(args) },
      id: 1,
    }
    const fakeSocket2Data = []
    const fakeSocket2 = {
      emit: (unused, args) => { fakeSocket2Data.push(args) },
      id: 2,
    }
    const fakeField = 'this is fake field'
    const fakeGame = {
      fields: { 'playerName1': fakeField, 'playerName2': fakeField },
      sockets: { 'playerName1': fakeSocket1.id, 'playerName2': fakeSocket2.id },
    }
    const fakeIo = {
      of: () => ({
        connected: {
          [fakeSocket1.id]: fakeSocket1,
          [fakeSocket2.id]: fakeSocket2,
        },
      }),
    }
    const fakeSpectre = 'this is fake spectre'
    actionManager = new actions.ActionManager({
      isGameExists: () => true,
      connectGame: (args) => fakeGame,
      games: { 'roomName1': fakeGame },
      getSpectre: () => (fakeSpectre),
    }, fakeIo)

    actionManager.dispatch({
      type: SERVER_CREATE_GAME,
      playerName: 'playerName2',
      roomName: 'roomName1',
    }, fakeSocket2)
    const emmited = fakeSocket1Data
    const emmitedSelf = fakeSocket2Data

    chai.expect(emmitedSelf[0].type).to.equal(CLIENT_CREATE_GAME)
    chai.expect(emmitedSelf[0].field).to.equal(fakeField)
    chai.expect(emmitedSelf[0]).to.have.property('message')
    done()
  })

  test('Dispatch SERVER_GET_FIGURE', (done) => {
    const fakeFigure = 'this is fake figure'
    actionManager = new actions.ActionManager({
      getFigure: () => fakeFigure,
    }, io)

    const fakeSocket1Data = []
    const fakeSocket1 = {
      emit: (unused, args) => { fakeSocket1Data.push(args) },
      id: 1,
    }

    actionManager.dispatch({
      type: SERVER_GET_FIGURE, roomName: 'roomName1', playerName: 'playerName1'
    }, fakeSocket1)

    const emmited = fakeSocket1Data[0]

    chai.expect(emmited.type).to.equal(CLIENT_GET_FIGURE)
    chai.expect(emmited).to.have.property('message')
    chai.expect(emmited.figure).to.equal(fakeFigure)
    done()
  })

  test('Dispatch SERVER_SET_FIGURE', (done) => {
    const fakeField = 'this is fake field'
    const fakeScore = 0
    const fakeSocket1Data = []
    const fakeSocket1 = {
      emit: (unused, args) => { fakeSocket1Data.push(args) },
      id: 1,
    }
    const fakeSocket2Data = []
    const fakeSocket2 = {
      emit: (unused, args) => { fakeSocket2Data.push(args) },
      id: 2,
    }
    const fakeIo = {
      of: () => ({
        connected: {
          [fakeSocket1.id]: fakeSocket1,
          [fakeSocket2.id]: fakeSocket2,
        },
      }),
    }

    actionManager = new actions.ActionManager({
      getFigure: () => fakeField,
      setFigure: () => ({ field: fakeField, score: fakeScore }),
      isGameExists: () => true,
      getConnectedSockets: () => ({ 'playerName1': fakeSocket1.id, 'playerName2': fakeSocket2.id }),
      getSpectre: () => 'fakespectre',
    }, fakeIo)


    actionManager.dispatch({
      type: SERVER_SET_FIGURE, roomName: 'roomName1', playerName: 'playerName1', figure: 'this is fake figure',
    }, fakeSocket1)

    const emmited = fakeSocket1Data[0]
    const emmitedOthers = fakeSocket2Data[0]

    chai.expect(emmited.type).to.equal(CLIENT_SET_FIGURE)
    chai.expect(emmited).to.have.property('message')
    chai.expect(emmited.field).to.equal(fakeField)
    chai.expect(emmited.score).to.equal(fakeScore)
    chai.expect(emmitedOthers.type).to.equal(CLIENT_UPDATE_COMPETITOR_SPECTRE)
    chai.expect(emmitedOthers).to.have.property('message')
    chai.expect(emmitedOthers.name).to.equal('playerName1')
    chai.expect(emmitedOthers.score).to.equal(fakeScore)
    done()
  })

  test('Dispatch unsupported action', (done) => {
    const fakeField = 'this is fake field'
    actionManager = new actions.ActionManager({}, io)

    const fakeSocket1Data = []
    const fakeSocket1 = {
      emit: (unused, args) => { fakeSocket1Data.push(args) },
      id: 1,
    }

    actionManager.dispatch({ type: 'WATAFACKISTHISACTIONITISUNSUPPORTED' }, fakeSocket1)

    const emmited = fakeSocket1Data[0]

    chai.expect(emmited.type).to.equal(CLIENT_ERROR)
    chai.expect(emmited).to.have.property('message')
    done()
  })

  test('roomForEachSocket test', (done) => {
    const fakeSocket1Data = []
    const fakeSocket1 = {
      emit: (unused, args) => { fakeSocket1Data.push(args) },
      id: 1,
    }
    const fakeSocket2Data = []
    const fakeSocket2 = {
      emit: (unused, args) => { fakeSocket2Data.push(args) },
      id: 2,
    }
    const fakeIo = {
      of: () => ({
        connected: {
          [fakeSocket1.id]: fakeSocket1,
          [fakeSocket2.id]: fakeSocket2,
        },
      }),
    }
    const fakeField = 'this is fake field'
    const fakeGame = {
      fields: { 'playerName1': fakeField, 'playerName2': fakeField },
      sockets: { 'playerName1': fakeSocket1.id, 'playerName2': fakeSocket2.id },
    }
    actionManager = new actions.ActionManager({
      isGameExists: () => true,
      games: { 'roomName1': fakeGame },
      getConnectedSockets: () => ({ 'playerName1': fakeSocket1.id, 'playerName2': fakeSocket2.id }),
    }, fakeIo)

    actionManager.roomForEachSocket('roomName1', fakeSocket1.id, (s, player) => {
      s.emit('doesn\'t matter', { socket: s, playerName: player })
    })

    chai.expect(fakeSocket1Data).to.deep.equal([])
    chai.expect(fakeSocket2Data[0].socket).to.equal(fakeSocket2)
    chai.expect(fakeSocket2Data[0].playerName).to.equal('playerName2')

    done()
  })

  test('roomForEachSocket with non existing room should throw', (done) => {
    actionManager = new actions.ActionManager({
      isGameExists: () => false,
    }, io)

    chai.expect(
      () => actionManager.roomForEachSocket('roomName1', 1, () => console.log('gopa'))
    ).to.throw(Error)

    done()
  })

  test('ActionManager methods args check', (done) => {
    actionManager = new actions.ActionManager({
    }, io)

    chai.expect(
      () => actionManager.createGame({ action: {}, socket: {} })
    ).to.throw(Error)
    chai.expect(
      () => actionManager.getFigure({ action: {}, socket: {} })
    ).to.throw(Error)
    chai.expect(
      () => actionManager.setFigure({ action: {}, socket: {} })
    ).to.throw(Error)

    done()
  })

  test('verifyRequiredActionArgs', (done) => {
    actionManager = new actions.ActionManager({
    }, io)
    const fakeAction = { test1: 'test', test2: 'test' }

    chai.expect(
      actionManager.verifyRequiredActionArgs(fakeAction, ['test1', 'test2'])
    ).to.equal(fakeAction)
    chai.expect(
      () => actionManager.verifyRequiredActionArgs(fakeAction, ['test1', 'test3'])
    ).to.throw(Error)
    chai.expect(
      () => actionManager.verifyRequiredActionArgs(fakeAction, ['test3', 'test2'])
    ).to.throw(Error)
    chai.expect(
      actionManager.verifyRequiredActionArgs(fakeAction, [])
    ).to.equal(fakeAction)

    done()
  })

  test('getGameList test', (done) => {
    const fakeSocket1Data = []
    const fakeSocket1 = {
      emit: (unused, args) => { fakeSocket1Data.push(args) },
      id: 1,
    }
    const fakeIo = {
      of: () => ({
        connected: {
          [fakeSocket1.id]: fakeSocket1,
        },
      }),
    }
    const expectedGameListSubscribers = {
      1: true,
    }
    const fakeGameList = 'this is fake game list'
    actionManager = new actions.ActionManager({
      getGameList: () => fakeGameList,
    }, fakeIo)

    actionManager.dispatch({ type: SERVER_GET_GAME_LIST }, fakeSocket1)

    chai.expect(fakeSocket1Data[0]).to.have.property('gameList')
    chai.expect(fakeSocket1Data[0].gameList).to.equal(fakeGameList)
    chai.expect(actionManager.gameListSubscribers).to.deep.equal(expectedGameListSubscribers)

    actionManager.dispatch({ type: SERVER_UNSUBSCRIBE_GAME_LIST }, fakeSocket1)

    chai.expect(actionManager.gameListSubscribers).to.deep.equal({})
    done()
  })

  test('playerGameOver test', (done) => {
    const fakeSocket1Data = []
    const fakeSocket1 = {
      emit: (unused, args) => { fakeSocket1Data.push(args) },
      id: 1,
    }
    const fakeSocket2Data = []
    const fakeSocket2 = {
      emit: (unused, args) => { fakeSocket2Data.push(args) },
      id: 2,
    }
    const fakeIo = {
      of: () => ({
        connected: {
          [fakeSocket1.id]: fakeSocket1,
          [fakeSocket2.id]: fakeSocket2,
        },
      }),
    }
    actionManager = new actions.ActionManager(new GameManager(), fakeIo)

    actionManager.gameManager.createGame('roomName1', 'playerName1', fakeSocket1)
    actionManager.gameManager.connectGame('roomName1', 'playerName2', fakeSocket2)
    actionManager.gameManager.playerToggleReady('roomName1', 'playerName2')
    actionManager.gameManager.startGame('roomName1', fakeSocket1.id)

    actionManager.dispatch({
      type: SERVER_GAME_OVER,
      roomName: 'roomName1',
      playerName: 'playerName1'
    }, fakeSocket1)

    expect(actionManager.gameManager.games['roomName1'].isPlaying['playerName1']).toEqual(false)
    expect(fakeSocket1Data).toEqual([
      { type: CLIENT_GAME_OVER, message: 'Game is over for you' },
    ])
    expect(fakeSocket2Data).toEqual([])

    fakeSocket1Data.pop()

    actionManager.dispatch({
      type: SERVER_GAME_OVER,
      roomName: 'roomName1',
      playerName: 'playerName2'
    }, fakeSocket2)

    const expectedGameFinishedAction = {
      type: CLIENT_GAME_FINISHED,
      scores: [
        { player: 'playerName1', score: 0 },
        { player: 'playerName2', score: 0 },
      ],
    }

    expect(actionManager.gameManager.games['roomName1'].isPlaying['playerName2']).toEqual(false)
    expect(fakeSocket1Data).toEqual([
      expectedGameFinishedAction,
    ])
    expect(fakeSocket2Data).toEqual([
      { type: CLIENT_GAME_OVER, message: 'Game is over for you' },
      expectedGameFinishedAction,
    ])
    done()
  })

  test('disconnectPlayer test', (done) => {
    const fakeSocket1Data = []
    const fakeSocket1 = {
      emit: (unused, args) => { fakeSocket1Data.push(args) },
      id: 1,
    }
    const fakeSocket2Data = []
    const fakeSocket2 = {
      emit: (unused, args) => { fakeSocket2Data.push(args) },
      id: 2,
    }
    const fakeIo = {
      of: () => ({
        connected: {
          [fakeSocket1.id]: fakeSocket1,
          [fakeSocket2.id]: fakeSocket2,
        },
      }),
    }
    actionManager = new actions.ActionManager(new GameManager(), fakeIo)

    actionManager.gameManager.createGame('roomName1', 'playerName1', fakeSocket1)
    actionManager.gameManager.connectGame('roomName1', 'playerName2', fakeSocket2)
    actionManager.gameManager.playerToggleReady('roomName1', 'playerName2')
    actionManager.gameManager.startGame('roomName1', fakeSocket1.id)

    actionManager.dispatch({ type: SERVER_DISCONNECT_GAME }, fakeSocket1)

    const game = actionManager.gameManager.games.roomName1
    expect(game.fields).not.toHaveProperty('playerName1')
    expect(game.sockets).not.toHaveProperty('playerName1')
    expect(game.scores).not.toHaveProperty('playerName1')
    expect(game.isPlaying).not.toHaveProperty('playerName1')

    actionManager.gameListSubscribers[fakeSocket1.id] = true
    actionManager.gameListSubscribers[3] = true
    actionManager.dispatch({ type: SERVER_DISCONNECT_GAME }, fakeSocket2)

    expect(actionManager.gameManager.games).not.toHaveProperty('roomName1')
    expect(fakeSocket1Data).toEqual([
      { type: CLIENT_UPDATE_GAME_LIST, gameList: [] },
    ])

    actionManager.dispatch({ type: SERVER_DISCONNECT_GAME }, { id: 3 })

    done()
  })

  test('gameRestart test', (done) => {
    const fakeSocket1Data = []
    const fakeSocket1 = {
      emit: (unused, args) => { fakeSocket1Data.push(args) },
      id: 1,
    }
    const fakeSocket2Data = []
    const fakeSocket2 = {
      emit: (unused, args) => { fakeSocket2Data.push(args) },
      id: 2,
    }
    const fakeIo = {
      of: () => ({
        connected: {
          [fakeSocket1.id]: fakeSocket1,
          [fakeSocket2.id]: fakeSocket2,
        },
      }),
    }
    actionManager = new actions.ActionManager(new GameManager(), fakeIo)

    actionManager.gameManager.createGame('roomName1', 'playerName1', fakeSocket1)
    actionManager.gameManager.connectGame('roomName1', 'playerName2', fakeSocket2)
    actionManager.gameManager.playerToggleReady('roomName1', 'playerName2')
    actionManager.gameManager.startGame('roomName1', fakeSocket1.id)

    actionManager.dispatch({
      type: SERVER_GAME_OVER,
      roomName: 'roomName1', playerName: 'playerName1' }, fakeSocket1)
    actionManager.dispatch({
      type: SERVER_GAME_OVER,
      roomName: 'roomName1', playerName: 'playerName2' }, fakeSocket2)

    fakeSocket1Data.length = 0
    fakeSocket2Data.length = 0

    actionManager.dispatch({ type: SERVER_GAME_RESTART, roomName: 'roomName1' }, fakeSocket1)

    const game = actionManager.gameManager.games.roomName1
    expect(game.state).toEqual(gameStates.STATE_GAME_LOBBY)
    expect(fakeSocket1Data).toEqual([
      {
        type: CLIENT_GAME_RESTART, message: 'Success restarting game',
        playerReadyList: [
          { player: 'playerName1', readyStatus: true },
          { player: 'playerName2', readyStatus: false },
        ],
      },
    ])

    done()
  })

  test('starting test', (done) => {
    const fakeSocket1Data = []
    const fakeSocket1 = {
      emit: (unused, args) => { fakeSocket1Data.push(args) },
      id: 1,
    }
    const fakeSocket2Data = []
    const fakeSocket2 = {
      emit: (unused, args) => { fakeSocket2Data.push(args) },
      id: 2,
    }
    const fakeIo = {
      of: () => ({
        connected: {
          [fakeSocket1.id]: fakeSocket1,
          [fakeSocket2.id]: fakeSocket2,
        },
      }),
    }
    actionManager = new actions.ActionManager(new GameManager(), fakeIo)

    actionManager.gameManager.createGame('roomName1', 'playerName1', fakeSocket1)
    actionManager.gameManager.connectGame('roomName1', 'playerName2', fakeSocket2)
    actionManager.gameManager.playerToggleReady('roomName1', 'playerName2')
    actionManager.gameManager.startGame('roomName1', fakeSocket1.id)

    actionManager.dispatch({
      type: SERVER_EXIT_GAME, roomName: 'roomName1',
      playerName: 'playerName1'
    }, fakeSocket1)

    expect(fakeSocket1Data).toEqual([
      { type: CLIENT_EXIT_GAME, message: 'Success exiting game' },
    ])
    expect(fakeSocket2Data).toEqual([
      {
        type: CLIENT_PLAYER_EXITED,
        message: 'Player playerName1 exited',
        playerName: 'playerName1',
      },
    ])

    done()
  })

  test('startGame test', (done) => {
    const fakeSocket1Data = []
    const fakeSocket1 = {
      emit: (unused, args) => { fakeSocket1Data.push(args) },
      id: 1,
    }
    const fakeSocket2Data = []
    const fakeSocket2 = {
      emit: (unused, args) => { fakeSocket2Data.push(args) },
      id: 2,
    }
    const fakeIo = {
      of: () => ({
        connected: {
          [fakeSocket1.id]: fakeSocket1,
          [fakeSocket2.id]: fakeSocket2,
        },
      }),
    }
    actionManager = new actions.ActionManager(new GameManager(), fakeIo)

    actionManager.gameManager.createGame('roomName1', 'playerName1', fakeSocket1)
    actionManager.gameManager.connectGame('roomName1', 'playerName2', fakeSocket2)
    actionManager.gameManager.playerToggleReady('roomName1', 'playerName2')

    // actionManager.gameManager.startGame('roomName1', fakeSocket1.id)

    actionManager.dispatch({
      type: SERVER_START_GAME, roomName: 'roomName1',
    }, fakeSocket1)

    expect(fakeSocket1Data).toEqual([
      {
        type: CLIENT_START_GAME, message: 'Success starting game',
        field: actionManager.gameManager.getPlayerField('roomName1', 'playerName1'),
      },
    ])
    expect(fakeSocket2Data).toEqual([
      {
        type: CLIENT_START_GAME, message: 'Success starting game',
        field: actionManager.gameManager.getPlayerField('roomName1', 'playerName2'),
      },
    ])

    done()
  })

  test('playerToggleReady test', (done) => {
    const fakeSocket1Data = []
    const fakeSocket1 = {
      emit: (unused, args) => { fakeSocket1Data.push(args) },
      id: 1,
    }
    const fakeSocket2Data = []
    const fakeSocket2 = {
      emit: (unused, args) => { fakeSocket2Data.push(args) },
      id: 2,
    }
    const fakeIo = {
      of: () => ({
        connected: {
          [fakeSocket1.id]: fakeSocket1,
          [fakeSocket2.id]: fakeSocket2,
        },
      }),
    }
    actionManager = new actions.ActionManager(new GameManager(), fakeIo)

    actionManager.gameManager.createGame('roomName1', 'playerName1', fakeSocket1)
    actionManager.gameManager.connectGame('roomName1', 'playerName2', fakeSocket2)

    // actionManager.gameManager.playerToggleReady('roomName1', 'playerName2')
    actionManager.dispatch({
      type: SERVER_TOGGLE_READY,
      roomName: 'roomName1',
      playerName: 'playerName2',
    }, fakeSocket2)

    expect(fakeSocket1Data).toEqual([
      {
        type: CLIENT_GET_PLAYER_READY_LIST,
        message: 'Player ready list was updated',
        playerReadyList: actionManager.gameManager.getPlayerReadyList('roomName1'),
      },
    ])
    expect(fakeSocket2Data).toEqual([
      {
        type: CLIENT_GET_PLAYER_READY_LIST,
        message: 'Player ready list was updated',
        playerReadyList: actionManager.gameManager.getPlayerReadyList('roomName1'),
      },
    ])

    done()
  })
})
