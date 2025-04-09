/**
 * Hal9000 Program
 */

import { Program } from "../term.js";

class Hal9000 extends Program {
  run() {
    this.term.writeln("I'm afraid I can't do that Dave.");
    this.shutdown(0);
  }
}

export { Hal9000 };
