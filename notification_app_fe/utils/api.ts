import { Notification, ScoredNotification } from "../types/notification";

const AUTH_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJhZDU3NzdAc3JtaXN0LmVkdS5pbiIsImV4cCI6MTc3NzcwNjAyOCwiaWF0IjoxNzc3NzA1MTI4LCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiMTlmNDdiOWItODZhMS00ZmJhLWE4ODAtMDMwYzZhZjk2ZjgyIiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoiYWtzaGF0aCBkdWJleSIsInN1YiI6ImJiYmFkOTY4LTc3NDYtNGEyNC1iMTM0LWI4Zjc0MzU3YmY0MSJ9LCJlbWFpbCI6ImFkNTc3N0Bzcm1pc3QuZWR1LmluIiwibmFtZSI6ImFrc2hhdGggZHViZXkiLCJyb2xsTm8iOiJyYTIzMTEwMzMwMTAxNDAiLCJhY2Nlc3NDb2RlIjoiUWticHhIIiwiY2xpZW50SUQiOiJiYmJhZDk2OC03NzQ2LTRhMjQtYjEzNC1iOGY3NDM1N2JmNDEiLCJjbGllbnRTZWNyZXQiOiJhY0FkcEdZYkFCelVDVnJnIn0.pj--1qpglq3XE3XXjLHU8AK3693_BpDXoTOnNs2kMVU";

const BASE_URL = "http://20.207.122.201/evaluation-service";

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    ID: "1a2b3c",
    Type: "Placement",
    Message: "Google hiring SDE interns",
    Timestamp: "2026-04-22 17:55:00",
  },
  {
    ID: "2b3c4d",
    Type: "Placement",
    Message: "Microsoft full-time roles open",
    Timestamp: "2026-04-22 17:53:00",
  },
  {
    ID: "3c4d5e",
    Type: "Placement",
    Message: "Amazon hiring for cloud roles",
    Timestamp: "2026-04-22 17:51:30",
  },
  {
    ID: "4d5e6f",
    Type: "Result",
    Message: "Mid-semester results declared",
    Timestamp: "2026-04-22 17:51:18",
  },
  {
    ID: "5e6f7g",
    Type: "Result",
    Message: "Project review scores updated",
    Timestamp: "2026-04-22 17:51:06",
  },
  {
    ID: "6f7g8h",
    Type: "Result",
    Message: "External exam results out",
    Timestamp: "2026-04-22 17:50:54",
  },
  {
    ID: "7g8h9i",
    Type: "Placement",
    Message: "AMD hiring hardware engineers",
    Timestamp: "2026-04-22 17:50:42",
  },
  {
    ID: "8h9i0j",
    Type: "Event",
    Message: "Tech Fest 2026 registration open",
    Timestamp: "2026-04-22 17:50:30",
  },
  {
    ID: "9i0j1k",
    Type: "Result",
    Message: "Internal assessment marks released",
    Timestamp: "2026-04-22 17:50:18",
  },
  {
    ID: "0j1k2l",
    Type: "Event",
    Message: "Farewell ceremony this Friday",
    Timestamp: "2026-04-22 17:50:06",
  },
  {
    ID: "1k2l3m",
    Type: "Placement",
    Message: "Infosys walk-in drive announced",
    Timestamp: "2026-04-22 17:49:54",
  },
  {
    ID: "2l3m4n",
    Type: "Event",
    Message: "Cultural night tickets available",
    Timestamp: "2026-04-22 17:49:42",
  },
  {
    ID: "3m4n5o",
    Type: "Result",
    Message: "Supplementary exam timetable out",
    Timestamp: "2026-04-22 17:49:30",
  },
  {
    ID: "4n5o6p",
    Type: "Placement",
    Message: "Wipro off-campus drive next week",
    Timestamp: "2026-04-22 17:49:18",
  },
  {
    ID: "5o6p7q",
    Type: "Event",
    Message: "Annual sports day schedule released",
    Timestamp: "2026-04-22 17:49:06",
  },
  {
    ID: "6p7q8r",
    Type: "Result",
    Message: "Lab practical results published",
    Timestamp: "2026-04-22 17:48:54",
  },
  {
    ID: "7q8r9s",
    Type: "Placement",
    Message: "TCS NQT registration deadline today",
    Timestamp: "2026-04-22 17:48:42",
  },
  {
    ID: "8r9s0t",
    Type: "Event",
    Message: "Hackathon 2026 registrations open",
    Timestamp: "2026-04-22 17:48:30",
  },
  {
    ID: "9s0t1u",
    Type: "Result",
    Message: "Revaluation results announced",
    Timestamp: "2026-04-22 17:48:18",
  },
  {
    ID: "0t1u2v",
    Type: "Placement",
    Message: "Deloitte hiring for analyst roles",
    Timestamp: "2026-04-22 17:48:06",
  },
];

