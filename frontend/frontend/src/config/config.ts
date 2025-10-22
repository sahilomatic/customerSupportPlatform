// Application Configuration
// This file centralizes all environment variables and configuration settings

export const config = {
  // Google Drive configuration
  gDrive: {
    link: import.meta.env.VITE_GDRIVE_LINK || "https://drive.google.com/drive/folders/1acrdWqZU6UXjp5UK5Rr8c08hup6T9BYG?usp=drive_link",
    alias: import.meta.env.VITE_GDRIVE_ALIAS || "Please download digital pictures from G-drive",
  },

  // Default messages
  messages: {
    // Default WhatsApp/SMS message with proper line breaks
    defaultMessage: (import.meta.env.VITE_DEFAULT_MESSAGE ||
      `Notice of Convocation Photography

Congratulations on your convocation held at the Bar Council on 22 October 2025.
Digital photographs of the event will be available for viewing and download by 30 October 2025 at the following link:
 https://tinyurl.com/BarCouncilPicturesSonipixel

Printed copies of the photographs will be delivered by 15 November 2025.`
    ).replace(/\\n/g, '\n'), // Convert \n strings to actual newlines
  },
};

export default config;
