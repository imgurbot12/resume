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
      perms: 700,
    }),
  }),
});

const FILESYSTEM = new FileSystem(ROOT, 1001, 1001);

console.log(FILESYSTEM.list_dir("/home/guest"));
console.log(FILESYSTEM.read_file("/home/guest/readme.txt"));

FILESYSTEM.change_dir("/home/guest/test");

console.log(FILESYSTEM.read_file("test.txt"));
console.log(FILESYSTEM.list_dir("../.."));

FILESYSTEM.uid = 1002;
FILESYSTEM.gid = 1002;
console.log("=====");

console.log(FILESYSTEM.list_dir("/home/guest"));
console.log(FILESYSTEM.read_file("/home/guest/readme.txt"));
console.log(FILESYSTEM.read_file("test.txt"));

console.log(FILESYSTEM.list_dir(".."));

export { FILESYSTEM };
