module.exports = class Queue {
  #items = []
  enqueue = (item) => this.#items.splice(0, 0, item)
  dequeue = () => this.#items.pop()
  empty = () => (this.#items.length = 0)
  get isempty() {
    return this.#items.length === 0
  }
  get size() { 
    return this.#items.length
  }
}
