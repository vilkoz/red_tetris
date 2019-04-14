import _ from 'lodash'
import { ALERT_POP } from '../actions/alert'
import { ACTION_PING } from '../actions/server'
import {
  SERVER_UNSUBSCRIBE_GAME_LIST,
  SERVER_GET_PLAYER_READY_LIST,
  CLIENT_UPDATE_COMPETITOR_SPECTRE,
  CLIENT_UPDATE_GAME_LIST,
  CLIENT_GET_PLAYER_READY_LIST,
  CLIENT_START_GAME,
  CLIENT_GAME_FINISHED,
  CLIENT_GAME_RESTART,
  CLIENT_UPDATE_FIELD,
  CLIENT_GAME_OVER,
} from '../../common/action_index'
import { getFigureAction, setFigureAction } from '../actions/figure'
import { gameOverAction } from '../actions/server'
import {
  STATE_LOBBY,
  STATE_GAME_LOBBY,
  STATE_GAME,
  STATE_LEADER_BOARD,
} from '../../common/game_states'
import {
  mapStateToRoute,
  doMapStateToRoute,
} from '../routes'

export const cutEmpty = (figure) => {
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
  return { shift, res }
}

export const checkCollision = (figure, field) => {
  const cut = cutEmpty(figure.figure)
  const h = cut.res.length
  const w = cut.res[0].length

  for (let i = 0; i < h; i = i + 1) {
    for (let j = 0; j < w; j = j + 1) {
      if (cut.res[i][j] !== 0) {
        const row = field[i + figure.y + cut.shift.y]
        if (!row) {
          return false
        }
        if (row[j + figure.x + cut.shift.x] !== 0) {
          console.log('0')
          return false
        }
      }
    }
  }
  return true
}

