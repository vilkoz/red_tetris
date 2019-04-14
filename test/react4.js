
import { mapDispatchToProps, mapStateToProps } from '../src/client/components/game'
// import chai from 'chai'
import React from 'react'
// import { render, cleanup, fireEvent } from 'react-testing-library'
import 'jest-dom/extend-expect'

jest.mock('react')

test('mapDispatchToProps test', (done) => {
  const useEffectMock = jest.spyOn(React, 'useEffect')
  const addEventListenerMock = jest.spyOn(window, 'addEventListener')
  const dispatch = jest.fn(() => 'gopa')
  const props = mapDispatchToProps(dispatch)

  props.moveFigure(true, false)
  console.log(dispatch.mock.calls)
  console.log(useEffectMock.mock.calls)
  let cb = useEffectMock.mock.calls[0][0]
  cb()
  let inputCb = addEventListenerMock.mock.calls[0][1]
  expect(addEventListenerMock.mock.calls[0][0]).toEqual('keydown')
  inputCb({ keyCode: 38 })
  expect(dispatch.mock.calls[0][0]).toHaveProperty('type')
  dispatch.mock.calls.length = 0
  inputCb({ keyCode: 2342 })
  expect(dispatch.mock.calls.length).toEqual(0)

  done()
})
