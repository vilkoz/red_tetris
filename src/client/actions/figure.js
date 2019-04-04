import {
  SERVER_GET_FIGURE,
  SERVER_SET_FIGURE,
  CLIENT_GET_FIGURE,
  CLIENT_SET_FIGURE,
} from '../../common/action_index'

export const ping = () => ({
  type: 'server/ping',
  message: 'test',
})

export const getFigureAction = (roomName, playerName) => ({
  type: SERVER_GET_FIGURE,
  roomName,
  playerName,
})

export const setFigureAction = (roomName, playerName, figure) => ({
  type: SERVER_SET_FIGURE,
  roomName,
  playerName,
  figure,
})
