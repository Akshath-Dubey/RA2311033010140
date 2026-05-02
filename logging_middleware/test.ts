import { Log } from "./logger";

async function main() {
  await Log(
    "backend",
    "info",
    "middleware",
    "Logging middleware initialized successfully",
  );
  await Log("backend", "debug", "config", "Configuration loaded");
}

main();
