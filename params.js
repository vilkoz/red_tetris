const params = {
  server: {
    host: '0.0.0.0',
    port: 5000,
    get url() { return `http://${this.host}:${this.port}` },
  },
  serverDev: {
    host: '0.0.0.0',
    port: 3004,
    get url() { return `http://${this.host}:${this.port}` },
  },
}

module.exports = params

