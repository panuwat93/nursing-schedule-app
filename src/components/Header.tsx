import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
} from '@mui/material';
import { LocalHospital, Schedule, Assignment, AdminPanelSettings } from '@mui/icons-material';

interface HeaderProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  isAdmin?: boolean;
}

const Header: React.FC<HeaderProps> = ({ currentPage, onPageChange, isAdmin = false }) => {
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
    {
      key: 'admin',
      label: 'เข้าสู่ระบบ ADMIN',
      icon: <AdminPanelSettings />,
    },
  ];

  return (
    <AppBar position="static" sx={{ backgroundColor: '#2196f3' }}>
      <Container maxWidth="xl">
        <Toolbar>
          <LocalHospital sx={{ mr: 2, fontSize: 32 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontFamily: 'Kanit' }}>
            ระบบจัดตารางเวรพยาบาล
          </Typography>
          
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