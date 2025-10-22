import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import AppHeader from "./components/AppHeader";
import WhatsappMessenger from "./components/WhatsappMessenger";
import RaiseTicket from "./components/RaiseTicket";
import ViewTickets from "./components/ViewTickets";
import StaffLogin from "./components/StaffLogin";
import StaffRegister from "./components/StaffRegister";
import AdminPanel from "./components/AdminPanel";
import ProtectedRoute from "./components/ProtectedRoute";
import { Box } from "@mui/material";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Box sx={{ bgcolor: "#f5f5f5", minHeight: "100vh" }}>
          <Routes>
            {/* Public route for raising tickets - Default page */}
            <Route
              path="/"
              element={
                <>
                  <AppHeader />
                  <RaiseTicket />
                </>
              }
            />

            {/* Staff Authentication routes */}
            <Route path="/staff-login" element={<StaffLogin />} />
            <Route path="/staff-register" element={<StaffRegister />} />

            {/* Legacy login route - redirects to staff-login */}
            <Route path="/login" element={<Navigate to="/staff-login" replace />} />

            {/* Protected routes */}
            <Route
              path="/messenger"
              element={
                <ProtectedRoute>
                  <AppHeader />
                  <WhatsappMessenger />
                </ProtectedRoute>
              }
            />
            <Route
              path="/view-tickets"
              element={
                <ProtectedRoute>
                  <AppHeader />
                  <ViewTickets />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AppHeader />
                  <AdminPanel />
                </ProtectedRoute>
              }
            />

            {/* Redirect any unknown routes to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Box>
      </Router>
    </AuthProvider>
  );
};

export default App;
