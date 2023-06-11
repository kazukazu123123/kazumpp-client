import { EventEmitter } from './eventEmitter.js'

export class Client {
  constructor(uri) {
    this.eventEmitter = new EventEmitter()
    this.uri = uri
    this.ws = undefined
    this.serverTimeOffset = 0
    this.pingInterval = undefined
    this.connectionTime = undefined
    this.connectionAttempts = 0
    this.canConnect = false
    this.noteBuffer = []
    this.noteBufferTime = 0
    this.noteFlushInterval = undefined
  }

  isSupported() {
    return typeof WebSocket === "function"
  }

  isConnected() {
    return (
      this.isSupported() && this.ws && this.ws.readyState === WebSocket.OPEN
    )
  }

  isConnecting() {
    return (
      this.isSupported() &&
      this.ws &&
      this.ws.readyState === WebSocket.CONNECTING
    )
  }

  start() {
    this.canConnect = true
    this.connect()
  }

  stop() {
    this.canConnect = false
    this.close()
  }

  connect() {
    if (
      !this.canConnect ||
      !this.isSupported() ||
      this.isConnected() ||
      this.isConnecting()
    )
      return
    this.eventEmitter.emit("status", "evt_connecting")
    this.ws = new WebSocket(this.uri)
    this.ws.addEventListener("close", () => {
      clearInterval(this.pingInterval)
      clearInterval(this.noteFlushInterval)

      this.eventEmitter.emit("disconnect")
      this.eventEmitter.emit("status", "evt_offline_mode")

      // reconnect!
      if (this.connectionTime) {
        this.connectionTime = undefined
        this.connectionAttempts = 0
      } else {
        ++this.connectionAttempts
      }
      const ms_lut = [50, 2950, 7000, 10000]
      let idx = this.connectionAttempts
      if (idx >= ms_lut.length) idx = ms_lut.length - 1
      const ms = ms_lut[idx]
      setTimeout(this.connect.bind(this), ms)
    })
    this.ws.addEventListener("open", () => {
      this.sendJSON({ m: "hi" })
      this.pingInterval = setInterval(() => {
        this.sendJSON({m: "t", e: Date.now()})
      }, 20000)
      this.noteBuffer = []
      this.noteBufferTime = 0
      this.noteFlushInterval = setInterval(() => {
      if (this.noteBufferTime && this.noteBuffer.length > 0) {
          this.sendJSON(
            {
              m: "n",
              t: this.noteBufferTime + this.serverTimeOffset,
              n: this.noteBuffer,
            },
          )
          this.noteBufferTime = 0
          this.noteBuffer = []
        }
      }, 200)

      this.eventEmitter.emit("connect")
      this.eventEmitter.emit("status", "evt_connected" )
      this.ws.addEventListener("message", (evt) => {
        if (typeof evt.data !== "string") return
        const msg = JSON.parse(evt.data)
        this.eventEmitter.emit(msg.m, msg)
      })
    })
  }

  sendJSON(msg) {
    this.ws.send(JSON.stringify(msg))
  }

  receiveServerTime(time) {
    var now = Date.now();
    var target = time - now;
    //console.log("Target serverTimeOffset: " + target);
    var duration = 1000;
    var step = 0;
    var steps = 50;
    var step_ms = duration / steps;
    var difference = target - this.serverTimeOffset;
    var inc = difference / steps;
    var iv;
    iv = setInterval(function() {
      this.serverTimeOffset += inc;
      if(++step >= steps) {
        clearInterval(iv);
        //console.log("serverTimeOffset reached: " + self.serverTimeOffset);
        this.serverTimeOffset = target;
      }
    }, step_ms);
    }
}
