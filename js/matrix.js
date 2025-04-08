/**
 * Matrix Visual Implementation
 */

/* Variables */

const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
  "abcdefghijklmnopqrstuvwxyz" +
  "0123456789)(}{][*&^%$#@!~";

/* Functions */

function randint(min, max) {
  return Math.trunc(Math.random() * (max - min) + min);
}

function randchar() {
  const idx = randint(0, CHARSET.length - 1);
  return CHARSET[idx];
}

function transpose(a) {
  return Object.keys(a[0]).map(function (c) {
    return a.map(function (r) {
      return r[c];
    });
  });
}

/* Classes */

class Sym {
  constructor(value, white) {
    this.value = value;
    this.white = white;
  }

  update(value, white) {
    this.value = value;
    this.white = white;
  }
}

class LineState {
  constructor(height) {
    this.stream = randint(0, 1) == 1;
    this.line = new Array(height).fill(null);
    this.chars = randint(5, height / 2);
    this.whitespace = randint(10, height);
  }

  update() {
    if (this.stream) this.update_on();
    else this.update_off();
  }

  // update when stream is off (false)
  update_off() {
    let updated = false;
    const iter = this.line.entries();

    while (true) {
      const item = iter.next();
      if (item.done) break;
      const [i, sym] = item.value;
      // if character is null (whitespace)
      if (sym === null) {
        updated = false;
        continue;
      }
      // if character is a symbol (marked not white)
      if (!sym.white) {
        if (!updated) {
          this.line[i] = null;
          updated = true;
        }
        continue;
      }
      // if character is a symbol (marked white)
      const next = iter.next().value;
      sym.white = false;
      if (next !== undefined) {
        const char = randchar();
        const index = next[0];
        this.line[index] = new Sym(char, true);
      }
      updated = true;
    }

    this.whitespace -= 1;
    if (this.whitespace == 0) {
      this.stream = true;
      this.whitespace = randint(10, this.line.length - 1);
    }
  }

  // update when stream is on (true)
  update_on() {
    let updated = false;
    const iter = this.line.entries();

    while (true) {
      const item = iter.next();
      if (item.done) break;
      const [i, sym] = item.value;

      // if character is null (whitespace)
      if (sym === null) {
        if (!updated) {
          const char = randchar();
          this.line[i] = new Sym(char, true);
          updated = true;
        }
        continue;
      }
      // if character is a symbol (marked white)
      if (sym.white) {
        const next = iter.next().value;
        sym.white = false;
        if (next !== undefined) {
          const char = randchar();
          const index = next[0];
          this.line[index] = new Sym(char, true);
        }
        updated = true;
        continue;
      }
      // if character is a symbol (marked not white)
      if (updated) {
        this.line[i] = null;
        updated = false;
      }
    }

    this.chars -= 1;
    if (this.chars == 0) {
      this.stream = false;
      this.chars = randint(5, this.line.length - 1);
    }
  }
}

class Matrix {
  constructor(rows, cols) {
    this.matrix = [];
    for (let i = 0; i <= cols / 2; i++) {
      this.matrix.push(new LineState(rows));
    }
  }

  update() {
    for (const state of this.matrix) state.update();
  }

  draw_columns(line, column) {
    if (line >= this.matrix.length) return;

    const state = this.matrix[line];
    return state.line.map((sym) => {
      if (sym === null) return " ";
      if (sym.white) return `\x1B[37;1;1m${sym.value}\x1B[0m`;
      return `\x1B[32;1;2m${sym.value}\x1B[0m`;
    });
  }

  draw() {
    this.update();
    const columns = this.matrix.map((_, i) => this.draw_columns(i));
    const rows = transpose(columns);
    return rows;
  }
}

export { Matrix };
