export const ACTION_PING = 'server/ping'

export const ping = () => {
  return {
    type: 'server/ping',
	message: 'test'
  }
}
