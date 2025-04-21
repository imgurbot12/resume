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
      uid: 1001,
      gid: 1001,
      perms: 704,
    }),
  }),
});

const FILESYSTEM = new FileSystem(ROOT, 1002, 1002);

console.log(FILESYSTEM.list_dir("/home/guest"));
console.log(FILESYSTEM.read_file("/home/guest/readme.txt"));

export { FILESYSTEM };
