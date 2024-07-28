class Queue {
  #queue = [];
  #latency = 2000;
  constructor() {
    this.run();
  }

  run() {
    setTimeout(() => {
      console.log("Functions in the queue:", this.#queue.length);
      if (this.#queue.length === 0) return;
      const fct = this.#queue.pop();
      fct();
      this.run();
    }, this.#latency)
  }

  addToQueue(fct) {
    this.#queue.push(fct);
  }
}

export default Queue;