import React from 'react'
import ReactDom from 'react-dom'
import { createLogger } from 'redux-logger'
import thunk from 'redux-thunk'
import { createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import { HashRouter } from 'react-router-dom'

import { storeStateMiddleWare } from './middleware/storeStateMiddleWare'
import reducer from './reducers'
import App from './containers/app'

import createSocketIoMiddleWare from 'redux-socket.io'
import io from 'socket.io-client'
const socket = io(':3004')
const socketIoMiddleware = createSocketIoMiddleWare(socket, 'server/')

import { STATE_LOBBY } from '../common/game_states'

const initialState = {
  playerName: '',
  roomName: '',
  gameState: STATE_LOBBY,
  gameUrl: '/',
  theme: 'default',
}

const store = applyMiddleware(socketIoMiddleware)(createStore)(
  reducer,
  initialState,
  applyMiddleware(thunk, createLogger())
)

ReactDom.render((
  <HashRouter hashType='noslash'>
    <Provider store={store}>
      <App/>
    </Provider>
  </HashRouter>
), document.getElementById('tetris'))

store.subscribe(() => {
  console.log('new client state', store.getState());
})

let dequeueRunning = false
store.subscribe(() => {
  const { actionQueue } = store.getState()
  if (!dequeueRunning && actionQueue && actionQueue.length > 0) {
    actionQueue.forEach((action, i) => {
      dequeueRunning = true
      store.dispatch(action)
      store.dispatch({ type: 'CLIENT_DEQUEUE_ACTION', index: i })
      dequeueRunning = false
    })
  }
})
