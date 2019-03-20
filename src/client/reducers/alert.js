import { ALERT_POP } from '../actions/alert'
import { ACTION_PING } from '../actions/server'

const reducer = (state = {}, action) => {
  switch (action.type) {
  case ALERT_POP:
    return { ...state, message: action.message }
  case ACTION_PING:
    return { ...state, message: action.message }
  case 'client/pong':
    return { ...state, message: action.message }
  case 'client/create_game':
    return { ...state, message: action.message, field: action.field }
  case 'SAVE_GAME_NAME':
    return { ...state, roomName: action.roomName }
  case 'SAVE_PLAYER_NAME':
    return { ...state, playerName: action.playerName }
  default:
    return state
  }
}

export default reducer

