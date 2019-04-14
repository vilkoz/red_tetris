import {
  cutEmpty,
  checkCollision,
  reducer,
} from "../src/client/reducers/alert";
import * as chai from "chai";
import {ACTION_PING} from "../src/client/actions/server";
import {
  CLIENT_GAME_FINISHED,
  CLIENT_GET_PLAYER_READY_LIST,
  CLIENT_UPDATE_COMPETITOR_SPECTRE, CLIENT_UPDATE_FIELD
} from "../src/common/action_index";


test('CutEmptyTest', (done) => {
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

  let res = cutEmpty(figureYCrop)
  expect(res.res).toEqual(croppedY)
  expect(res.shift).toEqual(shiftCroppedY)

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

  res = cutEmpty(figureXCrop)
  expect(res.res).toEqual(croppedX)
  expect(res.shift).toEqual(shiftCroppedX)
  done()
})

test('Reducer AlertPop', (done) => {
  const state = {}
  const action = { type: 'ALERT_POP', message: 'gopa' }
  expect(reducer(state, action)).toEqual({ message: 'gopa' })
  done()
})

test('Reducer client/error', (done) => {
  const state = {}
  const action = { type: 'client/error', message: 'test' }
  expect(reducer(state, action)).toEqual({ message: 'test', errorMessage: 'test' })
  done()
})

test('Reducer ACTION_PING', (done) => {
  const state = {}
  const action = { type: 'server/ping', message: 'test' }
  expect(reducer(state, action)).toEqual({ message: 'test' })
  done()
})

test('Reducer client/pong', (done) => {
  const state = {}
  const action = { type: 'client/pong', message: 'test' }
  expect(reducer(state, action)).toEqual({ message: 'test' })
  done()
})

test('Reducer client/create_game', (done) => {
  const state = {}
  const action = { type: 'client/create_game', message: 'test' }
  expect(reducer(state, action)).toHaveProperty('gameState')
  done()
})

test('Reducer CLIENT_START_GAME', (done) => {
  const state = {}
  const action = { type: 'client/start_game', message: 'test' }
  expect(reducer(state, action)).toHaveProperty('gameState')
  done()
})

test('Reducer CLIENT_GAME_FINISHED', (done) => {
  const state = {}
  const action = { type: 'client/game_finished', message: 'test' }
  expect(reducer(state, action)).toHaveProperty('gameState')
  done()
})

test('Reducer CLIENT_GAME_RESTART', (done) => {
  const state = {}
  const action = { type: 'client/game_restart', message: 'test' }
  expect(reducer(state, action)).toHaveProperty('gameState')
  done()
})

test('Reducer client/get_figure', (done) => {
  const state = {}
  const newFigure = [
    1,1,1,
    1,0,0,
    0,0,0,
  ]
  const action = { type: 'client/get_figure', message: 'test', figure: newFigure }
  expect(reducer(state, action)).toEqual({ message: 'test', errorMessage: undefined,
    figure: { x: 0, y: 0, figure: newFigure, rotations: 0 } })
  done()
})

test('Reducer client/set_figure', (done) => {
  const state = {
    roomName: 'chlen',
    playerName: 'gopa',
  }
  const newField = [
    1,1,1,0,0,0,0,0,0,0,
    1,1,1,0,0,0,0,0,0,0,
    1,1,1,0,0,0,0,0,0,0,
    1,1,1,0,0,0,0,0,0,0,
    1,1,1,0,0,0,0,0,0,0,
    1,1,1,0,0,0,0,0,0,0,
    1,1,1,0,0,0,0,0,0,0,
    1,1,1,0,0,0,0,0,0,0,
    1,1,1,0,0,0,0,0,0,0,
    1,1,1,0,0,0,0,0,0,0,
    1,1,1,0,0,0,0,0,0,0,
    1,1,1,0,0,0,0,0,0,0,
    1,1,1,0,0,0,0,0,0,0,
    1,1,1,0,0,0,0,0,0,0,
    1,1,1,0,0,0,0,0,0,0,
    1,1,1,0,0,0,0,0,0,0,
    1,1,1,0,0,0,0,0,0,0,
    1,1,1,0,0,0,0,0,0,0,
    1,1,1,0,0,0,0,0,0,0,
    1,1,1,0,0,0,0,0,0,0,
  ]
  const action = { type: 'client/set_figure', message: 'test', field: newField, score: 123, }
  expect(reducer(state, action)).toEqual({ ...state, message: 'test', field: newField, figure: undefined, score: 123,
    actionQueue: [ {type: 'server/get_figure', roomName: state.roomName, playerName: state.playerName} ] })
  done()
})

test('Reducer client/new_player', (done) => {
  const state = {
    players: {
      kos: 'zapupa',
    }
  }
  const action = { type: 'client/new_player', message: 'test', playerName: 'sanya', spectre: 'sobaka' }
  expect(reducer(state, action)).toEqual({ ...state, players: {
    kos: 'zapupa',
    sanya: 'sobaka',
  } })
  done()
})


test('Reducer CLIENT_GET_PLAYER_READY_LIST', (done) => {
  const state = {}
  const action = { type: 'client/get_player_ready_list', playerReadyList: 'test' }
  expect(reducer(state, action)).toEqual({ playerReadyList: 'test' })
  done()
})

test('Reducer SAVE_GAME_NAME', (done) => {
  const state = {}
  const action = { type: 'SAVE_GAME_NAME', roomName: 'test' }
  expect(reducer(state, action)).toEqual({ roomName: 'test' })
  done()
})

