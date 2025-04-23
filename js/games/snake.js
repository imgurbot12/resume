/**
 * Snake Terminal Game Implementation
 */

import { Colors, Program } from "../term.js";

/* Functions */

function padCenter(str, maxLen) {
  return str.padStart((str.length + maxLen) / 2).padEnd(maxLen);
}

function randint(min, max) {
  return Math.trunc(Math.random() * (max - min) + min);
}

/* Classes */

class Snake extends Program {
  static description = "Play snake game";

  clear() {
    for (let i = 0; i < this.rows; i++) {
      this.term.writeln(" ".repeat(this.cols));
    }
  }

  center(...lines) {
    for (const [idx, line] of Object.entries(lines)) {
      this.draw(
        Math.round(this.cols / 2 - line.length / 2),
        Math.round(this.rows / 2 - (lines.length / 2 - idx) - 1),
        line,
      );
    }
  }

  draw(x, y, string) {
    this.term.write(`\x1B[${y + 1};${x + 1}H${string}`);
  }

  render() {
    this.clear();
    if (this.collect) {
      const [x, y] = this.collect;
      this.draw(x, y, this.food);
    }
    for (const [x, y] of this.snake.slice(0, -1)) {
      this.draw(x, y, this.body);
    }
    const [x, y] = this.snake[this.snake.length - 1];
    this.draw(x, y, this.head);
  }

  tick(wait) {
    if (!this.running) return;
    if (this.stop) return this.gameover();

    if (this.keys.length > 0) {
      this.ticks = 0;
      this.direction = this.keys.shift();
    }

    if (this.collect == null) this.add_food();

    if (this.direction == "up" || this.direction == "down") {
      this.ticks %= this.ratio;
      if (this.ticks == 0) this.move(this.direction);
      this.ticks += 1;
    } else this.move(this.direction);

    this.render();
    setTimeout(() => this.tick(wait), wait);
  }

  move(direction) {
    const head = this.snake[this.snake.length - 1].slice();
    switch (direction) {
      case "up":
        head[1] -= 1;
        this.head = "^";
        break;
      case "down":
        head[1] += 1;
        this.head = "v";
        break;
      case "right":
        head[0] += 1;
        this.head = ">";
        break;
      case "left":
        head[0] -= 1;
        this.head = "<";
        break;
    }

    // snake eats food
    if (head[0] == this.collect[0] && head[1] == this.collect[1]) {
      this.grow += this.scale;
      this.scale += 3;
      this.collect = null;
    }

    // snake out of bounds or hits itself
    if (
      head[0] > this.cols || head[0] < 0 ||
      head[1] > this.rows || head[1] < 0 ||
      this.snake.some(([x, y]) => x == head[0] && y == head[1])
    ) {
      this.stop = true;
    }

    // grow/move snake
    this.snake.push(head);
    if (this.grow > 0) this.grow -= 1;
    else this.snake.shift();
  }

  onKey(key) {
    switch (key.key) {
      // escape / q
      case "\x1B":
      case "q":
        this.shutdown(0);
        break;
      // r - restart/run
      case "r":
        this.running = false;
        setTimeout(() => this.run(), 500);
        break;
      // up-arrow
      case "\x1B[A":
        this.keys.push("up");
        break;
      // down-arrow
      case "\x1B[B":
        this.keys.push("down");
        break;
      // right-arrow
      case "\x1B[C":
        this.keys.push("right");
        break;
      // left-arrow
      case "\x1B[D":
        this.keys.push("left");
        break;
    }
  }

  add_food() {
    let rx = randint(0, this.cols);
    let ry = randint(0, this.rows);
    while (this.snake.some(([x, y]) => x == rx && y == ry)) {
      rx = randint(0, this.cols);
      ry = randint(0, this.rows);
    }
    this.collect = [rx, ry];
  }

  gameover() {
    const score = padCenter(`Score: ${this.snake.length}`, 27);
    this.center(
      "╔════════════•●•════════════╗",
      "║                           ║",
      "║         Game Over!        ║",
      "║                           ║",
      `║${score}║`,
      "║                           ║",
      "║    Press `q` to exit.     ║",
      "║    Press `r` to restart.  ║",
      "║                           ║",
      "╚════════════•●•════════════╝",
    );
  }

  run() {
    this.cols = this.term.cols;
    this.rows = this.term.rows;

    this.snake = [[0, 0]];
    this.collect = null;
    this.grow = 5;
    this.head = ">";
    this.body = "#";
    this.food = "@";
    this.direction = "right";

    this.keys = [];
    this.scale = 3;
    this.stop = false;
    this.ticks = 0;
    this.ratio = Math.min(3, Math.floor(this.cols / this.rows));

    this.running = true;
    this.term.write("\x1b[?1049h");
    this.term.write("\x9b?25l");
    this.tick(1000 / 20);
  }

  shutdown() {
    this.running = false;
    this.term.write("\x9b?25h");
    this.term.write("\x1b[?1049l");
    super.shutdown();
  }
}

export { Snake };
