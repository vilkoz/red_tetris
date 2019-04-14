// import chai from 'chai'
import React from 'react'
import { render, cleanup, fireEvent } from 'react-testing-library'
import 'jest-dom/extend-expect'
const LeaderBoard = jest.requireActual('../src/client/components/leader_board').default.WrappedComponent
import { mapDispatchToProps, mapStateToProps } from '../src/client/components/leader_board'

jest.mock('../src/client/routes', () => {
  return { changeRouteByState: jest.fn(() => 'gopa') }
})
import { changeRouteByState } from '../src/client/routes'

afterEach(cleanup)

test('LeaderBoard test', (done) => {
  const { getByText } = render(
    <LeaderBoard
      errorMessage={'error message'} gameList={['game']}
      scores={[
        { player: '1', score: 10 },
        { player: '2', score: 20 },
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
    scores: 'gopa',
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
    scores: 'gopa',
    isOwner: 'gopa',
    theme: 'gopa',
  }
  expect(mapStateToProps(state)).toEqual(props)
  done()
})

test('mapDispatchToProps test', (done) => {
  const dispatch = jest.fn(() => 'gopa')
  const props = mapDispatchToProps(dispatch)

  props.reStartGame()
  expect(dispatch.mock.calls[0][0]).toHaveProperty('type')
  props.switchGameUrl()
  expect(dispatch.mock.calls[1][0]).toHaveProperty('type')
  done()
})
