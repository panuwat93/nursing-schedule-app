import React, { useState } from 'react';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Container,
  Fade,
  Grow,
  Zoom,
  IconButton,
  Tooltip,
} from '@mui/material';
import { AdminPanelSettings, ArrowBack, Security, Person, Lock } from '@mui/icons-material';

interface AdminLoginProps {
  onLogin: (username: string, password: string) => void;
  onBackToLogin?: () => void;
  error?: string;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, onBackToLogin, error }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('********');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #667eea 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        p: 2,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 80%, rgba(30, 60, 114, 0.4) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(102, 126, 234, 0.3) 0%, transparent 50%)',
          zIndex: 1,
        },
      }}
    >
      {/* Floating Security Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '15%',
          left: '10%',
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          animation: 'float 8s ease-in-out infinite',
          zIndex: 1,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '25%',
          right: '15%',
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.08)',
          animation: 'float 10s ease-in-out infinite reverse',
          zIndex: 1,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '20%',
          left: '20%',
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.06)',
          animation: 'float 12s ease-in-out infinite',
          zIndex: 1,
        }}
      />

      <Fade in timeout={800}>
        <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 2 }}>
          <Paper
            elevation={24}
            sx={{
              p: 5,
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
              transform: 'translateY(0)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 35px 70px rgba(0, 0, 0, 0.4)',
              },
            }}
          >
            {/* Header with Enhanced Icon */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Zoom in timeout={1000}>
                <Box
                  sx={{
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                    boxShadow: '0 15px 35px rgba(30, 60, 114, 0.4)',
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: -2,
                      left: -2,
                      right: -2,
                      bottom: -2,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      zIndex: -1,
                      opacity: 0.7,
                    },
                  }}
                >
                  <Security sx={{ fontSize: 50, color: 'white' }} />
                </Box>
              </Zoom>
              
              <Grow in timeout={1200}>
                <Typography
                  variant="h3"
                  sx={{
                    fontFamily: 'Kanit',
                    textAlign: 'center',
                    mb: 2,
                    background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 800,
                    fontSize: { xs: '1.8rem', md: '2.2rem' },
                    textShadow: '0 2px 10px rgba(0,0,0,0.1)',
                  }}
                >
                  เข้าสู่ระบบ ADMIN
                </Typography>
              </Grow>

              <Fade in timeout={1500}>
                <Typography
                  variant="body1"
                  sx={{
                    fontFamily: 'Kanit',
                    textAlign: 'center',
                    color: '#666',
                    fontSize: '1rem',
                    lineHeight: 1.6,
                  }}
                >
                  กรุณาเข้าสู่ระบบด้วยสิทธิ์ผู้ดูแลระบบ
                </Typography>
              </Fade>
            </Box>

            {error && (
              <Zoom in timeout={300}>
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 3, 
                    fontFamily: 'Kanit',
                    borderRadius: 2,
                    boxShadow: '0 4px 12px rgba(244, 67, 54, 0.2)',
                  }}
                >
                  {error}
                </Alert>
              </Zoom>
            )}

            <form onSubmit={handleSubmit}>
              <Grow in timeout={1800}>
                <TextField
                  fullWidth
                  label="ชื่อผู้ใช้ *"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  margin="normal"
                  required
                  sx={{ 
                    fontFamily: 'Kanit',
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      background: 'rgba(102, 126, 234, 0.05)',
                      '&:hover fieldset': {
                        borderColor: '#1e3c72',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#1e3c72',
                        borderWidth: 2,
                      },
                    },
                  }}
                  InputLabelProps={{ 
                    sx: { 
                      fontFamily: 'Kanit',
                      color: '#1e3c72',
                      fontWeight: 500,
                    } 
                  }}
                  InputProps={{
                    startAdornment: <Person sx={{ mr: 1, color: '#1e3c72' }} />,
                  }}
                />
              </Grow>
              
              <Grow in timeout={2000}>
                <TextField
                  fullWidth
                  label="รหัสผ่าน *"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  margin="normal"
                  required
                  sx={{ 
                    fontFamily: 'Kanit',
                    mb: 4,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      background: 'rgba(102, 126, 234, 0.05)',
                      '&:hover fieldset': {
                        borderColor: '#1e3c72',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#1e3c72',
                        borderWidth: 2,
                      },
                    },
                  }}
                  InputLabelProps={{ 
                    sx: { 
                      fontFamily: 'Kanit',
                      color: '#1e3c72',
                      fontWeight: 500,
                    } 
                  }}
                  InputProps={{
                    startAdornment: <Lock sx={{ mr: 1, color: '#1e3c72' }} />,
                  }}
                />
              </Grow>
              
              <Grow in timeout={2200}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={{ 
                    mb: 3,
                    fontFamily: 'Kanit',
                    fontWeight: 700,
                    py: 2,
                    fontSize: '1.1rem',
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                    boxShadow: '0 10px 30px rgba(30, 60, 114, 0.4)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #152f5b 0%, #1e3c72 100%)',
                      boxShadow: '0 15px 40px rgba(30, 60, 114, 0.6)',
                      transform: 'translateY(-2px)',
                    },
                    '&:active': {
                      transform: 'translateY(0)',
                    },
                  }}
                >
                  เข้าสู่ระบบ
                </Button>
              </Grow>

              {onBackToLogin && (
                <Grow in timeout={2400}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<ArrowBack />}
                    onClick={onBackToLogin}
                    sx={{ 
                      fontFamily: 'Kanit',
                      py: 1.5,
                      borderRadius: 3,
                      color: '#1e3c72',
                      borderColor: '#1e3c72',
                      borderWidth: 2,
                      fontWeight: 600,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: '#152f5b',
                        color: '#152f5b',
                        background: 'rgba(30, 60, 114, 0.05)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 20px rgba(30, 60, 114, 0.2)',
                      },
                    }}
                  >
                    กลับไปหน้าเข้าสู่ระบบ
                  </Button>
                </Grow>
              )}
            </form>

            {/* Security Badge */}
            <Fade in timeout={3000}>
              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Tooltip title="ระบบรักษาความปลอดภัยระดับสูง" arrow>
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 1,
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                      background: 'rgba(30, 60, 114, 0.1)',
                      border: '1px solid rgba(30, 60, 114, 0.2)',
                    }}
                  >
                    <Security sx={{ fontSize: 16, color: '#1e3c72' }} />
                    <Typography
                      variant="caption"
                      sx={{
                        fontFamily: 'Kanit',
                        color: '#1e3c72',
                        fontWeight: 500,
                      }}
                    >
                      ระบบรักษาความปลอดภัย
                    </Typography>
                  </Box>
                </Tooltip>
              </Box>
            </Fade>
          </Paper>
        </Container>
      </Fade>

      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
          }
        `}
      </style>
    </Box>
  );
};

export default AdminLogin; 