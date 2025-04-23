/**
 * Custom CTF Related Commands
 */
import { confetti } from "@tsparticles/confetti";

import * as _md5 from "md5";
const md5 = _md5.default || _md5;

import { Program } from "../term.js";
import { ACCOUNTS, CONGRATS, FLAGS } from "../ctf/content.js";

/* Variables */

const SS_OUTPUT = `
State   Recv-Q  Send-Q  Local Address:Port  Peer Address:Port
LISTEN  0       128     127.0.0.1:22        127.0.0.1:*
`.trim();

/* Functions */

function fireworks(seconds = 1) {
  const duration = seconds * 1000,
    animationEnd = Date.now() + duration,
    defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  new Audio("/sound/fly.mp3").play();
  confetti().then((canvas) => setTimeout(() => canvas.destroy(), duration));

  const interval = setInterval(function () {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);
    new Audio("/sound/boom.mp3").play();

    // since particles fall down, start a bit higher than random
    confetti(
      Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      }),
    );
    confetti(
      Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      }),
    );
  }, 500);
}

/* Programs */

class Exit extends Program {
  run() {
    this.fs.uid = 1001;
    this.fs.gid = 1001;
    this.fs.change_dir("/home/guest");
    this.shutdown(0);
  }
}

class Flag extends Program {
  static description = "Turn in CTF flags for rewards";

  run(flag) {
    const captured = this.ctx["flags"] ?? [];
    if (captured.length == FLAGS.length) {
      this.term.writeln("You've already completed the CTF! Congrats!");
      return this.shutdown(0);
    }
    if (!flag) {
      this.term.writeln("Usage: flag <ctf-flag>");
      return this.shutdown(1);
    }
    if (!FLAGS.includes(flag)) {
      this.term.writeln(`Invalid flag: ${flag}. Please try again.`);
      return this.shutdown(1);
    }
    if (captured.includes(flag)) {
      this.term.writeln(`This flag is already captured. Please try again.`);
      return this.shutdown(1);
    }
    captured.push(flag);
    this.ctx["flags"] = captured;

    if (captured.length < FLAGS.length) {
      this.term.writeln(`Flag captured! Congrats! :)`);
    } else {
      const lines = CONGRATS.split("\n");
      for (const line of lines) {
        this.term.writeln(line);
      }
    }
    fireworks(captured.length);

    this.shutdown(0);
  }
}

class Md5Sum extends Program {
  run(content) {
    this.term.writeln(`${md5(content)}  -`);
    this.shutdown(0);
  }
}

class SwitchUser extends Program {
  run() {
    this.term.writeln("This has been disabled for non-admins - admin :)");
    this.shutdown(0);
  }
}

class ShowServices extends Program {
  run() {
    const lines = SS_OUTPUT.split("\n");
    for (const line of lines) this.term.writeln(line);
    this.shutdown(0);
  }
}

class SSH extends Program {
  prompt() {
    this.term.write(`${this.user}@${this.host}: `);
  }

  check_login(user, password) {
    return (user in this.ids && user in ACCOUNTS && ACCOUNTS[user] == password);
  }

  onKey(key) {
    switch (key.key) {
      case "\r":
        if (this.check_login(this.user, this.password)) {
          this.term.writeln(`\r\nWelcome ${this.user}!`);
          this.fs.uid = this.ids[this.user];
          this.fs.gid = this.ids[this.user];
          this.fs.change_dir(`/home/${this.user}`);
          return this.shutdown(0);
        }
        if (this.login_attempts >= 2) {
          this.term.writeln("\r\nPermission denied (publickey,password)");
          return this.shutdown(1);
        }
        this.term.writeln("\r\nPermission denied, please try again.");
        this.prompt();
        this.login_attempts += 1;
        break;
      case "\b":
        this.password = this.password.substring(0, this.password.length - 1);
        break;
      default:
        this.password += key.key;
    }
  }

  run(dest) {
    if (!dest) {
      this.term.writeln("usage: ssh <username>@<host>");
      return this.shutdown(1);
    }
    if (!dest.match(/^\w+@(?:localhost|127\.0\.0\.1)$/)) {
      const items = dest.split("@", 2);
      const host = items[items.length - 1];
      console.log(items);
      this.term.write(`ssh: Could not resolve hostname ${host}: `);
      this.term.writeln("No address associated with hostname");
      return this.shutdown(1);
    }

    const [user, host] = dest.split("@", 2);
    this.user = user;
    this.host = host;
    this.password = "";
    this.ids = Object.fromEntries(
      Object.entries(this.fs.users).map((a) => a.reverse()),
    );
    this.login_attempts = 0;
    this.prompt();
  }
}

export { Exit, Flag, Md5Sum, ShowServices, SSH, SwitchUser };
