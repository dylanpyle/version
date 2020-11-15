import { inc, valid } from "https://deno.land/x/semver@v1.0.0/mod.ts";

import UserError from "./user-error.ts";
import { checkPrerequisites, commitAndTag } from "./git.ts";

const fileName = "VERSION";

async function readVersion(): Promise<string> {
  let content: string;

  try {
    content = await Deno.readTextFile(fileName);
  } catch (err) {
    throw new UserError(
      `Could not read ${fileName} file. Run \`version init\` to create one`,
    );
  }

  if (!valid(content)) {
    throw new UserError(
      `${fileName} file contained "${content}", which is not a valid version string`,
    );
  }

  return content;
}

async function writeVersion(version: string): Promise<void> {
  if (!valid(version)) {
    throw new UserError(`${version} is not a valid version string`);
  }

  await checkPrerequisites();

  await Deno.writeTextFile(fileName, version);
  await commitAndTag(version, fileName);
  console.log(version);
}

enum Actions {
  major = "major",
  minor = "minor",
  patch = "patch",
  init = "init",
  set = "set",
}

const allowedActions = Object.keys(Actions);

async function run() {
  const [action, ...params] = Deno.args;
  if (!allowedActions.includes(action)) {
    throw new UserError(`Usage: version <${allowedActions.join("|")}>`);
  }

  switch (action) {
    case "init": {
      const version = "1.0.0";
      await writeVersion(version);
      break;
    }

    case "set": {
      if (!params[1]) {
        throw new UserError(`Usage: version set <version>`);
      }

      await writeVersion(params[1]);
      break;
    }

    case "major":
    case "minor":
    case "patch": {
      const currentVersion = await readVersion();
      const newVersion = inc(
        currentVersion,
        action as "major" | "minor" | "patch",
      );
      if (!newVersion) {
        throw new Error("Could not increment version");
      }

      await writeVersion(newVersion);
      break;
    }
  }
}

try {
  await run();
} catch (err) {
  if (err instanceof UserError) {
    console.error(`Error: ${err.message}`);
    Deno.exit(1);
  }

  throw err;
}
