/**
 * Neofetch-like Program
 */

import { Colors, Program } from "../term.js";

class Fetch extends Program {
  run() {
    const colors = [
      Colors.GRAY + "●",
      Colors.B_WHITE + "●",
      Colors.B_CYAN + "●",
      Colors.B_MAGENTA + "●",
      Colors.B_BLUE + "●",
      Colors.B_YELLOW + "●",
      Colors.B_GREEN + "●",
      Colors.B_RED + "●",
    ];
    const cores = navigator.hardwareConcurrency;
    const mem = window.performance.memory;
    const total = (mem.jsHeapSizeLimit / 1024 / 1024).toFixed(1);
    const used = (mem.usedJSHeapSize / 1024 / 1024).toFixed();
    const perc = (mem.usedJSHeapSize * 100 / mem.jsHeapSizeLimit).toFixed(1);
    const memory =
      `${used}M/${total}M (${Colors.GREEN}${perc}%${Colors.RESET})`;
    const details = [
      `${Colors.BLUE}│ ${Colors.RED} user   ${Colors.BLUE}│${Colors.RESET} guest`,
      `│ ${Colors.GREEN}󰇅 hname  ${Colors.BLUE}│${Colors.RESET} resume `,
      `│ ${Colors.YELLOW} distro ${Colors.BLUE}│${Colors.RESET} ResumeOS v0.1.0`,
      `│ ${Colors.BLUE} kernel ${Colors.BLUE}│${Colors.RESET} XTermJS 5.5.0`,
      `│ ${Colors.MAGENTA} term   ${Colors.BLUE}│${Colors.RESET} ResumeTerm v0.1.0`,
      `│ ${Colors.RED} shell  ${Colors.BLUE}│${Colors.RESET} ResumeShell v0.1.0`,
      `│ ${Colors.GREEN}󰍛 cpu    ${Colors.BLUE}│${Colors.RESET} Unknown (${cores} cores)`,
      `${Colors.BLUE}│ ${Colors.YELLOW} memory ${Colors.BLUE}│${Colors.RESET} ${memory}`,
      `${Colors.BLUE}├──────────┤`,
      `│ ${Colors.WHITE} colors ${Colors.BLUE}│ ` + colors.join(" "),
    ];
    const logo = [
      ` ${Colors.WHITE}    .-------.`,
      ` ${Colors.BLUE}   _${Colors.WHITE}|~~ ~~  |${Colors.BLUE}_ `,
      ` ${Colors.BLUE} =(_${Colors.WHITE}|_______|${Colors.BLUE}_)=`,
      ` ${Colors.BLUE}   |${Colors.GRAY}:::::::::${Colors.BLUE}|`,
      ` ${Colors.BLUE}   |${Colors.GRAY}:::::::\x1B[33;1;1m[]${Colors.BLUE}|`,
      ` ${Colors.BLUE}   |${Colors.RED}o${Colors.GRAY}=======.${Colors.BLUE}|`,
      ` ${Colors.BLUE}   \`"""""""""\``,
    ];
    const lines = [
      " ".repeat(18) + `${Colors.BLUE}╭──────────╮`,
      logo[0] + " ".repeat(4) + details[0],
      logo[1] + " ".repeat(2) + details[1],
      logo[2] + " ".repeat(1) + details[2],
      logo[3] + " ".repeat(3) + details[3],
      logo[4] + " ".repeat(3) + details[4],
      logo[5] + " ".repeat(3) + details[5],
      logo[6] + " ".repeat(3) + details[6],
      " ".repeat(18) + details[7],
      " ".repeat(18) + details[8],
      " ".repeat(18) + details[9],
      " ".repeat(18) + `${Colors.BLUE}╰──────────╯${Colors.RESET}`,
    ];
    for (const line of lines) this.term.writeln(line);
    this.shutdown(0);
  }
}

export { Fetch };
