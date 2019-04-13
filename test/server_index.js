import * as index from '../src/server/index'
import fs from 'fs'

describe('server/actions.js', () => {
  test('initApp test', (done) => {
    let requestHandler
    let expectedHostPort
    let expectedExitCb
    const app = {
      on: (action, handler) => {
        requestHandler = handler
      },
      listen: (hostPort, exitCb) => {
        expectedHostPort = hostPort
        expectedExitCb = exitCb
        exitCb()
      },
    }
    const params = {
      host: '127.0.0.1',
      port: '1337',
      url: '127.0.0.1:1337'
    }
    const cb = jest.fn(() => 'gopa')
    index.initApp(app, params, cb)

    expect(expectedHostPort).toEqual({ host: '127.0.0.1', port: '1337' })
    expect(cb.mock.calls.length).toBe(1)

    const res = {
      writeHead: (num) => {
        expect(num).toEqual(200)
      },
      end: () => 'gopa',
    }
    requestHandler({ url: '/bundle.js' }, res)
    requestHandler({ url: '/static/baloochettah.ttf' }, res)
    requestHandler({ url: '/static/font.css' }, res)
    requestHandler({ url: '/hello' }, res)

    done()
  })

  test('initEngine', (done) => {
    let ioCallback
    const io = {
      on: (action, cb) => {
        expect(action).toEqual('connection')
        ioCallback = cb
      },
    }

    const socketCallbacks = []
    const socket = {
      on: jest.fn((action, cb) => {
        socketCallbacks.push(cb)
      }),
      emit: jest.fn((action, actionObj) => {}),
    }

    index.initEngine(io)
    ioCallback(socket)
    expect(socket.on.mock.calls[0][1]).not.toBeUndefined()
    expect(socket.on.mock.calls[0][0]).toEqual('action')
    expect(socket.on.mock.calls[1][1]).not.toBeUndefined()
    expect(socket.on.mock.calls[1][0]).toEqual('disconnect')

    socketCallbacks[0]({ type: 'server/ping' })
    expect(socket.emit.mock.calls[0][0]).toEqual('action')
    expect(socket.emit.mock.calls[0][1]).toEqual({ type: 'client/pong', message: 'pong' })

    socketCallbacks[1]()
    expect(socket.emit.mock.calls[1]).toBeUndefined()

    done()
  })
})
