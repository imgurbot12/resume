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

class Program {
  startup(term) {
    this.term = term;
  }

  onKey(_key) {
    throw new Error("Method onKey() must be implemented");
  }

  resize() {
  }

  shutdown() {
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
    // configure default program
    this.history = [];
    this.histpos = 0;
    this.cursor = 0;
    this.command = "";
    this.program = null;
    this.term.onKey((key) => this.onKey(key));
    this.prompt();
  }

  resize() {
    this.fit.fit();
    if (this.program !== null) this.program.resize();
  }

  attach(program) {
    program.startup(term);
    this.term.onKey(program.onKey);
  }

  detatch() {
    if (this.program === null) return;
    this.program.shutdown();
    this.program = null;
  }

  prompt() {
    this.term.write("[guest@resume ~]$ ");
  }

  run(command) {
    console.log("run", command);
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
        this.command = this.command.trim();
        if (this.command.length != 0) {
          this.history.push(this.command);
          this.run(this.command);
        }
        this._setcommand("");
        this.histpos = this.history.length;
        this.term.writeln("");
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

export { Program, ResumeTerm };
