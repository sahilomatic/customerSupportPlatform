import React from "react";
import AppHeader from "./components/AppHeader";
import WhatsappMessenger from "./components/WhatsappMessenger";
import { Box } from "@mui/material";

const App: React.FC = () => {
  return (
    <Box sx={{ bgcolor: "#f5f5f5", minHeight: "100vh" }}>
      <AppHeader />
      <WhatsappMessenger />
    </Box>
  );
};

export default App;
