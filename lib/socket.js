const { server: wsServer } = require('websocket')
const http = require('http')
const EventEmitter = require('events')

class Socket extends EventEmitter {
  constructor(events) {
    super()
    this.events = events
    this.port = 8080
    this.ws = null
    this.conn = null
  }

  stop() {
    try {
      if (this.conn) {
        this.conn.close()
      }
      // Close websocket and server
      this.httpServer.close()
      return { isOk: true }
    } catch (error) {
      console.log(error)
      return { error }
    }
  }

  connect() {
    const httpServer = this.httpServer = http.createServer((req, res) => {
      console.log('[SOCKET]', (new Date()) + ' Received request for ' + req.url)
      res.statusCode = 404;
      res.write('wowowow, stop!')
      res.end()
    })
    httpServer.listen(this.port)
    httpServer.on('error', (e) => {
      if (e.message.startsWith('listen EADDRINUSE: address already in use')) return this.emit('error', { error: `address already in use ${this.port}` });
      console.log(e)
    })
    httpServer.on('close', () => console.log('[SOCKET/SERVER]', 'Closed.'))
    
    const ws = this.ws = new wsServer({
      httpServer,
      autoAcceptConnections: false
    });
    console.log('[SOCKET]', 'Ready.')
    ws.on('request', this.#request.bind(this))

    return this
  }

  #request(req) {
    if (false) { // validate connection
      return req.reject()
    }
  
    const conn = this.conn = req.accept();
    console.log('[SOCKET] New connection.')
    conn.on('message', this.#connMsg.bind(this))
    conn.on('close', this.#connClose.bind(this))
    this.events.on('bot_internal_msg', (bot_msg) => {
      this.conn.sendUTF(JSON.stringify({guild_info: bot_msg}))
    })
    this.emit('new_conn')
  }

  #connMsg(msg) {
    try {
      msg = JSON.parse(msg.utf8Data)
      console.log('[SOCKET]', 'Received Message:', msg)
      // Send message back
      this.conn.sendUTF(JSON.stringify({ msg: msg.msg }))
  
      // transfer message to the bot
      this.emit('msg', msg)
    } catch (error) {
      console.log(error)
    }
  }

  #connClose(reasonCode, description) {
    console.log(
      '[SOCKET]',
      `${new Date()} ${this.conn?.remoteAddress} disconnected. ${reasonCode} ${description}`
    )
    this.stop();
    this.emit('close');
  }
}

module.exports = Socket