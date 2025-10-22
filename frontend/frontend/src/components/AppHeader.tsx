import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Tabs,
  Tab,
  Box,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import ListAltIcon from "@mui/icons-material/ListAlt";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import Logo from "../assets/sonipixeLogo2.png";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import { useAuth } from "../contexts/AuthContext";

const AppHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleTabChange = (_: React.SyntheticEvent, newValue: string) => {
    navigate(newValue);
  };

  const handleLogout = () => {
    logout();
    navigate("/staff-login");
    setDrawerOpen(false);
  };

  const handleLogin = () => {
    navigate("/staff-login");
    setDrawerOpen(false);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setDrawerOpen(false);
  };

  const currentPath = location.pathname;

  const menuItems = [
    { label: "Raise Ticket", icon: <ConfirmationNumberIcon />, path: "/", showAlways: true },
    { label: "Messenger", icon: <WhatsAppIcon />, path: "/messenger", showAlways: false },
    { label: "View Tickets", icon: <ListAltIcon />, path: "/view-tickets", showAlways: false },
    { label: "Admin Panel", icon: <AdminPanelSettingsIcon />, path: "/admin", showAlways: false, adminOnly: true },
  ];

  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          sx={{ mr: { xs: 1, sm: 2 } }}
          onClick={() => navigate(isAuthenticated ? "/messenger" : "/")}
        >
          <img
            src={Logo}
            alt="Logo"
            style={{ width: 40, height: 40, borderRadius: "50%" }}
          />
        </IconButton>
        <Typography variant="h6" sx={{ mr: { xs: 1, md: 4 }, display: { xs: "none", sm: "block" } }}>
          Sonipixel
        </Typography>

        {/* Mobile Menu */}
        {isMobile ? (
          <>
            <Box sx={{ flexGrow: 1 }} />
            <IconButton
              color="inherit"
              onClick={() => setDrawerOpen(true)}
              edge="end"
            >
              <MenuIcon />
            </IconButton>
            <Drawer
              anchor="right"
              open={drawerOpen}
              onClose={() => setDrawerOpen(false)}
            >
              <Box sx={{ width: 250, pt: 2 }}>
                <List>
                  {menuItems.map((item) => {
                    const shouldShow = item.showAlways ||
                      (isAuthenticated && (!item.adminOnly || user?.role === "admin"));

                    return shouldShow ? (
                      <ListItem
                        key={item.path}
                        onClick={() => handleNavigate(item.path)}
                        sx={{
                          cursor: "pointer",
                          backgroundColor: currentPath === item.path ? "rgba(0, 0, 0, 0.08)" : "transparent",
                          "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.04)" },
                        }}
                      >
                        <ListItemIcon>{item.icon}</ListItemIcon>
                        <ListItemText primary={item.label} />
                      </ListItem>
                    ) : null;
                  })}
                  <ListItem
                    onClick={isAuthenticated ? handleLogout : handleLogin}
                    sx={{
                      cursor: "pointer",
                      mt: 2,
                      borderTop: "1px solid #e0e0e0",
                      "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.04)" },
                    }}
                  >
                    <ListItemIcon>
                      {isAuthenticated ? <LogoutIcon /> : <LoginIcon />}
                    </ListItemIcon>
                    <ListItemText primary={isAuthenticated ? "Logout" : "Login"} />
                  </ListItem>
                </List>
              </Box>
            </Drawer>
          </>
        ) : (
          <>
            {/* Desktop Menu */}
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
                {isAuthenticated && user?.role === "admin" && (
                  <Tab
                    icon={<AdminPanelSettingsIcon />}
                    iconPosition="start"
                    label="Admin Panel"
                    value="/admin"
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
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default AppHeader;
