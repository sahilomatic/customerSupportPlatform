import React, { useState } from "react";
import {
  Box,
  Tabs,
  Tab,
  TextField,
  Button,
  Typography,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { sendSingleMessage, sendBulkMessages } from "../api/api";

const WhatsappMessenger: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [mobileNumber, setMobileNumber] = useState("");
  const [singleMessage, setSingleMessage] = useState("");
  const [singleMedia, setSingleMedia] = useState<File[]>([]);
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkMessage, setBulkMessage] = useState("");
  const [bulkMedia, setBulkMedia] = useState<File[]>([]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSingleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setSingleMedia(Array.from(e.target.files));
  };

  const handleBulkMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setBulkMedia(Array.from(e.target.files));
  };

  const handleBulkFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setBulkFile(e.target.files[0]);
  };

  const handleSingleMessageChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSingleMessage(e.target.value);
  };

  const handleBulkMessageChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setBulkMessage(e.target.value);
  };

  const handleMobileNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMobileNumber(e.target.value);
  };

  // Simple validation for mobile number
  const isMobileValid = (): boolean => {
    const regex = /^[0-9]{10,15}$/; // 10 to 15 digits
    return regex.test(mobileNumber);
  };

  const handleSingleSubmit = async () => {
    if (!isMobileValid()) {
      alert("Please enter a valid mobile number (10-15 digits).");
      return;
    }

    try {
      const result = await sendSingleMessage(mobileNumber, singleMessage);
      console.log("Single Message Sent:", result, singleMedia);
      alert("Message sent successfully!");
      setSingleMessage("");
      setMobileNumber("");
      setSingleMedia([]);
    } catch (error) {
      console.error(error);
      alert("Failed to send message.");
    }
  };

  const handleBulkSubmit = async () => {
    if (!bulkFile || bulkMessage.trim().length < 10) return;

    try {
      const result = await sendBulkMessages(bulkFile, bulkMessage);
      console.log("Bulk Message Sent:", result, bulkMedia);
      alert("Bulk messages sent successfully!");
      setBulkMessage("");
      setBulkFile(null);
      setBulkMedia([]);
    } catch (error) {
      console.error(error);
      alert("Failed to send bulk messages.");
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
      <Typography variant="h6" sx={{ flexGrow: 1 }}>
        Whatsapp Messenger
      </Typography>

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

      {/* Single Message Tab */}
      {tabValue === 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Send Single Message
          </Typography>

          <TextField
            label="Mobile Number"
            fullWidth
            margin="normal"
            value={mobileNumber}
            onChange={handleMobileNumberChange}
            error={mobileNumber !== "" && !isMobileValid()}
            helperText={
              mobileNumber !== "" && !isMobileValid()
                ? "Enter a valid number (10-15 digits)"
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
            onChange={handleSingleMessageChange}
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
              onChange={handleSingleMediaUpload}
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
            disabled={
              !isMobileValid() || singleMessage.trim().length < 10
            }
            onClick={handleSingleSubmit}
          >
            Send Message
          </Button>
        </Box>
      )}

      {/* Bulk Message Tab */}
      {tabValue === 1 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Send Bulk Messages
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
              onChange={handleBulkFileUpload}
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
            onChange={handleBulkMessageChange}
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
              onChange={handleBulkMediaUpload}
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
            disabled={!bulkFile || bulkMessage.trim().length < 10}
            onClick={handleBulkSubmit}
          >
            Send Bulk Messages
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default WhatsappMessenger;