export const rotateFigure = (figure) => {
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

export const enqueueAction = (action, state) => {
  let actionQueue = state.actionQueue
  if (!actionQueue) {
    actionQueue = []
  }
  actionQueue.push(action)
  return actionQueue
}

export const reducer = (state = {}, action) => {
  switch (action.type) {
  case 'CLIENT_DEQUEUE_ACTION':
    let actionQueue = state.actionQueue
    if (!!actionQueue) {
      actionQueue = actionQueue.filter((el, i) => i !== action.index)
    }
    return { ...state, actionQueue }
  case ALERT_POP:
    return { ...state, message: action.message }
  case 'client/error':
    return { ...state, message: action.message, errorMessage: action.message }
  case ACTION_PING:
    return { ...state, message: action.message }
  case 'client/pong':
    return { ...state, message: action.message }
  case 'client/create_game':
    return { ...state,
      gameState: STATE_GAME_LOBBY,
      message: action.message,
      field: action.field,
      gameUrl: doMapStateToRoute(state),
      actionQueue: enqueueAction({ type: SERVER_UNSUBSCRIBE_GAME_LIST }, state)
        .concat([
          { type: SERVER_GET_PLAYER_READY_LIST, roomName: state.roomName },
        ]),
      isOwner: action.isOwner,
    }
  case CLIENT_START_GAME:
    return { ...state,
      gameState: STATE_GAME,
      message: action.message,
      field: action.field,
      gameUrl: doMapStateToRoute(state),
      actionQueue: enqueueAction(getFigureAction(state.roomName, state.playerName), state),
    }
  case CLIENT_GAME_FINISHED:
    return {
      ...state,
      gameState: STATE_LEADER_BOARD,
      message: undefined,
      errorMessage: undefined,
      gameUrl: doMapStateToRoute(state),
      scores: action.scores,
    }
  case CLIENT_GAME_RESTART:
    return {
      ...state,
      gameState: STATE_GAME_LOBBY,
      message: action.message,
      gameUrl: doMapStateToRoute(state),
      playerReadyList: action.playerReadyList,
      figure: undefined,
      scores: undefined,
      field: undefined,
      spectres: undefined,
      isGameOver: false,
    }
  case 'client/get_figure':
    return { ...state, message: action.message, errorMessage: undefined,
      figure: { x: 0, y: 0, figure: action.figure, rotations: 0 } }
  case 'client/set_figure':
    return { ...state, message: action.message, field: action.field, figure: undefined, score: action.score,
      actionQueue: enqueueAction(getFigureAction(state.roomName, state.playerName), state),
    }
  case 'client/new_player':
    const players = { ...state.players }
    players[action.playerName] = action.spectre
    return { ...state, players: { ...players } }
  case CLIENT_GET_PLAYER_READY_LIST:
    return { ...state, playerReadyList: action.playerReadyList }
  case 'SAVE_GAME_NAME':
    return { ...state, roomName: (action.roomName.match(/[a-zA-Z0-9 ]*/) || []).join('')}
  case 'SAVE_PLAYER_NAME':
    return { ...state, playerName: (action.playerName.match(/[a-zA-Z0-9 ]*/) || []).join('') }
  case 'GAME_MOVE_FIGURE_LEFT':
    if (!state.figure) {
      return state
    }
    let figure = state.figure
    figure = { ...figure, x: figure.x - 1 }
    if (checkCollision(figure, state.field)) {
      return { ...state, figure }
    }
    return state
  case 'GAME_MOVE_FIGURE_RIGHT':
    if (!state.figure) {
      return state
    }
    figure = state.figure
    figure = { ...figure, x: figure.x + 1 }
    if (checkCollision(figure, state.field)) {
      return { ...state, figure }
    }
    return state
  case 'GAME_MOVE_FIGURE_DOWN':
    if (!state.figure) {
      return state
    }
    figure = state.figure
    if (figure.y === 0 && !checkCollision(figure, state.field)) {
      return {
        ...state,
        actionQueue: enqueueAction(gameOverAction(state.roomName, state.playerName), state),
      }
    }
    figure = { ...figure, y: figure.y + 1 }
    if (checkCollision(figure, state.field)) {
      return { ...state, figure }
    }
    return { ...state,
      actionQueue: enqueueAction(setFigureAction(state.roomName, state.playerName, state.figure), state)
    }
  case 'GAME_MOVE_FIGURE_ROTATE':
    if (!state.figure) {
      return state
    }
    figure = state.figure
    figure = { ...figure, rotations: figure.rotations + 1, figure: rotateFigure(figure.figure) }
    if (checkCollision(figure, state.field)) {
      return { ...state, figure }
    }
    return state
  case 'GAME_MOVE_FIGURE_MAX_DOWN':
    if (!state.figure) {
      return state
    }
    figure = state.figure
    if (figure.y === 0 && !checkCollision(figure, state.field)) {
      return {
        ...state,
        actionQueue: enqueueAction(gameOverAction(state.roomName, state.playerName), state),
      }
    }
    while (checkCollision(figure, state.field)) {
      console.log('Y:', figure.y)
      figure.y = figure.y + 1
    }
    figure.y = figure.y - 1
    return { ...state,
      actionQueue: enqueueAction(setFigureAction(state.roomName, state.playerName, state.figure), state)
    }
  case 'GAME_SET_MOVE_LISTENER':
    return { ...state, moveFigureListener: action.moveFigureListener }
  case 'GAME_CLEAR_MOVE_LISTENER':
    return { ...state, moveFigureListener: undefined }
  case 'GAME_SET_FALL_INTERVAL':
    return { ...state, fallFigureInterval: action.fallFigureInterval }
  case 'GAME_CLEAR_FALL_INTERVAL':
    return { ...state, fallFigureInterval: undefined }
  case CLIENT_UPDATE_COMPETITOR_SPECTRE:
    return { ...state, spectres: { ...state.spectres, [action.name]: { field: action.spectre, score: action.score } } }
  case CLIENT_UPDATE_GAME_LIST:
    return { ...state, gameList: action.gameList }
  case 'SWITCH_GAME_URL':
    return { ...state, gameUrl: action.gameUrl, message: undefined, errorMessage: undefined }
  case 'CHANGE_THEME':
    return { ...state, theme: action.theme }
  case CLIENT_UPDATE_FIELD:
    return { ...state, field: action.field }
  case CLIENT_GAME_OVER:
    return { ...state, message: 'Game Over', isGameOver: true, figure: undefined }
  default:
    return state
  }
}

export default reducer
