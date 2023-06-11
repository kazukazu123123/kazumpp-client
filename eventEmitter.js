export class EventEmitter {
  #events = Object.create(null)

  on(event, fn) {
    (this.#events[event] ??= []).push(fn)
  }

  off(event, fn) {
    if (!this.#events) return
    const idx = this.#events[event].indexOf(fn)
    if (idx < 0) return
    this.#events[event].splice(idx, 1)
  }

  emit(event, ...restArgs) {
    const events = this.#events[event]
    if (!events || !events.length) return
    events.forEach(f => Reflect.apply(f, this, restArgs))
  }
}
