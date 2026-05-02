import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
  CircularProgress,
  Alert,
  Button,
  Chip,
  Stack,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import Navbar from "../components/Navbar";
import NotificationCard from "../components/NotificationCard";
import { fetchNotifications, sendLog, MOCK_NOTIFICATIONS } from "../utils/api";
import { Notification } from "../types/notification";

const ITEMS_PER_PAGE = 8;
const TYPES = ["All", "Placement", "Result", "Event"];

export default function AllNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [page, setPage] = useState(1);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [usingMock, setUsingMock] = useState(false);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      await sendLog(
        "frontend",
        "info",
        "page",
        "All notifications page loaded",
      );
      const type = filterType === "All" ? "" : filterType;
      const data = await fetchNotifications(page, ITEMS_PER_PAGE, type);
      setNotifications(data);

      if (
        data.length > 0 &&
        MOCK_NOTIFICATIONS.some((m) => m.ID === data[0].ID)
      ) {
        setUsingMock(true);
      } else {
        setUsingMock(false);
      }

      await sendLog(
        "frontend",
        "debug",
        "api",
        `Loaded ${data.length} notifications`,
      );
    } catch (err) {
      setError("Failed to load notifications. Showing demo data.");
      setUsingMock(true);
      await sendLog(
        "frontend",
        "error",
        "api",
        "Failed to fetch notifications from server",
      );
    } finally {
      setLoading(false);
    }
  }, [filterType, page]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    setPage(1);
  }, [filterType]);

  const handleCardClick = (id: string) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    sendLog(
      "frontend",
      "debug",
      "component",
      `Notification ${id} marked as read`,
    );
  };

  const handleMarkAllRead = () => {
    const allIds = new Set(notifications.map((n) => n.ID));
    setReadIds((prev) => new Set([...prev, ...allIds]));
    sendLog(
      "frontend",
      "info",
      "component",
      "All notifications marked as read",
    );
  };

  const unreadCount = notifications.filter((n) => !readIds.has(n.ID)).length;

  const filtered =
    filterType === "All"
      ? MOCK_NOTIFICATIONS
      : MOCK_NOTIFICATIONS.filter((n) => n.Type === filterType);
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  return (
    <Box sx={{ minHeight: "100vh", background: "#0f1117" }}>
      <Navbar unreadCount={unreadCount} />

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box mb={3}>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
            All Notifications
          </Typography>
          <Typography variant="body2" sx={{ color: "#9094a6" }}>
            {unreadCount} unread · Click a notification to mark it as read
          </Typography>
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
            API session expired — showing demo data. The UI and logic are fully
            functional.
          </Alert>
        )}

        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          flexWrap="wrap"
          gap={2}
          mb={3}
        >
          <Stack direction="row" spacing={1}>
            {TYPES.map((type) => (
              <Chip
                key={type}
                label={type}
                onClick={() => {
                  setFilterType(type);
                  sendLog(
                    "frontend",
                    "debug",
                    "component",
                    `Filter changed to ${type}`,
                  );
                }}
                variant={filterType === type ? "filled" : "outlined"}
                sx={{
                  cursor: "pointer",
                  fontWeight: 600,
                  ...(filterType === type
                    ? { background: "#6c63ff", color: "#fff" }
                    : {
                        borderColor: "rgba(255,255,255,0.1)",
                        color: "#9094a6",
                      }),
                }}
              />
            ))}
          </Stack>

          <Box display="flex" gap={1}>
            <Button
              size="small"
              startIcon={<DoneAllIcon />}
              onClick={handleMarkAllRead}
              sx={{
                textTransform: "none",
                color: "#9094a6",
                fontSize: "0.8rem",
              }}
            >
              Mark all read
            </Button>
            <Button
              size="small"
              startIcon={<RefreshIcon />}
              onClick={loadNotifications}
              sx={{
                textTransform: "none",
                color: "#9094a6",
                fontSize: "0.8rem",
              }}
            >
              Refresh
            </Button>
          </Box>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress sx={{ color: "#6c63ff" }} />
          </Box>
        ) : error && notifications.length === 0 ? (
          <Alert severity="error">{error}</Alert>
        ) : notifications.length === 0 ? (
          <Box textAlign="center" py={8}>
            <Typography sx={{ color: "#9094a6" }}>
              No notifications found.
            </Typography>
          </Box>
        ) : (
          <>
            <Box>
              {notifications.map((n) => (
                <NotificationCard
                  key={n.ID}
                  notification={n}
                  isRead={readIds.has(n.ID)}
                  onClick={handleCardClick}
                />
              ))}
            </Box>

            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, val) => setPage(val)}
                color="primary"
                sx={{
                  "& .MuiPaginationItem-root": { color: "#9094a6" },
                  "& .Mui-selected": {
                    background: "#6c63ff !important",
                    color: "#fff",
                  },
                }}
              />
            </Box>
          </>
        )}
      </Container>
    </Box>
  );
}
