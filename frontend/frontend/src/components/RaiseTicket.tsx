import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Snackbar,
  Alert,
  CircularProgress,
  Container,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Grid } from "@mui/material"; 
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import SendIcon from "@mui/icons-material/Send";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import InfoIcon from "@mui/icons-material/Info";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { createTicket } from "../api/api";

const RaiseTicket: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    father_name: "",
    address: "",
    pincode: "",
    mobile_number: "",
    event_date: "",
    query: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const [successDialog, setSuccessDialog] = useState(false);
  const [ticketNumber, setTicketNumber] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.father_name.trim()) newErrors.father_name = "Father's name is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";

    if (!formData.pincode.trim()) {
      newErrors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = "Pincode must be 6 digits";
    }

    if (!formData.mobile_number.trim()) {
      newErrors.mobile_number = "Mobile number is required";
    } else if (!/^\d{10,15}$/.test(formData.mobile_number.replace(/\D/g, ""))) {
      newErrors.mobile_number = "Mobile number must be 10-15 digits";
    }

    if (!formData.event_date) {
      newErrors.event_date = "Event date is required";
    }

    if (!formData.query.trim()) {
      newErrors.query = "Query is required";
    } else if (formData.query.trim().length < 10) {
      newErrors.query = "Query must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      setSnackbar({
        open: true,
        message: "Please fix the errors in the form",
        severity: "error",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await createTicket(formData);
      setTicketNumber(result.ticket_number);
      setSuccessDialog(true);

      // Reset form
      setFormData({
        name: "",
        father_name: "",
        address: "",
        pincode: "",
        mobile_number: "",
        event_date: "",
        query: "",
      });
    } catch (error: any) {
      console.error(error);
      setSnackbar({
        open: true,
        message: error.response?.data?.detail || "Failed to create ticket",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleCloseSuccessDialog = () => {
    setSuccessDialog(false);
    setSnackbar({
      open: true,
      message: "Ticket raised successfully!",
      severity: "success",
    });
  };

  const gdriveLink = "https://drive.google.com/drive/folders/1acrdWqZU6UXjp5UK5Rr8c08hup6T9BYG?usp=drive_link";
  const gdriveAlias = "Please download digital pictures from G-drive"

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 2,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <ConfirmationNumberIcon sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: "bold" }}>
              Raise a Support Ticket
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              We're here to help! Fill out the form below and we'll get back to you soon.
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* G-Drive Link Ticker */}
      {gdriveLink && gdriveAlias && (
        <Paper
          elevation={2}
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 2,
            background: "linear-gradient(135deg, #f17049ff 0%, #f37439ff 100%)",
            color: "white",
            display: "flex",
            alignItems: "center",
            gap: 2,
            cursor: "pointer",
            transition: "transform 0.2s",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: 4,
            },
          }}
          onClick={() => window.open(gdriveLink, "_blank")}
        >
          <CloudUploadIcon sx={{ fontSize: 32 }} />
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <InfoIcon sx={{ fontSize: 18 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                Important Notice
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              {gdriveAlias}
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ opacity: 0.9 }}>
            Click to open →
          </Typography>
        </Paper>
      )}

      <Card elevation={3}>
        <CardContent sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={Boolean(errors.name)}
                  helperText={errors.name}
                  variant="outlined"
                  required
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Father's Name"
                  name="father_name"
                  value={formData.father_name}
                  onChange={handleChange}
                  error={Boolean(errors.father_name)}
                  helperText={errors.father_name}
                  variant="outlined"
                  required
                />
              </Grid>

              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  error={Boolean(errors.address)}
                  helperText={errors.address}
                  variant="outlined"
                  multiline
                  rows={2}
                  required
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Pincode"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  error={Boolean(errors.pincode)}
                  helperText={errors.pincode}
                  variant="outlined"
                  inputProps={{ maxLength: 6 }}
                  required
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Mobile Number"
                  name="mobile_number"
                  value={formData.mobile_number}
                  onChange={handleChange}
                  error={Boolean(errors.mobile_number)}
                  helperText={errors.mobile_number}
                  variant="outlined"
                  required
                />
              </Grid>

              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Event Date"
                  name="event_date"
                  type="date"
                  value={formData.event_date}
                  onChange={handleChange}
                  error={Boolean(errors.event_date)}
                  helperText={errors.event_date || "Select the date of your event"}
                  variant="outlined"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  required
                />
              </Grid>

              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Describe Your Query"
                  name="query"
                  value={formData.query}
                  onChange={handleChange}
                  error={Boolean(errors.query)}
                  helperText={errors.query || `${formData.query.length} characters`}
                  variant="outlined"
                  multiline
                  rows={5}
                  required
                  placeholder="Please describe your issue or query in detail..."
                />
              </Grid>

              <Grid size={12}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
                  sx={{
                    py: 1.5,
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
                    },
                  }}
                >
                  {loading ? "Submitting..." : "Submit Ticket"}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      {/* Success Dialog */}
      <Dialog
        open={successDialog}
        onClose={handleCloseSuccessDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: "center", pt: 4 }}>
          <CheckCircleIcon sx={{ fontSize: 60, color: "success.main" }} />
          <Typography variant="h5" sx={{ mt: 2, fontWeight: "bold" }}>
            Ticket Created Successfully!
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ textAlign: "center", pb: 2 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Your ticket has been raised. Please note down your ticket number:
          </Typography>
          <Paper
            elevation={2}
            sx={{
              p: 2,
              backgroundColor: "#f5f5f5",
              display: "inline-block",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                color: "primary.main",
                letterSpacing: 1,
              }}
            >
              {ticketNumber}
            </Typography>
          </Paper>
          <Typography variant="body2" sx={{ mt: 2, color: "text.secondary" }}>
            We will contact you soon regarding your query.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 3 }}>
          <Button
            onClick={handleCloseSuccessDialog}
            variant="contained"
            color="primary"
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default RaiseTicket;
