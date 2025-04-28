/**
 * Game Utilities
 */

import { Program } from "../term.js";

/* Functions */

/**
 * Generate Random Integer Within the Specified Range
 *
 * @param  {Integer} min
 * @param  {Integer} max
 * @return {Integer}
 */
function randint(min, max) {
  return Math.trunc(Math.random() * (max - min) + min);
}

/**
 * Pad Start & End of String to Place in Center
 *
 * @param  {String}  str
 * @param  {Integer} maxLen
 * @return {String}
 */
function padCenter(str, maxLen) {
  return str.padStart((str.length + maxLen) / 2).padEnd(maxLen);
}

/* Classes */

class GameProgram extends Program {
  clear() {
    for (let i = 0; i < this.rows; i++) {
      this.term.writeln(" ".repeat(this.cols));
    }
  }

  draw(x, y, string) {
    this.term.write(`\x1B[${y + 1};${x + 1}H${string}`);
  }

  moveCursor(x, y) {
    this.term.write(`\x1B[${y + 1};${x + 1}H`);
  }

  findCenter(width, height, idx = 0) {
    return [
      Math.round(this.cols / 2 - width / 2),
      Math.round(this.rows / 2 - (height / 2 - idx) - 1),
    ];
  }

  center(...lines) {
    for (const [idx, line] of Object.entries(lines)) {
      const [x, y] = this.findCenter(line.length, lines.length, idx);
      this.draw(x, y, line);
    }
  }

  run() {
    this.cols = this.term.cols;
    this.rows = this.term.rows;
  }
}

export { GameProgram, padCenter, randint };
