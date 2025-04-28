/**
 * Minesweeper Terminal Game Implementation
 */

import { GameProgram, randint } from "./_base.js";

/* Functions */

function elapsed(start) {
  const ms = Date.now() - start;
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  return [
    (h > 0) ? `${h}h` : "",
    (m > 0) ? `${m % 60}m` : "",
    `${s % 60}s`,
  ].join("");
}

/**
 * Generate MineSweeper Board of Specified Size and Number of Mines
 *
 * @param  {Integer}   size      size of board (x / y)
 * @param  {Integer}   numMines  number of mines to place on the board
 * @return {Coord[][]}           two dimensional board array
 */
function genBoard(size, numMines) {
  // build empty board
  const board = Array.from({ length: size }, () => {
    return Array.from({ length: size }, () => new Coord());
  });
  // place mines and propigate values around it
  for (let n = 0; n < numMines; n++) {
    // place mine at new location on board
    let [y, x] = [randint(0, size), randint(0, size)];
    while (board[y][x].mine) [y, x] = [randint(0, size), randint(0, size)];
    board[y][x].mine = true;
    // propigate values surrounding mine
    const min = Math.max(0, x - 1);
    const max = Math.min(x + 1, size - 1);
    for (let i = min; i <= max; i++) {
      if (y - 1 >= 0 && !board[y - 1][i].mine) board[y - 1][i].value += 1;
      if (y + 1 < size && !board[y + 1][i].mine) board[y + 1][i].value += 1;
    }
    if (x - 1 >= 0 && !board[y][x - 1].mine) board[y][x - 1].value += 1;
    if (x + 1 < size && !board[y][x + 1].mine) board[y][x + 1].value += 1;
  }
  return board;
}

/**
 * Trigger Coordinate on Board and Propigate Response
 *
 * @param {Coord[][]} board  two dimensional board space
 * @param {Integer}   x      x coordinate of dig
 * @param {Integer}   y      y coordinate of dig
 */
function dig(board, x, y) {
  const size = board.length;
  const coords = [[x, y]];
  while (coords.length > 0) {
    [x, y] = coords.shift();

    const coord = board[y][x];
    if (coord.revealed) continue;

    coord.revealed = true;
    if (coord.mine) return false;
    if (coord.value > 0) continue;

    const min = Math.max(0, x - 1);
    const max = Math.min(x + 1, size - 1);
    for (let i = min; i <= max; i++) {
      if (y - 1 >= 0 && !board[y - 1][i].revealed) coords.push([i, y - 1]);
      if (y + 1 < size && !board[y + 1][i].revealed) coords.push([i, y + 1]);
    }
    if (x - 1 >= 0 && !board[y][x - 1].revealed) coords.push([x - 1, y]);
    if (x + 1 < size && !board[y][x + 1].revealed) coords.push([x + 1, y]);
  }
  return true;
}

/* Classes */

class Coord {
  constructor() {
    this.value = 0;
    this.mine = false;
    this.revealed = false;
    this.marked = false;
  }
}

class MineSweeper extends GameProgram {
  static description = "Play mine-sweeper game";

  marker(coord) {
    if (!coord.revealed) return (coord.marked) ? this.flag : this.unknown;
    if (coord.mine) return this.mine;
    if (coord.value == 0) return this.empty;
    return String(coord.value);
  }

  lines() {
    const lines = [];

    const time = elapsed(this.start);
    lines.push(`mines: ${this.numMines - this.marked}, time: ${time}`);

    const border = "═".repeat(this.size + 1);
    const board = this.board
      .map((line) => line.map((coord) => this.marker(coord)).join(" "))
      .map((line) => `║ ${line} ║`);
    lines.push(`╔${border}╗`, ...board, `╚${border}╝`, "");

    switch (this.win) {
      case true:
        lines.push("You win! Congratulations :)");
        break;
      case false:
        lines.push("Kaboom! Press `r` to restart.");
        break;
      default:
        lines.push("Press `f` to mark a mine.");
    }
    return lines;
  }

  render() {
    this.clear();
    const lines = this.lines();
    this.center(...lines);
    this.moveCursor(...this.physCursor);
  }

  tick(wait) {
    if (!this.running) return;
    this.render();
    if (this.win === null) setTimeout(() => this.tick(wait), wait);
  }

  mark() {
    const [x, y] = this.cursor;
    const coord = this.board[y][x];
    coord.marked = !coord.marked;
    this.marked += (coord.marked) ? 1 : -1;
  }

  dig() {
    const safe = dig(this.board, ...this.cursor);
    if (!safe) this.win = false;

    const won = this.board
      .flat()
      .filter((coord) => !coord.mine)
      .every((coord) => coord.revealed || coord.value == 0);
    if (won) this.win = true;
  }

  move(direction) {
    switch (direction) {
      case "left":
        if (this.cursor[0] == 0) break;
        this.cursor[0] -= 1;
        this.physCursor[0] -= 2;
        break;
      case "right":
        if (this.cursor[0] == this.boardSize - 1) break;
        this.cursor[0] += 1;
        this.physCursor[0] += 2;
        break;
      case "up":
        if (this.cursor[1] == 0) break;
        this.cursor[1] -= 1;
        this.physCursor[1] -= 1;
        break;
      case "down":
        if (this.cursor[1] == this.boardSize - 1) break;
        this.cursor[1] += 1;
        this.physCursor[1] += 1;
        break;
    }
    this.moveCursor(...this.physCursor);
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
      // enter/return
      case "\r":
        this.dig();
        break;
      // mark button
      case "f":
        this.mark();
        break;
      // left-arrow
      case "\x1B[D":
        this.move("left");
        break;
      // right-arrow
      case "\x1B[C":
        this.move("right");
        break;
      // up-arrow
      case "\x1B[A":
        this.move("up");
        break;
      // down-arrow
      case "\x1B[B":
        this.move("down");
        break;
    }
  }

  run() {
    super.run();

    this.empty = " ";
    this.flag = "F";
    this.mine = "M";
    this.unknown = "☰";

    this.boardSize = this.rows - 9;
    this.numMines = Math.floor((this.boardSize ** 2) * 0.20);

    this.win = null;
    this.board = genBoard(this.boardSize, this.numMines);
    this.marked = 0;
    this.start = Date.now();
    this.cursor = [0, 0];

    this.size = this.boardSize * 2;
    this.size += this.size % 2;

    const lines = this.lines();
    this.physMinCursor = this.findCenter(lines[2].length, lines.length, 2);
    this.physMinCursor[0] += 2;

    this.physCursor = this.physMinCursor.slice();

    this.running = true;
    this.term.write("\x1b[?1049h");
    this.tick(1000 / 20);
  }

  shutdown(code) {
    this.running = false;
    this.term.write("\x1b[?1049l");
    super.shutdown(code);
  }
}

export { MineSweeper };
