/**
 * Hobbies Program
 */

import { Program } from "../term.js";

class Hobbies extends Program {
  static description = "Display the list of my hobbies";

  run() {
    this.term.writeln("");
    this.term.writeln("  • Community:   NCWF Volunteering, SVYA Youth Group");
    this.term.writeln("  • Programming: Python, Rust, Javascript, PHP");
    this.term.writeln("  • Media:       Music, Reading, Cinema, Videogames");
    this.term.writeln("");
    this.shutdown(0);
  }
}

export { Hobbies };
