/**
 * About Program
 */

import { Colors, Program } from "../term.js";

/* Variables */

const PROJECTS = [
  {
    name: "Rmenu",
    description: `
      A tool I use everyday.
      A highly customizable desktop application
      launcher utility for Linux.`,
    tags: ["rust", "desktop", "gui", "linux"],
    links: ["https://github.com/imgurbot12/rmenu"],
  },
  {
    name: "Pypub",
    description: `
      Python library to progamatically build Ebooks.
      I took over development from an old abandoned project
      and rewrote it from scratch adding many additional features.
      Acts as a testbed for my own xml/html parser written in plain python.`,
    tags: ["python", "ebook", "xml", "html", "parsing"],
    links: ["https://github.com/imgurbot12/pypub"],
  },
  {
    name: "PyDHCP/PyDNS",
    description: `
      Opensource DNS/DHCP Protocol/Client/Server libraries implemented from
      scratch using python. Acts as the backbone for some of the technolgies
      standardized by the National Cyber Warfare Foundation.`,
    tags: ["python", "networking", "dhcp", "dns"],
    links: [
      "https://github.com/imgurbot12/pydns",
      "https://github.com/imgurbot12/pydhcp",
    ],
  },
  {
    name: "RealPew",
    description: `
      An animated website with a 3D scene with a spinning globe and lasers
      intended to visualize attacks against the
      National Cyber Warfare Foundation.`,
    tags: ["javascript", "python", "shaders", "animation"],
    links: ["https://realpew.io"],
  },
  {
    name: "Itatem Identity",
    description: `
      Principle engineer and architect for all of V2
      Itatem technologies, primarily made up of large REST APIs.
      Globally scaled infrastructure using unique security
      techniques and technologies implemented
      from the ground up.`,
    tags: ["security", "python", "php", "shell", "encryption"],
    links: ["https://itatem.com"],
  },
];

/* Functions */

function splitIntoBlocks(size, text) {
  const words = text.split(" ");

  return words.reduce((blocks, word) => {
    const last = blocks[blocks.length - 1];

    if ((last + " " + word).trim().length <= size) {
      blocks[blocks.length - 1] = (last + " " + word).trim();
    } else {
      blocks.push(word);
    }

    return blocks;
  }, [""]);
}

/* Classes */

class Projects extends Program {
  static description = "Displays a list of some of my personal projects";

  run() {
    const lines = [""];
    for (const project of PROJECTS) {
      const prefix = "    ";
      const description = prefix + splitIntoBlocks(
        this.term.cols - 8,
        project.description
          .split("\n")
          .map((line) => line.trim())
          .join(" "),
      ).join("\r\n" + prefix);

      const tags = project.tags.join(", ");
      const links = project.links.join(" & ");

      lines.push(
        `${Colors.RED}  name:${Colors.RESET} ${project.name}`,
        `${Colors.GREEN}  tags:${Colors.RESET} ${tags}`,
        `${Colors.BLUE}  link:${Colors.RESET} ${links}`,
        `${Colors.WHITE}  description:${Colors.RESET}\r\n${description}\r\n`,
      );
    }
    for (const line of lines) this.term.writeln(line);
    this.shutdown(0);
  }
}

export { Projects, splitIntoBlocks };
