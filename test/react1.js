// import chai from 'chai'
import React from 'react'
import { render, cleanup } from 'react-testing-library'
import 'jest-dom/extend-expect'
import { Tetris, Board } from '../src/client/components/test'

afterEach(cleanup)

test('Board should render test text', () => {
  const { getByText } = render(<Board msg={'1111'} />)
  expect(getByText(/^test text/)).toHaveTextContent('test text 1111')
})
