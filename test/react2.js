// import chai from 'chai'
import React from 'react'
import { render, cleanup, fireEvent } from 'react-testing-library'
import 'jest-dom/extend-expect'
const GameLobby = jest.requireActual('../src/client/components/game_lobby').default.WrappedComponent
import { mapDispatchToProps, mapStateToProps } from '../src/client/components/game_lobby'

jest.mock('../src/client/routes', () => {
  return { changeRouteByState: jest.fn(() => 'gopa') }
})
import { changeRouteByState } from '../src/client/routes'

afterEach(cleanup)

test('GameLobby test', (done) => {
  const { getByText } = render(
    <GameLobby
      errorMessage={'error message'} gameList={['game']}
      playerReadyList={[
        { player: '1', readyStatus: false },
        { player: '2', readyStatus: true },
      ]}

    />
  )
  expect(getByText(/error message/)).toHaveTextContent('error message')
  done()
})

test('mapStateToProps test', (done) => {
  const state = {
    message: 'gopa',
    roomName: 'gopa',
    playerName: 'gopa',
    gameUrl: 'gopa',
    errorMessage: 'gopa',
    gameState: 'gopa',
    playerReadyList: 'gopa',
    isOwner: 'gopa',
    theme: 'gopa',
  }
  const props = {
    message: 'gopa',
    roomName: 'gopa',
    playerName: 'gopa',
    gameUrl: 'gopa',
    errorMessage: 'gopa',
    gameState: 'gopa',
    playerReadyList: 'gopa',
    isOwner: 'gopa',
    theme: 'gopa',
  }
  expect(mapStateToProps(state)).toEqual(props)
  done()
})

test('mapDispatchToProps test', (done) => {
  const dispatch = jest.fn(() => 'gopa')
  const props = mapDispatchToProps(dispatch)

  props.changeTheme({ target: { value: 'gopa' } })
  expect(dispatch.mock.calls[0][0]).toHaveProperty('type')
  props.startGame()
  expect(dispatch.mock.calls[1][0]).toHaveProperty('type')
  props.toggleReadyState()
  expect(dispatch.mock.calls[2][0]).toHaveProperty('type')
  props.switchGameUrl()
  expect(dispatch.mock.calls[3][0]).toHaveProperty('type')
  done()
})
