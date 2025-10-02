import React, { useState } from "react";
import {
  sendSingleMessage,
  sendBulkMessages,
  SingleMessageResponse,
  BulkMessageResponse,
} from "../../api/api";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Snackbar,
} from "@mui/material";
import MuiAlert, { AlertColor } from "@mui/material/Alert";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return <div hidden={value !== index}>{value === index && <Box sx={{ pt: 2 }}>{children}</Box>}</div>;
};

// Custom Snackbar component
const AlertSnackbar = React.forwardRef<HTMLDivElement, any>(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const WhatsAppMessenger: React.FC = () => {
  const [tabIndex, setTabIndex] = useState(0);

  // Snackbar state
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as AlertColor });

  // Single message state
  const [singleNumber, setSingleNumber] = useState("");
  const [singleMessage, setSingleMessage] = useState("");
  const [singleMedia, setSingleMedia] = useState<File | null>(null);
  const [singleResult, setSingleResult] = useState<SingleMessageResponse | null>(null);
  const [singleLoading, setSingleLoading] = useState(false);

  // Bulk message state
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkMessage, setBulkMessage] = useState("");
  const [bulkMedia, setBulkMedia] = useState<File | null>(null);
  const [bulkResult, setBulkResult] = useState<BulkMessageResponse | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  const showSnackbar = (message: string, severity: AlertColor = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSingleResult(null);

    if (!singleNumber.trim()) {
      showSnackbar("Mobile number is required!", "error");
      return;
    }

    if (!singleMessage.trim()) {
      showSnackbar("Message field is required for single messaging!", "error");
      return;
    }

    setSingleLoading(true);
    try {
      const res = await sendSingleMessage(singleNumber, singleMessage, singleMedia || undefined);
      setSingleResult(res);
      showSnackbar("Message sent successfully!", "success");
    } catch (err: any) {
      console.error(err);
      setSingleResult({ status: "failed", error: err.message });
      showSnackbar("Failed to send message!", "error");
    } finally {
      setSingleLoading(false);
    }
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBulkResult(null);

    if (!bulkFile) {
      showSnackbar("Please select an Excel file!", "error");
      return;
    }

    if (!bulkMessage.trim()) {
      showSnackbar("Message field is required for bulk messaging!", "error");
      return;
    }

    setBulkLoading(true);
    try {
      const res = await sendBulkMessages(bulkFile, bulkMessage, bulkMedia || undefined);
      setBulkResult(res);
      showSnackbar("Bulk messages sent successfully!", "success");
    } catch (err: any) {
      console.error(err);
      setBulkResult({
        status: "failed",
        total_numbers: 0,
        successful: 0,
        failed: 0,
        invalid_numbers: [],
        results: [],
        message_sent: "",
      });
      showSnackbar("Failed to send bulk messages!", "error");
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 4 }}>
      {/* Global Snackbar Notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <AlertSnackbar severity={snackbar.severity}>{snackbar.message}</AlertSnackbar>
      </Snackbar>
      <Typography variant="h4" align="center" gutterBottom>
        Sonipixel WhatsApp Messenger
      </Typography>

      <Paper elevation={3}>
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Single Message" />
          <Tab label="Bulk Message" />
        </Tabs>

        {/* Single Message Tab */}
        <TabPanel value={tabIndex} index={0}>
          <Box component="form" onSubmit={handleSingleSubmit} sx={{ p: 3 }}>
            <TextField
              label="Mobile Number"
              variant="outlined"
              fullWidth
              margin="normal"
              value={singleNumber}
              onChange={(e) => setSingleNumber(e.target.value)}
              required
            />
            <TextField
              label="Message"
              variant="outlined"
              fullWidth
              margin="normal"
              multiline
              minRows={3}
              value={singleMessage}
              onChange={(e) => setSingleMessage(e.target.value)}
            />

            <Button variant="contained" component="label" sx={{ mt: 2, mb: 1 }} fullWidth>
              Upload Media
              <input type="file" hidden onChange={(e) => setSingleMedia(e.target.files?.[0] || null)} />
            </Button>
            {singleMedia && <Typography variant="body2">{singleMedia.name}</Typography>}

            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
              disabled={singleLoading}
              startIcon={singleLoading ? <CircularProgress size={20} /> : null}
            >
              {singleLoading ? "Sending..." : "Send Single Message"}
            </Button>

            {singleResult && (
              <Alert
                severity={singleResult.status === "success" ? "success" : "error"}
                sx={{ mt: 2, whiteSpace: "pre-wrap" }}
              >
                {JSON.stringify(singleResult, null, 2)}
              </Alert>
            )}
          </Box>
        </TabPanel>

        {/* Bulk Message Tab */}
        <TabPanel value={tabIndex} index={1}>
          <Box component="form" onSubmit={handleBulkSubmit} sx={{ p: 3 }}>
            <Button variant="contained" component="label" sx={{ mb: 2 }} fullWidth>
              Upload Excel File
              <input type="file" accept=".xlsx,.xls" hidden onChange={(e) => setBulkFile(e.target.files?.[0] || null)} />
            </Button>
            {bulkFile && <Typography variant="body2" sx={{ mb: 1 }}>{bulkFile.name}</Typography>}

            <TextField
              label="Message"
              variant="outlined"
              fullWidth
              margin="normal"
              multiline
              minRows={3}
              value={bulkMessage}
              onChange={(e) => setBulkMessage(e.target.value)}
              required
            />

            <Button variant="contained" component="label" sx={{ mb: 2 }} fullWidth>
              Upload Media
              <input type="file" hidden onChange={(e) => setBulkMedia(e.target.files?.[0] || null)} />
            </Button>
            {bulkMedia && <Typography variant="body2">{bulkMedia.name}</Typography>}

            <Button
              type="submit"
              variant="contained"
              color="success"
              sx={{ mt: 2 }}
              disabled={bulkLoading}
              startIcon={bulkLoading ? <CircularProgress size={20} /> : null}
            >
              {bulkLoading ? "Sending..." : "Send Bulk Message"}
            </Button>

            {bulkResult && (
              <Alert
                severity={bulkResult.status === "success" ? "success" : "error"}
                sx={{ mt: 2, whiteSpace: "pre-wrap" }}
              >
                {JSON.stringify(bulkResult, null, 2)}
              </Alert>
            )}
          </Box>
        </TabPanel>
      </Paper>

      
    </Box>
  );
};

export default WhatsAppMessenger;
