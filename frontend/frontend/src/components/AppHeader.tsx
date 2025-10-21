import React from "react";
import { AppBar, Toolbar, Typography, IconButton, Tabs, Tab, Box } from "@mui/material";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import ListAltIcon from "@mui/icons-material/ListAlt";
import Logo from "../assets/sonipixeLogo2.png";

interface AppHeaderProps {
  currentPage: string;
  onPageChange: (page: "messenger" | "raise-ticket" | "view-tickets") => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ currentPage, onPageChange }) => {
  const handleTabChange = (_: React.SyntheticEvent, newValue: string) => {
    onPageChange(newValue as "messenger" | "raise-ticket" | "view-tickets");
  };

  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        <IconButton edge="start" color="inherit" sx={{ mr: 2 }}>
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
            value={currentPage}
            onChange={handleTabChange}
            textColor="inherit"
            TabIndicatorProps={{
              style: {
                backgroundColor: "white",
              },
            }}
          >
            <Tab
              icon={<WhatsAppIcon />}
              iconPosition="start"
              label="Messenger"
              value="messenger"
              sx={{ color: "white", minHeight: 64 }}
            />
            <Tab
              icon={<ConfirmationNumberIcon />}
              iconPosition="start"
              label="Raise Ticket"
              value="raise-ticket"
              sx={{ color: "white", minHeight: 64 }}
            />
            <Tab
              icon={<ListAltIcon />}
              iconPosition="start"
              label="View Tickets"
              value="view-tickets"
              sx={{ color: "white", minHeight: 64 }}
            />
          </Tabs>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default AppHeader;
