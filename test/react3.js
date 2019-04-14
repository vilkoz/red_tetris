// import chai from 'chai'
import React from 'react'
import { render, cleanup, fireEvent } from 'react-testing-library'
import 'jest-dom/extend-expect'
const Game = jest.requireActual('../src/client/components/game').default.WrappedComponent
import { mapDispatchToProps, mapStateToProps } from '../src/client/components/game'

jest.mock('../src/client/routes', () => {
  return { changeRouteByState: jest.fn(() => 'gopa') }
})
import { changeRouteByState } from '../src/client/routes'

afterEach(cleanup)

test('Game test', (done) => {
  const moveFigureMock = jest.fn(()=>{})
  const fallFigureMock = jest.fn(()=>{})
  const { getByText } = render(
    <Game
      errorMessage={'error message'}
      moveFigure={moveFigureMock}
      fallFigure={fallFigureMock}
      roomName={'gopa111111111111111111112'}
      spectres={{
        'kos': [[0, 0, 0], [1, 1, 1]],
        'nekos': [[0, 0, 0], [1, 1, 1]],
      }}
    />
  )
  expect(getByText(/error message/)).toHaveTextContent('error message')
  expect(getByText(/gopa/)).toHaveTextContent('gopa11111111111111111...')
  expect(moveFigureMock.mock.calls.length).toEqual(1)
  expect(fallFigureMock.mock.calls.length).toEqual(1)

  const container = render(
    <Game
      errorMessage={'error message'}
      moveFigure={moveFigureMock}
      fallFigure={fallFigureMock}
      roomName={'gopa111111111111111111112'}
      spectres={{
        'kos': { field: [[0, 0, 0], [1, 1, 1]], score: 30 },
        'nekos': { field: [[0, 0, 0], [1, 1, 1]], score: 30 },
      }}
      isGameOver={true}
      score={30}
    />
  )
  expect(container.getByText(/error message/)).toHaveTextContent('error message')
  done()
})

test('mapStateToProps test', (done) => {
  const state = {
    roomName: 'gopa',
    playerName: 'gopa',
    field: 'gopa',
    gameUrl: 'gopa',
    gameState: 'gopa',
    figure: 'gopa',
    message: 'gopa',
    errorMessage: 'gopa',
    moveFigureListener: 'gopa',
    fallFigureInterval: 'gopa',
    spectres: 'gopa',
    score: 'gopa',
    theme: 'gopa',
    scores: 'gopa',
  }
  const props = {
    roomName: 'gopa',
    playerName: 'gopa',
    field: 'gopa',
    gameUrl: 'gopa',
    gameState: 'gopa',
    figure: 'gopa',
    message: 'gopa',
    errorMessage: 'gopa',
    moveFigureListener: 'gopa',
    fallFigureInterval: 'gopa',
    spectres: 'gopa',
    score: 'gopa',
    theme: 'gopa',
    scores: 'gopa',
  }
  expect(mapStateToProps(state)).toEqual(props)
  done()
})


test('mapDispatchToProps test', (done) => {
  const dispatch = jest.fn(() => 'gopa')
  const props = mapDispatchToProps(dispatch)

  props.getFigure()
  expect(dispatch.mock.calls[0][0]).toHaveProperty('type')
  props.setFigure()
  expect(dispatch.mock.calls[1][0]).toHaveProperty('type')

  props.switchGameUrl()
  expect(dispatch.mock.calls[2][0]).toHaveProperty('type')

  // props.moveFigure(true, false)
  // expect(dispatch.mock.calls[3][0]).toHaveProperty('type')
  // props.moveFigure(false, true)
  // expect(dispatch.mock.calls[4][0]).toHaveProperty('type')
  done()
})
