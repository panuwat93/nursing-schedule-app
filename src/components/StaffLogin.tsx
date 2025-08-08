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

interface StaffLoginProps {
  onLogin: (staffId: string, password: string) => Promise<boolean>;
  onRegister: () => void;
}

const StaffLogin: React.FC<StaffLoginProps> = ({
  onLogin,
  onRegister,
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
          เข้าสู่ระบบ
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
          กรุณาเลือกชื่อเจ้าหน้าที่และกรอกรหัสผ่านเพื่อเข้าสู่ระบบ
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
                  'เข้าสู่ระบบ'
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
            ยังไม่มีบัญชี?
          </Typography>
          <Button
            variant="text"
            onClick={onRegister}
            sx={{
              fontFamily: 'Kanit',
              color: '#1976d2',
            }}
          >
            สมัครสมาชิก
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default StaffLogin; 