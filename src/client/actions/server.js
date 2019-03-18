export const ACTION_PING = 'ACTION_PING'

export const ping = () => {
  return {
    type: 'server/ping',
	message: 'test'
  }
}
