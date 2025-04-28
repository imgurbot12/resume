/**
 * Game Export Utility
 */

import { Program } from "../term.js";
import { Snake } from "../games/snake.js";
import { MineSweeper } from "../games/sweeper.js";

/* Functions */

/**
 * Add Available Games to Accessable Programs
 */
function addGames(programs) {
  programs["snake"] = new Snake();
  programs["sweeper"] = new MineSweeper();
}

/* Classes */

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
