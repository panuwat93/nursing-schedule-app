import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Grid,
  Divider,
  Fade,
  Grow,
  Zoom,
} from '@mui/material';
import { AdminPanelSettings, Person, Lock, Login } from '@mui/icons-material';
import { nurses, assistants } from '../data/nurses';

interface StaffLoginProps {
  onLogin: (staffId: string, password: string) => Promise<boolean>;
  onRegister: () => void;
  onAdminLogin?: () => void;
}

const StaffLogin: React.FC<StaffLoginProps> = ({
  onLogin,
  onRegister,
  onAdminLogin,
}) => {
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const allStaff = [...nurses, ...assistants];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // ตรวจสอบข้อมูล
    if (!selectedStaffId) {
      setError('กรุณาเลือกชื่อเจ้าหน้าที่');
      return;
    }

    if (!password) {
      setError('กรุณากรอกรหัสผ่าน');
      return;
    }

    setIsLoading(true);
    try {
      const success = await onLogin(selectedStaffId, password);
      if (!success) {
        setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      }
    } catch (error) {
      setError('เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%)',
          zIndex: 1,
        },
        p: 2,
      }}
    >
      {/* Floating Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          animation: 'float 6s ease-in-out infinite',
          zIndex: 1,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '20%',
          right: '15%',
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.08)',
          animation: 'float 8s ease-in-out infinite reverse',
          zIndex: 1,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '15%',
          left: '20%',
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.05)',
          animation: 'float 10s ease-in-out infinite',
          zIndex: 1,
        }}
      />

      <Fade in timeout={1000}>
        <Paper
          elevation={24}
          sx={{
            p: 5,
            maxWidth: 550,
            width: '100%',
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
            position: 'relative',
            zIndex: 2,
            transform: 'translateY(0)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 35px 70px rgba(0, 0, 0, 0.35)',
            },
          }}
        >
          {/* Header with Icon */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Zoom in timeout={800}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)',
                }}
              >
                <Login sx={{ fontSize: 40, color: 'white' }} />
              </Box>
            </Zoom>
            
            <Grow in timeout={1200}>
              <Typography
                variant="h3"
                sx={{
                  fontFamily: 'Kanit',
                  textAlign: 'center',
                  mb: 2,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 800,
                  fontSize: { xs: '2rem', md: '2.5rem' },
                  textShadow: '0 2px 10px rgba(0,0,0,0.1)',
                }}
              >
                เข้าสู่ระบบ
              </Typography>
            </Grow>

            <Fade in timeout={1500}>
              <Typography
                variant="body1"
                sx={{
                  fontFamily: 'Kanit',
                  textAlign: 'center',
                  color: '#666',
                  fontSize: '1.1rem',
                  lineHeight: 1.6,
                }}
              >
                กรุณาเลือกชื่อเจ้าหน้าที่และกรอกรหัสผ่านเพื่อเข้าสู่ระบบ
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
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Grow in timeout={1800}>
                  <FormControl fullWidth>
                    <InputLabel 
                      sx={{ 
                        fontFamily: 'Kanit',
                        color: '#667eea',
                        fontWeight: 500,
                      }}
                    >
                      เลือกชื่อเจ้าหน้าที่
                    </InputLabel>
                    <Select
                      value={selectedStaffId}
                      label="เลือกชื่อเจ้าหน้าที่"
                      onChange={(e) => setSelectedStaffId(e.target.value)}
                      sx={{ 
                        fontFamily: 'Kanit',
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          '&:hover fieldset': {
                            borderColor: '#667eea',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#667eea',
                            borderWidth: 2,
                          },
                        },
                      }}
                      startAdornment={<Person sx={{ mr: 1, color: '#667eea' }} />}
                    >
                      {allStaff.map((staff) => (
                        <MenuItem key={staff.id} value={staff.id} sx={{ fontFamily: 'Kanit' }}>
                          {staff.name} ({staff.type === 'nurse' ? 'พยาบาล' : 'ผู้ช่วย'})
                          {staff.isPartTime && ' - พาร์ทไทม์'}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grow>
              </Grid>

              <Grid item xs={12}>
                <Grow in timeout={2000}>
                  <TextField
                    fullWidth
                    type="password"
                    label="รหัสผ่าน"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    InputLabelProps={{ 
                      sx: { 
                        fontFamily: 'Kanit',
                        color: '#667eea',
                        fontWeight: 500,
                      } 
                    }}
                    inputProps={{ sx: { fontFamily: 'Kanit' } }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        '&:hover fieldset': {
                          borderColor: '#667eea',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#667eea',
                          borderWidth: 2,
                        },
                      },
                    }}
                    InputProps={{
                      startAdornment: <Lock sx={{ mr: 1, color: '#667eea' }} />,
                    }}
                  />
                </Grow>
              </Grid>

              <Grid item xs={12}>
                <Grow in timeout={2200}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={isLoading}
                    sx={{
                      fontFamily: 'Kanit',
                      py: 2,
                      fontSize: '1.2rem',
                      fontWeight: 600,
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                        boxShadow: '0 12px 35px rgba(102, 126, 234, 0.6)',
                        transform: 'translateY(-2px)',
                      },
                      '&:active': {
                        transform: 'translateY(0)',
                      },
                    }}
                  >
                    {isLoading ? (
                      <CircularProgress size={28} color="inherit" />
                    ) : (
                      'เข้าสู่ระบบ'
                    )}
                  </Button>
                </Grow>
              </Grid>
            </Grid>
          </form>

          <Divider sx={{ my: 4, opacity: 0.3 }} />

          <Fade in timeout={2500}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'Kanit',
                  color: '#666',
                  mb: 2,
                  fontSize: '1rem',
                }}
              >
                ยังไม่มีบัญชี?
              </Typography>
              <Button
                variant="text"
                onClick={onRegister}
                sx={{
                  fontFamily: 'Kanit',
                  color: '#667eea',
                  fontWeight: 600,
                  fontSize: '1rem',
                  textTransform: 'none',
                  '&:hover': {
                    background: 'rgba(102, 126, 234, 0.1)',
                    transform: 'scale(1.05)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                สมัครสมาชิก
              </Button>
            </Box>
          </Fade>

          {onAdminLogin && (
            <>
              <Divider sx={{ my: 4, opacity: 0.3 }} />
              
              <Fade in timeout={2800}>
                <Box sx={{ textAlign: 'center' }}>
                  <Button
                    variant="outlined"
                    startIcon={<AdminPanelSettings />}
                    onClick={onAdminLogin}
                    sx={{
                      fontFamily: 'Kanit',
                      color: '#667eea',
                      borderColor: '#667eea',
                      borderWidth: 2,
                      borderRadius: 3,
                      py: 1.5,
                      px: 3,
                      fontWeight: 600,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: '#5a6fd8',
                        color: '#5a6fd8',
                        background: 'rgba(102, 126, 234, 0.05)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 20px rgba(102, 126, 234, 0.2)',
                      },
                    }}
                  >
                    เข้าสู่ระบบแอดมิน
                  </Button>
                </Box>
              </Fade>
            </>
          )}
        </Paper>
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

export default StaffLogin; 