import React from 'react'
import ReactDom from 'react-dom'
import createLogger from 'redux-logger'
import thunk from 'redux-thunk'
import { createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'

import { storeStateMiddleWare } from './middleware/storeStateMiddleWare'
import reducer from './reducers'
import App from './containers/app'
import { alert, ping } from './actions/alert'

import createSocketIoMiddleWare from 'redux-socket.io'
import io from 'socket.io-client'
const socket = io(':3004')
const socketIoMiddleware = createSocketIoMiddleWare(socket, 'server/')

const initialState = {}

const store = applyMiddleware(socketIoMiddleware)(createStore)(
  reducer,
  initialState,
  applyMiddleware(thunk, createLogger())
)


ReactDom.render((
  <Provider store={store}>
    <App/>
  </Provider>
), document.getElementById('tetris'))

store.subscribe(() => {
	console.log('new client state', store.getState());
})
store.dispatch(alert('KOSSOSoon, will be here a fantastic Tetris ...'))