/**
 * Fake Memory Based Filesystem
 */

/* Variables */

const Errors = {
  PERM_DENIED: 1,
  NOT_FOUND: 2,
  IS_DIRECTORY: 3,
  NOT_A_DIRECTORY: 4,

  is_error: (error) => Number.isInteger(error),

  stringify: function (err) {
    switch (err) {
      case this.PERM_DENIED:
        return "Permission denied";
      case this.NOT_FOUND:
        return "No such file or directory";
      case this.IS_DIRECTORY:
        return "Is a Directory";
      case this.NOT_A_DIRECTORY:
        return "Not a Directory";
      default:
        return "Unknown Error";
    }
  },
};

/* Functions */

function dirname(path) {
  if (!path.includes("/")) return ".";
  const index = path.lastIndexOf("/");
  return path.slice(0, index);
}

function basename(path) {
  const index = path.lastIndexOf("/");
  return path.slice(index + 1);
}

function pathJoin(...parts) {
  const last = parts[parts.length - 1];
  if (last.startsWith("/")) return last;
  // join items together and fix //
  const replace = new RegExp("/" + "{1,}", "g");
  const path = parts.join("/").replace(replace, "/");
  // resolve ..
  const items = path.split("/");
  while (items.includes("..")) {
    const idx = items.indexOf("..");
    console.log("splice", idx);
    items.splice(idx - 1, 2);
  }
  // join items together and fix //
  return items.length > 1 ? items.join("/") : "/";
}

/* Classes */

class Perm {
  constructor(perm = 7) {
    this.perm = perm;
  }

  can_read() {
    return this.perm >= 4;
  }

  can_write() {
    return this.perm >= 5;
  }

  can_exec() {
    return this.perm % 2 == 1;
  }

  toString() {
    return [
      this.can_read() ? "r" : "-",
      this.can_write() ? "w" : "-",
      this.can_write() ? "x" : "-",
    ].join("");
  }
}

class Permissions {
  constructor(perm = 644) {
    const digits = Array.from(String(perm));
    this.user = new Perm(digits[0]);
    this.group = new Perm(digits[1]);
    this.other = new Perm(digits[2]);
  }

  toString() {
    return [
      this.user.toString(),
      this.group.toString(),
      this.other.toString(),
    ].join("");
  }
}

class INode {
  constructor(isdir, { uid = 0, gid = 0, perms = null }) {
    this.isdir = isdir;
    this.uid = uid;
    this.gid = gid;
    this.perms = perms;
  }

  chown(uid = null, gid = null) {
    this.uid = uid ?? this.uid;
    this.gid = gid ?? this.gid;
  }

  chmod(perms) {
    this.perms = perms ? new Permissions(perms) : this.perms;
  }

  can_read(uid, gid) {
    if ((uid == 0 || this.uid == uid) && this.perms.user.can_read()) {
      return true;
    }
    if ((gid == 0 || this.gid == gid) && this.perms.group.can_read()) {
      return true;
    }
    return this.perms.other.can_read();
  }

  can_write(uid, gid) {
    if (this.uid == uid && this.perms.user.can_write()) return true;
    if (this.gid == gid && this.perms.group.can_write()) return true;
    return this.perms.other.can_write();
  }

  can_exec(uid, gid) {
    if (this.uid == uid && this.perms.user.can_exec()) return true;
    if (this.gid == gid && this.perms.group.can_exec()) return true;
    return this.perms.other.can_exec();
  }
}

class File extends INode {
  constructor({ content = "", uid = 0, gid = 0, perms = 644 }) {
    super(false, {
      uid,
      gid,
      perms: new Permissions(perms),
    });
    this.content = content;
  }

  read(uid, gid, pos = 0, length = null) {
    if (!this.can_read(uid, gid)) return Errors.PERM_DENIED;
    return this.content.substring(
      pos,
      length ? pos + length : this.content.length,
    );
  }

  write(uid, gid, content, pos = null, clear = false) {
    if (!this.can_write(uid, gid)) return Errors.PERM_DENIED;
    if (clear) this.content = "";
    pos = pos ?? content.length;
    this.content = this.content.slice(0, pos) + content +
      this.content.slice(pos);
  }
}

