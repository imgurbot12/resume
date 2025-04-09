/**
 * Ping Program
 */
import { Program } from "../term.js";

class Ping extends Program {
  run() {
    this.term.writeln("Pong. Would you like to play a game?");
    this.shutdown(0);
  }
}

export { Ping };
