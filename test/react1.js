// import chai from 'chai'
import React from 'react'
import { render, cleanup } from 'react-testing-library'
import 'jest-dom/extend-expect'
const Lobby = jest.requireActual('../src/client/components/lobby').default.WrappedComponent
import { mapDispatchToProps, mapStateToProps } from '../src/client/components/lobby'

jest.mock('../src/client/routes', () => {
  return { changeRouteByState: jest.fn(() => 'gopa') }
})
import { changeRouteByState } from '../src/client/routes'

test('Lobby test', (done) => {
  const { getByText } = render(<Lobby errorMessage={'error message'} gameList={['game']}/>)
  expect(getByText(/error message/)).toHaveTextContent('error message')
  done()
})

test('mapStateToProps test', (done) => {
  const state = {
    message: 'test',
    roomName: 'test',
    playerName: 'test',
    field: 'test',
    gameUrl: 'test',
    gameList: 'test',
    errorMessage: 'test',
    gameState: 'test',
  }
  const props = {
    message: 'test',
    roomName: 'test',
    playerName: 'test',
    field: 'test',
    gameUrl: 'test',
    gameList: 'test',
    errorMessage: 'test',
    gameState: 'test',
  }
  expect(mapStateToProps(state)).toEqual(props)
  done()
})

test('mapDispatchToProps test', (done) => {
  const dispatch = jest.fn(() => 'gopa')
  const props = mapDispatchToProps(dispatch)

  props.updateRoomName({ target: { value: 'gopa' } })
  expect(dispatch.mock.calls[0][0]).toHaveProperty('type')
  props.updatePlayerName({ target: { value: 'gopa' } })
  expect(dispatch.mock.calls[1][0]).toHaveProperty('type')
  props.createGame('gopa', 'sobaka')
  expect(dispatch.mock.calls[2][0]).toHaveProperty('type')
  props.getGameList()
  expect(dispatch.mock.calls[3][0]).toHaveProperty('type')
  props.switchGameUrl()
  expect(dispatch.mock.calls[4][0]).toHaveProperty('type')
  done()
})
