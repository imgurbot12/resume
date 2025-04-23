/**
 * Interactive Terminal Shell Implementation
 */
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebglAddon } from "@xterm/addon-webgl";
import { WebLinksAddon } from "@xterm/addon-web-links";

/* Variables */

const termColor = globalThis
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
  startup(term, ctx, signal) {
    this.ctx = ctx;
    this.fs = ctx.filesystem;
    this.term = term;
    this.signal = signal;
  }

  autocomplete(..._args) {}
  run(..._args) {}
  onKey(_key) {}
  resize() {}

  shutdown(exitCode = 0) {
    this.signal(exitCode);
  }
}

class ResumeTerm {
  constructor({
    elementId = "terminal",
    startup = [],
    programs = {},
    context = {},
    filesystem = null,
  }) {
    // initialize and prepare terminal
    this.term = new Terminal({
      cursorWidth: 1,
      theme: { background: termColor },
      fontFamily: "Ubuntu Mono,monospace",
    });
    this.fit = new FitAddon();
    this.term.loadAddon(this.fit);
    this.term.loadAddon(new WebglAddon());
    this.term.loadAddon(new WebLinksAddon());
    // attach terminal to element and resize
    this.term.open(document.getElementById(elementId));
    this.fit.fit();
    globalThis.addEventListener("resize", () => this.resize());
    // configure internals
    this.history = [];
    this.histpos = 0;
    this.cursor = 0;
    this.command = "";
    this.program = null;
    this.programs = programs;
    this.context = { ...context, filesystem };
    this.fs = filesystem;
    // translate data into keypress events (mobile compatable)
    this.term.onData((data) => {
      const keys = (data.charCodeAt(0) == 27) ? [data] : data;
      for (const char of keys) this.onKey({ key: char });
    });
    // run startup
    for (const command of startup) this.run(command);
    this.prompt();
  }

  focus() {
    this.term.focus();
  }

  resize() {
    this.fit.fit();
    if (this.program !== null) return this.program.resize();
    this.prompt(this.command);
  }

  attach(program, args) {
    this.program = program;
    program.startup(this.term, this.context, (code) => this.detatch(code));
    program.run(...args);
  }

  detatch(_exitCode) {
    if (this.program !== null) this.program = null;
    this.prompt();
  }

  add_program(command, program) {
    this.programs[command] = program;
  }

  prompt(command = null) {
    const move = "\b".repeat(this.term.cols);
    const clear = " ".repeat(this.term.cols);
    const dir = this.fs ? this.fs.current_dir() : "~";
    const user = this.fs ? this.fs.users[this.fs.uid] : "guest";
    const prompt = `[${user}@resume ${dir}]$ `;
    const cmd = command ?? "";
    this.term.write(move + clear + move + prompt + cmd);
  }

  autocomplete() {
    if (this.command.length == 0 || "help".startsWith(this.command)) {
      this._setcommand("help");
      this.prompt("help");
      return;
    }
    const entries = Object.entries(this.programs);
    entries.sort((a, _) => a[1].constructor.description ? -1 : 1);
    for (const [key, _] of entries) {
      if (key.startsWith(this.command)) {
        this._setcommand(key);
        this.prompt(key);
        return;
      }
    }
    // attempt command specific autocomplete
    const [cmd, ...args] = this.command.split(" ");
    if (cmd in this.programs) {
      const program = this.programs[cmd];
      program.startup(this.term, this.context, null);
      const match = program.autocomplete(...args);
      if (match) {
        this.term.write(match);
        args[args.length - 1] += match;
        this._setcommand([cmd, ...args].join(" "));
      }
    }
  }

  help() {
    const lengths = Object.keys(this.programs).map((cmd) => cmd.length);
    const buffer = Math.max(...lengths);
    const prefix = " • ";

    const buf = " ".repeat(buffer - 4);
    const lines = [`\x1B[91mhelp${Colors.RESET}${buf} : Display help`];
    for (const [key, program] of Object.entries(this.programs)) {
      const desc = program.constructor.description;
      if (!desc) continue;
      const buf = " ".repeat(buffer - key.length);
      lines.push(`\x1B[91m${key}${Colors.RESET}${buf} : ${desc}`);
    }

    lines.push("\x1b[3mYou can use the TAB key to complete a command.");
    lines.push("You can find old commands with the up and down arrows.\x1B[0m");
    for (const line of lines) {
      this.term.writeln(prefix + line);
    }
    this.prompt();
  }

  run(command) {
    if (command == "help") return this.help();
    const [cmd, ...args] = command.split(" ");
    if (cmd in this.programs) {
      const program = this.programs[cmd];
      this.attach(program, args);
      return;
    }
    this.term.writeln(`resume: Unknown Command: ${cmd}`);
    this.prompt();
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
    if (this.program !== null) {
      if (key.key == "\x03") return this.program.shutdown(1);
      return this.program.onKey(key);
    }
    switch (key.key) {
      // enter/return
      case "\r":
        this.term.writeln("");
        this.command = this.command.trim();
        if (this.command.length != 0) {
          this.history.push(this.command);
          this.run(this.command);
        } else {
          this.prompt();
        }
        this._setcommand("");
        this.histpos = this.history.length;
        break;
      case "\t":
        this.autocomplete();
        break;
      // ctrl+c
      case "\x03":
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
      // ctrl+a && home key
      case "\x01":
      case "\x1B[H":
        this._jumpstart();
        break;
      // end key and ctrl+e
      case "\x1B[F":
      case "\x05":
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
