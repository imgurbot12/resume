/**
 * Interactive Terminal Shell Implementation
 */
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebglAddon } from "@xterm/addon-webgl";

/* Variables */

const termColor = window
  .getComputedStyle(document.body)
  .getPropertyValue("--terminal-bg");

/* Classes */

const Colors = {
  BLACK: "\x1B[30;1;1m",
  RED: "\x1B[31;1;1m",
  GREEN: "\x1B[32;1;1m",
  YELLOW: "\x1B[33;1;1m",
  BLUE: "\x1B[34;1;1m",
  MAGENTA: "\x1B[35;1;1m",
  CYAN: "\x1B[36;1;1m",
  WHITE: "\x1B[37;1;1m",
  GRAY: "\x1B[90;1;1m",
  B_RED: "\x1B[91;1;1m",
  B_GREEN: "\x1B[92;1;1m",
  B_YELLOW: "\x1B[93;1;1m",
  B_BLUE: "\x1B[94;1;1m",
  B_MAGENTA: "\x1B[95;1;1m",
  B_CYAN: "\x1B[96;1;1m",
  B_WHITE: "\x1B[97;1;1m",
  RESET: "\x1B[0m",
};

class Program {
  startup(term, signal) {
    this.term = term;
    this.signal = signal;
    this.run();
  }

  run() {}
  onKey(_key) {}
  resize() {}

  shutdown(exitCode = 0) {
    this.signal(exitCode);
  }
}

class ResumeTerm {
  constructor(elementId = "terminal") {
    // initialize and prepare terminal
    this.term = new Terminal({
      scrollback: 0,
      cursorWidth: 1,
      theme: { background: termColor },
      fontFamily: "Ubuntu Mono,monospace",
    });
    this.fit = new FitAddon();
    this.term.loadAddon(this.fit);
    this.term.loadAddon(new WebglAddon());
    // attach terminal to element and resize
    this.term.open(document.getElementById(elementId));
    this.fit.fit();
    window.addEventListener("resize", () => this.resize());
    // configure internals
    this.history = [];
    this.histpos = 0;
    this.cursor = 0;
    this.command = "";
    this.program = null;
    this.programs = {};
    this.term.onKey((key) => this.onKey(key));
    this.prompt();
  }

  resize() {
    this.fit.fit();
    if (this.program !== null) this.program.resize();
  }

  attach(program) {
    program.startup(this.term, (code) => this.detatch(code));
    this.term.onKey(program.onKey);
  }

  detatch(exitCode) {
    if (this.program === null) return;
    this.program.shutdown();
    this.program = null;
  }

  add_program(command, program) {
    this.programs[command] = program;
  }

  prompt() {
    this.term.write("[guest@resume ~]$ ");
  }

  run(command) {
    console.log("run", command);
    const [cmd, args] = command.split(" ", 1);
    if (cmd in this.programs) {
      const program = this.programs[cmd];
      this.attach(program);
      return;
    }
    this.term.writeln(`resume: Unknown Command: ${cmd}`);
  }

  _setcommand(command) {
    this.command = command;
    this.cursor = this.command.length;
  }

  _jumpstart() {
    while (this.cursor > 0) {
      this.cursor -= 1;
      this.term.write("\x1B[D");
    }
  }

  _jumpend() {
    while (this.cursor < this.command.length) {
      this.cursor += 1;
      this.term.write("\x1B[C");
    }
  }

  _backspace() {
    if (this.cursor < this.command.length) {
      const before = this.command.slice(0, this.cursor - 1);
      const after = this.command.slice(this.cursor);
      const shift = "\x1B[D".repeat(this.command.length - this.cursor + 1);
      this.cursor -= 1;
      this.command = before + after;
      this.term.write("\b \b" + after + " " + shift);
      return;
    }
    this.cursor -= 1;
    this.command = this.command.substring(0, this.command.length - 1);
    this.term.write("\b \b");
  }

  _clearprompt() {
    this._jumpend();
    for (let i = 0; i < this.command.length; i++) this.term.write("\b \b");
    this._setcommand("");
  }

  onKey(key) {
    if (this.program !== null) return this.program.onKey(key);
    switch (key.key) {
      // enter/return
      case "\r":
        this.term.writeln("");
        this.command = this.command.trim();
        if (this.command.length != 0) {
          this.history.push(this.command);
          this.run(this.command);
        }
        this._setcommand("");
        this.histpos = this.history.length;
        this.prompt();
        break;
      // ctrl+l
      case "\f":
        this.term.clear();
        break;
      // ctrl+u
      case "\x15":
        while (this.cursor > 0) this._backspace();
        break;
      // backspace
      case "\x7f":
      case "\b":
        if (this.command.length == 0 || this.cursor == 0) break;
        this._backspace();
        break;
      // home key
      case "\x1B[H":
        this._jumpstart();
        break;
      // end key and ctrl+e
      case "\x1B[F":
      case "\x05":
        console.log("jumping end");
        this._jumpend();
        break;
      // left arrow
      case "\x1B[D":
        if (this.cursor == 0) break;
        this.cursor -= 1;
        this.term.write(key.key);
        break;
      // right arrow
      case "\x1B[C":
        if (this.cursor == this.command.length) break;
        this.cursor += 1;
        this.term.write(key.key);
        break;
      // up arrow
      case "\x1B[A":
        if (this.history.length <= 0) break;
        if (this.histpos > 0) this.histpos -= 1;
        this._clearprompt();
        this._setcommand(this.history[this.histpos]);
        this.term.write(this.command);
        break;
      // down arrow
      case "\x1B[B":
        if (this.histpos < this.history.length) {
          this.histpos += 1;
          this._clearprompt();
        }
        if (this.histpos === this.history.length) break;
        this._setcommand(this.history[this.histpos]);
        this.term.write(this.command);
        break;
      default:
        if (this.cursor < this.command.length) {
          const before = this.command.slice(0, this.cursor);
          const after = key.key + this.command.slice(this.cursor);
          const shift = "\x1B[D".repeat(this.command.length - this.cursor);
          this.cursor += 1;
          this.command = before + after;
          this.term.write(after + shift);
          break;
        }
        this.cursor += 1;
        this.command += key.key;
        this.term.write(key.key);
    }
  }
}

export { Colors, Program, ResumeTerm };
