import {
  ping,
  getFigureAction,
  setFigureAction,
} from '../src/client/actions/figure'

import {
  getGameListAction,
  createGameAction,
  toggleReadyStateAction,
  startGameAction,
  reStartGameAction,
  gameOverAction,
} from '../src/client/actions/server'

import { ping as ping2 } from '../src/client/actions/server'

test('ping test', (done) => {
  const res = ping()

  expect(res).toHaveProperty('type')
  done()
})

test('getFigureAction test', (done) => {
  const res = getFigureAction()

  expect(res).toHaveProperty('type')
  expect(res.type).toEqual('server/get_figure')
  done()
})

test('setFigureAction test', (done) => {
  const res = setFigureAction('room', 'player', 'figure')

  expect(res).toHaveProperty('type')
  expect(res.type).toEqual('server/set_figure')
  expect(res.roomName).toEqual('room')
  expect(res.playerName).toEqual('player')
  expect(res.figure).toEqual('figure')
  done()
})

test('server actions', () => {

  let res = getGameListAction()
  expect(res).toHaveProperty('type')
  res = createGameAction()
  expect(res).toHaveProperty('type')
  res = toggleReadyStateAction()
  expect(res).toHaveProperty('type')
  res = startGameAction()
  expect(res).toHaveProperty('type')
  res = reStartGameAction()
  expect(res).toHaveProperty('type')
  res = gameOverAction()
  expect(res).toHaveProperty('type')
  res = ping2()
  expect(res).toHaveProperty('type')
})
