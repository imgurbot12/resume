/**
 * Fake FileSystem Implementation
 */
import { Directory, File, FileSystem } from "./fs.js";
import { EMAIL, FLAGS, README, SQLDUMP } from "../ctf/content.js";

const ROOT = new Directory({
  "tmp": new Directory({
    "temp": new File({ content: EMAIL }),
    "flag": new File({ content: `Congrats! This is a flag: ${FLAGS[0]}` }),
  }),
  "home": new Directory({
    "guest": new Directory({
      "readme.txt": new File({
        content: README,
        uid: 1001,
        gid: 1001,
      }),
      "ctf": new Directory({
        "flag": new File({ content: `Congrats! This is a flag: ${FLAGS[1]}` }),
      }),
      uid: 1001,
      gid: 1001,
    }),
    "admin": new Directory({
      "flag": new File({ content: `Congrats! This is a flag: ${FLAGS[2]}` }),
      uid: 1000,
      gid: 1000,
      perms: 700,
    }),
    "web": new Directory({
      "sqldump.sql": new File({ content: SQLDUMP }),
      "flag": new File({ content: `Congrats! This is a flag: ${FLAGS[3]}` }),
      uid: 1002,
      gid: 1002,
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
    1000: "admin",
    1001: "guest",
    1002: "web",
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