test('Reducer SAVE_PLAYER_NAME', (done) => {
  const state = {}
  const action = { type: 'SAVE_PLAYER_NAME', playerName: 'test' }
  expect(reducer(state, action)).toEqual({ playerName: 'test' })
  done()
})

test('Reducer GAME_MOVE_FIGURE_LEFT', (done) => {
  const state = {
    figure: {
      figure: [
        [1, 1, 1],
        [0, 1, 0],
        [0, 0, 0],
      ],
      x: 2,
      y: 2,
    },
    field: [
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
    ],
  }
  const action = { type: 'GAME_MOVE_FIGURE_LEFT', message: 'test' }
  expect(reducer(state, action)).toHaveProperty('figure')
  done()
})

test('Reducer GAME_MOVE_FIGURE_RIGHT', (done) => {
  const state = {
    figure: {
      figure: [
        [1, 1, 1],
        [0, 1, 0],
        [0, 0, 0],
      ],
      x: 2,
      y: 2,
    },
    field: [
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
    ],
  }
  const action = { type: 'GAME_MOVE_FIGURE_RIGHT', message: 'test' }
  expect(reducer(state, action)).toHaveProperty('figure')
  done()
})

test('Reducer GAME_MOVE_FIGURE_DOWN', (done) => {
  const state = {
    figure: {
      figure: [
        [1, 1, 1],
        [0, 1, 0],
        [0, 0, 0],
      ],
      x: 2,
      y: 2,
    },
    field: [
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
    ],
  }
  const action = { type: 'GAME_MOVE_FIGURE_DOWN', message: 'test' }
  expect(reducer(state, action)).toHaveProperty('figure')
  done()
})

test('Reducer GAME_MOVE_FIGURE_ROTATE', (done) => {
  const state = {
    figure: {
      figure: [
        [1, 1, 1],
        [0, 1, 0],
        [0, 0, 0],
      ],
      x: 2,
      y: 2,
    },
    field: [
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
    ],
  }
  const action = { type: 'GAME_MOVE_FIGURE_ROTATE', message: 'test' }
  expect(reducer(state, action)).toHaveProperty('figure')
  done()
})

test('Reducer GAME_MOVE_FIGURE_MAX_DOWN', (done) => {
  const state = {
    figure: {
      figure: [
        [1, 1, 1],
        [0, 1, 0],
        [0, 0, 0],
      ],
      x: 2,
      y: 2,
    },
    field: [
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
    ],
  }
  const action = { type: 'GAME_MOVE_FIGURE_MAX_DOWN', message: 'test' }
  expect(reducer(state, action)).toHaveProperty('figure')
  done()
})

test('Reducer GAME_SET_MOVE_LISTENER', (done) => {
  const state = {}
  const action = { type: 'GAME_SET_MOVE_LISTENER', moveFigureListener: 'test' }
  expect(reducer(state, action)).toEqual({ moveFigureListener: 'test' })
  done()
})

test('Reducer GAME_CLEAR_MOVE_LISTENER', (done) => {
  const state = {}
  const action = { type: 'GAME_CLEAR_MOVE_LISTENER', moveFigureListener: 'test' }
  expect(reducer(state, action)).toEqual({ moveFigureListener: undefined})
  done()
})

test('Reducer GAME_SET_FALL_INTERVAL', (done) => {
  const state = {}
  const action = { type: 'GAME_SET_FALL_INTERVAL', fallFigureInterval: 'test' }
  expect(reducer(state, action)).toEqual({ fallFigureInterval: 'test' })
  done()
})

test('Reducer GAME_CLEAR_FALL_INTERVAL', (done) => {
  const state = {}
  const action = { type: 'GAME_CLEAR_FALL_INTERVAL', fallFigureInterval: 'test' }
  expect(reducer(state, action)).toEqual({ fallFigureInterval: undefined})
  done()
})

test('Reducer CLIENT_UPDATE_GAME_LIST', (done) => {
  const state = {}
  const action = { type: 'client/update_game_list', gameList: 'test' }
  expect(reducer(state, action)).toEqual({ gameList: 'test' })
  done()
})

test('Reducer SWITCH_GAME_URL', (done) => {
  const state = {}
  const action = { type: 'SWITCH_GAME_URL', gameUrl: 'test' }
  expect(reducer(state, action)).toEqual({ gameUrl: 'test', message: undefined, errorMessage: undefined })
  done()
})

test('Reducer CHANGE_THEME', (done) => {
  const state = {}
  const action = { type: 'CHANGE_THEME', theme: 'podval' }
  expect(reducer(state, action)).toEqual({ theme: 'podval' })
  done()
})

test('Reducer CLIENT_UPDATE_FIELD', (done) => {
  const state = {}
  const action = { type: 'client/update_field', field: 'podval' }
  expect(reducer(state, action)).toEqual({ field: 'podval' })
  done()
})

test('Reducer CLIENT_GAME_OVER', (done) => {
  const state = {}
  const action = { type: 'client/game_over'}
  expect(reducer(state, action)).toEqual({ message: 'Game Over', isGameOver: true, figure: undefined })
  done()
})

test('Reducer CLIENT_DEQUEUE_ACTION', (done) => {
  const state = {
  }
  const action = { type: 'CLIENT_DEQUEUE_ACTION', message: 'test' }
  expect(reducer(state, action)).toHaveProperty('actionQueue')
  done()
})

