import { describe, it, afterEach, beforeEach } from 'mocha'
import * as chai from 'chai'

import * as actions from '../src/server/actions.js'
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
} from '../src/common/action_index'

chai.should()

describe('server/actions.js', () => {
  let actionManager
  let io

  beforeEach((cb) => {
    io = {}
    actionManager = new actions.ActionManager({}, io)
    cb()
  })

  it('Dispatch createGame with new game', (done) => {
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

  it('Dispatch createGame with existing game', (done) => {
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

  it('Dispatch SERVER_GET_FIGURE', (done) => {
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

  it('Dispatch SERVER_SET_FIGURE', (done) => {
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
    chai.expect(emmitedOthers.name).to.equal('playerName2')
    chai.expect(emmitedOthers.score).to.equal(fakeScore)
    done()
  })

  it('Dispatch unsupported action', (done) => {
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

  it('roomForEachSocket test', (done) => {
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

  it('roomForEachSocket with non existing room should throw', (done) => {
    actionManager = new actions.ActionManager({
      isGameExists: () => false,
    }, io)

    chai.expect(
      () => actionManager.roomForEachSocket('roomName1', 1, () => console.log('gopa'))
    ).to.throw(Error)

    done()
  })

  it('ActionManager methods args check', (done) => {
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

  it('verifyRequiredActionArgs', (done) => {
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
})
