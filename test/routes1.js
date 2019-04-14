import {
  mapStateToRoute,
  doMapStateToRoute,
  changeRouteByState
} from '../src/client/routes'
import {
  STATE_LOBBY,
  STATE_GAME_LOBBY,
  STATE_GAME,
  STATE_LEADER_BOARD,
} from '../src/common/game_states'

test('mapStateToRoute test', (done) => {
  const res = mapStateToRoute({ roomname: 'r', playername: 'p' })
  expect(res).toHaveProperty(STATE_LOBBY)
  expect(res).toHaveProperty(STATE_GAME_LOBBY)
  expect(res).toHaveProperty(STATE_GAME)
  expect(res).toHaveProperty(STATE_LEADER_BOARD)
  done()
})

test('doMapStateToRoute test', (done) => {
  const state = {
    roomname: 'r', playername: 'p', gameState: STATE_LOBBY,
  }
  const res = doMapStateToRoute(state)
  expect(res).toEqual('/')
  done()
})

test('changeRouteByState test', (done) => {
  const props = {
    roomname: 'r', playername: 'p', gameState: STATE_LOBBY,
    history: { push: jest.fn(() => {}), location: { pathname: 'gopa' } },
    switchGameUrl: () => {},
  }
  const res = changeRouteByState(props)
  expect(props.history.push.mock.calls[0][0]).toEqual('/')

  props.gameUrl = '/'

  changeRouteByState(props)

  expect(props.history.push.mock.calls[1][0]).toEqual('/')
  done()
})
