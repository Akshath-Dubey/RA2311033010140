import axios from "axios";

const AUTH_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJhZDU3NzdAc3JtaXN0LmVkdS5pbiIsImV4cCI6MTc3NzcwNjAyOCwiaWF0IjoxNzc3NzA1MTI4LCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiMTlmNDdiOWItODZhMS00ZmJhLWE4ODAtMDMwYzZhZjk2ZjgyIiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoiYWtzaGF0aCBkdWJleSIsInN1YiI6ImJiYmFkOTY4LTc3NDYtNGEyNC1iMTM0LWI4Zjc0MzU3YmY0MSJ9LCJlbWFpbCI6ImFkNTc3N0Bzcm1pc3QuZWR1LmluIiwibmFtZSI6ImFrc2hhdGggZHViZXkiLCJyb2xsTm8iOiJyYTIzMTEwMzMwMTAxNDAiLCJhY2Nlc3NDb2RlIjoiUWticHhIIiwiY2xpZW50SUQiOiJiYmJhZDk2OC03NzQ2LTRhMjQtYjEzNC1iOGY3NDM1N2JmNDEiLCJjbGllbnRTZWNyZXQiOiJhY0FkcEdZYkFCelVDVnJnIn0.pj--1qpglq3XE3XXjLHU8AK3693_BpDXoTOnNs2kMVU";

const LOG_URL = "http://20.207.122.201/evaluation-service/logs";

type Stack = "backend" | "frontend";
type Level = "debug" | "info" | "warn" | "error" | "fatal";
type Package =
  | "cache"
  | "controller"
  | "cron_job"
  | "domain"
  | "handler"
  | "repository"
  | "route"
  | "service"
  | "api"
  | "component"
  | "hook"
  | "page"
  | "state"
  | "style"
  | "auth"
  | "config"
  | "middleware"
  | "utils";

export async function Log(
  stack: Stack,
  level: Level,
  pkg: Package,
  message: string,
): Promise<void> {
  try {
    const response = await axios.post(
      LOG_URL,
      {
        stack: stack,
        level: level,
        package: pkg,
        message: message,
      },
      {
        headers: {
          Authorization: `Bearer ${AUTH_TOKEN}`,
          "Content-Type": "application/json",
        },
      },
    );
    console.log(
      `[LOG SUCCESS] [${stack}] [${level.toUpperCase()}] [${pkg}] ${message}`,
    );
    console.log(`  → logID: ${response.data.logID}`);
  } catch (error: any) {
    console.error(
      `[LOG FAILED] [${stack}] [${level.toUpperCase()}] [${pkg}] ${message}`,
    );
    console.error(`  → ${error?.response?.data?.message || error.message}`);
  }
}
