import { ALERT_POP } from '../actions/alert'
import { ACTION_PING } from '../actions/server'

const reducer = (state = {}, action) => {
  switch (action.type) {
  case ALERT_POP:
    return { message: action.message }
  case ACTION_PING:
    return { message: action.message }
  case 'client/pong':
    return { message: action.message }
  case 'client/create_game':
    let ret = {}
    Object.assign(ret, state)
    ret['message'] = action.message
    ret['field'] = action.field
    return ret
  case 'SAVE_GAME_NAME':
    state['roomName'] = action.roomName
    return state
  case 'SAVE_PLAYER_NAME':
    state['playerName'] = action.playerName
    return state
  default:
    return state
  }
}

export default reducer

