#!/usr/bin/env node
import { createRequire } from "module";
import { getStatus, moveTo } from "../lib/index.js";

const meow = createRequire(import.meta.url)("meow");

const cli = meow(
  `
  Usage
    $ deskctl <value>

  Options
    --status, -s Get current status
    --type,   -t Type of value (cm, %, raw)

  Examples
    $ deskctl 10 -t cm
    $ deskctl 10 -t %
`,
  {
    flags: {
      type: {
        type: "string",
        default: "cm",
        alias: "t",
      },
      status: {
        type: "boolean",
        alias: "s",
      },
    },
  }
);

const {
  input: [value],
  flags: { type, status },
} = cli;

if (type !== "cm" && type !== "%" && type !== "raw") {
  console.error(`type ${type} is not supported`);
  process.exit(1);
}

if (!status && !+value) {
  console.error(`value must be a number`);
  process.exit(1);
}

if (status) {
  getStatus()
    .then(({ ref1 }) => {
      if (type === "raw") {
        console.log(
          `${ref1.getPos()}, ${ref1.getPos("cm")}cm, ${ref1.getPos("%")}%`
        );
      } else {
        console.log(ref1.getPos(type) + type);
      }
      process.exit(0);
    })
    .catch((err) => console.error(err));
} else {
  moveTo({ value: +value, type })
    .then(() => process.exit(0))
    .catch((err) => console.error(err));
}
