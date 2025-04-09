/**
 * Whoami Program
 */
import { Program } from "../term.js";

class Whoami extends Program {
  run() {
    this.term.writeln("That's a pretty existential question don't you think?");
    this.shutdown(0);
  }
}

export { Whoami };
