const ws = new WebSocket("ws://localhost:3000");

ws.addEventListener("connect", () => {
  console.log("Connected");
})

ws.addEventListener("disconnect", () => {
  console.log("Disconnected");
})

ws.addEventListener("message", msg => {
  const jsonMsg = JSON.parse(msg.data)
  switch (jsonMsg.m) {
    case 'n':
      const noteData = jsonMsg
      if (noteData.t) {
        kazumpp.pianoAudio.noteOn(noteData.n, noteData.v)
      } else {
        kazumpp.pianoAudio.noteOff(noteData.n);
      }
      break
  }
})
