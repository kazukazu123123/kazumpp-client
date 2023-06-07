const canvas = document.getElementById("piano");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth - 15;
canvas.height = window.innerHeight / 1.5;
canvas.setAttribute("tabindex", 0);

let pianoOctave = 0;

const keyBufferChanged = (changes) => {
  changes.forEach(function (change, i) {
    console.log(change.name); // 変更があったpropertyの名前
    console.log(change.type); // 変更の種類
    console.log(change.object[change.name]); // 変更後の値
    console.log(change); // すべての変更
  });
};

const keyMapping = new Map([
  //LowerRow
  ["a", 56],
  ["z", 57],
  ["s", 58],
  ["x", 59],
  ["c", 60],
  ["f", 61],
  ["v", 62],
  ["g", 63],
  ["b", 64],
  ["n", 65],
  ["j", 66],
  ["m", 67],
  ["k", 68],
  [",", 69],
  ["l", 70],
  [".", 71],
  ["/", 72],
  //UpperRow
  ["1", 68],
  ["q", 69],
  ["2", 70],
  ["w", 71],
  ["e", 72],
  ["4", 73],
  ["r", 74],
  ["5", 75],
  ["t", 76],
  ["y", 77],
  ["7", 78],
  ["u", 79],
  ["8", 80],
  ["i", 81],
  ["9", 82],
  ["o", 83],
  ["p", 84],
  ["-", 85],
  ["@", 86],
  ["^", 87],
  ["[", 88],
  ["\\", 89],
]);

window.addEventListener("keydown", (e) => {
  if (e.key == "ArrowLeft") {
    if (e.repeat) return;
    e.preventDefault();
    if (pianoOctave > -36) pianoOctave -= 12;
  }
  if (e.key == "ArrowRight") {
    if (e.repeat) return;
    e.preventDefault();
    if (pianoOctave < 24) pianoOctave += 12;
  }
  if (keyMapping.get(e.key)) {
    if (e.repeat) return;
    e.preventDefault();
    pianoAudio.noteOn(keyMapping.get(e.key) + pianoOctave, 1);
    socket.emit("n", { t: 1, n: keyMapping.get(e.key) + pianoOctave, v: 1 });
  }
});

window.addEventListener("keyup", (e) => {
  if (keyMapping.get(e.key)) {
    if (e.repeat) return;
    e.preventDefault();
    pianoAudio.noteOff(keyMapping.get(e.key) + pianoOctave);
    socket.emit("n", { t: 0, n: keyMapping.get(e.key) + pianoOctave });
  }
});
