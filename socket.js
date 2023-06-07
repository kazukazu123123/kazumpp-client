const socket = io("https://kazumpp-server.kazu123.net");

socket.on("connect", () => {
  console.log("Connected");
});

socket.on("disconnect", () => {
  console.log("Disconnected");
});

socket.on("n", async (note) => {
  switch (note.t) {
    case 1:
      await pianoAudio.noteOn(note.n, note.v);
      break;
    case 0:
      await pianoAudio.noteOff(note.n);
      break;
    default:
      break;
  }
});
