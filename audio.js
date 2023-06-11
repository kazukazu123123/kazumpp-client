class PianoAudio {
  init() {
    if (this._isInitialized) return
    this._context = new AudioContext()
    this._masterGain = this._context.createGain()
    this._limiterNode = this._context.createDynamicsCompressor()
    this._isInitialized = false
    this._volume = 0.5
    this._buffers = {}
    this._pianoAudios = []
    this._limiterNode.threshold.value = -6
    this._limiterNode.knee.value = 0
    this._limiterNode.ratio.value = 20
    this._limiterNode.attack.value = 0
    this._limiterNode.release.value = 0.1
    this._limiterNode.connect(this._masterGain)
    this._masterGain.gain.value = this._volume
    this._masterGain.connect(this._context.destination)
    this._isInitialized = true

    //Load default sound
    for (let i = 21; i < 109; i++) {
      this.loadSound(i, `sounds/MPPClassic/${i}.wav.mp3`)
    }
  }

  loadSound(key, url) {
    if (!this._isInitialized) return
    if (this._buffers.length) this._buffers = []
    fetch(url)
      .then(async (response) => {
        if (!response.ok)
          return console.log(`HTTP error! Status: ${response.status}`)
        const audioData = await response.arrayBuffer()
        this._context.decodeAudioData(audioData, (buffer) => {
          this._buffers[key] = buffer
        })
      })
      .catch((error) => {
        console.error("Error fetching audio:", error)
      })
  }

  noteOn(noteNumber, vel) {
    if (vel < 0) vel = 0
    else if (vel > 1) vel = 1
    if (!this._isInitialized) return
    if (kazumpp.pianoAudio._context.state !== "running") return
    if (!this._buffers[noteNumber]) return
    const buffer = this._buffers[noteNumber]
    const envelopeGain = this._context.createGain()
    envelopeGain.gain.setValueAtTime(1, this._context.currentTime)
    const gain = this._context.createGain()
    const source = this._context.createBufferSource()
    gain.gain.value = vel
    source.buffer = buffer
    source.start(0)
    source.connect(gain)
    gain.connect(envelopeGain)
    envelopeGain.connect(this._limiterNode)
    this._pianoAudios.push({
      note: noteNumber,
      source,
      envelopeGain: envelopeGain,
    })
    source.onended = (_e) => {
      const targetRemoveIndex = this._pianoAudios.findIndex(
        (e) => e.note === noteNumber
      )
      this._pianoAudios.splice(targetRemoveIndex, 1)
    }
  }

  noteOff(noteNumber) {
    if (!this._isInitialized) return
    if (window.kazumpp.pianoAudio._context.state !== "running") return
    window.kazumpp.pianoAudio._pianoAudios
      .forEach((e) => {
        if (!e) return
        if (e.note != noteNumber) return
        e.envelopeGain.gain.setValueAtTime(
          e.envelopeGain.gain.value,
          this._context.currentTime
        )
        e.envelopeGain.gain.linearRampToValueAtTime(
          0,
          this._context.currentTime + 0.15
        )
        e.source.stop(this._context.currentTime + 0.15)
      })
  }

  noteOffAll() {
    if (!this._isInitialized) return
    if (window.kazumpp.pianoAudio._context.state !== "running") return
    window.kazumpp.pianoAudio._pianoAudios.forEach((e) => {
      if (e) {
        e.envelopeGain.gain.setValueAtTime(
          e.envelopeGain.gain.value,
          this._context.currentTime
        )
        e.envelopeGain.gain.linearRampToValueAtTime(
          0,
          this._context.currentTime + 0.15
        )
        e.source.stop(this._context.currentTime + 0.15)
      }
    })
  }

  getVolume() {
    return this._volume
  }

  setVolume(newVolume) {
    this._volume = Math.min(Math.max(newVolume, 0), 1)
    this._masterGain.gain.value = this._volume
    return this._volume
  }
}

window.addEventListener("DOMContentLoaded", () => {
  window.kazumpp.pianoAudio = new PianoAudio()
  window.kazumpp.pianoAudio.init()
})
