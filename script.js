import { Client } from './client.js'

const kazumpp = {
  client: new Client("ws://localhost:3000")
}

kazumpp.client.start()

kazumpp.client.eventEmitter.on("hi", msg => {
  kazumpp.client.receiveServerTime(msg.t, msg.e || undefined)
})

kazumpp.client.eventEmitter.on("t", msg => {
  kazumpp.client.receiveServerTime(msg.t, msg.e || undefined)
})

kazumpp.client.eventEmitter.on("n", msg => {
  const t = msg.t - kazumpp.client.serverTimeOffset + 1000 - Date.now()
  for (let i = 0; i < msg.n.length; i++) {
    const note = msg.n[i]
    let ms = t + (note.d || 0)
    if (ms < 0) {
      ms = 0
    } else if (ms > 10000) continue
    if (note.s) {
      kazumpp.pianoAudio.stop(note.n, ms)
    } else {
      let vel =
        typeof note.v !== "undefined" ? parseFloat(note.v) : DEFAULT_VELOCITY
      if (vel < 0) vel = 0
      else if (vel > 1) vel = 1
      kazumpp.pianoAudio.play(note.n, vel, ms)
    }
  }
})

window.kazumpp  = kazumpp
