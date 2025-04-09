/**
 * Entrypoint and Main Script for Resume Terminal
 */
import * as _interact from "interactjs";
const interact = _interact.default || _interact;

import { ResumeTerm } from "./term.js";
import { Matrix } from "./matrix.js";

const term = new ResumeTerm();

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

// let matrix = new Matrix(term.rows, term.cols - 1);
//
// function render(draw, wait) {
//   const rows = matrix.draw();
//   for (const row of rows) {
//     term.writeln(row.join(" "));
//   }
//
//   setTimeout(() => render(!draw, wait), wait);
// }
//
// render(true, 1000 / 10);
