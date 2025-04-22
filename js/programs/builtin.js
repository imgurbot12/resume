/**
 * Builtin Terminal Programs
 */
import { basename, Errors } from "../fs/fs.js";
import { Colors, Program } from "../term.js";

/* Functions */

/**
 * Search for Best Match for File/Directory based on Prefix
 *
 * @param  {FileSystem} fs      filesystem object
 * @param  {String}     prefix  prefix to match
 * @param  {?bool}      isdir   controls on isdir or not
 * @return {?String}
 */
function findNode(fs, prefix, isdir = null) {
  const base = (prefix.includes("/")) ? basename(prefix) : ".";
  const items = fs.read_dir(base ? base : ".");
  for (const [name, node] of Object.entries(items)) {
    if (isdir != null && node.isdir != isdir) continue;
    if (name.startsWith(prefix)) return name;
  }
  return null;
}

/* Programs */

class Cat extends Program {
  autocomplete(file) {
    return findNode(this.fs, file, false);
  }
  run(file) {
    const result = this.fs.read_file(file);
    if (Errors.is_error(result)) {
      this.term.writeln(`cat: ${file}: ${Errors.stringify(result)}`);
      return this.shutdown(1);
    }
    const lines = result.split("\n");
    for (const line of lines) this.term.writeln(line);
    this.shutdown(0);
  }
}

class ChangeDirectory extends Program {
  autocomplete(file) {
    return findNode(this.fs, file, true);
  }
  run(directory) {
    if (!directory) {
      const name = this.fs.users[this.fs.uid];
      directory = "/home/" + name;
    }
    let code = 0;
    const result = this.fs.change_dir(directory);
    if (Errors.is_error(result)) {
      code = 1;
      this.term.writeln(`cd: ${directory}: ${Errors.stringify(result)}`);
    }
    this.shutdown(code);
  }
}

class Id extends Program {
  run() {
    const uid = this.fs.uid;
    const gid = this.fs.gid;
    const user = this.fs.users[uid];
    const group = this.fs.users[gid];
    this.term.writeln(`uid=${uid}(${user}) gid=${gid}(${group})`);
    this.shutdown(0);
  }
}

class Ls extends Program {
  autocomplete(file) {
    return findNode(this.fs, file, true);
  }
  run(path) {
    const result = this.fs.read_dir(path ? path : ".");
    if (Errors.is_error(result)) {
      this.term.writeln(`ls: ${this.fs.cwd}: ${Errors.stringify(result)}`);
      return this.shutdown(1);
    }
    const items = Object
      .entries(result)
      .map(([key, node]) =>
        node.isdir ? `${Colors.BLUE}${key}${Colors.RESET}` : key
      );

    this.term.writeln(items.join(" "));
    this.shutdown(0);
  }
}

class Pwd extends Program {
  run() {
    this.term.writeln(this.fs.cwd);
    this.shutdown(0);
  }
}

class Whoami extends Program {
  run() {
    this.term.writeln(this.fs.users[this.fs.uid] ?? "unknown user");
    this.shutdown(0);
  }
}

export { Cat, ChangeDirectory, Id, Ls, Pwd, Whoami };
