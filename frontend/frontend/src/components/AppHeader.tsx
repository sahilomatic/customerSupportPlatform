import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AppBar, Toolbar, Typography, IconButton, Tabs, Tab, Box, Button } from "@mui/material";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import ListAltIcon from "@mui/icons-material/ListAlt";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import Logo from "../assets/sonipixeLogo2.png";
import { useAuth } from "../contexts/AuthContext";

const AppHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();

  const handleTabChange = (_: React.SyntheticEvent, newValue: string) => {
    navigate(newValue);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  // Get current route for tab highlighting
  const currentPath = location.pathname;

  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        <IconButton edge="start" color="inherit" sx={{ mr: 2 }} onClick={() => navigate(isAuthenticated ? "/messenger" : "/")}>
          <img
            src={Logo}
            alt="Logo"
            style={{ width: 40, height: 40, borderRadius: "50%" }}
          />
        </IconButton>
        <Typography variant="h6" sx={{ mr: 4 }}>
          Sonipixel
        </Typography>
        <Box sx={{ flexGrow: 1 }}>
          <Tabs
            value={currentPath}
            onChange={handleTabChange}
            textColor="inherit"
            TabIndicatorProps={{
              style: {
                backgroundColor: "white",
              },
            }}
          >
            <Tab
              icon={<ConfirmationNumberIcon />}
              iconPosition="start"
              label="Raise Ticket"
              value="/"
              sx={{ color: "white", minHeight: 64 }}
            />
            {isAuthenticated && (
              <Tab
                icon={<WhatsAppIcon />}
                iconPosition="start"
                label="Messenger"
                value="/messenger"
                sx={{ color: "white", minHeight: 64 }}
              />
            )}
            {isAuthenticated && (
              <Tab
                icon={<ListAltIcon />}
                iconPosition="start"
                label="View Tickets"
                value="/view-tickets"
                sx={{ color: "white", minHeight: 64 }}
              />
            )}
          </Tabs>
        </Box>
        {isAuthenticated ? (
          <Button
            color="inherit"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{ ml: 2 }}
          >
            Logout
          </Button>
        ) : (
          <Button
            color="inherit"
            startIcon={<LoginIcon />}
            onClick={handleLogin}
            sx={{ ml: 2 }}
          >
            Login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default AppHeader;
