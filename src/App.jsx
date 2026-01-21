import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Services from './pages/Services';
import Providers from './pages/Providers';

const theme = createTheme({
  palette: {
    primary: { main: '#171C4F' }, // Using brandBlue
    secondary: { main: '#D5C3B8' }, // Using brandBeige
  },
});

import AdminLayout from './components/AdminLayout';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<AdminLayout><Dashboard /></AdminLayout>} />
          <Route path="/services" element={<AdminLayout><Services /></AdminLayout>} />
          <Route path="/providers" element={<AdminLayout><Providers /></AdminLayout>} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
