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
} from '@mui/material';
import { nurses, assistants } from '../data/nurses';

interface StaffRegistrationProps {
  onRegister: (staffId: string, password: string, confirmPassword: string) => Promise<boolean>;
  onBackToLogin: () => void;
}

const StaffRegistration: React.FC<StaffRegistrationProps> = ({
  onRegister,
  onBackToLogin,
}) => {
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

    if (password.length < 6) {
      setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      return;
    }

    if (password !== confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน');
      return;
    }

    setIsLoading(true);
    try {
      const success = await onRegister(selectedStaffId, password, confirmPassword);
      if (!success) {
        setError('เกิดข้อผิดพลาดในการสมัครสมาชิก');
      }
    } catch (error) {
      setError('เกิดข้อผิดพลาดในการสมัครสมาชิก');
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
        backgroundColor: '#f5f5f5',
        p: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          maxWidth: 500,
          width: '100%',
          borderRadius: 2,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontFamily: 'Kanit',
            textAlign: 'center',
            mb: 3,
            color: '#1976d2',
            fontWeight: 'bold',
          }}
        >
          สมัครสมาชิก
        </Typography>

        <Typography
          variant="body1"
          sx={{
            fontFamily: 'Kanit',
            textAlign: 'center',
            mb: 3,
            color: '#666',
          }}
        >
          กรุณาเลือกชื่อเจ้าหน้าที่และตั้งรหัสผ่านเพื่อสมัครสมาชิก
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2, fontFamily: 'Kanit' }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel sx={{ fontFamily: 'Kanit' }}>เลือกชื่อเจ้าหน้าที่</InputLabel>
                <Select
                  value={selectedStaffId}
                  label="เลือกชื่อเจ้าหน้าที่"
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  sx={{ fontFamily: 'Kanit' }}
                >
                  {allStaff.map((staff) => (
                    <MenuItem key={staff.id} value={staff.id} sx={{ fontFamily: 'Kanit' }}>
                      {staff.name} ({staff.type === 'nurse' ? 'พยาบาล' : 'ผู้ช่วย'})
                      {staff.isPartTime && ' - พาร์ทไทม์'}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                type="password"
                label="รหัสผ่าน"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputLabelProps={{ sx: { fontFamily: 'Kanit' } }}
                inputProps={{ sx: { fontFamily: 'Kanit' } }}
                helperText="รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"
                FormHelperTextProps={{ sx: { fontFamily: 'Kanit' } }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                type="password"
                label="ยืนยันรหัสผ่าน"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                InputLabelProps={{ sx: { fontFamily: 'Kanit' } }}
                inputProps={{ sx: { fontFamily: 'Kanit' } }}
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isLoading}
                sx={{
                  fontFamily: 'Kanit',
                  py: 1.5,
                  fontSize: '1.1rem',
                }}
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'สมัครสมาชิก'
                )}
              </Button>
            </Grid>
          </Grid>
        </form>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ textAlign: 'center' }}>
          <Typography
            variant="body2"
            sx={{
              fontFamily: 'Kanit',
              color: '#666',
              mb: 1,
            }}
          >
            มีบัญชีอยู่แล้ว?
          </Typography>
          <Button
            variant="text"
            onClick={onBackToLogin}
            sx={{
              fontFamily: 'Kanit',
              color: '#1976d2',
            }}
          >
            เข้าสู่ระบบ
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default StaffRegistration; 