import { clean, inc, valid } from "https://deno.land/x/semver@v1.4.0/mod.ts";

import UserError from "./user-error.ts";
import { checkPrerequisites, commitAndTag, GitError } from "./git.ts";

const fileName = "VERSION";

async function readVersion(): Promise<string> {
  let content: string;

  try {
    content = await Deno.readTextFile(fileName);
    content = content.replace(/[\n\r\t\s]+/g, '');
  } catch (err) {
    if (err instanceof Deno.errors.PermissionDenied) {
      throw err;
    } else {
      throw new UserError(
        `Could not read ${fileName} file. Run \`version init\` to create one`,
      );
    }
  }
  
  if (!valid(content)) {
    throw new UserError(
      `${fileName} file contained "${content}", which is not a valid version string`,
    );
  }

  return content;
}

async function writeVersion(versionInput: string): Promise<void> {
  const normalizedVersion = clean(versionInput);

  if (!normalizedVersion) {
    throw new UserError(`${versionInput} is not a valid version string`);
  }

  await checkPrerequisites();

  await Deno.writeTextFile(fileName, normalizedVersion);
  await commitAndTag(normalizedVersion, fileName);
  console.log(normalizedVersion);
}

enum Actions {
  major = "major",
  minor = "minor",
  patch = "patch",
  init = "init",
  set = "set",
  get = "get",
}

const allowedActions = Object.keys(Actions);

async function run() {
  const [action, ...params] = Deno.args;
  if (!allowedActions.includes(action)) {
    throw new UserError(`Usage: version <${allowedActions.join("|")}>`);
  }

  switch (action) {
    case "init": {
      const version = params[0] || "1.0.0";

      await writeVersion(version);
      break;
    }

    case "get": {
      const currentVersion = await readVersion();
      console.log(currentVersion);
      break;
    }

    case "set": {
      if (!params[0]) {
        throw new UserError(`Usage: version set <version>`);
      }

      await writeVersion(params[0]);
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
  if (err instanceof Deno.errors.PermissionDenied) {
    console.error(err.message);
    Deno.exit(1);
  } else if (err instanceof UserError || err instanceof GitError) {
    console.error(`Error: ${err.message}`);
    Deno.exit(1);
  }

  throw err;
}
