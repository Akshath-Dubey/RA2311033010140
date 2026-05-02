import React from "react";
import {
  AppBar, Toolbar, Typography, Button, Box, Badge,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import StarIcon from "@mui/icons-material/Star";
import Link from "next/link";
import { useRouter } from "next/router";

interface NavbarProps {
  unreadCount?: number;
}

export default function Navbar({ unreadCount = 0 }: NavbarProps) {
  const router = useRouter();

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: "rgba(26, 29, 39, 0.95)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(108, 99, 255, 0.2)",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", px: { xs: 2, md: 4 } }}>
        <Box display="flex" alignItems="center" gap={1}>
          <NotificationsIcon sx={{ color: "#6c63ff", fontSize: 28 }} />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              background: "linear-gradient(135deg, #6c63ff, #ff6584)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-0.02em",
            }}
          >
            CampusNotify
          </Typography>
        </Box>

        <Box display="flex" gap={1}>
          <Link href="/" passHref>
            <Button
              startIcon={
                <Badge badgeContent={unreadCount} color="error" max={99}>
                  <NotificationsIcon />
                </Badge>
              }
              variant={router.pathname === "/" ? "contained" : "text"}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                ...(router.pathname === "/"
                  ? { background: "linear-gradient(135deg, #6c63ff, #5a52e0)" }
                  : { color: "#9094a6", "&:hover": { color: "#e8eaf0" } }),
              }}
            >
              All Notifications
            </Button>
          </Link>

          <Link href="/priority" passHref>
            <Button
              startIcon={<StarIcon />}
              variant={router.pathname === "/priority" ? "contained" : "text"}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                ...(router.pathname === "/priority"
                  ? { background: "linear-gradient(135deg, #6c63ff, #5a52e0)" }
                  : { color: "#9094a6", "&:hover": { color: "#e8eaf0" } }),
              }}
            >
              Priority Inbox
            </Button>
          </Link>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
