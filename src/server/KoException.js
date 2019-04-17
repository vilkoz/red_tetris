class KoException extends Error {
  constructor(message) {
    super()
    this.name = 'KoException'
    this.mesage = message || 'KO'
  }
}

module.exports = KoException;
