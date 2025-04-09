/**
 * MOTD Banner Program
 */

import { Colors, Program } from "../term.js";

/* Variables */

const banner = [
  "     ___              __                          ____                               ",
  "    /   |  ____  ____/ /_______ _      _______   / __ \\___  _______  ______ ___  ___ ",
  "   / /| | / __ \\/ __  / ___/ _ \\ | /| / / ___/  / /_/ / _ \\/ ___/ / / / __ `__ \\/ _ \\",
  "  / ___ |/ / / / /_/ / /  /  __/ |/ |/ (__  )  / _, _/  __(__  ) /_/ / / / / / /  __/",
  " /_/  |_/_/ /_/\\__,_/_/   \\___/|__/|__/____/  /_/ |_|\\___/____/\\__,_/_/ /_/ /_/\\___/",
  "",
  " Welcome to my Resume! :)",
  ` To view the available commands type \x1B[31;3;1mhelp${Colors.RESET}.`,
  " To validate each command press Enter.",
  ` You can use the \x1b[3mTab${Colors.RESET} key to help you complete a command.`,
  "",
];

/* Classes */

class Motd extends Program {
  static description = "View message of the day";

  run() {
    for (const line of banner) {
      this.term.writeln(line);
    }
    this.shutdown(0);
  }
}

export { Motd };
