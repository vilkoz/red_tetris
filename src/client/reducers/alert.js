import { ALERT_POP } from '../actions/alert'
import { ACTION_PING } from '../actions/server'

const reducer = (state = {} , action) => {
  switch(action.type) {
    case ALERT_POP:
      return { message: action.message }
	case ACTION_PING:
	  return { message: action.message }
    default: 
      return state
  }
}

export default reducer

