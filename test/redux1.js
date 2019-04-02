import {configureStore} from './helpers/server'
import rootReducer from '../src/client/reducers'
import {ALERT_POP, alert} from '../src/client/actions/alert'

const MESSAGE = "message"

describe('Fake redux test', () => {
  test('alert it', done => {
    const initialState = {}
    const store =  configureStore(rootReducer, null, initialState, {
      ALERT_POP: ({dispatch, getState}) =>  {
        const state = getState()
        expect(state.message).toBe(MESSAGE)
        done()
      }
    })
    store.dispatch(alert(MESSAGE))
  });

});
