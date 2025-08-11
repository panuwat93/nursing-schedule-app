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
  Avatar,
  Chip,
} from '@mui/material';
import { 
  LocalHospital, 
  Schedule, 
  Assignment, 
  Login,
  Logout,
  Favorite,
  Menu as MenuIcon,
  Close as CloseIcon,
  Lock as LockIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { nurses, assistants } from '../data/nurses';
import ChangePassword from './ChangePassword';

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
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
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
      },

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
      icon: <Login />,
    });
  }

  return (
    <>
      <AppBar 
        position="static" 
        elevation={0}
        sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ minHeight: '70px' }}>
            {/* Logo Section */}
            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: 'linear-gradient(45deg, #ff6b6b, #ff8e8e)',
                  boxShadow: '0 4px 15px rgba(255, 107, 107, 0.3)',
                  mr: 2,
                }}
              >
                <Favorite sx={{ fontSize: 24, color: 'white' }} />
              </Box>
              <Typography 
                variant="h5" 
                component="div" 
                sx={{ 
                  fontFamily: 'Kanit',
                  fontWeight: 700,
                  background: 'linear-gradient(45deg, #ffffff, #f0f8ff)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
              >
                SA-SICU1
              </Typography>
            </Box>
            
            {/* User Info Section */}
            {(isStaffLoggedIn || isAdmin) && (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mr: isMobile ? 1 : 3,
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '25px',
                px: 2,
                py: 1,
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
              }}>
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    mr: 1.5,
                    background: 'linear-gradient(45deg, #4fc3f7, #29b6f6)',
                    boxShadow: '0 2px 8px rgba(79, 195, 247, 0.3)',
                  }}
                >
                  <PersonIcon sx={{ fontSize: 18 }} />
                </Avatar>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontFamily: 'Kanit', 
                    color: 'white', 
                    mr: 2,
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    display: isMobile ? 'none' : 'block'
                  }}
                >
                  {isAdmin ? 'แอดมิน' : `เจ้าหน้าที่: ${getStaffName(currentStaffId)}`}
                </Typography>
                
                {!isAdmin && isStaffLoggedIn && !isMobile && (
                  <Chip
                    icon={<LockIcon />}
                    label="เปลี่ยนรหัสผ่าน"
                    onClick={() => setChangePasswordOpen(true)}
                    sx={{
                      fontFamily: 'Kanit',
                      fontSize: '0.75rem',
                      height: 28,
                      background: 'rgba(255,255,255,0.15)',
                      color: 'white',
                      border: '1px solid rgba(255,255,255,0.3)',
                      '&:hover': {
                        background: 'rgba(255,255,255,0.25)',
                      },
                      '& .MuiChip-icon': {
                        color: 'rgba(255,255,255,0.8)',
                        fontSize: '1rem',
                      },
                    }}
                  />
                )}
                
                {onLogout && !isMobile && (
                  <Chip
                    icon={<Logout />}
                    label="ออกจากระบบ"
                    onClick={onLogout}
                    sx={{
                      fontFamily: 'Kanit',
                      fontSize: '0.75rem',
                      height: 28,
                      ml: 1,
                      background: 'rgba(244, 67, 54, 0.2)',
                      color: 'white',
                      border: '1px solid rgba(244, 67, 54, 0.4)',
                      '&:hover': {
                        background: 'rgba(244, 67, 54, 0.3)',
                      },
                      '& .MuiChip-icon': {
                        color: 'rgba(255,255,255,0.8)',
                        fontSize: '1rem',
                      },
                    }}
                  />
                )}
              </Box>
            )}
            
            {/* Desktop Menu */}
            {!isMobile && (
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                {menuItems.map((item) => (
                  <Button
                    key={item.key}
                    variant="contained"
                    startIcon={item.icon}
                    onClick={() => item.key === 'admin' ? onPageChange('admin-login') : onPageChange(item.key)}
                    sx={{
                      fontFamily: 'Kanit',
                      fontWeight: 500,
                      fontSize: '0.875rem',
                      textTransform: 'none',
                      borderRadius: '20px',
                      px: 2.5,
                      py: 1,
                      background: currentPage === item.key 
                        ? 'linear-gradient(45deg, #ffffff, #f0f8ff)' 
                        : 'rgba(255,255,255,0.15)',
                      color: currentPage === item.key ? '#333' : 'white',
                      border: currentPage === item.key 
                        ? 'none' 
                        : '1px solid rgba(255,255,255,0.3)',
                      boxShadow: currentPage === item.key 
                        ? '0 4px 15px rgba(255,255,255,0.3)' 
                        : 'none',
                      backdropFilter: 'blur(10px)',
                      '&:hover': {
                        background: currentPage === item.key 
                          ? 'linear-gradient(45deg, #f0f8ff, #e6f3ff)' 
                          : 'rgba(255,255,255,0.25)',
                        transform: 'translateY(-1px)',
                        boxShadow: currentPage === item.key 
                          ? '0 6px 20px rgba(255,255,255,0.4)' 
                          : '0 4px 15px rgba(255,255,255,0.2)',
                      },
                      transition: 'all 0.3s ease',
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
                sx={{ 
                  ml: 1,
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.2)',
                  },
                }}
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
            width: 320,
            background: 'linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%)',
            borderLeft: '1px solid rgba(0,0,0,0.1)',
          },
        }}
      >
        <Box sx={{ width: 320 }} role="presentation">
          {/* Header ของ Drawer */}
          <Box sx={{ 
            p: 3, 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
              opacity: 0.3,
            },
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative', zIndex: 1 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: 'linear-gradient(45deg, #ff6b6b, #ff8e8e)',
                  boxShadow: '0 4px 15px rgba(255, 107, 107, 0.3)',
                  mr: 2,
                }}
              >
                <Favorite sx={{ fontSize: 24, color: 'white' }} />
              </Box>
              <Typography variant="h6" sx={{ fontFamily: 'Kanit', fontWeight: 700 }}>
                SA-SICU1
              </Typography>
            </Box>
            <IconButton
              color="inherit"
              onClick={handleMobileMenuClose}
              sx={{
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                '&:hover': {
                  background: 'rgba(255,255,255,0.2)',
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* ข้อมูลผู้ใช้ */}
          {(isStaffLoggedIn || isAdmin) && (
            <>
              <Box sx={{ 
                p: 3, 
                background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                borderBottom: '1px solid rgba(0,0,0,0.1)',
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      mr: 2,
                      background: 'linear-gradient(45deg, #4fc3f7, #29b6f6)',
                      boxShadow: '0 4px 15px rgba(79, 195, 247, 0.3)',
                    }}
                  >
                    <PersonIcon sx={{ fontSize: 24 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" sx={{ 
                      fontFamily: 'Kanit', 
                      fontWeight: 'bold',
                      color: '#1976d2',
                      fontSize: '1rem',
                    }}>
                      {isAdmin ? 'แอดมิน' : `เจ้าหน้าที่: ${getStaffName(currentStaffId)}`}
                    </Typography>
                    <Typography variant="caption" sx={{ 
                      fontFamily: 'Kanit',
                      color: '#666',
                    }}>
                      {isAdmin ? 'ผู้ดูแลระบบ' : 'เจ้าหน้าที่ทั่วไป'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Divider />
            </>
          )}

          {/* ปุ่มเปลี่ยนรหัสผ่านสำหรับเจ้าหน้าที่ทั่วไป */}
          {!isAdmin && isStaffLoggedIn && (
            <>
              <List>
                <ListItem
                  onClick={() => {
                    setChangePasswordOpen(true);
                    handleMobileMenuClose();
                  }}
                  sx={{
                    cursor: 'pointer',
                    mx: 2,
                    my: 0.5,
                    borderRadius: '12px',
                    '&:hover': {
                      backgroundColor: 'rgba(76, 175, 80, 0.1)',
                      transform: 'translateX(4px)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  <ListItemIcon sx={{ color: '#4caf50' }}>
                    <LockIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="เปลี่ยนรหัสผ่าน"
                    primaryTypographyProps={{
                      fontFamily: 'Kanit',
                      color: '#4caf50',
                      fontWeight: 500,
                    }}
                  />
                </ListItem>
              </List>
              <Divider />
            </>
          )}

          {/* Menu Items */}
          <List sx={{ py: 1 }}>
            {menuItems.map((item) => (
              <ListItem
                key={item.key}
                onClick={() => handleMobileMenuItemClick(item.key)}
                sx={{
                  cursor: 'pointer',
                  mx: 2,
                  my: 0.5,
                  borderRadius: '12px',
                  backgroundColor: currentPage === item.key ? 'rgba(33, 150, 243, 0.1)' : 'transparent',
                  border: currentPage === item.key ? '1px solid rgba(33, 150, 243, 0.2)' : 'none',
                  '&:hover': {
                    backgroundColor: currentPage === item.key ? 'rgba(33, 150, 243, 0.15)' : 'rgba(0,0,0,0.05)',
                    transform: 'translateX(4px)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <ListItemIcon sx={{ 
                  color: currentPage === item.key ? '#2196f3' : '#666',
                  minWidth: 40,
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.label}
                  primaryTypographyProps={{
                    fontFamily: 'Kanit',
                    fontWeight: currentPage === item.key ? 'bold' : 'normal',
                    color: currentPage === item.key ? '#2196f3' : '#333',
                    fontSize: '0.95rem',
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
                    mx: 2,
                    my: 0.5,
                    borderRadius: '12px',
                    '&:hover': {
                      backgroundColor: 'rgba(244, 67, 54, 0.1)',
                      transform: 'translateX(4px)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  <ListItemIcon sx={{ color: '#f44336' }}>
                    <Logout />
                  </ListItemIcon>
                  <ListItemText 
                    primary="ออกจากระบบ"
                    primaryTypographyProps={{
                      fontFamily: 'Kanit',
                      color: '#f44336',
                      fontWeight: 500,
                    }}
                  />
                </ListItem>
              </List>
            </>
          )}
        </Box>
      </Drawer>

      {/* Dialog เปลี่ยนรหัสผ่าน */}
      {!isAdmin && isStaffLoggedIn && (
        <ChangePassword
          staffId={currentStaffId}
          open={changePasswordOpen}
          onClose={() => setChangePasswordOpen(false)}
        />
      )}
    </>
  );
};

export default Header; 