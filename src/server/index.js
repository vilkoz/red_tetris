import fs from 'fs'
import debug from 'debug'

const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const logerror = debug('tetris:error'), loginfo = debug('tetris:info')
const _ = require('lodash')
const GameManager = require('./GameManager.js')
const action_index = require('../common/action_index')

const actions = require('./actions.js')

export const initApp = (app, params, cb) => {
  const { host, port } = params
  const handler = (req, res) => {
    const files = {
      '/bundle.js': '/../../build/bundle.js',
      '/static/baloochettah.ttf': '/../../static/baloochettah.ttf',
      '/static/font.css': '/../../static/font.css',
	  '/static/img/confeti.png': '/../../static/img/confeti.png',
	  '/static/img/podval.jpeg': '/../../static/img/podval.jpeg',
	  '/static/img/magic.jpeg': '/../../static/img/magic.jpeg',
    }
    let file = files[req.url]
    if (!file) {
      file = '/../../index.html'
    }
    loginfo('path:', path.join(__dirname, file))
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
const actionManager = new actions.ActionManager(gameManager)

export const initEngine = io => {
  actionManager.io = io
  io.on('connection', (socket) => {
    loginfo(`Socket connected: ${socket.id}`)
    socket.on('action', (action) => {
      loginfo(action)
      if (action.type === 'server/ping') {
        socket.emit('action', { type: 'client/pong', message: 'pong' })
      }
      else {
        actionManager.dispatch(action, socket)
      }
    })

    socket.on('disconnect', () => {
      logerror(`disconnect ${socket.id}`)
      const playerExitGameAction = {
        type: action_index.SERVER_DISCONNECT_GAME,
      }
      actionManager.dispatch(playerExitGameAction, socket)
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
