import fs from 'fs'
import debug from 'debug'

const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const logerror = debug('tetris:error'), loginfo = debug('tetris:info')

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

class GameManager {
  constructor() {
    this.games = {};
  }

  createGame(roomName, playerName) {
    if (roomName in this.games) {
      throw Error(`Game with name ${roomName} already exists!`)
    }
    let game = this.games[roomName]
    game = {
      fields: {},
    }
    game['roomName'] = roomName
    game.fields[playerName] = this.createField()
    this.games[roomName] = game
    return game
  }

  connectGame(roomName, playerName) {
    if (!(roomName in this.games)) {
      return this.createGame(roomName, playerName)
    }
    const game = this.games[roomName]
    if (playerName in game.fields) {
      throw Error(`Player with name ${playerName} already connected to the room ${roomName}!`)
    }
    game.fields[playerName] = this.createField()
    return game
  }

  createField() {
    const fieldHeight = 20
    const fieldWidth = 10
    const arr = new Array(fieldHeight)
    for (let i = 0; i < fieldHeight; i = i + 1) {
      arr[i] = Array(fieldWidth)
    }
    return arr
  }
}

const gameManager = new GameManager()

const initEngine = io => {
  io.on('connection', (socket) => {
    loginfo(`Socket connected: ${socket.id}`)
    socket.on('action', (action) => {
      if (action.type === 'server/ping') {
        socket.emit('action', { type: 'client/pong', message: 'kos tochno pidar' })
      }
      else if (action.type === 'server/create_game') {
        try {
          loginfo(action)
          const game = gameManager.connectGame(action.roomName, action.playerName)
          socket.emit('action', { type: 'client/create_game',
            message: `game crated, to connect redirect to: http://host:port/#${action.roomName}${action.playerName}`,
            field: game.fields[action.playerName], game: game })
        }
        catch (e) {
          console.log(e)
          socket.emit('action', { type: 'client/create_game', message: e.message })
        }
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
