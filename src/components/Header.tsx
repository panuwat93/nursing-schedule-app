import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Divider,
} from '@mui/material';
import { 
  LocalHospital, 
  Schedule, 
  Assignment, 
  AdminPanelSettings, 
  Favorite,
  Menu as MenuIcon,
  Close as CloseIcon
} from '@mui/icons-material';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const menuItems = [];

  // เพิ่มปุ่มสำหรับเจ้าหน้าที่ทั่วไป (ไม่ใช่แอดมิน)
  if (isStaffLoggedIn && !isAdmin) {
    menuItems.push(
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
        key: 'personal-calendar',
        label: 'ปฏิทินส่วนตัว',
        icon: <Schedule />,
      }
    );
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
      },
      {
        key: 'original-schedule',
        label: 'ตารางเวรก่อนแลก',
        icon: <Schedule />,
      }
    );
  }

  // ฟังก์ชันดึงชื่อเจ้าหน้าที่จาก ID
  const getStaffName = (staffId: string) => {
    const allStaff = [...nurses, ...assistants];
    const staff = allStaff.find(s => s.id === staffId);
    return staff ? staff.name : staffId;
  };

  // ฟังก์ชันจัดการเมนูมือถือ
  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuOpen(false);
  };

  const handleMobileMenuItemClick = (pageKey: string) => {
    if (pageKey === 'admin') {
      onPageChange('admin-login');
    } else {
      onPageChange(pageKey);
    }
    handleMobileMenuClose();
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
    <>
      <AppBar position="static" sx={{ backgroundColor: '#2196f3' }}>
        <Container maxWidth="xl">
          <Toolbar>
            <Favorite sx={{ mr: 2, fontSize: 32, color: '#ff4444' }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontFamily: 'Kanit' }}>
              SA-SICU1
            </Typography>
            
            {/* แสดงข้อมูลผู้ใช้ */}
            {(isStaffLoggedIn || isAdmin) && (
              <Box sx={{ display: 'flex', alignItems: 'center', mr: isMobile ? 1 : 2 }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontFamily: 'Kanit', 
                    color: 'white', 
                    mr: 1,
                    fontSize: isMobile ? '0.75rem' : '0.875rem',
                    display: isMobile ? 'none' : 'block'
                  }}
                >
                  {isAdmin ? 'แอดมิน' : `เจ้าหน้าที่: ${getStaffName(currentStaffId)}`}
                </Typography>
                {onLogout && !isMobile && (
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
            
            {/* Desktop Menu */}
            {!isMobile && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                {menuItems.map((item) => (
                  <Button
                    key={item.key}
                    color="inherit"
                    startIcon={item.icon}
                    onClick={() => item.key === 'admin' ? onPageChange('admin-login') : onPageChange(item.key)}
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
            )}

            {/* Mobile Menu Button */}
            {isMobile && (
              <IconButton
                color="inherit"
                onClick={handleMobileMenuToggle}
                sx={{ ml: 1 }}
              >
                <MenuIcon />
              </IconButton>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={handleMobileMenuClose}
        sx={{
          '& .MuiDrawer-paper': {
            width: 280,
            backgroundColor: '#f5f5f5',
          },
        }}
      >
        <Box sx={{ width: 280 }} role="presentation">
          {/* Header ของ Drawer */}
          <Box sx={{ 
            p: 2, 
            backgroundColor: '#2196f3', 
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Favorite sx={{ mr: 2, fontSize: 28, color: '#ff4444' }} />
              <Typography variant="h6" sx={{ fontFamily: 'Kanit' }}>
                SA-SICU1
              </Typography>
            </Box>
            <IconButton
              color="inherit"
              onClick={handleMobileMenuClose}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* ข้อมูลผู้ใช้ */}
          {(isStaffLoggedIn || isAdmin) && (
            <>
              <Box sx={{ p: 2, backgroundColor: '#e3f2fd' }}>
                <Typography variant="body2" sx={{ fontFamily: 'Kanit', fontWeight: 'bold' }}>
                  {isAdmin ? 'แอดมิน' : `เจ้าหน้าที่: ${getStaffName(currentStaffId)}`}
                </Typography>
              </Box>
              <Divider />
            </>
          )}

          {/* Menu Items */}
          <List>
            {menuItems.map((item) => (
              <ListItem
                key={item.key}
                onClick={() => handleMobileMenuItemClick(item.key)}
                sx={{
                  cursor: 'pointer',
                  backgroundColor: currentPage === item.key ? '#e3f2fd' : 'transparent',
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                  },
                }}
              >
                <ListItemIcon sx={{ color: currentPage === item.key ? '#2196f3' : '#666' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.label}
                  primaryTypographyProps={{
                    fontFamily: 'Kanit',
                    fontWeight: currentPage === item.key ? 'bold' : 'normal',
                    color: currentPage === item.key ? '#2196f3' : '#333',
                  }}
                />
              </ListItem>
            ))}
          </List>

          {/* ปุ่มออกจากระบบ */}
          {onLogout && (isStaffLoggedIn || isAdmin) && (
            <>
              <Divider />
              <List>
                <ListItem
                  onClick={() => {
                    onLogout();
                    handleMobileMenuClose();
                  }}
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: '#ffebee',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: '#f44336' }}>
                    <AdminPanelSettings />
                  </ListItemIcon>
                  <ListItemText 
                    primary="ออกจากระบบ"
                    primaryTypographyProps={{
                      fontFamily: 'Kanit',
                      color: '#f44336',
                    }}
                  />
                </ListItem>
              </List>
            </>
          )}
        </Box>
      </Drawer>
    </>
  );
};

export default Header; 