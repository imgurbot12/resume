/**
 * Entrypoint and Main Script for Resume Terminal
 */
import * as _interact from "interactjs";
const interact = _interact.default || _interact;

import "./fs/impl.js";

import { ResumeTerm } from "./term.js";

import { FILESYSTEM } from "./fs/impl.js";
import {
  Cat,
  ChangeDirectory,
  Id,
  Ls,
  Pwd,
  Whoami,
} from "./programs/builtin.js";

import { About } from "./programs/about.js";
import { Echo } from "./programs/echo.js";
import { Experiences } from "./programs/experiences.js";
import { Fetch } from "./programs/fetch.js";
import { Hobbies } from "./programs/hobbies.js";
import { CMatrix } from "./programs/matrix.js";
import { Motd } from "./programs/motd.js";
import { Projects } from "./programs/projects.js";

// spawn terminal and configure with available programs
const hal = new Echo("I'm afraid I can't do that Dave.");

const term = new ResumeTerm({
  filesystem: FILESYSTEM,
  programs: {
    "cat": new Cat(),
    "cd": new ChangeDirectory(),
    "id": new Id(),
    "ls": new Ls(),
    "pwd": new Pwd(),
    "whoami": new Whoami(),

    "groups": hal,

    "rm": new Echo("Removing Client FileSystem: 1%......%50.....100% [DONE]"),
    "mv": new Echo("Eh, I dont wanna."),
    "cp": new Echo("Copy that."),
    "mkdir": new Echo("Make this dir, make that dir. Do it yourself!"),

    "cwd": new Echo("This aint windows fam."),
    "ipconfig": new Echo("Erm acktchually its ifconfig. 🤓"),

    "route": new Echo("Route yourself to my resume :P"),
    "ip": new Echo("TCP/IP is cool but what about IPX/SPX?"),
    "ifconfig": new Echo("This command is basically deprecated now. Sadge."),

    "fd": new Echo("Rust tools ftw. Crab gang! 🦀"),
    "rg": new Echo("Rust tools ftw. Crab gang! 🦀"),
    "grep": new Echo("Get a grep."),
    "find": new Echo("Go find yourself first."),

    "ping": new Echo("Pong. Would you like to play a game?"),
    "chown": new Echo("Chown on deeze nuts. Gotem :P"),
    "chmod": new Echo("I don't have a clever line for this one sorry. :,("),
    "dig": new Echo("Manual labor isnt my thing really..."),
    "nslookup": new Echo("NSLookup ur mom. Gotem :P"),

    "ftp": new Echo("Why would you ever use this?"),
    "telnet": new Echo("Just use netcat bruh."),
    "netcat": new Echo("The command is 'nc' bruh."),
    "nc": new Echo("Lol made ya think. No reverse shells today!"),

    "git": new Echo("Git outa town. That ain't gonna work."),
    "man": new Echo("Man up and use the interwebs nerd."),
    "ssh": new Echo("This aint your moms terminal."),
    "rsync": new Echo("Rsync the goat."),
    "curl": new Echo("You should curl some weights instead."),
    "wget": new Echo("Wget a lyfe. Gotem :P"),

    "su": new Echo("'guest' is the only user on here fam."),
    "sudo": new Echo("How about SuDONT?"),

    "apt": new Echo("What exactly are you going to try and install?"),
    "pacman": new Echo("I use arch btw"),
    "dnf": new Echo("Fedora is gross."),
    "yum": new Echo("Fedora is gross (x2)."),
    "flatpak": new Echo("Flatpak is ok i guess."),
    "snap": new Echo("Why on gods green earth would you use snap?"),

    "sh": new Echo("This is usually ash/ksh but nobody realizes."),
    "zsh": new Echo("Zsh is overrated imo."),
    "bash": new Echo("The ol reliable..."),
    "fish": new Echo("Fish da best shell hands down."),

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
  .resizable({
    edges: {
      top: ".edge-top",
      left: ".edge-left",
      bottom: ".edge-bottom",
      right: ".edge-right",
    },
    modifiers: [
      // keep the edges inside the parent
      interact.modifiers.restrictEdges({ outer: "parent" }),
      // minimum size
      interact.modifiers.restrictSize({ min: { width: 100, height: 50 } }),
    ],
    listeners: {
      move(event) {
        const target = event.target;
        let x = parseFloat(target.getAttribute("data-x")) || 0;
        let y = parseFloat(target.getAttribute("data-y")) || 0;

        target.style.width = event.rect.width + "px";
        target.style.height = event.rect.height + "px";

        x += event.deltaRect.left;
        y += event.deltaRect.top;

        target.style.transform = "translate(" + x + "px," + y + "px)";
        target.setAttribute("data-x", x);
        target.setAttribute("data-y", y);

        term.resize();
      },
    },
    inertia: true,
  })
  .draggable({
    allowFrom: ".term-head",
    modifiers: [
      interact.modifiers.restrictRect({ restriction: "parent", endOnly: true }),
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
