import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Grid,
  Chip,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { nurses, assistants } from '../data/nurses';

interface StaffMember {
  id: string;
  name: string;
  position: 'nurse' | 'assistant' | 'admin';
  isPartTime: boolean;
  canManageAssignments: boolean;
  isActive: boolean;
}

interface AdminSettingsProps {
  onBack: () => void;
}

const AdminSettings: React.FC<AdminSettingsProps> = ({ onBack }) => {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [newStaff, setNewStaff] = useState<Partial<StaffMember>>({
    name: '',
    position: 'nurse',
    isPartTime: false,
    canManageAssignments: false,
    isActive: true
  });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  // โหลดข้อมูลเจ้าหน้าที่จากไฟล์ data
  useEffect(() => {
    const loadStaffData = () => {
      const allStaff: StaffMember[] = [
        ...nurses.map(nurse => ({
          id: nurse.id,
          name: nurse.name,
          position: 'nurse' as const,
          isPartTime: nurse.isPartTime || false,
          canManageAssignments: false, // เริ่มต้นไม่มีสิทธิ์
          isActive: true
        })),
        ...assistants.map(assistant => ({
          id: assistant.id,
          name: assistant.name,
          position: 'assistant' as const,
          isPartTime: assistant.isPartTime || false,
          canManageAssignments: false, // เริ่มต้นไม่มีสิทธิ์
          isActive: true
        }))
      ];
      setStaffMembers(allStaff);
    };

    loadStaffData();
  }, []);

  const handleAddStaff = () => {
    if (!newStaff.name || !newStaff.position) {
      setSnackbar({
        open: true,
        message: 'กรุณากรอกชื่อและตำแหน่ง',
        severity: 'error'
      });
      return;
    }

    const staffId = `staff_${Date.now()}`;
    const newStaffMember: StaffMember = {
      id: staffId,
      name: newStaff.name,
      position: newStaff.position!,
      isPartTime: newStaff.isPartTime || false,
      canManageAssignments: newStaff.canManageAssignments || false,
      isActive: newStaff.isActive || true
    };

    setStaffMembers(prev => [...prev, newStaffMember]);
    setIsAddDialogOpen(false);
    setNewStaff({
      name: '',
      position: 'nurse',
      isPartTime: false,
      canManageAssignments: false,
      isActive: true
    });

    setSnackbar({
      open: true,
      message: 'เพิ่มเจ้าหน้าที่สำเร็จ',
      severity: 'success'
    });
  };

  const handleEditStaff = () => {
    if (!editingStaff) return;

    setStaffMembers(prev => 
      prev.map(staff => 
        staff.id === editingStaff.id ? editingStaff : staff
      )
    );

    setIsEditDialogOpen(false);
    setEditingStaff(null);

    setSnackbar({
      open: true,
      message: 'แก้ไขข้อมูลสำเร็จ',
      severity: 'success'
    });
  };

  const handleDeleteStaff = (staffId: string) => {
    if (window.confirm('คุณแน่ใจหรือไม่ที่จะลบเจ้าหน้าที่คนนี้?')) {
      setStaffMembers(prev => prev.filter(staff => staff.id !== staffId));
      setSnackbar({
        open: true,
        message: 'ลบเจ้าหน้าที่สำเร็จ',
        severity: 'success'
      });
    }
  };

  const handleToggleAssignmentPermission = (staffId: string) => {
    setStaffMembers(prev => 
      prev.map(staff => 
        staff.id === staffId 
          ? { ...staff, canManageAssignments: !staff.canManageAssignments }
          : staff
      )
    );
  };

  const handleToggleActiveStatus = (staffId: string) => {
    setStaffMembers(prev => 
      prev.map(staff => 
        staff.id === staffId 
          ? { ...staff, isActive: !staff.isActive }
          : staff
      )
    );
  };

  const openEditDialog = (staff: StaffMember) => {
    setEditingStaff({ ...staff });
    setIsEditDialogOpen(true);
  };

  const getPositionLabel = (position: string) => {
    switch (position) {
      case 'nurse': return 'พยาบาล';
      case 'assistant': return 'ผู้ช่วย';
      case 'admin': return 'แอดมิน';
      default: return position;
    }
  };

  const getPositionColor = (position: string) => {
    switch (position) {
      case 'nurse': return 'primary';
      case 'assistant': return 'secondary';
      case 'admin': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button onClick={onBack} sx={{ mr: 2 }}>
          ← กลับ
        </Button>
        <Typography variant="h4" sx={{ fontFamily: 'Kanit', fontWeight: 'bold' }}>
          ตั้งค่าระบบ
        </Typography>
      </Box>

      {/* Staff Management Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontFamily: 'Kanit', fontWeight: 'bold' }}>
            จัดการเจ้าหน้าที่
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsAddDialogOpen(true)}
            sx={{ fontFamily: 'Kanit' }}
          >
            เพิ่มเจ้าหน้าที่
          </Button>
        </Box>

        <List>
          {staffMembers.map((staff, index) => (
            <React.Fragment key={staff.id}>
              <ListItem>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1" sx={{ fontFamily: 'Kanit' }}>
                        {staff.name}
                      </Typography>
                      <Chip
                        label={getPositionLabel(staff.position)}
                        color={getPositionColor(staff.position) as any}
                        size="small"
                        sx={{ fontFamily: 'Kanit' }}
                      />
                      {staff.isPartTime && (
                        <Chip
                          label="พาร์ทไทม์"
                          color="warning"
                          size="small"
                          sx={{ fontFamily: 'Kanit' }}
                        />
                      )}
                      {!staff.isActive && (
                        <Chip
                          label="ไม่ใช้งาน"
                          color="default"
                          size="small"
                          sx={{ fontFamily: 'Kanit' }}
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={staff.canManageAssignments}
                            onChange={() => handleToggleAssignmentPermission(staff.id)}
                            size="small"
                          />
                        }
                        label={
                          <Typography variant="caption" sx={{ fontFamily: 'Kanit' }}>
                            สิทธิ์จัดการตารางมอบหมายงาน
                          </Typography>
                        }
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={staff.isActive}
                            onChange={() => handleToggleActiveStatus(staff.id)}
                            size="small"
                          />
                        }
                        label={
                          <Typography variant="caption" sx={{ fontFamily: 'Kanit' }}>
                            สถานะใช้งาน
                          </Typography>
                        }
                      />
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => openEditDialog(staff)}
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    onClick={() => handleDeleteStaff(staff.id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
              {index < staffMembers.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Paper>

      {/* Add Staff Dialog */}
      <Dialog open={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: 'Kanit' }}>เพิ่มเจ้าหน้าที่ใหม่</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="ชื่อเจ้าหน้าที่"
                value={newStaff.name}
                onChange={(e) => setNewStaff(prev => ({ ...prev, name: e.target.value }))}
                sx={{ fontFamily: 'Kanit' }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel sx={{ fontFamily: 'Kanit' }}>ตำแหน่ง</InputLabel>
                <Select
                  value={newStaff.position}
                  label="ตำแหน่ง"
                  onChange={(e) => setNewStaff(prev => ({ ...prev, position: e.target.value as any }))}
                  sx={{ fontFamily: 'Kanit' }}
                >
                  <MenuItem value="nurse" sx={{ fontFamily: 'Kanit' }}>พยาบาล</MenuItem>
                  <MenuItem value="assistant" sx={{ fontFamily: 'Kanit' }}>ผู้ช่วย</MenuItem>
                  <MenuItem value="admin" sx={{ fontFamily: 'Kanit' }}>แอดมิน</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={newStaff.isPartTime}
                    onChange={(e) => setNewStaff(prev => ({ ...prev, isPartTime: e.target.checked }))}
                  />
                }
                label={<Typography sx={{ fontFamily: 'Kanit' }}>พาร์ทไทม์</Typography>}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={newStaff.canManageAssignments}
                    onChange={(e) => setNewStaff(prev => ({ ...prev, canManageAssignments: e.target.checked }))}
                  />
                }
                label={<Typography sx={{ fontFamily: 'Kanit' }}>สิทธิ์จัดการตารางมอบหมายงาน</Typography>}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddDialogOpen(false)} sx={{ fontFamily: 'Kanit' }}>
            ยกเลิก
          </Button>
          <Button
            onClick={handleAddStaff}
            variant="contained"
            startIcon={<SaveIcon />}
            sx={{ fontFamily: 'Kanit' }}
          >
            บันทึก
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Staff Dialog */}
      <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: 'Kanit' }}>แก้ไขข้อมูลเจ้าหน้าที่</DialogTitle>
        <DialogContent>
          {editingStaff && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="ชื่อเจ้าหน้าที่"
                  value={editingStaff.name}
                  onChange={(e) => setEditingStaff(prev => prev ? { ...prev, name: e.target.value } : null)}
                  sx={{ fontFamily: 'Kanit' }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel sx={{ fontFamily: 'Kanit' }}>ตำแหน่ง</InputLabel>
                  <Select
                    value={editingStaff.position}
                    label="ตำแหน่ง"
                    onChange={(e) => setEditingStaff(prev => prev ? { ...prev, position: e.target.value as any } : null)}
                    sx={{ fontFamily: 'Kanit' }}
                  >
                    <MenuItem value="nurse" sx={{ fontFamily: 'Kanit' }}>พยาบาล</MenuItem>
                    <MenuItem value="assistant" sx={{ fontFamily: 'Kanit' }}>ผู้ช่วย</MenuItem>
                    <MenuItem value="admin" sx={{ fontFamily: 'Kanit' }}>แอดมิน</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={editingStaff.isPartTime}
                      onChange={(e) => setEditingStaff(prev => prev ? { ...prev, isPartTime: e.target.checked } : null)}
                    />
                  }
                  label={<Typography sx={{ fontFamily: 'Kanit' }}>พาร์ทไทม์</Typography>}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={editingStaff.canManageAssignments}
                      onChange={(e) => setEditingStaff(prev => prev ? { ...prev, canManageAssignments: e.target.checked } : null)}
                    />
                  }
                  label={<Typography sx={{ fontFamily: 'Kanit' }}>สิทธิ์จัดการตารางมอบหมายงาน</Typography>}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={editingStaff.isActive}
                      onChange={(e) => setEditingStaff(prev => prev ? { ...prev, isActive: e.target.checked } : null)}
                    />
                  }
                  label={<Typography sx={{ fontFamily: 'Kanit' }}>สถานะใช้งาน</Typography>}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditDialogOpen(false)} sx={{ fontFamily: 'Kanit' }}>
            ยกเลิก
          </Button>
          <Button
            onClick={handleEditStaff}
            variant="contained"
            startIcon={<SaveIcon />}
            sx={{ fontFamily: 'Kanit' }}
          >
            บันทึก
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} sx={{ fontFamily: 'Kanit' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminSettings;
