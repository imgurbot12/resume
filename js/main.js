/**
 * Entrypoint and Main Script for Resume Terminal
 */
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebglAddon } from "@xterm/addon-webgl";

import { Matrix } from "./matrix.js";

const term = new Terminal({ scrollback: 0, cursorWidth: 1 });
const fitAddon = new FitAddon();
term.loadAddon(fitAddon);
term.loadAddon(new WebglAddon());

term.open(document.getElementById("terminal"));
fitAddon.fit();

let matrix = new Matrix(term.rows, term.cols - 1);

window.addEventListener("resize", () => {
  console.log("resize");
  fitAddon.fit();
  matrix = new Matrix(term.rows, term.cols - 1);
});

// for (let i = 0; i <= 20; i++) {
//   matrix.matrix[1].update();
//   const col = matrix.draw_columns(1, 1);
//   console.log(col);
// }

function render(draw, wait) {
  const rows = matrix.draw();
  for (const row of rows) {
    term.writeln(row.join(" "));
  }

  setTimeout(() => render(!draw, wait), wait);
}

render(true, 1000 / 20);
