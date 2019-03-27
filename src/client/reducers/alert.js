import { ALERT_POP } from '../actions/alert'
import { ACTION_PING } from '../actions/server'

const rotateFigure = (figure) => {
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

const reducer = (state = {}, action) => {
  switch (action.type) {
  case ALERT_POP:
    return { ...state, message: action.message }
  case 'client/error':
    return { ...state, message: action.message }
  case ACTION_PING:
    return { ...state, message: action.message }
  case 'client/pong':
    return { ...state, message: action.message }
  case 'client/create_game':
    return { ...state, message: action.message, field: action.field, gameUrl: `${state.roomName}${state.playerName}` }
  case 'client/get_figure':
    return { ...state, message: action.message, figure: { x: 0, y: 0, figure: action.figure, rotations: 0 } }
  case 'client/set_figure':
    return { ...state, message: action.message, field: action.field, figure: undefined }
  case 'client/new_player':
    console.log('NEW PLAYER!!!')
    const players = { ...state.players }
    players[action.playerName] = action.spectre
    return { ...state, players: { ...players } }
  case 'SAVE_GAME_NAME':
    return { ...state, roomName: action.roomName }
  case 'SAVE_PLAYER_NAME':
    return { ...state, playerName: action.playerName }
    case 'GAME_MOVE_FIGURE_LEFT':
      let figure = state.figure
      figure = { ...figure, x: Math.max(figure.x - 1, 0) }
      return { ...state, figure: figure }
    case 'GAME_MOVE_FIGURE_RIGHT':
      figure = state.figure
      figure = { ...figure, x: Math.min(figure.x + 1, state.field[0].length) }
      return { ...state, figure: figure }
    case 'GAME_MOVE_FIGURE_DOWN':
      figure = state.figure
      figure = { ...figure, y: Math.max(figure.y + 1, 0) }
      return { ...state, figure: figure }
    case 'GAME_MOVE_FIGURE_ROTATE':
      figure = state.figure
      figure = { ...figure, rotations: figure.rotations + 1, figure: rotateFigure(figure.figure)}
      return { ...state, figure: figure }
  default:
    return state
  }
}

export default reducer

