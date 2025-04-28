/**
 * Simple Cowsay Implementation
 */

import { Program } from "../term.js";

/* Variables */

const COW = `        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||
`;

/* Functions */

function wordWrap(str, maxLength) {
  const l = maxLength;
  const rgx = new RegExp(`(?![^\\n]{1,${l}}$)([^\\n]{1,${l}})\\s`, "g");
  return str.replace(rgx, "$1\n");
}

/* Classes */

class Cowsay extends Program {
  static description = "The speaking cow program";

  bubble(message) {
    const lines = wordWrap(message, this.maxlen).split("\n");
    if (lines.length == 1) lines[0] = ` < ${lines[0]} >`;
    else {
      const start = lines.shift();
      const end = lines.pop();
      for (const [idx, line] of Object.entries(lines)) {
        lines[idx] = ` | ${line.padEnd(this.maxlen)} |`;
      }
      lines.splice(0, 0, ` / ${start.padEnd(this.maxlen)} \\`);
      lines.push(` \\ ${end.padEnd(this.maxlen)} /`);
    }
    const length = Math.max(...lines.map((l) => l.length));
    this.term.writeln("  " + "_".repeat(length - 3));
    for (const line of lines) this.term.writeln(line);
    this.term.writeln("  " + "-".repeat(length - 3));
  }

  run(...args) {
    if (args.length == 0) {
      this.term.writeln("usage: cowsay <message...>");
      return this.shutdown(1);
    }
    this.maxlen = Math.floor(43, this.term.cols);
    this.bubble(args.join(" "));
    for (const line of COW.split("\n")) this.term.writeln(line);
    this.shutdown(0);
  }
}

export { Cowsay };
