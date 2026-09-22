import { exec } from "node:child_process";
import { promisify } from "node:util";
import { spawn } from "node:child_process";

const execAsync = promisify(exec);
const isWindows = process.platform === "win32";
const npmCommand = isWindows ? "npm.cmd" : "npm";
const npxCommand = isWindows ? "npx.cmd" : "npx";
const port = "4173";
const url = "http://127.0.0.1:" + port + "/";

async function run(command, args) {
  const commandLine = [command, ...args]
    .map((argument, index) => index === 0
      ? argument
      : "\"" + argument.replace(/"/g, "\\\"") + "\"")
    .join(" ");
  const result = await execAsync(commandLine, {
    encoding: "utf8",
    maxBuffer: 1024 * 1024,
    timeout: 90000,
  });
  return result.stdout + result.stderr;
}

async function waitForServer() {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // The dev server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error("Timed out waiting for the Vite server.");
}

const serverArgs = ["run", "dev", "--", "--host", "127.0.0.1", "--port", port];
const server = isWindows
  ? spawn(process.env.ComSpec ?? "cmd.exe", ["/d", "/s", "/c", npmCommand + " " + serverArgs.join(" ")], {
      stdio: "ignore",
      windowsHide: true,
    })
  : spawn(npmCommand, serverArgs, { stdio: "ignore" });

try {
  await waitForServer();
  await run(npxCommand, ["--yes", "agent-browser", "open", url]);
  await run(npxCommand, ["--yes", "agent-browser", "wait", "--load", "networkidle"]);
  const snapshot = await run(npxCommand, ["--yes", "agent-browser", "snapshot", "-i"]);

  const requiredMarkers = [
    'heading "Your money, translated."',
    'region "Your shopping basket"',
    'region "Historical exchange rates"',
    'button "Switch to Azərbaycan dili"',
    'button "Share link"',
    'link "Official source"',
  ];

  const missingMarkers = requiredMarkers.filter((marker) => !snapshot.includes(marker));
  if (missingMarkers.length > 0) {
    throw new Error("Missing accessibility markers:\n" + missingMarkers.join("\n"));
  }

  if (snapshot.includes("Error:") || snapshot.includes("Unhandled")) {
    throw new Error("The accessibility snapshot contains a runtime error.");
  }

  console.log("Browser accessibility smoke check passed.");
} finally {
  try {
    await run(npxCommand, ["--yes", "agent-browser", "close", "--all"]);
  } catch {
    // The browser may not have started.
  }
  server.kill();
}
