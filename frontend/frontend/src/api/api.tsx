import axios from "axios";

export interface SingleMessageResponse {
  status: string;
  sid?: string;
  error?: string;
}

export interface BulkMessageResponse {
  status: string;
  total_numbers: number;
  successful: number;
  failed: number;
  invalid_numbers: string[];
  results: any[];
  message_sent: string;
}

// Get API base URL from env, fallback to localhost
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1/whatsapp`,
  headers: { "Content-Type": "multipart/form-data" },
});

/**
 * Send a single WhatsApp message
 * @param media Optional media file (image/video/document)
 */
export const sendSingleMessage = async (
  mobile_number: string,
  message: string,
  media?: File
): Promise<SingleMessageResponse> => {
  const formData = new FormData();
  formData.append("mobile_number", mobile_number);
  formData.append("message", message);

  if (media) {
    formData.append("media", media);
  }

  const res = await apiClient.post("/send-single", formData);
  return res.data;
};

/**
 * Send bulk WhatsApp messages
 * @param media Optional media file (image/video/document)
 */
export const sendBulkMessages = async (
  file: File,
  message: string,
  media?: File
): Promise<BulkMessageResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("message", message);

  if (media) {
    formData.append("media", media);
  }

  const res = await apiClient.post("/send-bulk", formData);
  return res.data;
};
