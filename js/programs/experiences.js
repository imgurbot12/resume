/**
 * Personal Experiences Program
 */

import { Colors, Program } from "../term.js";
import { splitIntoBlocks } from "./projects.js";

/* Variables */

const EXPERIENCES = [
  {
    time: "2013-2018",
    title: "Disk Jockey",
    company: "Freelancer",
    division: "N/A",
    description: `
      Ten shows a year with audiences from 10 to over 4000 people.
      Three gigs with audience of over 1500.
      Live mixing of all types of music but with an emphasis on
      Electronic Dance Music (EDM).
    `,
    tags: ["music", "soft-skills", "leadership"],
  },
  {
    time: "2013-Present",
    title: "Core Volunteer (Badge-Holder)",
    company: "National Cyber Warfare Foundation",
    division: "AZ01/AZ02/AZ05",
    description: `
      Over 7000 volunteer hours on record.
      Leading and managing several core components to system administration.
      Experience with training cybersecurity concepts and leadership.
      Constantly utilized to help maintain and develop new skills in
      software development and cyber security industries.
    `,
    tags: [
      "python",
      "shell",
      "security",
      "networking",
      "hacking",
      "automation",
    ],
  },
  {
    time: "2018-2021",
    title: "Sofware Engineer I",
    company: "American Express",
    division: "Application Security Management (ASM)",
    description: `
      Large focus on automation and internal developer support
      through internal web services and chatbots accessed through
      internal slack. Lead the development of several core projects
      key to operation on ASM Team.`,
    tags: ["python", "golang", "shell", "security", "automation", "chatbots"],
  },
  {
    time: "2021-Present",
    title: "Principle Software Engineer",
    company: "Livesquare Security",
    division: "Itatem Identity",
    description: `
      Sole engineer for Itatem V2. Primary focused on expansive
      REST APIs servicing many backend services including custom
      implementations of LDAP/KERBEROS/OAUTH/NTLM/SASL protocols,
      in addition to several internal and public web portals for
      managing the Itatem service. Some mobile app development using flutter.`,
    tags: ["python", "php", "flutter", "shell", "security"],
  },
];

/* Classes */

class Experiences extends Program {
  static description = "Displays the list of my professional experiences";

  run() {
    const lines = [""];
    for (const rec of EXPERIENCES) {
      const prefix = "    ";
      const description = prefix + splitIntoBlocks(
        this.term.cols - 8,
        rec.description
          .split("\n")
          .map((line) => line.trim())
          .join(" "),
      ).join("\r\n" + prefix);

      const tags = rec.tags.join(", ");

      lines.push(
        `${Colors.BLUE}  title:${Colors.RESET}    ${rec.title}`,
        `${Colors.RED}  company:${Colors.RESET}  ${rec.company}`,
        `${Colors.YELLOW}  division:${Colors.RESET} ${rec.division}`,
        `${Colors.GREEN}  tags:${Colors.RESET}     ${tags}`,
        `${Colors.WHITE}  description:${Colors.RESET}\r\n${description}\r\n`,
      );
    }
    for (const line of lines) this.term.writeln(line);
    this.shutdown(0);
  }
}

export { Experiences };
