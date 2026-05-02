import axios from "axios";

const AUTH_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJhZDU3NzdAc3JtaXN0LmVkdS5pbiIsImV4cCI6MTc3NzcwNjAyOCwiaWF0IjoxNzc3NzA1MTI4LCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiMTlmNDdiOWItODZhMS00ZmJhLWE4ODAtMDMwYzZhZjk2ZjgyIiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoiYWtzaGF0aCBkdWJleSIsInN1YiI6ImJiYmFkOTY4LTc3NDYtNGEyNC1iMTM0LWI4Zjc0MzU3YmY0MSJ9LCJlbWFpbCI6ImFkNTc3N0Bzcm1pc3QuZWR1LmluIiwibmFtZSI6ImFrc2hhdGggZHViZXkiLCJyb2xsTm8iOiJyYTIzMTEwMzMwMTAxNDAiLCJhY2Nlc3NDb2RlIjoiUWticHhIIiwiY2xpZW50SUQiOiJiYmJhZDk2OC03NzQ2LTRhMjQtYjEzNC1iOGY3NDM1N2JmNDEiLCJjbGllbnRTZWNyZXQiOiJhY0FkcEdZYkFCelVDVnJnIn0.pj--1qpglq3XE3XXjLHU8AK3693_BpDXoTOnNs2kMVU";

const NOTIFICATIONS_URL =
  "http://20.207.122.201/evaluation-service/notifications";
const LOG_URL = "http://20.207.122.201/evaluation-service/logs";

const TYPE_WEIGHT: Record<string, number> = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

interface Notification {
  ID: string;
  Type: string;
  Message: string;
  Timestamp: string;
}

interface ScoredNotification extends Notification {
  score: number;
}

async function Log(
  stack: "backend" | "frontend",
  level: "debug" | "info" | "warn" | "error" | "fatal",
  pkg: string,
  message: string,
): Promise<void> {
  try {
    await axios.post(
      LOG_URL,
      { stack, level, package: pkg, message },
      {
        headers: {
          Authorization: `Bearer ${AUTH_TOKEN}`,
          "Content-Type": "application/json",
        },
      },
    );
    console.log(`[LOG] [${level.toUpperCase()}] [${pkg}] ${message}`);
  } catch {}
}

class MinHeap {
  private heap: ScoredNotification[] = [];
  private maxSize: number;

  constructor(maxSize: number) {
    this.maxSize = maxSize;
  }

  private parentIdx(i: number): number {
    return Math.floor((i - 1) / 2);
  }
  private leftIdx(i: number): number {
    return 2 * i + 1;
  }
  private rightIdx(i: number): number {
    return 2 * i + 2;
  }

  private swap(i: number, j: number): void {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }

  private heapifyUp(index: number): void {
    while (
      index > 0 &&
      this.heap[this.parentIdx(index)].score > this.heap[index].score
    ) {
      this.swap(index, this.parentIdx(index));
      index = this.parentIdx(index);
    }
  }

  private heapifyDown(index: number): void {
    let smallest = index;
    const left = this.leftIdx(index);
    const right = this.rightIdx(index);

    if (
      left < this.heap.length &&
      this.heap[left].score < this.heap[smallest].score
    )
      smallest = left;
    if (
      right < this.heap.length &&
      this.heap[right].score < this.heap[smallest].score
    )
      smallest = right;

    if (smallest !== index) {
      this.swap(index, smallest);
      this.heapifyDown(smallest);
    }
  }

  insert(notification: ScoredNotification): void {
    if (this.heap.length < this.maxSize) {
      this.heap.push(notification);
      this.heapifyUp(this.heap.length - 1);
    } else if (notification.score > this.heap[0].score) {
      this.heap[0] = notification;
      this.heapifyDown(0);
    }
  }

  getTopN(): ScoredNotification[] {
    return [...this.heap].sort((a, b) => b.score - a.score);
  }

  size(): number {
    return this.heap.length;
  }
}

function calculateScore(notification: Notification): number {
  const typeWeight = TYPE_WEIGHT[notification.Type] ?? 0;
  const timestamp = new Date(notification.Timestamp).getTime();
  const recencyScore = timestamp / 1e10;
  return typeWeight * 1000 + recencyScore;
}

async function fetchNotifications(): Promise<Notification[]> {
  await Log(
    "backend",
    "info",
    "service",
    "Fetching notifications from evaluation server",
  );
  try {
    const response = await axios.get(NOTIFICATIONS_URL, {
      headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
    });
    const notifications: Notification[] = response.data.notifications;
    await Log(
      "backend",
      "info",
      "service",
      `Fetched ${notifications.length} notifications successfully`,
    );
    return notifications;
  } catch (error: any) {
    await Log(
      "backend",
      "error",
      "handler",
      `Failed to fetch notifications: ${error.message}`,
    );
    throw error;
  }
}

async function getTopNotifications(n: number = 10): Promise<void> {
  await Log(
    "backend",
    "info",
    "middleware",
    "Priority inbox computation started",
  );
  console.log(`\n🔔 Fetching notifications and computing top ${n}...\n`);

  const notifications = await fetchNotifications();
  console.log(`✅ Total notifications fetched: ${notifications.length}\n`);

  const heap = new MinHeap(n);
  for (const notification of notifications) {
    const score = calculateScore(notification);
    heap.insert({ ...notification, score });
  }

  await Log(
    "backend",
    "debug",
    "service",
    `Min-heap built with top ${heap.size()} notifications`,
  );

  const topN = heap.getTopN();

  console.log(`🏆 Top ${n} Priority Notifications:`);
  console.log("─".repeat(80));

  topN.forEach((notif, index) => {
    console.log(`#${index + 1}`);
    console.log(`  ID      : ${notif.ID}`);
    console.log(`  Type    : ${notif.Type}`);
    console.log(`  Message : ${notif.Message}`);
    console.log(`  Time    : ${notif.Timestamp}`);
    console.log(`  Score   : ${notif.score.toFixed(4)}`);
    console.log("─".repeat(80));
  });

  await Log(
    "backend",
    "info",
    "handler",
    `Top ${n} priority notifications displayed successfully`,
  );
}

getTopNotifications(10);
