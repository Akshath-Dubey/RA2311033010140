import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Stack,
  Chip,
  Divider,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import Navbar from "../components/Navbar";
import NotificationCard from "../components/NotificationCard";
import {
  fetchNotifications,
  getTopNNotifications,
  sendLog,
  MOCK_NOTIFICATIONS,
} from "../utils/api";
import { Notification, ScoredNotification } from "../types/notification";

const TOP_N_OPTIONS = [5, 10, 15, 20];
const TYPES = ["All", "Placement", "Result", "Event"];

export default function PriorityInboxPage() {
  const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
  const [prioritized, setPrioritized] = useState<ScoredNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [topN, setTopN] = useState(10);
  const [filterType, setFilterType] = useState("All");
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [usingMock, setUsingMock] = useState(false);

  const loadAndPrioritize = useCallback(async () => {
    setLoading(true);
    try {
      await sendLog("frontend", "info", "page", "Priority inbox page loaded");

      const data = await fetchNotifications(1, 100, "");
      setAllNotifications(data);

      if (
        data.length > 0 &&
        MOCK_NOTIFICATIONS.some((m) => m.ID === data[0].ID)
      ) {
        setUsingMock(true);
      }

      const filtered =
        filterType === "All" ? data : data.filter((n) => n.Type === filterType);

      const top = getTopNNotifications(filtered, topN);
      setPrioritized(top);

      await sendLog(
        "frontend",
        "debug",
        "component",
        `Priority inbox computed top ${topN} from ${filtered.length} notifications`,
      );
    } catch {
      await sendLog(
        "frontend",
        "error",
        "api",
        "Failed to load notifications for priority inbox",
      );
      const filtered =
        filterType === "All"
          ? MOCK_NOTIFICATIONS
          : MOCK_NOTIFICATIONS.filter((n) => n.Type === filterType);
      setPrioritized(getTopNNotifications(filtered, topN));
      setUsingMock(true);
    } finally {
      setLoading(false);
    }
  }, [topN, filterType]);

  useEffect(() => {
    loadAndPrioritize();
  }, [loadAndPrioritize]);

  const handleCardClick = (id: string) => {
    setReadIds((prev) => new Set([...prev, id]));
    sendLog(
      "frontend",
      "debug",
      "component",
      `Priority notification ${id} marked as read`,
    );
  };

  const unreadCount = prioritized.filter((n) => !readIds.has(n.ID)).length;

  const counts = prioritized.reduce(
    (acc, n) => {
      acc[n.Type] = (acc[n.Type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <Box sx={{ minHeight: "100vh", background: "#0f1117" }}>
      <Navbar unreadCount={unreadCount} />

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box
          mb={3}
          display="flex"
          alignItems="flex-start"
          justifyContent="space-between"
          flexWrap="wrap"
          gap={2}
        >
          <Box>
            <Box display="flex" alignItems="center" gap={1} mb={0.5}>
              <StarIcon sx={{ color: "#f59e0b", fontSize: 28 }} />
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                Priority Inbox
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: "#9094a6" }}>
              Top {topN} most important notifications �� ranked by type weight
              &amp; recency
            </Typography>
          </Box>

          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel sx={{ color: "#9094a6" }}>Show Top</InputLabel>
            <Select
              value={topN}
              label="Show Top"
              onChange={(e) => {
                setTopN(Number(e.target.value));
                sendLog(
                  "frontend",
                  "debug",
                  "component",
                  `Top-N changed to ${e.target.value}`,
                );
              }}
              sx={{
                color: "#e8eaf0",
                borderColor: "rgba(255,255,255,0.1)",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(255,255,255,0.15)",
                },
              }}
            >
              {TOP_N_OPTIONS.map((n) => (
                <MenuItem key={n} value={n}>
                  Top {n}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {usingMock && (
          <Alert
            severity="info"
            sx={{
              mb: 2,
              background: "rgba(96, 165, 250, 0.1)",
              border: "1px solid rgba(96, 165, 250, 0.3)",
            }}
          >
            API session expired — showing demo data. Priority algorithm
            (min-heap) is fully functional.
          </Alert>
        )}

        <Stack direction="row" spacing={1} mb={3} flexWrap="wrap">
          {TYPES.map((type) => (
            <Chip
              key={type}
              label={
                type === "All"
                  ? `All (${prioritized.length})`
                  : `${type} (${counts[type] || 0})`
              }
              onClick={() => {
                setFilterType(type);
                sendLog(
                  "frontend",
                  "debug",
                  "component",
                  `Priority filter changed to ${type}`,
                );
              }}
              variant={filterType === type ? "filled" : "outlined"}
              sx={{
                cursor: "pointer",
                fontWeight: 600,
                mb: 1,
                ...(filterType === type
                  ? { background: "#6c63ff", color: "#fff" }
                  : { borderColor: "rgba(255,255,255,0.1)", color: "#9094a6" }),
              }}
            />
          ))}
        </Stack>

        <Box
          display="flex"
          gap={3}
          mb={3}
          p={2}
          sx={{
            background: "rgba(26,29,39,0.8)",
            borderRadius: 2,
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <Typography variant="caption" sx={{ color: "#9094a6" }}>
            Priority weights:
          </Typography>
          {[
            { label: "Placement", color: "#4ade80", weight: 3 },
            { label: "Result", color: "#f59e0b", weight: 2 },
            { label: "Event", color: "#60a5fa", weight: 1 },
          ].map((item) => (
            <Box key={item.label} display="flex" alignItems="center" gap={0.5}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: item.color,
                }}
              />
              <Typography
                variant="caption"
                sx={{ color: item.color, fontWeight: 700 }}
              >
                {item.label}
              </Typography>
              <Typography variant="caption" sx={{ color: "#606475" }}>
                ×{item.weight}
              </Typography>
            </Box>
          ))}
        </Box>

        <Divider sx={{ mb: 3, borderColor: "rgba(255,255,255,0.06)" }} />

        {loading ? (
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress sx={{ color: "#6c63ff" }} />
          </Box>
        ) : prioritized.length === 0 ? (
          <Box textAlign="center" py={8}>
            <Typography sx={{ color: "#9094a6" }}>
              No notifications found for this filter.
            </Typography>
          </Box>
        ) : (
          <Box>
            {prioritized.map((n, idx) => (
              <NotificationCard
                key={n.ID}
                notification={n}
                isRead={readIds.has(n.ID)}
                onClick={handleCardClick}
                score={n.score}
                rank={idx + 1}
              />
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
}
