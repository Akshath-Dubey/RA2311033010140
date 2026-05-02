import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Tooltip,
} from "@mui/material";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import AssessmentIcon from "@mui/icons-material/Assessment";
import EventIcon from "@mui/icons-material/Event";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import { Notification } from "../types/notification";

interface Props {
  notification: Notification;
  isRead: boolean;
  onClick: (id: string) => void;
  score?: number;
  rank?: number;
}

const TYPE_CONFIG: Record<
  string,
  { color: string; bg: string; icon: React.ReactNode; label: string }
> = {
  Placement: {
    color: "#4ade80",
    bg: "rgba(74, 222, 128, 0.1)",
    icon: <BusinessCenterIcon sx={{ fontSize: 14 }} />,
    label: "Placement",
  },
  Result: {
    color: "#f59e0b",
    bg: "rgba(245, 158, 11, 0.1)",
    icon: <AssessmentIcon sx={{ fontSize: 14 }} />,
    label: "Result",
  },
  Event: {
    color: "#60a5fa",
    bg: "rgba(96, 165, 250, 0.1)",
    icon: <EventIcon sx={{ fontSize: 14 }} />,
    label: "Event",
  },
};

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function NotificationCard({
  notification,
  isRead,
  onClick,
  score,
  rank,
}: Props) {
  const config = TYPE_CONFIG[notification.Type] ?? TYPE_CONFIG["Event"];

  return (
    <Card
      onClick={() => onClick(notification.ID)}
      sx={{
        mb: 1.5,
        cursor: "pointer",
        background: isRead ? "rgba(26, 29, 39, 0.6)" : "rgba(26, 29, 39, 1)",
        border: isRead
          ? "1px solid rgba(255,255,255,0.05)"
          : `1px solid ${config.color}33`,
        borderLeft: isRead ? undefined : `3px solid ${config.color}`,
        borderRadius: 2,
        transition: "all 0.2s ease",
        opacity: isRead ? 0.65 : 1,
        "&:hover": {
          transform: "translateY(-1px)",
          boxShadow: `0 4px 20px ${config.color}22`,
          opacity: 1,
        },
      }}
    >
      <CardContent sx={{ py: "12px !important", px: 2 }}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          gap={2}
        >
          <Box
            display="flex"
            alignItems="center"
            gap={1.5}
            flex={1}
            minWidth={0}
          >
            {rank && (
              <Typography
                sx={{
                  fontSize: "0.75rem",
                  fontWeight: 800,
                  color: config.color,
                  minWidth: 24,
                }}
              >
                #{rank}
              </Typography>
            )}

            {!isRead && (
              <FiberManualRecordIcon
                sx={{ fontSize: 8, color: config.color, flexShrink: 0 }}
              />
            )}

            <Box flex={1} minWidth={0}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: isRead ? 400 : 600,
                  color: isRead ? "#9094a6" : "#e8eaf0",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {notification.Message}
              </Typography>
              <Typography variant="caption" sx={{ color: "#606475" }}>
                {formatTime(notification.Timestamp)}
              </Typography>
            </Box>
          </Box>

          <Box display="flex" alignItems="center" gap={1} flexShrink={0}>
            {score !== undefined && (
              <Tooltip title="Priority score">
                <Typography
                  sx={{
                    fontSize: "0.65rem",
                    color: config.color,
                    fontWeight: 700,
                    background: config.bg,
                    px: 1,
                    py: 0.3,
                    borderRadius: 1,
                  }}
                >
                  {score.toFixed(1)}
                </Typography>
              </Tooltip>
            )}
            <Chip
              icon={<>{config.icon}</>}
              label={config.label}
              size="small"
              sx={{
                background: config.bg,
                color: config.color,
                border: `1px solid ${config.color}44`,
                "& .MuiChip-icon": { color: config.color },
              }}
            />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
