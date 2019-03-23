import fs from 'fs'
import debug from 'debug'

const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const logerror = debug('tetris:error'), loginfo = debug('tetris:info')
const _ = require('lodash')
const GameManager = require('./GameManager.js')

const actions = require('./actions.js')

const initApp = (app, params, cb) => {
  const { host, port } = params
  const handler = (req, res) => {
    const file = req.url === '/bundle.js' ? '/../../build/bundle.js' : '/../../index.html'
    fs.readFile(path.join(__dirname, file), (err, data) => {
      if (err) {
        logerror(err)
        res.writeHead(500)
        return res.end('Error loading index.html')
      }
      res.writeHead(200)
      res.end(data)
    })
  }

  app.on('request', handler)

  app.listen({ host, port }, () => {
    loginfo(`tetris listen on ${params.url}`)
    cb()
  })
}

const gameManager = new GameManager()

const actionWrapper = (args, cb) => {
  try {
    return cb(args)
  }
  catch (e) {
    console.log(e)
    args.socket.emit('action', { type: 'client/error', message: e.message })
  }
}

const initEngine = io => {
  io.on('connection', (socket) => {
    loginfo(`Socket connected: ${socket.id}`)
    socket.on('action', (action) => {
      loginfo(action)
      if (action.type === 'server/ping') {
        socket.emit('action', { type: 'client/pong', message: 'pong' })
      }
      else if (action.type === actions.ACTION_SERVER_CREATE_GAME) {
        actionWrapper({ action, socket, gameManager, io }, actions.createGameAction)
      }
      else if (action.type === actions.ACTION_SERVER_GET_FIGURE) {
        actionWrapper({ action, socket, gameManager }, actions.getFigureAction)
      }
      else if (action.type === actions.ACTION_SERVER_SET_FIGURE) {
        actionWrapper(action, socket, actions.setFigureAction)
      }
    })
  })
}

export function create(params) {
  const promise = new Promise((resolve, reject) => {
    const app = http.createServer()
    initApp(app, params, () => {
      const io = socketIo(app)
      const stop = (cb) => {
        io.close()
        app.close(() => {
          app.unref()
        })
        loginfo('Engine stopped.')
        cb()
      }

      initEngine(io)
      resolve({ stop })
    })
  })
  return promise
}
