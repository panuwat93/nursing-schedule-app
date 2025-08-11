import React, { useState } from 'react';
import { Container, Box, Button, Alert, Snackbar, CircularProgress, Backdrop } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { 
  Save as SaveIcon, 
  FileDownload as ExportIcon, 
  History as HistoryIcon, 
  ArrowBack as BackIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import Header from './components/Header';
import MonthSelector from './components/MonthSelector';
import MonthlySummary from './components/MonthlySummary';
import ScheduleTable from './components/ScheduleTable';
import WorkAssignmentTable from './components/WorkAssignmentTable';
import AdminLogin from './components/AdminLogin';
import StaffLogin from './components/StaffLogin';
import StaffRegistration from './components/StaffRegistration';
import PersonalCalendar from './components/PersonalCalendar';

import { ScheduleEntry, WorkAssignment, CustomHoliday } from './types';
// import { nurses, assistants } from './data/nurses';
import {
  saveScheduleDraft,
  saveAssignmentsDraft,
  loadScheduleDraft,
  loadAssignmentsDraft,
  publishScheduleAndAssignments,
  loadPublishedData
} from './services/dataService';
import { registerStaff, loginStaff } from './services/authService';


const theme = createTheme({
  typography: {
    fontFamily: 'Kanit, Arial, sans-serif',
  },
  palette: {
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#4caf50',
    },
  },
});

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('login');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isStaffLoggedIn, setIsStaffLoggedIn] = useState(false);
  const [currentStaffId, setCurrentStaffId] = useState('');
  const [adminError, setAdminError] = useState('');
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  
  // Schedule data
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [publishedSchedule, setPublishedSchedule] = useState<ScheduleEntry[]>([]);
  
  // Assignment data
  const [assignments, setAssignments] = useState<WorkAssignment[]>([]);
  const [publishedAssignments, setPublishedAssignments] = useState<WorkAssignment[]>([]);
  
  // Custom holidays data
  const [customHolidays, setCustomHolidays] = useState<CustomHoliday[]>([]);
  const [publishedCustomHolidays, setPublishedCustomHolidays] = useState<CustomHoliday[]>([]);
  
  // Original schedule data (before exchange)
  const [originalSchedule, setOriginalSchedule] = useState<ScheduleEntry[]>([]);
  const [originalCustomHolidays, setOriginalCustomHolidays] = useState<CustomHoliday[]>([]);
  

  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  // Notification
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Admin credentials (in real app, this should be in backend)
  const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
  };

  const handleAdminLogin = (username: string, password: string) => {
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      setIsAdmin(true);
      setAdminError('');
      setCurrentPage('admin-schedule');
      showNotification('เข้าสู่ระบบสำเร็จ', 'success');
    } else {
      setAdminError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setIsStaffLoggedIn(false);
    setCurrentStaffId('');
    setCurrentPage('login');
    showNotification('ออกจากระบบสำเร็จ', 'success');
  };

  const handleStaffLogin = async (staffId: string, password: string) => {
    const success = await loginStaff(staffId, password);
    if (success) {
      setIsStaffLoggedIn(true);
      setCurrentStaffId(staffId);
      setCurrentPage('schedule');
      showNotification('เข้าสู่ระบบสำเร็จ', 'success');
      return true;
    }
    return false;
  };

  const handleStaffRegister = async (staffId: string, password: string, confirmPassword: string) => {
    if (password !== confirmPassword) {
      return false;
    }
    
    const success = await registerStaff(staffId, password);
    if (success) {
      showNotification('สมัครสมาชิกสำเร็จ กรุณาเข้าสู่ระบบ', 'success');
      setCurrentPage('login');
      return true;
    } else {
      showNotification('มีบัญชีนี้อยู่แล้ว', 'error');
      return false;
    }
  };

  const handleShowRegister = () => {
    setCurrentPage('register');
  };

  const handleBackToLogin = () => {
    setCurrentPage('login');
  };

  const handleAdminLoginPage = () => {
    setCurrentPage('admin-login');
  };

  const handlePublishSchedule = async () => {
    setIsLoading(true);
    try {
      await publishScheduleAndAssignments(schedule, assignments, customHolidays);
      setPublishedSchedule([...schedule]);
      setPublishedAssignments([...assignments]);
      setPublishedCustomHolidays([...customHolidays]);
      showNotification('ตารางเวรและมอบหมายงานถูกเผยแพร่แล้ว', 'success');
    } catch (error) {
      console.error('Error publishing:', error);
      showNotification('เกิดข้อผิดพลาดในการเผยแพร่ข้อมูล', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublishAssignments = async () => {
    setIsLoading(true);
    try {
      await publishScheduleAndAssignments(schedule, assignments, customHolidays);
      setPublishedSchedule([...schedule]);
      setPublishedAssignments([...assignments]);
      setPublishedCustomHolidays([...customHolidays]);
      showNotification('ตารางมอบหมายงานถูกเผยแพร่แล้ว', 'success');
    } catch (error) {
      console.error('Error publishing assignments:', error);
      showNotification('เกิดข้อผิดพลาดในการเผยแพร่ข้อมูล', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // ฟังก์ชันบันทึกร่าง
  const handleSaveScheduleDraft = async () => {
    setIsLoading(true);
    try {
      await saveScheduleDraft(schedule, customHolidays);
      showNotification('บันทึกร่างตารางเวรเรียบร้อยแล้ว', 'success');
    } catch (error) {
      console.error('Error saving schedule draft:', error);
      showNotification('เกิดข้อผิดพลาดในการบันทึกร่างตารางเวร', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAssignmentsDraft = async () => {
    setIsLoading(true);
    try {
      await saveAssignmentsDraft(assignments);
      showNotification('บันทึกร่างตารางมอบหมายงานเรียบร้อยแล้ว', 'success');
    } catch (error) {
      console.error('Error saving assignments draft:', error);
      showNotification('เกิดข้อผิดพลาดในการบันทึกร่างตารางมอบหมายงาน', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveOriginalSchedule = async () => {
    setIsLoading(true);
    try {
      // บันทึกตารางเวรปัจจุบันเป็นตารางเวรก่อนแลก
      setOriginalSchedule([...schedule]);
      setOriginalCustomHolidays([...customHolidays]);
      showNotification('บันทึกตารางเวรก่อนแลกสำเร็จ', 'success');
    } catch (error) {
      console.error('Error saving original schedule:', error);
      showNotification('เกิดข้อผิดพลาดในการบันทึกตารางเวรก่อนแลก', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
  };

  const handleCloseNotification = () => {
    setNotification(null);
  };



  // โหลดข้อมูลเมื่อเริ่มต้น
  React.useEffect(() => {
    const loadInitialData = async () => {
      setIsInitialLoading(true);
      try {
        // โหลดข้อมูลที่เผยแพร่แล้ว
        const publishedData = await loadPublishedData();
        if (publishedData) {
          setPublishedSchedule(publishedData.publishedSchedule);
          setPublishedAssignments(publishedData.publishedAssignments);
          setPublishedCustomHolidays(publishedData.publishedCustomHolidays);
        }

        // โหลดร่างตารางเวร
        const scheduleDraft = await loadScheduleDraft();
        if (scheduleDraft) {
          setSchedule(scheduleDraft.schedule);
          setCustomHolidays(scheduleDraft.customHolidays);
        }

        // โหลดร่างตารางมอบหมายงาน
        const assignmentsDraft = await loadAssignmentsDraft();
        if (assignmentsDraft) {
          setAssignments(assignmentsDraft.assignments);
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
        showNotification('เกิดข้อผิดพลาดในการโหลดข้อมูล', 'error');
      } finally {
        setIsInitialLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return (
          <StaffLogin
            onLogin={handleStaffLogin}
            onRegister={handleShowRegister}
            onAdminLogin={handleAdminLoginPage}
          />
        );

      case 'register':
        return (
          <StaffRegistration
            onRegister={handleStaffRegister}
            onBackToLogin={handleBackToLogin}
          />
        );

      case 'admin-login':
        return (
          <AdminLogin
            onLogin={handleAdminLogin}
            onBackToLogin={handleBackToLogin}
            error={adminError}
          />
        );

      case 'schedule':
        if (!isStaffLoggedIn && !isAdmin) {
          return (
            <StaffLogin
              onLogin={handleStaffLogin}
              onRegister={handleShowRegister}
            />
          );
        }
        
        return (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <h2 style={{ fontFamily: 'Kanit' }}>ตารางเวรประจำเดือน</h2>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  onClick={handlePublishSchedule}
                  sx={{ 
                    fontFamily: 'Kanit',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    borderRadius: '25px',
                    padding: '12px 30px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                      boxShadow: '0 12px 35px rgba(102, 126, 234, 0.4)',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  บันทึก
                </Button>
              </Box>
            </Box>
            
            <MonthSelector
              year={currentYear}
              month={currentMonth}
              onYearChange={setCurrentYear}
              onMonthChange={setCurrentMonth}
            />
            <MonthlySummary 
              year={currentYear} 
              month={currentMonth} 
              isAdmin={true}
              customHolidays={customHolidays}
              onCustomHolidaysChange={setCustomHolidays}
            />
            <ScheduleTable
              year={currentYear}
              month={currentMonth}
              schedule={schedule}
              onScheduleChange={setSchedule}
              isReadOnly={false}
              customHolidays={customHolidays}
              currentStaffId={currentStaffId}
            />
          </Box>
        );

      case 'assignments':
        if (!isStaffLoggedIn && !isAdmin) {
          return (
            <StaffLogin
              onLogin={handleStaffLogin}
              onRegister={handleShowRegister}
            />
          );
        }
        
        // ตรวจสอบว่าเป็นผู้ใช้ที่สามารถจัดตารางมอบหมายงานได้หรือไม่
        const authorizedStaffIds = ['n2', 'n4', 'n3', 'n7', 'n5', 'n6']; // ศิรินทรา, โยธกา, หทัยชนก, สุวรรณา, ปาณิสรา, ขวัญเรือน
        const isPanuwat = currentStaffId === 'a1'; // ภาณุวัฒน์
        const canManageAssignments = isAdmin || authorizedStaffIds.includes(currentStaffId) || isPanuwat;
        
        return (
          <Box>
            {canManageAssignments && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <h2 style={{ fontFamily: 'Kanit' }}>ตารางมอบหมายงานประจำวัน</h2>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    onClick={handlePublishAssignments}
                    sx={{ 
                      fontFamily: 'Kanit',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      borderRadius: '25px',
                      padding: '12px 30px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                        boxShadow: '0 12px 35px rgba(102, 126, 234, 0.4)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    บันทึก
                  </Button>
                </Box>
              </Box>
            )}
            
            <WorkAssignmentTable
              year={currentYear}
              month={currentMonth}
              assignments={canManageAssignments ? assignments : publishedAssignments}
              onAssignmentChange={canManageAssignments ? setAssignments : () => {}}
              schedule={canManageAssignments ? schedule : publishedSchedule}
              isReadOnly={!canManageAssignments}
              currentStaffId={currentStaffId}
              isPanuwat={isPanuwat} // ส่งข้อมูลว่าเป็นภาณุวัฒน์หรือไม่
            />
          </Box>
        );

      case 'personal-calendar':
        if (!isStaffLoggedIn && !isAdmin) {
          return (
            <StaffLogin
              onLogin={handleStaffLogin}
              onRegister={handleShowRegister}
            />
          );
        }
        
        return (
          <Box>
            <PersonalCalendar
              year={currentYear}
              month={currentMonth}
              schedule={schedule}
              assignments={assignments}
              currentStaffId={currentStaffId}
              onYearChange={setCurrentYear}
              onMonthChange={setCurrentMonth}
            />
          </Box>
        );



      case 'admin-schedule':
        return (
          <Box>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: 3,
              p: 3,
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              borderRadius: '16px',
              border: '1px solid rgba(0,0,0,0.08)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <ScheduleIcon sx={{ fontSize: 32, color: '#2196f3' }} />
                <h2 style={{ 
                  fontFamily: 'Kanit', 
                  margin: 0,
                  background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 700,
                }}>
                  จัดตารางเวร
                </h2>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveScheduleDraft}
                  sx={{ 
                    fontFamily: 'Kanit',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    textTransform: 'none',
                    borderRadius: '25px',
                    px: 3,
                    py: 1.5,
                    background: 'linear-gradient(45deg, #4caf50, #66bb6a)',
                    boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #43a047, #4caf50)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(76, 175, 80, 0.4)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  บันทึกร่าง
                </Button>
                <Button
                  variant="contained"
                  startIcon={<ExportIcon />}
                  onClick={handlePublishSchedule}
                  sx={{ 
                    fontFamily: 'Kanit',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    textTransform: 'none',
                    borderRadius: '25px',
                    px: 3,
                    py: 1.5,
                    background: 'linear-gradient(45deg, #2196f3, #42a5f5)',
                    boxShadow: '0 4px 15px rgba(33, 150, 243, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #1976d2, #2196f3)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(33, 150, 243, 0.4)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  เผยแพร่
                </Button>
                <Button
                  variant="contained"
                  startIcon={<HistoryIcon />}
                  onClick={handleSaveOriginalSchedule}
                  sx={{ 
                    fontFamily: 'Kanit',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    textTransform: 'none',
                    borderRadius: '25px',
                    px: 3,
                    py: 1.5,
                    background: 'linear-gradient(45deg, #ff9800, #ffb74d)',
                    boxShadow: '0 4px 15px rgba(255, 152, 0, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #f57c00, #ff9800)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(255, 152, 0, 0.4)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  บันทึกตารางเวรก่อนแลก
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<BackIcon />}
                  onClick={() => setCurrentPage('schedule')}
                  sx={{ 
                    fontFamily: 'Kanit',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    textTransform: 'none',
                    borderRadius: '25px',
                    px: 3,
                    py: 1.5,
                    border: '2px solid #9e9e9e',
                    color: '#616161',
                    '&:hover': {
                      border: '2px solid #757575',
                      backgroundColor: 'rgba(158, 158, 158, 0.04)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  กลับ
                </Button>
              </Box>
            </Box>

            <MonthSelector
              year={currentYear}
              month={currentMonth}
              onYearChange={setCurrentYear}
              onMonthChange={setCurrentMonth}
            />
            <MonthlySummary 
              year={currentYear} 
              month={currentMonth} 
              isAdmin={true}
              customHolidays={customHolidays}
              onCustomHolidaysChange={setCustomHolidays}
            />
            <ScheduleTable
              year={currentYear}
              month={currentMonth}
              schedule={schedule}
              onScheduleChange={setSchedule}
              isReadOnly={false}
              customHolidays={customHolidays}
              currentStaffId={currentStaffId}
            />
          </Box>
        );

      case 'admin-assignments':
        return (
          <Box>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: 3,
              p: 3,
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              borderRadius: '16px',
              border: '1px solid rgba(0,0,0,0.08)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <AssignmentIcon sx={{ fontSize: 32, color: '#ff6f00' }} />
                <h2 style={{ 
                  fontFamily: 'Kanit', 
                  margin: 0,
                  background: 'linear-gradient(45deg, #e65100, #ff6f00)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 700,
                }}>
                  จัดตารางมอบหมายงาน
                </h2>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveAssignmentsDraft}
                  sx={{ 
                    fontFamily: 'Kanit',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    textTransform: 'none',
                    borderRadius: '25px',
                    px: 3,
                    py: 1.5,
                    background: 'linear-gradient(45deg, #4caf50, #66bb6a)',
                    boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #43a047, #4caf50)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(76, 175, 80, 0.4)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  บันทึกร่าง
                </Button>
                <Button
                  variant="contained"
                  startIcon={<ExportIcon />}
                  onClick={handlePublishAssignments}
                  sx={{ 
                    fontFamily: 'Kanit',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    textTransform: 'none',
                    borderRadius: '25px',
                    px: 3,
                    py: 1.5,
                    background: 'linear-gradient(45deg, #2196f3, #42a5f5)',
                    boxShadow: '0 4px 15px rgba(33, 150, 243, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #1976d2, #2196f3)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(33, 150, 243, 0.4)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  เผยแพร่
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<BackIcon />}
                  onClick={() => setCurrentPage('schedule')}
                  sx={{ 
                    fontFamily: 'Kanit',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    textTransform: 'none',
                    borderRadius: '25px',
                    px: 3,
                    py: 1.5,
                    border: '2px solid #9e9e9e',
                    color: '#616161',
                    '&:hover': {
                      border: '2px solid #757575',
                      backgroundColor: 'rgba(158, 158, 158, 0.04)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  กลับ
                </Button>
              </Box>
            </Box>

            <WorkAssignmentTable
              year={currentYear}
              month={currentMonth}
              assignments={assignments}
              onAssignmentChange={setAssignments}
              schedule={schedule}
              isReadOnly={false}
              currentStaffId={currentStaffId}
            />
          </Box>
        );

      case 'original-schedule':
        return (
          <Box>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: 3,
              p: 3,
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              borderRadius: '16px',
              border: '1px solid rgba(0,0,0,0.08)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <HistoryIcon sx={{ fontSize: 32, color: '#ff9800' }} />
                <h2 style={{ 
                  fontFamily: 'Kanit', 
                  margin: 0,
                  background: 'linear-gradient(45deg, #f57c00, #ff9800)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 700,
                }}>
                  ตารางเวรก่อนแลก
                </h2>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<BackIcon />}
                  onClick={() => setCurrentPage('admin-schedule')}
                  sx={{ 
                    fontFamily: 'Kanit',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    textTransform: 'none',
                    borderRadius: '25px',
                    px: 3,
                    py: 1.5,
                    border: '2px solid #9e9e9e',
                    color: '#616161',
                    '&:hover': {
                      border: '2px solid #757575',
                      backgroundColor: 'rgba(158, 158, 158, 0.04)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  กลับ
                </Button>
              </Box>
            </Box>
            
            <MonthSelector
              year={currentYear}
              month={currentMonth}
              onYearChange={setCurrentYear}
              onMonthChange={setCurrentMonth}
            />
            <MonthlySummary 
              year={currentYear} 
              month={currentMonth} 
              isAdmin={true}
              customHolidays={customHolidays}
              onCustomHolidaysChange={setCustomHolidays}
            />
            <ScheduleTable
              year={currentYear}
              month={currentMonth}
              schedule={originalSchedule}
              onScheduleChange={() => {}}
              isReadOnly={true}
              customHolidays={originalCustomHolidays}
              currentStaffId={currentStaffId}
            />
          </Box>
        );



      default:
        return <div>Page not found</div>;
    }
  };

  if (isInitialLoading) {
    return (
      <ThemeProvider theme={theme}>
        <Box 
          sx={{ 
            minHeight: '100vh', 
            backgroundColor: '#f5f5f5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 2
          }}
        >
          <CircularProgress size={60} />
          <Box sx={{ fontFamily: 'Kanit', fontSize: '1.2rem', color: '#666' }}>
            กำลังโหลดข้อมูล...
          </Box>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        {/* แสดง Header เฉพาะเมื่อไม่ได้อยู่ในหน้าล็อกอินหรือสมัครสมาชิก */}
        {(currentPage !== 'login' && currentPage !== 'register' && currentPage !== 'admin-login') && (
          <Header
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            isAdmin={isAdmin}
            isStaffLoggedIn={isStaffLoggedIn}
            currentStaffId={currentStaffId}
            onLogout={handleLogout}
          />
        )}
        
        {/* แสดง Container เฉพาะเมื่อไม่ได้อยู่ในหน้าล็อกอินหรือสมัครสมาชิก */}
        {(currentPage !== 'login' && currentPage !== 'register' && currentPage !== 'admin-login') ? (
          <Container maxWidth="xl" sx={{ py: 3 }}>
            {renderPage()}
          </Container>
        ) : (
          renderPage()
        )}

        <Snackbar
          open={!!notification}
          autoHideDuration={6000}
          onClose={handleCloseNotification}
        >
          <Alert
            onClose={handleCloseNotification}
            severity={notification?.type}
            sx={{ fontFamily: 'Kanit' }}
          >
            {notification?.message}
          </Alert>
        </Snackbar>

        {/* Loading backdrop for operations */}
        <Backdrop
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={isLoading}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <CircularProgress color="inherit" />
            <Box sx={{ fontFamily: 'Kanit' }}>กำลังดำเนินการ...</Box>
          </Box>
        </Backdrop>


      </Box>
    </ThemeProvider>
  );
};

export default App; 