class Directory extends INode {
  constructor({ paths = {}, uid = 0, gid = 0, perms = 755, ...more_paths }) {
    super(true, {
      uid,
      gid,
      perms: new Permissions(perms),
    });
    this.paths = { ...paths, ...more_paths };
    for (const node of Object.values(this.paths)) {
      node.uid = (node.uid == 0) ? this.uid : node.uid;
      node.gid = (node.gid == 0) ? this.gid : node.gid;
    }
  }

  mkdir(uid, gid, name, options) {
    if (!this.can_write(uid, gid)) return Errors.PERM_DENIED;
    this.paths[name] = new Directory({ uid, gid, ...options });
  }

  read_dir(uid, gid) {
    if (!this.can_read(uid, gid)) return Errors.PERM_DENIED;
    return this.paths;
  }

  read_file(uid, gid, name) {
    if (!this.can_exec(uid, gid)) return Errors.PERM_DENIED;
    const file = this.paths[name];
    if (!file) return Errors.NOT_FOUND;
    if (file.isdir) return Errors.IS_DIRECTORY;
    return file.read(uid, gid);
  }

  write_file(uid, gid, name, content, options) {
    if (!this.can_exec(uid, gid)) return Errors.PERM_DENIED;
    if (!this.can_write(uid, gid)) return Errors.PERM_DENIED;
    this.paths[name] = new File({ uid, gid, ...options, content });
  }
}

class FileSystem {
  constructor({ root, uid = 0, gid = 0, cwd = "/", usermap = {} }) {
    this.fs = root ?? Directory();
    this.uid = uid;
    this.gid = gid;
    this.cwd = cwd;
    this.users = { ...usermap, "root": 0 };
  }

  _cleanpath(path) {
    path = path.trim().replace(/^\.(?!\.)/, "").replace(/\/+/g, "/");
    path = path.startsWith("/") ? path.substring(1) : path;
    path = path.endsWith("/") ? path.slice(0, -1) : path;
    return path;
  }

  _find_dir(path) {
    path = path.trim();
    let match = this.fs;
    const dirs = [];
    const stack = [];
    // build list of directories to iterate through
    if (!path.startsWith("/") && this.cwd) {
      const items = this._cleanpath(this.cwd).split("/").filter((d) => d);
      //NOTE: skip permissions whilst iterating through cwd
      dirs.push(...items.map((d) => [d, false]));
    }
    const items = this._cleanpath(path).split("/").filter((d) => d);
    dirs.push(...items.map((d) => [d, true]));
    // iterate through items in path
    for (const [name, p] of dirs) {
      if (p && !match.can_exec(this.uid, this.gid)) return Errors.PERM_DENIED;
      if (name.match(/^\.{2}$/)) {
        match = stack.pop();
        if (!match) return Errors.NOT_FOUND;
        continue;
      }
      stack.push(match);
      match = match.paths[name];
      if (!match) return Errors.NOT_FOUND;
      if (!match.isdir) return Errors.NOT_A_DIRECTORY;
    }
    return match;
  }

  /**
   * Get Basename for Current Directory
   *
   * @return {String}
   */
  current_dir() {
    if (this.cwd.match(/^\/home\/\w+$/)) {
      const match = this._find_dir(".");
      if (Errors.is_error(match)) return match;
      if (match.uid == this.uid) return "~";
    }
    return this.cwd == "/" ? "/" : basename(this.cwd);
  }

  /**
   * Change Current Work Directory to Specified Path
   *
   * @param {String} path
   */
  change_dir(path) {
    const match = this._find_dir(path);
    if (Errors.is_error(match)) return match;
    if (!match.can_exec(this.uid, this.gid)) return Errors.PERM_DENIED;
    this.cwd = pathJoin(this.cwd, path);
  }

  /**
   * Read a File at the Specified Path
   *
   * @param {String} path
   */
  read_file(path) {
    const [dir, name] = [dirname(path), basename(path)];
    const match = this._find_dir(dir);
    if (Errors.is_error(match)) return match;
    return match.read_file(this.uid, this.gid, name);
  }

  /**
   * List of All Files/Directories at Specified Path
   *
   * @param {String} path
   */
  read_dir(path) {
    const match = this._find_dir(path);
    if (Errors.is_error(match)) return match;
    return match.read_dir(this.uid, this.gid);
  }
}

export { basename, Directory, dirname, Errors, File, FileSystem, pathJoin };
