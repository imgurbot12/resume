/**
 * Echo Program
 */

import { Program } from "../term.js";

class Echo extends Program {
  constructor(message) {
    super();
    this.message = message ?? "This is a message";
  }

  run() {
    this.term.writeln(" " + this.message);
    this.shutdown(0);
  }
}

export { Echo };
