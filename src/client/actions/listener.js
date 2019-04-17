export const setListenerAction = (input) => ({
  type: 'GAME_SET_MOVE_LISTENER',
  moveFigureListener: input,
})

export const createListenerAction = (input) => ({
  type: 'GAME_CREATE_MOVE_LISTENER',
  inputListener: input,
})

export const clearListenerAction = (input) => ({
  type: 'GAME_CLEAR_MOVE_LISTENER',
  moveFigureListener: input,
})

export const createFallIntervalAction = (interval) => ({
  type: 'GAME_CREATE_FALL_INTERVAL',
  fallInterval: interval,
})

export const setFallIntrevalAction = () => ({
  type: 'GAME_SET_FALL_INTERVAL',
})

export const clearFallIntrevalAction = () => ({
  type: 'GAME_CLEAR_FALL_INTERVAL',
})
