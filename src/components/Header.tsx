import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
} from '@mui/material';
import { LocalHospital, Schedule, Assignment, AdminPanelSettings, Favorite } from '@mui/icons-material';
import { nurses, assistants } from '../data/nurses';

interface HeaderProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  isAdmin?: boolean;
  isStaffLoggedIn?: boolean;
  currentStaffId?: string;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  currentPage, 
  onPageChange, 
  isAdmin = false, 
  isStaffLoggedIn = false,
  currentStaffId = '',
  onLogout
}) => {
  const menuItems = [
    {
      key: 'schedule',
      label: 'ตารางเวรประจำเดือน',
      icon: <Schedule />,
    },
    {
      key: 'assignments',
      label: 'ตารางมอบหมายงานประจำวัน',
      icon: <Assignment />,
    },
  ];

  // เพิ่มปุ่มปฏิทินส่วนตัวสำหรับเจ้าหน้าที่ที่ล็อกอินแล้ว
  if (isStaffLoggedIn || isAdmin) {
    menuItems.push({
      key: 'personal-calendar',
      label: 'ปฏิทินส่วนตัว',
      icon: <Schedule />,
    });
  }

  // เพิ่มปุ่มสำหรับแอดมิน
  if (isAdmin) {
    menuItems.push(
      {
        key: 'admin-schedule',
        label: 'จัดตารางเวร',
        icon: <Schedule />,
      },
      {
        key: 'admin-assignments',
        label: 'จัดตารางมอบหมายงาน',
        icon: <Assignment />,
      }
    );
  }

  // ฟังก์ชันดึงชื่อเจ้าหน้าที่จาก ID
  const getStaffName = (staffId: string) => {
    const allStaff = [...nurses, ...assistants];
    const staff = allStaff.find(s => s.id === staffId);
    return staff ? staff.name : staffId;
  };

  // แสดงปุ่ม ADMIN เฉพาะเมื่อไม่ได้ล็อกอินเป็นแอดมินและเจ้าหน้าที่ทั่วไป
  if (!isAdmin && !isStaffLoggedIn) {
    menuItems.push({
      key: 'admin',
      label: 'เข้าสู่ระบบ ADMIN',
      icon: <AdminPanelSettings />,
    });
  }

  return (
    <AppBar position="static" sx={{ backgroundColor: '#2196f3' }}>
      <Container maxWidth="xl">
        <Toolbar>
          <Favorite sx={{ mr: 2, fontSize: 32, color: '#ff4444' }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontFamily: 'Kanit' }}>
            SA-SICU1
          </Typography>
          
          {/* แสดงข้อมูลผู้ใช้ */}
          {(isStaffLoggedIn || isAdmin) && (
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
              <Typography variant="body2" sx={{ fontFamily: 'Kanit', color: 'white', mr: 1 }}>
                {isAdmin ? 'แอดมิน' : `เจ้าหน้าที่: ${getStaffName(currentStaffId)}`}
              </Typography>
              {onLogout && (
                <Button
                  color="inherit"
                  onClick={onLogout}
                  sx={{ fontFamily: 'Kanit', fontSize: '0.8rem' }}
                >
                  ออกจากระบบ
                </Button>
              )}
            </Box>
          )}
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            {menuItems.map((item) => (
              <Button
                key={item.key}
                color="inherit"
                startIcon={item.icon}
                onClick={() => onPageChange(item.key)}
                sx={{
                  fontFamily: 'Kanit',
                  backgroundColor: currentPage === item.key ? 'rgba(255,255,255,0.2)' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header; 