import UserError from "./user-error.ts";

async function runCommand(...args: string[]): Promise<string> {
  const cmd = Deno.run({
    cmd: ["git", ...args],
    stdout: "piped",
    stderr: "piped",
  });

  const stdout = await cmd.output();
  const stdoutString = new TextDecoder().decode(stdout);

  const stderr = await cmd.stderrOutput();
  const stderrString = new TextDecoder().decode(stderr);

  const { code } = await cmd.status();
  cmd.close();

  if (code !== 0) {
    throw new Error(`Git error: ${stderrString}`);
  }

  return stdoutString;
}

export async function checkPrerequisites(): Promise<void> {
  const status = await runCommand("status", "--porcelain");

  if (status !== "") {
    throw new UserError("Cannot release with uncommitted changes");
  }
}

export async function commitAndTag(version: string, fileName: string) {
  await runCommand("add", fileName);
  await runCommand("commit", "-m", version);
  await runCommand("tag", version);
}
