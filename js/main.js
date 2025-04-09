/**
 * Entrypoint and Main Script for Resume Terminal
 */
import * as _interact from "interactjs";
const interact = _interact.default || _interact;

import { ResumeTerm } from "./term.js";
import { Hal9000 } from "./programs/hal9000.js";
import { Whoami } from "./programs/whoami.js";
import { Ping } from "./programs/ping.js";
import { Fetch } from "./programs/fetch.js";

import { Matrix } from "./matrix.js";

const term = new ResumeTerm();

const hal = new Hal9000();
term.add_program("ls", hal);
term.add_program("id", hal);
term.add_program("groups", hal);
term.add_program("cat", hal);

// cd / mkdir / mv / cp
// chown / chmod
// dig / nslookup
// curl / wget
// ssh
// man
// git
// ftp / telnet / netcat / nc
// rsync
// sudo
// apt / pacman / dnf / yum / flatpak / snap
// open / xdg-open
// bash / sh / zsh / fish / nushell

// neofetch :)
// cmatrix :)

term.add_program("whoami", new Whoami());
term.add_program("ping", new Ping());
term.add_program("neofetch", new Fetch());

term.term.writeln("");
term.run("neofetch");
term.prompt();

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
