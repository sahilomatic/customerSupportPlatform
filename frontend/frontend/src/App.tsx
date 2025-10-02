import React from 'react';
import logo from './assets/sonipixeLogo2.png';
import './App.css';
import WhatsAppMessenger from './components/whatsappMessenger/whatsappMessenger';
import { AppBar, Toolbar, Typography, Box } from '@mui/material';

function App() {
  return (
    <div className="App">
      {/* Header */}
      <AppBar position="static" >
        <Toolbar>
          <Box
            component="img"
            src={logo}
            alt="Logo"
            sx={{ height: 50, mr: 2, width: 60 }} // Adjust logo size & margin
          />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Customer Support Platform
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ mt: 4, px: 2 }}>
        <WhatsAppMessenger />
      </Box>
    </div>
  );
}

export default App;
