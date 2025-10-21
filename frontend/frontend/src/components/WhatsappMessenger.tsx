import React, { useState } from "react";
import {
  Box,
  Tabs,
  Tab,
  TextField,
  Button,
  Typography,
  Snackbar,
  Alert,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  CircularProgress,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import SmsIcon from "@mui/icons-material/Sms";
import { sendSingleMessage, sendBulkMessages, sendSingleSMS, sendBulkSMS } from "../api/api";

const WhatsappMessenger: React.FC = () => {
  const [messageType, setMessageType] = useState<"whatsapp" | "sms">("whatsapp");
  const [tabValue, setTabValue] = useState(0);
  const [mobileNumber, setMobileNumber] = useState("");
  const [singleMessage, setSingleMessage] = useState("");
  const [singleMedia, setSingleMedia] = useState<File[]>([]);
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkMessage, setBulkMessage] = useState("");
  const [bulkMedia, setBulkMedia] = useState<File[]>([]);

  const [results, setResults] = useState<
    { number: string; status: string; error?: string }[]
  >([]);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info",
  });

  const [loading, setLoading] = useState(false); // ✅ New loading state

  const showSnackbar = (message: string, severity: "success" | "error" | "info") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setResults([]);
  };

  const isMobileValid = (): boolean => /^[0-9]{10,15}$/.test(mobileNumber);

  // ✅ Single message handler with loader
  const handleSingleSubmit = async () => {
    if (!isMobileValid()) {
      showSnackbar("Please enter a valid mobile number (10–15 digits).", "error");
      return;
    }

    setLoading(true);
    try {
      const result = messageType === "whatsapp"
        ? await sendSingleMessage(mobileNumber, singleMessage)
        : await sendSingleSMS(mobileNumber, singleMessage);
      console.log("Single Message Sent:", result);
      setResults([{ number: mobileNumber, status: result.status }]);
      showSnackbar(`${messageType === "whatsapp" ? "WhatsApp" : "SMS"} sent successfully!`, "success");
      setSingleMessage("");
      setMobileNumber("");
      setSingleMedia([]);
    } catch (error) {
      console.error(error);
      showSnackbar(`Failed to send ${messageType === "whatsapp" ? "WhatsApp" : "SMS"}.`, "error");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Bulk message handler with loader
  const handleBulkSubmit = async () => {
    if (!bulkFile || bulkMessage.trim().length < 10) {
      showSnackbar("Please upload a valid file and enter a message.", "error");
      return;
    }

    setLoading(true);
    try {
      const result = messageType === "whatsapp"
        ? await sendBulkMessages(bulkFile, bulkMessage)
        : await sendBulkSMS(bulkFile, bulkMessage);
      console.log("Bulk Message Sent:", result);

      if (result && result.results) {
        setResults(
          result.results.map((r: any) => ({
            number: r.number,
            status: r.status,
            error: r.error || "",
          }))
        );
      }

      showSnackbar(`Bulk ${messageType === "whatsapp" ? "WhatsApp" : "SMS"} messages processed successfully!`, "success");
      setBulkMessage("");
      setBulkFile(null);
      setBulkMedia([]);
    } catch (error) {
      console.error(error);
      showSnackbar(`Failed to send bulk ${messageType === "whatsapp" ? "WhatsApp" : "SMS"} messages.`, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        width: "80%",
        mx: "auto",
        mt: 4,
        bgcolor: "#fff",
        p: 4,
        borderRadius: 2,
        boxShadow: 2,
      }}
    >
      <Typography variant="h6" sx={{ flexGrow: 1, mb: 2 }}>
        Multi-Channel Messenger
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
        <ToggleButtonGroup
          value={messageType}
          exclusive
          onChange={(_, newType) => {
            if (newType !== null) {
              setMessageType(newType);
              setResults([]);
            }
          }}
          aria-label="message type"
        >
          <ToggleButton value="whatsapp" aria-label="whatsapp">
            <WhatsAppIcon sx={{ mr: 1 }} />
            WhatsApp
          </ToggleButton>
          <ToggleButton value="sms" aria-label="sms">
            <SmsIcon sx={{ mr: 1 }} />
            SMS
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        centered
        textColor="primary"
        indicatorColor="primary"
      >
        <Tab label="Single Message" />
        <Tab label="Bulk Message" />
      </Tabs>

      {/* SINGLE MESSAGE TAB */}
      {tabValue === 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Send Single {messageType === "whatsapp" ? "WhatsApp" : "SMS"}
          </Typography>

          <TextField
            label="Mobile Number"
            fullWidth
            margin="normal"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            error={mobileNumber !== "" && !isMobileValid()}
            helperText={
              mobileNumber !== "" && !isMobileValid()
                ? "Enter a valid number (10–15 digits)"
                : ""
            }
          />

          <TextField
            label="Enter Message"
            fullWidth
            multiline
            rows={4}
            margin="normal"
            value={singleMessage}
            onChange={(e) => setSingleMessage(e.target.value)}
          />

          <Button
            variant="outlined"
            component="label"
            startIcon={<UploadFileIcon />}
            sx={{ mb: 2 }}
          >
            Attach Media
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={(e) =>
                e.target.files && setSingleMedia(Array.from(e.target.files))
              }
              style={{ display: "none" }}
            />
          </Button>

          <Typography variant="body2" color="text.secondary">
            {singleMedia.length} file(s) selected
          </Typography>

          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            disabled={!isMobileValid() || singleMessage.trim().length < 10 || loading}
            onClick={handleSingleSubmit}
            startIcon={messageType === "whatsapp" ? <WhatsAppIcon /> : <SmsIcon />}
          >
            {loading ? (
              <>
                <CircularProgress size={20} sx={{ color: "#fff", mr: 1 }} />
                Sending...
              </>
            ) : (
              `Send ${messageType === "whatsapp" ? "WhatsApp" : "SMS"}`
            )}
          </Button>
        </Box>
      )}

      {/* BULK MESSAGE TAB */}
      {tabValue === 1 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Send Bulk {messageType === "whatsapp" ? "WhatsApp" : "SMS"}
          </Typography>

          <Button
            variant="outlined"
            component="label"
            startIcon={<UploadFileIcon />}
            sx={{ mb: 2 }}
          >
            Upload Excel File
            <input
              type="file"
              accept=".xls,.xlsx"
              onChange={(e) => e.target.files && setBulkFile(e.target.files[0])}
              style={{ display: "none" }}
            />
          </Button>

          <Typography variant="body2" color="text.secondary">
            {bulkFile ? bulkFile.name : "No file selected"}
          </Typography>

          <TextField
            label="Enter Bulk Message"
            fullWidth
            multiline
            rows={4}
            margin="normal"
            value={bulkMessage}
            onChange={(e) => setBulkMessage(e.target.value)}
          />

          <Button
            variant="outlined"
            component="label"
            startIcon={<UploadFileIcon />}
            sx={{ mb: 2 }}
          >
            Attach Media
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={(e) =>
                e.target.files && setBulkMedia(Array.from(e.target.files))
              }
              style={{ display: "none" }}
            />
          </Button>

          <Typography variant="body2" color="text.secondary">
            {bulkMedia.length} file(s) selected
          </Typography>

          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            disabled={!bulkFile || bulkMessage.trim().length < 10 || loading}
            onClick={handleBulkSubmit}
            startIcon={messageType === "whatsapp" ? <WhatsAppIcon /> : <SmsIcon />}
          >
            {loading ? (
              <>
                <CircularProgress size={20} sx={{ color: "#fff", mr: 1 }} />
                Sending...
              </>
            ) : (
              `Send Bulk ${messageType === "whatsapp" ? "WhatsApp" : "SMS"}`
            )}
          </Button>
        </Box>
      )}

      {/* RESULTS TABLE */}
      {results.length > 0 && (
        <Paper sx={{ mt: 4, overflowX: "auto" }}>
          <Typography variant="h6" sx={{ p: 2 }}>
            Message Results
          </Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Number</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Error</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {results.map((r, i) => (
                <TableRow key={i}>
                  <TableCell>{r.number}</TableCell>
                  <TableCell
                    sx={{
                      color:
                        r.status === "success"
                          ? "green"
                          : r.status === "failed"
                          ? "red"
                          : "inherit",
                    }}
                  >
                    {r.status}
                  </TableCell>
                  <TableCell>
                    {r.error ? r.error.slice(0, 80) + "..." : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      {/* ✅ Snackbar moved to TOP */}
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
    </Box>
  );
};

export default WhatsappMessenger;
