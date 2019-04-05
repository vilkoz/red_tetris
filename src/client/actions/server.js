export const ACTION_PING = 'server/ping'

import {
  SERVER_CREATE_GAME,
  SERVER_GET_GAME_LIST,
} from '../../common/action_index'

export const ping = () => ({
  type: 'server/ping',
  message: 'test',
})

export const getGameListAction = () => ({
  type: SERVER_GET_GAME_LIST,
})

export const createGameAction = (roomName, playerName) => ({
  type: SERVER_CREATE_GAME,
  roomName,
  playerName
})
