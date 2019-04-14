// import chai from 'chai'
import React from 'react'
import { render, cleanup, fireEvent } from 'react-testing-library'
import 'jest-dom/extend-expect'
const GameField = jest.requireActual('../src/client/components/game_field').default
import { mapDispatchToProps, mapStateToProps } from '../src/client/components/game_field'

jest.mock('../src/client/routes', () => {
  return { changeRouteByState: jest.fn(() => 'gopa') }
})
import { changeRouteByState } from '../src/client/routes'

afterEach(cleanup)

test('GameField test', (done) => {
  const { container } = render(
    <GameField
      field={[
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      ]}
      figure={{
        figure: [
          [0, 1, 0],
          [0, 1, 0],
          [0, 1, 0],
        ],
        x: 0,
        y: 0,
      }}
    />
  )
  // expect(getByText(/error message/)).toHaveTextContent('error message')
  expect(container.firstChild).not.toBeUndefined()

  done()
})
