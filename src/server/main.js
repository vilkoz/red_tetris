import params from '../../params'
import * as server from './index'

let serverParams
if (process.env.NODE_ENV === 'production') {
  serverParams = params.server
  console.log('process.env:', process.env)
  if (process.env.PORT) {
    serverParams.port = process.env.PORT
  }
  // delete serverParams.host
}
else {
  serverParams = params.serverDev
  // delete serverParams.host
}
console.log(JSON.stringify(serverParams))
console.log(JSON.stringify(params))
console.log(JSON.stringify(params.server))

server.create(serverParams).then(() => {
  console.log('not yet ready to play tetris with U ...')
  console.log(`serverParams: ${JSON.stringify(serverParams)} ${JSON.stringify(params.serverDev)}`)
})
