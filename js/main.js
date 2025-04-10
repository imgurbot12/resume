/**
 * Entrypoint and Main Script for Resume Terminal
 */
import * as _interact from "interactjs";
const interact = _interact.default || _interact;

import { ResumeTerm } from "./term.js";

import { About } from "./programs/about.js";
import { Experiences } from "./programs/experiences.js";
import { Fetch } from "./programs/fetch.js";
import { Hal9000 } from "./programs/hal9000.js";
import { Hobbies } from "./programs/hobbies.js";
import { CMatrix } from "./programs/matrix.js";
import { Motd } from "./programs/motd.js";
import { Ping } from "./programs/ping.js";
import { Projects } from "./programs/projects.js";
import { Whoami } from "./programs/whoami.js";

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

// spawn terminal and configure with available programs
const hal = new Hal9000();
const term = new ResumeTerm({
  programs: {
    "ls": hal,
    "id": hal,
    "groups": hal,
    "cat": hal,

    "ping": new Ping(),
    "whoami": new Whoami(),

    "about": new About(),
    "projects": new Projects(),
    "experiences": new Experiences(),
    "hobbies": new Hobbies(),
    "motd": new Motd(),
    "cmatrix": new CMatrix(),
    "neofetch": new Fetch(),
  },
  startup: ["motd"],
});

// autofocus when dragged from terminal header
const termHeads = document.getElementsByClassName("term-head");
for (const head of termHeads) head.onclick = () => term.focus();

// configure terminal to make draggable
interact(".draggable")
  .draggable({
    allowFrom: ".term-head",
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
