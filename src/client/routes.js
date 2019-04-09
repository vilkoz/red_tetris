import {
  STATE_LOBBY,
  STATE_GAME_LOBBY,
  STATE_GAME,
  STATE_LEADER_BOARD,
} from '../common/game_states'

export const mapStateToRoute = ({ roomName, playerName }) => ({
  [STATE_LOBBY]: '/',
  [STATE_GAME_LOBBY]: `/game_lobby/${roomName}`,
  [STATE_GAME]: `/${roomName}[${playerName}]`,
  [STATE_LEADER_BOARD]: `/leader_board/${roomName}`,
})

export const changeRouteByState = ({ roomName, playerName, history, gameUrl, gameState, switchGameUrl }) => {
  const requiredRoute = mapStateToRoute({ roomName, playerName })[gameState]
  if (gameUrl !== requiredRoute) {
    history.push(requiredRoute)
    switchGameUrl(requiredRoute)
  }
  else if (history.location.pathname !== requiredRoute) {
    history.push(requiredRoute)
  }
}