const TYPE_WEIGHT: Record<string, number> = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

export function calculateScore(notification: Notification): number {
  const typeWeight = TYPE_WEIGHT[notification.Type] ?? 0;
  const timestamp = new Date(notification.Timestamp).getTime();
  return typeWeight * 1000 + timestamp / 1e10;
}

class MinHeap {
  private heap: ScoredNotification[] = [];
  private maxSize: number;

  constructor(maxSize: number) {
    this.maxSize = maxSize;
  }

  private parentIdx(i: number) {
    return Math.floor((i - 1) / 2);
  }
  private leftIdx(i: number) {
    return 2 * i + 1;
  }
  private rightIdx(i: number) {
    return 2 * i + 2;
  }
  private swap(i: number, j: number) {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }

  private heapifyUp(index: number) {
    while (
      index > 0 &&
      this.heap[this.parentIdx(index)].score > this.heap[index].score
    ) {
      this.swap(index, this.parentIdx(index));
      index = this.parentIdx(index);
    }
  }

  private heapifyDown(index: number) {
    let smallest = index;
    const l = this.leftIdx(index),
      r = this.rightIdx(index);
    if (l < this.heap.length && this.heap[l].score < this.heap[smallest].score)
      smallest = l;
    if (r < this.heap.length && this.heap[r].score < this.heap[smallest].score)
      smallest = r;
    if (smallest !== index) {
      this.swap(index, smallest);
      this.heapifyDown(smallest);
    }
  }

  insert(n: ScoredNotification) {
    if (this.heap.length < this.maxSize) {
      this.heap.push(n);
      this.heapifyUp(this.heap.length - 1);
    } else if (n.score > this.heap[0].score) {
      this.heap[0] = n;
      this.heapifyDown(0);
    }
  }

  getTopN(): ScoredNotification[] {
    return [...this.heap].sort((a, b) => b.score - a.score);
  }
}

export function getTopNNotifications(
  notifications: Notification[],
  n: number,
): ScoredNotification[] {
  const heap = new MinHeap(n);
  for (const notif of notifications) {
    heap.insert({ ...notif, score: calculateScore(notif) });
  }
  return heap.getTopN();
}

export async function fetchNotifications(
  page: number = 1,
  limit: number = 10,
  notification_type: string = "",
): Promise<Notification[]> {
  try {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (notification_type)
      params.append("notification_type", notification_type);

    const res = await fetch(`${BASE_URL}/notifications?${params.toString()}`, {
      headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
    });

    if (!res.ok) throw new Error("API unavailable");
    const data = await res.json();
    return data.notifications;
  } catch {
    let filtered = MOCK_NOTIFICATIONS;
    if (notification_type)
      filtered = filtered.filter((n) => n.Type === notification_type);
    const start = (page - 1) * limit;
    return filtered.slice(start, start + limit);
  }
}

export async function sendLog(
  stack: string,
  level: string,
  pkg: string,
  message: string,
): Promise<void> {
  try {
    await fetch(`${BASE_URL}/logs`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ stack, level, package: pkg, message }),
    });
  } catch {}
}
