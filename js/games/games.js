/**
 * Game Utilities
 */

import { Program } from "../term.js";
import { Snake } from "./snake.js";

/**
 * Add Available Games to Accessable Programs
 */
function addGames(programs) {
  programs["snake"] = new Snake();
}

class GibGames extends Program {
  static hide = true;

  run() {
    this.term.writeln("Secret command found! Games added to library :)");
    this.term.writeln("See 'help' command for new options.");
    addGames(this.ctx.programs);
    this.shutdown(0);
  }
}

export { addGames, GibGames };
