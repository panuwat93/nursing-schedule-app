import React, { useState } from 'react';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Container,
} from '@mui/material';
import { AdminPanelSettings } from '@mui/icons-material';

interface AdminLoginProps {
  onLogin: (username: string, password: string) => void;
  error?: string;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, error }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <AdminPanelSettings sx={{ fontSize: 32, mr: 2, color: '#2196f3' }} />
            <Typography variant="h5" sx={{ fontFamily: 'Kanit', fontWeight: 'bold' }}>
              เข้าสู่ระบบ ADMIN
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2, fontFamily: 'Kanit' }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="ชื่อผู้ใช้"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              margin="normal"
              required
              sx={{ fontFamily: 'Kanit' }}
              InputLabelProps={{ sx: { fontFamily: 'Kanit' } }}
            />
            
            <TextField
              fullWidth
              label="รหัสผ่าน"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              sx={{ fontFamily: 'Kanit' }}
              InputLabelProps={{ sx: { fontFamily: 'Kanit' } }}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ 
                mt: 3, 
                mb: 2,
                fontFamily: 'Kanit',
                fontWeight: 'bold',
                py: 1.5
              }}
            >
              เข้าสู่ระบบ
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default AdminLogin; 