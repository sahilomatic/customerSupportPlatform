import React, { useState } from "react";
import AppHeader from "./components/AppHeader";
import WhatsappMessenger from "./components/WhatsappMessenger";
import RaiseTicket from "./components/RaiseTicket";
import ViewTickets from "./components/ViewTickets";
import { Box } from "@mui/material";

type Page = "messenger" | "raise-ticket" | "view-tickets";

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>("messenger");

  const renderPage = () => {
    switch (currentPage) {
      case "messenger":
        return <WhatsappMessenger />;
      case "raise-ticket":
        return <RaiseTicket />;
      case "view-tickets":
        return <ViewTickets />;
      default:
        return <WhatsappMessenger />;
    }
  };

  return (
    <Box sx={{ bgcolor: "#f5f5f5", minHeight: "100vh" }}>
      <AppHeader currentPage={currentPage} onPageChange={setCurrentPage} />
      {renderPage()}
    </Box>
  );
};

export default App;
