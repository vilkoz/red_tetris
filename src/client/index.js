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
import { alert, ping } from './actions/alert'

import createSocketIoMiddleWare from 'redux-socket.io'
import io from 'socket.io-client'
const socket = io(':3004')
const socketIoMiddleware = createSocketIoMiddleWare(socket, 'server/')

import { STATE_LOBBY, STATE_GAME_LOBBY, STATE_GAME, STATE_LEADER_BOARD } from '../common/game_states'

const initialState = {
  playerName: '',
  roomName: '',
  gameState: STATE_LOBBY,
  gameUrl: '/',
  theme: 'default',
}
const tempField = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 1, 0, 1, 1, 1, 0, 0, 0],
  [0, 0, 1, 0, 1, 0, 0, 0, 0, 0],
  [0, 0, 1, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 0, 0, 1, 0, 1, 0, 0, 0],
  [0, 0, 1, 1, 1, 0, 1, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 1, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 1, 1, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
]

const fakeInitialStateGame = {
  playerName: 'kosp',
  roomName: '1241kksla',
  gameState: STATE_GAME,
  gameUrl: '/sdasd[adsasd]',
  score: '150',
  theme: 'default',
  message: 'ya ebal tvoy telku uu ya ebal tvoy telku uu ya ebal ebal ebal',
  field: tempField,
  spectres: {
    'player2212131231231231': { field: tempField, score: 1337 },
    'player22222222222': { field: tempField, score: 11113 },
    'player3': { field: tempField, score: 5 },
    'player42121222223441241241241224122412412414124142': { field: tempField, score: 50 },
  }
}

const fakeInitialState = {
  message: 'ebalgopaaaaaaaa ebalgopaaaaaaaaebalgopaaaaaaaa ebalgopaaaaaaaa ebalgopaaaaaaaa',
  playerName: 'kosp',
  roomName: '1sadasda241ksadasasdasdasdaddasdksla',
  gameState: STATE_LEADER_BOARD,
  gameUrl: '/leader_board/124',
  errorMessage: 'Error Message Error Message Error Message Error Message',
  isOwner: true,
  scores: [
    {player: 'sraka', score: 1000},
    {player: 'vilko', score: 2000},
    {player: 'sraka2', score: 3000},
    {player: 'sraka3', score: 4000},
  ],
  theme: 'podval',
}

const store = applyMiddleware(socketIoMiddleware)(createStore)(
  reducer,
  // fakeInitialState,
  // fakeInitialStateGame,
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
store.subscribe((whatisthat) => {
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
