/**
 * About Program
 */

import { Program } from "../term.js";

/* Variables */

const ABOUT = [
  "",
  "{",
  '  "name"       : "Andrew Scott",',
  '  "job"        : "Fullstack developer",',
  '  "experience" : "10 years",',
  '  "city"       : "Phoenix, Arizona"',
  "}",
  "",
];

/* Classes */

class About extends Program {
  static description = "Displays information about me";

  run() {
    for (const line of ABOUT) {
      this.term.writeln("  " + line);
    }
    this.shutdown(0);
  }
}

export { About };
