window.addEventListener("DOMContentLoaded", () => {
  window.kazumpp.noteBuffer = {}
  window.kazumpp.noteBuffer.buffer = []
  window.kazumpp.noteBuffer.bufferTime = 0
  window.kazumpp.noteBuffer._flushInterva = 1000

  setInterval(() => {
    if (window.kazumpp.noteBuffer.buffer.length) {
        kazumpp.client.sendJSON({
          m: "n",
          t: window.kazumpp.noteBuffer.bufferTime,
          n: window.kazumpp.noteBuffer.buffer,
        })
      window.kazumpp.noteBuffer.bufferTime = 0
      window.kazumpp.noteBuffer.buffer.splice(0)
    }
  }, 200)
})
