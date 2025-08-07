import React, { useState } from 'react';
import { Container, Box, Button, Alert, Snackbar, CircularProgress, Backdrop } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Header from './components/Header';
import MonthSelector from './components/MonthSelector';
import MonthlySummary from './components/MonthlySummary';
import ScheduleTable from './components/ScheduleTable';
import WorkAssignmentTable from './components/WorkAssignmentTable';
import AdminLogin from './components/AdminLogin';
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
  const [currentPage, setCurrentPage] = useState('schedule');
  const [isAdmin, setIsAdmin] = useState(false);
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
      setCurrentPage('admin');
      showNotification('เข้าสู่ระบบสำเร็จ', 'success');
    } else {
      setAdminError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setCurrentPage('schedule');
    showNotification('ออกจากระบบสำเร็จ', 'success');
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
      case 'schedule':
        return (
          <Box>
            <MonthSelector
              year={currentYear}
              month={currentMonth}
              onYearChange={setCurrentYear}
              onMonthChange={setCurrentMonth}
            />
            <MonthlySummary 
              year={currentYear} 
              month={currentMonth} 
              isAdmin={false}
              customHolidays={publishedCustomHolidays}
            />
            <ScheduleTable
              year={currentYear}
              month={currentMonth}
              schedule={publishedSchedule}
              onScheduleChange={() => {}}
              isReadOnly={true}
              customHolidays={publishedCustomHolidays}
            />
          </Box>
        );

      case 'assignments':
        return (
          <Box>
            <WorkAssignmentTable
              year={currentYear}
              month={currentMonth}
              assignments={publishedAssignments}
              onAssignmentChange={() => {}}
              schedule={publishedSchedule}
              isReadOnly={true}
            />
          </Box>
        );

      case 'admin':
        if (!isAdmin) {
          return (
            <AdminLogin
              onLogin={handleAdminLogin}
              error={adminError}
            />
          );
        }

        return (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <h2 style={{ fontFamily: 'Kanit' }}>เมนูแอดมิน</h2>
              <Button
                variant="outlined"
                onClick={handleLogout}
                sx={{ fontFamily: 'Kanit' }}
              >
                ออกจากระบบ
              </Button>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Button
                variant="contained"
                onClick={() => setCurrentPage('admin-schedule')}
                sx={{ fontFamily: 'Kanit' }}
              >
                จัดตารางเวร
              </Button>
              <Button
                variant="contained"
                onClick={() => setCurrentPage('admin-assignments')}
                sx={{ fontFamily: 'Kanit' }}
              >
                จัดตารางมอบหมายงาน
              </Button>
            </Box>
          </Box>
        );

      case 'admin-schedule':
        return (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <h2 style={{ fontFamily: 'Kanit' }}>จัดตารางเวร</h2>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  color="success"
                  onClick={handleSaveScheduleDraft}
                  sx={{ fontFamily: 'Kanit' }}
                >
                  บันทึกร่าง
                </Button>
                <Button
                  variant="contained"
                  onClick={handlePublishSchedule}
                  sx={{ fontFamily: 'Kanit' }}
                >
                  ส่งออก
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setCurrentPage('admin')}
                  sx={{ fontFamily: 'Kanit' }}
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
            />
          </Box>
        );

      case 'admin-assignments':
        return (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <h2 style={{ fontFamily: 'Kanit' }}>จัดตารางมอบหมายงาน</h2>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  color="success"
                  onClick={handleSaveAssignmentsDraft}
                  sx={{ fontFamily: 'Kanit' }}
                >
                  บันทึกร่าง
                </Button>
                <Button
                  variant="contained"
                  onClick={handlePublishAssignments}
                  sx={{ fontFamily: 'Kanit' }}
                >
                  ส่งออก
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setCurrentPage('admin')}
                  sx={{ fontFamily: 'Kanit' }}
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
        <Header
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          isAdmin={isAdmin}
        />
        
        <Container maxWidth="xl" sx={{ py: 3 }}>
          {renderPage()}
        </Container>

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