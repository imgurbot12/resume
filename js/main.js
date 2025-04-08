/**
 * Entrypoint and Main Script for Resume Terminal
 */
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebglAddon } from "@xterm/addon-webgl";

import * as _interact from "interactjs";
const interact = _interact.default || _interact;

import { Matrix } from "./matrix.js";

const color = window.getComputedStyle(document.body).getPropertyValue(
  "--terminal-bg",
);
console.log("terminal", color);

const term = new Terminal({
  scrollback: 0,
  cursorWidth: 1,
  theme: { background: color },
  fontFamily: "Ubuntu Mono,monospace",
});
const fitAddon = new FitAddon();
term.loadAddon(fitAddon);
term.loadAddon(new WebglAddon());

term.open(document.getElementById("terminal"));
fitAddon.fit();

interact(".draggable")
  .draggable({
    modifiers: [
      interact.modifiers.restrictRect({ restriction: "parent" }),
    ],
    listeners: {
      move(event) {
        const target = event.target;
        const x = (parseFloat(target.getAttribute("data-x")) || 0) + event.dx;
        const y = (parseFloat(target.getAttribute("data-y")) || 0) + event.dy;

        target.style.transform = "translate(" + x + "px, " + y + "px)";
        target.setAttribute("data-x", x);
        target.setAttribute("data-y", y);
      },
    },
  });

//TODO: use intermediate canvas system to draw in ui
// on top of the matrix effect. items can be layered
// and drawn on top of one another using a coordinate system?
//
// possible means of traversal:
// https://www.npmjs.com/package/ansi-escapes
//
// would a standard canvas multi-dimensional array be better?
//
// ui should have nice option menu with:
//   - neofetch display (heh)
//   - view github projects page
//
// maybe it would be better to migrate to a full 2d rendered
// canvas display to support click events and other things
// beyond pretending to be a terminal?

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

render(true, 1000 / 10);
