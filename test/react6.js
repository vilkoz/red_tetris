// import chai from 'chai'
import React from 'react'
import { render, cleanup, fireEvent } from 'react-testing-library'
import 'jest-dom/extend-expect'
const CompetitorSpectre = jest.requireActual('../src/client/components/competitor_spectre').default
import { mapDispatchToProps, mapStateToProps } from '../src/client/components/competitor_spectre'

jest.mock('../src/client/routes', () => {
  return { changeRouteByState: jest.fn(() => 'gopa') }
})
import { changeRouteByState } from '../src/client/routes'

afterEach(cleanup)

test('CompetitorSpectre test', (done) => {
  const { getByText } = render(
    <CompetitorSpectre
      name={'kos'}
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
      score={100}
    />
  )
  expect(getByText(/kos/)).toHaveTextContent('kos: 100')

  done()
})
