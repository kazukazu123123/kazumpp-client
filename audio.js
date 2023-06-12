export class PianoAudio {
  constructor() {
    this._context = new AudioContext();
    this._masterGain = this._context.createGain();
    this._masterGain.gain.value = 1;
    this._masterGain.connect(this._context.destination);
    this._limiterNode = this._context.createDynamicsCompressor();
    this._isInitialized = false;
    this._volume = 0.5;
    this._sounds = {};
    this._playings = [];
    this._limiterNode.threshold.value = -6;
    this._limiterNode.knee.value = 0;
    this._limiterNode.ratio.value = 20;
    this._limiterNode.attack.value = 0;
    this._limiterNode.release.value = 0.1;
    this._limiterNode.connect(this._masterGain);
    this.pianoGain = this._context.createGain();
    this.pianoGain.gain.value = 0.5;
    this.pianoGain.connect(this._limiterNode);
  }

  init() {
    if (this._isInitialized) return;
    this.lramp = 0.02;
    this.sstop = 0.02;
    this.lramps = 0.16;
    this.lramps2 = 0.4;
    this.sstops = 0.41;
    this._isInitialized = true;

    //Load default sound
    for (let i = 21; i < 109; i++) {
      this.loadSound(i, `sounds/MPPClassic/${i}.wav.mp3`);
    }
  }

  loadSound(key, url) {
    if (!this._isInitialized) return;
    if (this._sounds.length) this._sounds = [];
    fetch(url)
      .then(async (response) => {
        if (!response.ok)
          return console.log(`HTTP error! Status: ${response.status}`);
        const audioData = await response.arrayBuffer();
        this._context.decodeAudioData(audioData, (buffer) => {
          this._sounds[key] = buffer;
        });
      })
      .catch((error) => {
        console.error("Error fetching audio:", error);
      });
  }

  actualPlay(noteNumber, vel, time) {
    if (!this._isInitialized) return;
    if (kazumpp.pianoAudio._context.state !== "running") return;
    if (!this._sounds.hasOwnProperty(noteNumber)) return;
    if (!time) time = 0;
    const source = this._context.createBufferSource();
    source.buffer = this._sounds[noteNumber];
    const gain = this._context.createGain();
    gain.gain.value = vel;
    source.connect(gain);
    gain.connect(this.pianoGain);
    source.start(time);
    if (this._playings[noteNumber]) {
      var playing = this._playings[noteNumber];
      playing.gain.gain.setValueAtTime(playing.gain.gain.value, time);
      playing.gain.gain.linearRampToValueAtTime(0.0, time + this.lramp);
      playing.source.stop(time + this.sstop);
    }
    this._playings[noteNumber] = { source: source, gain: gain };
  }

  play(noteNumber, vel, delay_ms) {
    this.actualPlay(noteNumber, vel, this._context.currentTime + delay_ms / 1000);
  }

  stop(noteNumber, delay_ms) {
    this.actualStop(noteNumber, this._context.currentTime + delay_ms / 1000);
  }

  actualStop(noteNumber, time) {
    if (!this._isInitialized) return;
    if (window.kazumpp.pianoAudio._context.state !== "running") return;
    if (!time) time = 0;
    if (
      this._playings.hasOwnProperty(noteNumber) &&
      this._playings[noteNumber]
    ) {
      var gain = this._playings[noteNumber].gain.gain;
      gain.setValueAtTime(gain.value, time);
      gain.linearRampToValueAtTime(
        gain.value * 0.1,
        time + this.lramps
      );
      gain.linearRampToValueAtTime(0.0, time + this.lramps2);
      this._playings[noteNumber].source.stop(time + this.sstops);

      this._playings[noteNumber] = null;
    }
  }

  getVolume() {
    return this._volume;
  }

  setVolume(newVolume) {
    this._volume = Math.min(Math.max(newVolume, 0), 1);
    this._masterGain.gain.value = this._volume;
    return this._volume;
  }
}
