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
};

/* Functions */

function dirname(path) {
  const index = path.lastIndexOf("/");
  return path.slice(0, index);
}

function basename(path) {
  const index = path.lastIndexOf("/");
  return path.slice(index + 1);
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
    console.log("cmp", uid, gid, this.uid, this.gid, this.perms);
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
  constructor(fs, uid = 0, gid = 0) {
    this.fs = fs ?? Directory();
    this.uid = uid;
    this.gid = gid;
  }

  _cleanpath(path) {
    path = path.trim();
    path = path.startsWith("/") ? path.substring(1) : path;
    path = path.endsWith("/") ? path.slice(0, -1) : path;
    return path;
  }

  _find_dir(path) {
    let match = this.fs;
    const items = path.trim().split("/");
    for (const name of items) {
      if (!match.can_exec(this.uid, this.gid)) return Errors.PERM_DENIED;
      match = match.paths[name];
      if (!match) return Errors.NOT_FOUND;
      if (!match.isdir) return Errors.NOT_A_DIRECTORY;
    }
    return match;
  }

  list_dir(path) {
    path = this._cleanpath(path);
    const match = this._find_dir(path);
    if (Errors.is_error(match)) return match;
    return match.read_dir(this.uid, this.gid);
  }

  read_file(path) {
    path = this._cleanpath(path);
    const dir = dirname(path);
    const name = basename(path);
    const match = this._find_dir(dir);
    if (Errors.is_error(match)) return match;
    return match.read_file(this.uid, this.gid, name);
  }
}

export { Directory, Errors, File, FileSystem };
