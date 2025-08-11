import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon, Lock as LockIcon } from '@mui/icons-material';
import { changePassword } from '../services/authService';

interface ChangePasswordProps {
  staffId: string;
  onClose: () => void;
  open: boolean;
}

const ChangePassword: React.FC<ChangePasswordProps> = ({
  staffId,
  onClose,
  open,
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // ตรวจสอบข้อมูล
    if (!currentPassword) {
      setError('กรุณากรอกรหัสผ่านปัจจุบัน');
      return;
    }

    if (!newPassword) {
      setError('กรุณากรอกรหัสผ่านใหม่');
      return;
    }

    if (newPassword.length < 6) {
      setError('รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    if (newPassword === currentPassword) {
      setError('รหัสผ่านใหม่ต้องไม่เหมือนกับรหัสผ่านปัจจุบัน');
      return;
    }

    setIsLoading(true);
    try {
      const success = await changePassword(staffId, currentPassword, newPassword);
      if (success) {
        setSuccess('เปลี่ยนรหัสผ่านสำเร็จ');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        // ปิด dialog หลังจาก 2 วินาที
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setError('รหัสผ่านปัจจุบันไม่ถูกต้อง');
      }
    } catch (error) {
      setError('เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontFamily: 'Kanit', display: 'flex', alignItems: 'center', gap: 1 }}>
        <LockIcon color="primary" />
        เปลี่ยนรหัสผ่าน
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {error && (
              <Grid item xs={12}>
                <Alert severity="error" sx={{ fontFamily: 'Kanit' }}>
                  {error}
                </Alert>
              </Grid>
            )}

            {success && (
              <Grid item xs={12}>
                <Alert severity="success" sx={{ fontFamily: 'Kanit' }}>
                  {success}
                </Alert>
              </Grid>
            )}

            <Grid item xs={12}>
              <TextField
                fullWidth
                type="password"
                label="รหัสผ่านปัจจุบัน"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                InputLabelProps={{ sx: { fontFamily: 'Kanit' } }}
                inputProps={{ sx: { fontFamily: 'Kanit' } }}
                disabled={isLoading}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                type="password"
                label="รหัสผ่านใหม่"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                InputLabelProps={{ sx: { fontFamily: 'Kanit' } }}
                inputProps={{ sx: { fontFamily: 'Kanit' } }}
                disabled={isLoading}
                helperText="รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                type="password"
                label="ยืนยันรหัสผ่านใหม่"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                InputLabelProps={{ sx: { fontFamily: 'Kanit' } }}
                inputProps={{ sx: { fontFamily: 'Kanit' } }}
                disabled={isLoading}
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
                  'เปลี่ยนรหัสผ่าน'
                )}
              </Button>
            </Grid>
          </Grid>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePassword;
