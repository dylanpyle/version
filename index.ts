import { clean, inc, valid } from "https://deno.land/x/semver@v1.4.0/mod.ts";
import { resolve } from "https://deno.land/std@0.204.0/path/mod.ts";

import UserError from "./user-error.ts";
import { checkPrerequisites, commitAndTag, GitError } from "./git.ts";

const textFileName = "VERSION";
const codeFileName = "VERSION.ts";

const codeRegex = /export[\s\S]+?const[\s\S]+?VERSION\s+=\s+"(.*?)";/g;

let useCodeFile: boolean;
try {
  useCodeFile = (await Deno.stat(codeFileName)).isFile;
} catch {
  useCodeFile = false;
}

function getFileName() {
  return resolve(useCodeFile ? codeFileName : textFileName);
}

async function readVersion(): Promise<string> {
  const fileName = getFileName();

  let content: string;
  if (useCodeFile) {
    content = await readCodeVersion(fileName);
  } else {
    content = await readTextVersion(fileName);
  }

  if (!valid(content)) {
    throw new UserError(
      `${fileName} file contained "${content}", which is not a valid version string`,
    );
  }

  return content;
}

async function readCodeVersion(fileName: string): Promise<string> {
  let content: string;

  try {
    const fileContents = await Deno.readTextFile(fileName);
    const versionMatch = codeRegex.exec(fileContents);
    if (!versionMatch) {
      throw new UserError(
        `Failed to parse ${fileName}.`,
      );
    }

    content = versionMatch[1]

    if (typeof content !== "string") {
      throw new UserError(
        `Failed to parse ${fileName}.`,
      );
    }
  } catch (err) {
    if (err instanceof Deno.errors.PermissionDenied) {
      throw err;
    } else {
      throw new UserError(
        `Could not read ${fileName} file. Run \`version init\` to create one`,
      );
    }
  }

  return content;
}

async function readTextVersion(fileName: string): Promise<string> {
  let content: string;

  try {
    content = await Deno.readTextFile(fileName);
    content = content.replace(/[\n\r\t\s]+/g, "");
  } catch (err) {
    if (err instanceof Deno.errors.PermissionDenied) {
      throw err;
    } else {
      throw new UserError(
        `Could not read ${fileName} file. Run \`version init\` to create one`,
      );
    }
  }

  return content;
}

async function writeVersion(versionInput: string): Promise<void> {
  const fileName = getFileName();

  const normalizedVersion = clean(versionInput);

  if (!normalizedVersion) {
    throw new UserError(`${versionInput} is not a valid version string`);
  }

  await checkPrerequisites();

  if (useCodeFile) {
    writeCodeVersion(fileName, normalizedVersion);
  } else {
    writeTextVersion(fileName, normalizedVersion);
  }

  await commitAndTag(normalizedVersion, fileName);
  console.log(normalizedVersion);
}

async function writeCodeVersion(
  fileName: string,
  normalizedVersion: string,
): Promise<void> {
  const versionModule = `export const VERSION = "${normalizedVersion}";\n`;
  await Deno.writeTextFile(fileName, versionModule);
}

async function writeTextVersion(
  fileName: string,
  normalizedVersion: string,
): Promise<void> {
  await Deno.writeTextFile(fileName, normalizedVersion);
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
  const [action, ...paramsWithFlags] = Deno.args;
  if (!allowedActions.includes(action)) {
    throw new UserError(`Usage: version <${allowedActions.join("|")}>`);
  }

  if (paramsWithFlags.includes("--ts")) {
    useCodeFile = true;
  } else if (paramsWithFlags.includes("--txt")) {
    useCodeFile = false;
  }

  // Remove flags from params
  const params = paramsWithFlags.filter((param) => !param.startsWith("--"));

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
