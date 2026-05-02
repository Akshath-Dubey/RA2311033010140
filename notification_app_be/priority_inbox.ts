import axios from "axios";

const AUTH_TOKEN = "your_access_token_here";
const NOTIFICATIONS_URL =
  "http://20.207.122.201/evaluation-service/notifications";

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

class MinHeap {
  private heap: ScoredNotification[] = [];
  private maxSize: number;

  constructor(maxSize: number) {
    this.maxSize = maxSize;
  }

  private getParentIndex(i: number): number {
    return Math.floor((i - 1) / 2);
  }
  private getLeftIndex(i: number): number {
    return 2 * i + 1;
  }
  private getRightIndex(i: number): number {
    return 2 * i + 2;
  }

  private swap(i: number, j: number): void {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }

  private heapifyUp(index: number): void {
    while (
      index > 0 &&
      this.heap[this.getParentIndex(index)].score > this.heap[index].score
    ) {
      this.swap(index, this.getParentIndex(index));
      index = this.getParentIndex(index);
    }
  }

  private heapifyDown(index: number): void {
    let smallest = index;
    const left = this.getLeftIndex(index);
    const right = this.getRightIndex(index);

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
  const typeWeight = TYPE_WEIGHT[notification.Type] || 0;
  const timestamp = new Date(notification.Timestamp).getTime();
  const recencyScore = timestamp / 1e10;
  return typeWeight * 1000 + recencyScore;
}

async function fetchNotifications(): Promise<Notification[]> {
  const response = await axios.get(NOTIFICATIONS_URL, {
    headers: {
      Authorization: `Bearer ${AUTH_TOKEN}`,
    },
  });
  return response.data.notifications;
}

async function getTopNotifications(n: number = 10): Promise<void> {
  console.log(`\n🔔 Fetching notifications and computing top ${n}...\n`);

  const notifications = await fetchNotifications();
  console.log(`✅ Total notifications fetched: ${notifications.length}\n`);

  const heap = new MinHeap(n);

  for (const notification of notifications) {
    const score = calculateScore(notification);
    heap.insert({ ...notification, score });
  }

  const topN = heap.getTopN();

  console.log(`🏆 Top ${n} Priority Notifications:\n`);
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
}

getTopNotifications(10);
