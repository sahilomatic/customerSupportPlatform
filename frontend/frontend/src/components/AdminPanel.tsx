import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
  IconButton,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import ImageIcon from "@mui/icons-material/Image";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

interface Staff {
  id: number;
  username: string;
  name: string;
  father_name: string;
  address: string;
  mobile_number: string;
  role: string;
  is_active: boolean;
  permissions: {
    view_tickets?: boolean;
    manage_tickets?: boolean;
    send_messages?: boolean;
  };
}

const AdminPanel: React.FC = () => {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
  const [permissions, setPermissions] = useState({
    view_tickets: false,
    manage_tickets: false,
    send_messages: false,
  });

  const { user, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role !== "admin") {
      navigate("/messenger");
      return;
    }
    fetchStaffList();
  }, [user, navigate]);

  const fetchStaffList = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/v1/auth/admin/staff`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setStaffList(response.data);
    } catch (err: any) {
      setError("Failed to fetch staff list");
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (staffId: number) => {
    try {
      await axios.patch(
        `${API_URL}/api/v1/auth/admin/staff/${staffId}/activate`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSuccess("Staff member activated successfully");
      fetchStaffList();
    } catch (err: any) {
      setError("Failed to activate staff member");
    }
  };

  const handleDeactivate = async (staffId: number) => {
    try {
      await axios.patch(
        `${API_URL}/api/v1/auth/admin/staff/${staffId}/deactivate`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSuccess("Staff member deactivated successfully");
      fetchStaffList();
    } catch (err: any) {
      setError("Failed to deactivate staff member");
    }
  };

  const handleMakeAdmin = async (staffId: number) => {
    try {
      await axios.patch(
        `${API_URL}/api/v1/auth/admin/staff/${staffId}/make-admin`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSuccess("Staff member is now an admin");
      fetchStaffList();
    } catch (err: any) {
      setError("Failed to make staff member admin");
    }
  };

  const handleDelete = async (staffId: number) => {
    if (!confirm("Are you sure you want to delete this staff member?")) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/api/v1/auth/admin/staff/${staffId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSuccess("Staff member deleted successfully");
      fetchStaffList();
    } catch (err: any) {
      setError("Failed to delete staff member");
    }
  };

  const openPermissionsDialog = (staff: Staff) => {
    setSelectedStaff(staff);
    setPermissions(staff.permissions);
    setPermissionsDialogOpen(true);
  };

  const handleUpdatePermissions = async () => {
    if (!selectedStaff) return;

    try {
      await axios.patch(
        `${API_URL}/api/v1/auth/admin/staff/${selectedStaff.id}/permissions`,
        { permissions },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSuccess("Permissions updated successfully");
      setPermissionsDialogOpen(false);
      fetchStaffList();
    } catch (err: any) {
      setError("Failed to update permissions");
    }
  };

  const handleViewAadhar = async (staffId: number) => {
    window.open(`${API_URL}/api/v1/auth/admin/staff/${staffId}/aadhar`, "_blank");
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Paper
        elevation={3}
        sx={{
          p: 3,
          mb: 3,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
        }}
      >
        <Typography variant="h4" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AdminPanelSettingsIcon sx={{ fontSize: 40 }} />
          Admin Panel - Staff Management
        </Typography>
      </Paper>

      {error && (
        <Alert severity="error" onClose={() => setError("")} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" onClose={() => setSuccess("")} sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead sx={{ bgcolor: "#f5f5f5" }}>
            <TableRow>
              <TableCell><strong>Username</strong></TableCell>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Father's Name</strong></TableCell>
              <TableCell><strong>Mobile</strong></TableCell>
              <TableCell><strong>Role</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {staffList.map((staff) => (
              <TableRow key={staff.id} hover>
                <TableCell>{staff.username}</TableCell>
                <TableCell>{staff.name}</TableCell>
                <TableCell>{staff.father_name}</TableCell>
                <TableCell>{staff.mobile_number}</TableCell>
                <TableCell>
                  <Chip
                    label={staff.role}
                    color={staff.role === "admin" ? "secondary" : "default"}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={staff.is_active ? "Active" : "Inactive"}
                    color={staff.is_active ? "success" : "error"}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    {!staff.is_active ? (
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircleIcon />}
                        onClick={() => handleActivate(staff.id)}
                      >
                        Activate
                      </Button>
                    ) : (
                      <Button
                        size="small"
                        variant="contained"
                        color="error"
                        startIcon={<CancelIcon />}
                        onClick={() => handleDeactivate(staff.id)}
                      >
                        Deactivate
                      </Button>
                    )}

                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={() => openPermissionsDialog(staff)}
                    >
                      Permissions
                    </Button>

                    {staff.role !== "admin" && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="secondary"
                        startIcon={<AdminPanelSettingsIcon />}
                        onClick={() => handleMakeAdmin(staff.id)}
                      >
                        Make Admin
                      </Button>
                    )}

                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleViewAadhar(staff.id)}
                    >
                      <ImageIcon />
                    </IconButton>

                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(staff.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Permissions Dialog */}
      <Dialog
        open={permissionsDialogOpen}
        onClose={() => setPermissionsDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Edit Permissions - {selectedStaff?.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={permissions.view_tickets || false}
                  onChange={(e) =>
                    setPermissions({ ...permissions, view_tickets: e.target.checked })
                  }
                />
              }
              label="View Tickets"
            />
            <br />
            <FormControlLabel
              control={
                <Checkbox
                  checked={permissions.manage_tickets || false}
                  onChange={(e) =>
                    setPermissions({ ...permissions, manage_tickets: e.target.checked })
                  }
                />
              }
              label="Manage Tickets"
            />
            <br />
            <FormControlLabel
              control={
                <Checkbox
                  checked={permissions.send_messages || false}
                  onChange={(e) =>
                    setPermissions({ ...permissions, send_messages: e.target.checked })
                  }
                />
              }
              label="Send Messages"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPermissionsDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdatePermissions}>
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminPanel;
