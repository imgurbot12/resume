/**
 * Fake FileSystem Implementation
 */
import { Directory, File, FileSystem } from "./fs.js";

const ROOT = new Directory({
  "etc": new Directory({
    "passwd": new File({ content: "passwd", perms: 600 }),
    "shadow": new File({ content: "shadow", perms: 600 }),
  }),
  "home": new Directory({
    "guest": new Directory({
      "readme.txt": new File({
        content: "Hello World",
        uid: 1001,
        gid: 1001,
      }),
      "test": new Directory({
        "test.txt": new File({ content: "Test!" }),
      }),
      uid: 1001,
      gid: 1001,
    }),
    "andrew": new Directory({
      "email.txt": new File({ content: "Email Contents" }),
      uid: 1000,
      gid: 1000,
      perms: 700,
    }),
  }),
});

const FILESYSTEM = new FileSystem({
  root: ROOT,
  uid: 1001,
  gid: 1001,
  cwd: "/home/guest",
  usermap: {
    1001: "guest",
    1000: "andrew",
  },
});

const result = FILESYSTEM.change_dir("/home/andrew");
console.log(result);

// console.log(FILESYSTEM.list_dir("/home/guest"));
// console.log(FILESYSTEM.read_file("/home/guest/readme.txt"));
//
// FILESYSTEM.change_dir("/home/guest/test");
//
// console.log(FILESYSTEM.read_file("test.txt"));
// console.log(FILESYSTEM.list_dir("../.."));

// FILESYSTEM.uid = 1002;
// FILESYSTEM.gid = 1002;
// console.log("=====");
//
// console.log(FILESYSTEM.list_dir("/home/guest"));
// console.log(FILESYSTEM.read_file("/home/guest/readme.txt"));
// console.log(FILESYSTEM.read_file("test.txt"));
//
// console.log(FILESYSTEM.list_dir(".."));
//
// FILESYSTEM.uid = 0;
// FILESYSTEM.gid = 0;
// console.log

export { FILESYSTEM };
