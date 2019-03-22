import fs from 'fs'
import debug from 'debug'

const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const logerror = debug('tetris:error'), loginfo = debug('tetris:info')
const _ = require('lodash')
const GameManager = require('./GameManager.js')

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

const actionWrapper = (action, socket, cb) => {
  try {
    return cb(action, socket)
  }
  catch (e) {
    console.log(e)
    socket.emit('action', { type: 'client/error', message: e.message })
  }
}

const initEngine = io => {
  io.on('connection', (socket) => {
    loginfo(`Socket connected: ${socket.id}`)
    socket.on('action', (action) => {
      loginfo(action)
      if (action.type === 'server/ping') {
        socket.emit('action', { type: 'client/pong', message: 'kos tochno pidar' })
      }
      else if (action.type === 'server/create_game') {
        actionWrapper(action, socket, (action, socket) => {
          const { roomName, playerName } = action
          if (gameManager.isGameExists(roomName)) {
            const game = gameManager.connectGame(roomName, playerName, socket)
            socket.emit('action', { type: 'client/create_game',
              message: `You are connected to the game now, to connect redirect to: \
               http://host:port/#${action.roomName}${action.playerName}`,
              field: game.fields[action.playerName] })
            for (const player in game.sockets) {
              const id = game.sockets[player]
              loginfo('id:',id)
              loginfo(io.of('/').connected)
              const s = io.of('/').connected[id]
              s.emit('action', { type: 'client/new_player',
                message: `Player ${playerName} connected`,
                name: playerName,
                spectre: gameManager.getSpectre(roomName, playerName),
              })
            }
          }
          else {
            const game = gameManager.createGame(roomName, playerName, socket)
            socket.emit('action', { type: 'client/create_game',
              message: `game crated, to connect redirect to: \
               http://host:port/#${action.roomName}${action.playerName}`,
              field: game.fields[action.playerName] })
          }

        })
      }
      else if (action.type === 'server/get_figure') {
        actionWrapper(action, socket, (action, socket) => {
          const figure = gameManager.getFigure(action.roomName, action.playerName)
          socket.emit('action', { type: 'client/get_figure',
            message: 'Success',
            figure,
          })
        })
      }
      else if (action.type === 'server/set_figure') {
        actionWrapper(action, socket, (action, socket) => {
          const field = gameManager.setFigure(action.roomName, action.playerName, action.figure)
          socket.emit('action', { type: 'client/set_figure',
            message: 'Success',
            field,
          })
          console.log(e)
          socket.emit('action', { type: 'client/error', message: e.message })
        })
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
