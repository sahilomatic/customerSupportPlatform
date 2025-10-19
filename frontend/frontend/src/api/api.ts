import axios from "axios";

// Detect environment automatically
const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

// You can change this to your deployed backend URL (e.g. Render, Railway, etc.)
const DEPLOYED_BACKEND_URL = "https://customersupportplatform.onrender.com";
const LOCAL_BACKEND_URL = "http://localhost:8000";

export const API_BASE_URL = isLocalhost ? LOCAL_BACKEND_URL : DEPLOYED_BACKEND_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
});

// 📩 Send single WhatsApp message
export const sendSingleMessage = async (mobileNumber: string, message: string) => {
  const formData = new FormData();
  formData.append("mobile_number", mobileNumber);
  formData.append("message", message);

  const response = await api.post("/whatsapp/send-single", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// 📁 Send bulk WhatsApp messages
export const sendBulkMessages = async (file: File, message: string, columnName = "mobile") => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("message", message);
  formData.append("column_name", columnName);

  const response = await api.post("/whatsapp/send-bulk", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// 🧾 Get setup instructions
export const getSetupInstructions = async () => {
  const response = await api.get("/whatsapp/setup");
  return response.data;
};
