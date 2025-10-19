import React from "react";
import { AppBar, Toolbar, Typography, IconButton } from "@mui/material";
import Logo from "../assets/sonipixeLogo2.png";

const AppHeader: React.FC = () => {
  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        <IconButton edge="start" color="inherit" sx={{ mr: 2 }}>
          {/* Replace /logo.png with your logo path */}
          <img
            src={Logo}
            alt="Logo"
            style={{ width: 40, height: 40, borderRadius: "50%" }}
          />
        </IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Sonipixel
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default AppHeader;
