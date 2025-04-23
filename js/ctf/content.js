/**
 * Reusable Content for CTF
 */

import { Colors } from "../term.js";

const ACCOUNTS = {
  "admin": "123456",
  "web": "password",
};

const FLAGS = [
  "u3kIkGhmC4",
  "hpIBELKOuT",
  "gCo7bC73Sw",
  "MUCFKvjJBl",
];

const README = `
${Colors.GREEN}Welcome to my Resume!${Colors.RESET}

This website is a dynamic interactive CV built using vanilla javascript.
It includes a bit of information about myself and my work alongside being
a fun little side-project in itself.

Note that beyond the rendering, the shell itself and every interaction and
command included are re-implemented from scratch as approximations of a real
linux shell. Every keystroke, character, and behavior within the terminal
is all implemented by hand for this CV.

There are a ton of easter-eggs builtin to this website for you to find,
and even a mini CTF with rewards for completing it.

You can turn in CTF flags you find using the ${Colors.RED}flag${Colors.RESET} command.

${Colors.B_WHITE}Please enjoy and have fun! :)${Colors.RESET}

  - Andrew Scott
`.trim();

const EMAIL = `
to:   everyone@resume.acscott.dev
from: admin@resume.acscott.dev

Hello everyone!

I've been hired by Andrew to update the website and to improve the security!

I'm working on a Single Sign On (SSO) Solution for everyone's accounts, but
for the time being, I want to ask everyone to register with the same
username/password they use for the host box via our web portal to avoid
conflicts while I get it all working. The records are going to be stored in a
temporary database. I have already done the same for my account.

I've also taken extra measures to ensure the box is secure like disabling
the ability to switch users for non-admins. I'm so confident our accounts
are secure I'm willing to give the username and password to our web service
account! muhahaha!

Try to hack it if you date! Here are the credentials.

username: web
password: password
`.trim();

const SQLDUMP = `
PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE Users (
  UserId      INTEGER PRIMARY KEY,
  UserName    VARCHAR(25),
  MD5Hash     VARCHAR(100),
  EntryDate   DATETIME,
  LastUpdated DATETIME
);
INSERT INTO Users VALUES(0,'admin','e10adc3949ba59abbe56e057f20f883e','2025-04-22 21:37:12','2025-04-22 21:37:12');
COMMIT;
`.trim();

export { ACCOUNTS, EMAIL, FLAGS, README, SQLDUMP };
