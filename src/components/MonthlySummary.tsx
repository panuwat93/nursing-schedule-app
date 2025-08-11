import React, { useState, useEffect, useCallback } from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Chip,
  // Divider,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';

import { format } from 'date-fns';
import { th } from 'date-fns/locale';

interface MonthlySummaryProps {
  year: number;
  month: number;
  isAdmin?: boolean;
  customHolidays?: CustomHoliday[];
  onCustomHolidaysChange?: (holidays: CustomHoliday[]) => void;
}

interface PublicHoliday {
  date: string;
  name: string;
  type: string;
}

interface CustomHoliday {
  id: string;
  date: string;
  name: string;
  type: 'custom';
}

const MonthlySummary: React.FC<MonthlySummaryProps> = ({ 
  year, 
  month, 
  isAdmin = false,
  customHolidays = [],
  onCustomHolidaysChange
}) => {
  const [publicHolidays, setPublicHolidays] = useState<PublicHoliday[]>([]);
  const [loading, setLoading] = useState(false);

  
  // Admin holiday management
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newHoliday, setNewHoliday] = useState({ date: '', name: '' });
  const [holidayToDelete, setHolidayToDelete] = useState<PublicHoliday | CustomHoliday | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Get all days in the month
  const getAllDaysInMonth = (year: number, month: number): Date[] => {
    const days: Date[] = [];
    const lastDay = new Date(year, month, 0);
    
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month - 1, day));
    }
    
    return days;
  };

  // Calculate actual working days and holidays based on real data
  const calculateActualDays = () => {
    const allDays = getAllDaysInMonth(year, month);
    const weekendHolidays: Date[] = [];
    const publicHolidayDates: Date[] = [];
    
    // สร้าง filteredCustomHolidays และ visiblePublicHolidays สำหรับการคำนวณ
    const filteredCustomHolidays = customHolidays.filter(holiday => {
      const holidayDate = new Date(holiday.date);
      return holidayDate.getFullYear() === year && holidayDate.getMonth() + 1 === month;
    });

    const hiddenDates = filteredCustomHolidays
      .filter(holiday => holiday.name.startsWith('ซ่อน:'))
      .map(holiday => holiday.date);

    const visiblePublicHolidays = publicHolidays.filter(holiday => 
      !hiddenDates.includes(holiday.date)
    );
    
    allDays.forEach(day => {
      const dayOfWeek = day.getDay();
      // Check if it's weekend (Saturday = 6, Sunday = 0)
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        weekendHolidays.push(day);
      }
      
      // Check if it's a public holiday (including custom holidays)
      const dateStr = format(day, 'yyyy-MM-dd');
      const publicHoliday = visiblePublicHolidays.find(holiday => 
        holiday.date === dateStr
      );
      const customHoliday = filteredCustomHolidays.find(holiday => 
        holiday.date === dateStr && !holiday.name.startsWith('ซ่อน:')
      );
      if (publicHoliday || customHoliday) {
        publicHolidayDates.push(day);
      }
    });
    
    // Working days = total days - weekend holidays - public holidays
    const totalDays = allDays.length;
    const totalHolidays = weekendHolidays.length + publicHolidayDates.length;
    const actualWorkingDays = totalDays - totalHolidays;
    
    return {
      totalDays,
      actualWorkingDays,
      totalHolidays,
      weekendHolidays: weekendHolidays.length,
      publicHolidays: publicHolidayDates.length
    };
  };

  // สร้าง allHolidays สำหรับ render
  const filteredCustomHolidays = customHolidays.filter(holiday => {
    const holidayDate = new Date(holiday.date);
    return holidayDate.getFullYear() === year && holidayDate.getMonth() + 1 === month;
  });

  // กรองวันหยุดราชการที่ถูกซ่อน
  const hiddenDates = filteredCustomHolidays
    .filter(holiday => holiday.name.startsWith('ซ่อน:'))
    .map(holiday => holiday.date);

  const visiblePublicHolidays = publicHolidays.filter(holiday => 
    !hiddenDates.includes(holiday.date)
  );

  // กรองข้อมูลซ้ำออกจาก allHolidays
  const allHolidays = [...visiblePublicHolidays, ...filteredCustomHolidays.filter(holiday => 
    !holiday.name.startsWith('ซ่อน:')
  )].filter((holiday, index, self) => 
    index === self.findIndex(h => h.date === holiday.date && h.name === holiday.name)
  );

  const daysInfo = calculateActualDays();

  // Admin holiday management functions
  const handleAddHoliday = () => {
    if (!newHoliday.date || !newHoliday.name.trim()) return;
    
    const customHoliday: CustomHoliday = {
      id: Date.now().toString(),
      date: newHoliday.date,
      name: newHoliday.name.trim(),
      type: 'custom'
    };
    
    const updatedHolidays = [...customHolidays, customHoliday];
    onCustomHolidaysChange?.(updatedHolidays);
    
    setNewHoliday({ date: '', name: '' });
    setIsAddDialogOpen(false);
  };

  const handleDeleteHoliday = (holiday: PublicHoliday | CustomHoliday) => {
    if ('id' in holiday && holiday.type === 'custom') {
      // Delete custom holiday
      const updatedHolidays = customHolidays.filter(h => h.id !== holiday.id);
      onCustomHolidaysChange?.(updatedHolidays);
    } else {
      // Delete public holiday by adding it to custom holidays as "hidden"
      const hiddenHoliday: CustomHoliday = {
        id: `hidden_${holiday.date}_${Date.now()}`,
        date: holiday.date,
        name: `ซ่อน: ${holiday.name}`,
        type: 'custom'
      };
      
      const updatedHolidays = [...customHolidays, hiddenHoliday];
      onCustomHolidaysChange?.(updatedHolidays);
    }
    
    setHolidayToDelete(null);
    setIsDeleteDialogOpen(false);
  };

  const openDeleteDialog = (holiday: PublicHoliday | CustomHoliday) => {
    setHolidayToDelete(holiday);
    setIsDeleteDialogOpen(true);
  };

  const closeAddDialog = () => {
    setIsAddDialogOpen(false);
    setNewHoliday({ date: '', name: '' });
  };

  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setHolidayToDelete(null);
  };

  // Get comprehensive Thai public holidays
  const getThaiPublicHolidays = useCallback((year: number, month: number): PublicHoliday[] => {
    const holidays: { [key: string]: string } = {
      // มกราคม
      '01-01': 'วันขึ้นปีใหม่',
      
      // เมษายน
      '04-06': 'วันจักรี',
      '04-13': 'วันสงกรานต์',
      '04-14': 'วันสงกรานต์',
      '04-15': 'วันสงกรานต์',
      
      // พฤษภาคม
      '05-01': 'วันแรงงานแห่งชาติ',
      '05-05': 'วันฉัตรมงคล',
      
      // กรกฎาคม
      '07-28': 'วันเฉลิมพระชนมพรรษาพระบาทสมเด็จพระเจ้าอยู่หัว',
      
      // สิงหาคม
      '08-12': 'วันแม่แห่งชาติ',
      
      // ตุลาคม
      '10-23': 'วันปิยมหาราช',
      
      // ธันวาคม
      '12-05': 'วันพ่อแห่งชาติ',
      '12-10': 'วันรัฐธรรมนูญ',
    };

    // Add Buddhist holidays (calculated based on lunar calendar)
    const buddhistHolidays = getBuddhistHolidays(year, month);
    Object.assign(holidays, buddhistHolidays);

    const monthHolidays: PublicHoliday[] = [];
    const monthStr = month.toString().padStart(2, '0');
    
    Object.entries(holidays).forEach(([date, name]) => {
      if (date.startsWith(monthStr)) {
        monthHolidays.push({
          date: `${year}-${date}`,
          name,
          type: 'public'
        });
      }
    });

    return monthHolidays;
  }, []);

  // Get Buddhist holidays (calculated based on lunar calendar)
  const getBuddhistHolidays = (year: number, month: number): { [key: string]: string } => {
    const holidays: { [key: string]: string } = {};
    
    // วันหยุดทางพุทธศาสนาตามปี 2025
    if (year === 2025) {
      // วันมาฆบูชา - 13 กุมภาพันธ์ 2025 (วันพฤหัสบดี)
      if (month === 2) {
        holidays['02-13'] = 'วันมาฆบูชา';
      }
      
      // วันวิสาขบูชา - 13 พฤษภาคม 2025 (วันอังคาร)
      if (month === 5) {
        holidays['05-13'] = 'วันวิสาขบูชา';
      }
      
      // วันอาสาฬหบูชา - 11 กรกฎาคม 2025 (วันศุกร์)
      if (month === 7) {
        holidays['07-11'] = 'วันอาสาฬหบูชา';
      }
      
      // วันเข้าพรรษา - 12 กรกฎาคม 2025 (วันเสาร์) - ไม่ใช่วันหยุดราชการ
      // ไม่เพิ่มวันเข้าพรรษาเพราะเป็นวันเสาร์
      
      // วันออกพรรษา - 9 ตุลาคม 2025 (วันพฤหัสบดี)
      if (month === 10) {
        holidays['10-09'] = 'วันออกพรรษา';
      }
    }
    
    // วันหยุดทางพุทธศาสนาตามปี 2024
    if (year === 2024) {
      // วันมาฆบูชา - 24 กุมภาพันธ์ 2024 (วันเสาร์) - ไม่ใช่วันหยุดราชการ
      // ไม่เพิ่มวันมาฆบูชาเพราะเป็นวันเสาร์
      
      // วันวิสาขบูชา - 22 พฤษภาคม 2024 (วันพุธ)
      if (month === 5) {
        holidays['05-22'] = 'วันวิสาขบูชา';
      }
      
      // วันอาสาฬหบูชา - 20 กรกฎาคม 2024 (วันเสาร์) - ไม่ใช่วันหยุดราชการ
      // ไม่เพิ่มวันอาสาฬหบูชาเพราะเป็นวันเสาร์
      
      // วันเข้าพรรษา - 21 กรกฎาคม 2024 (วันอาทิตย์) - ไม่ใช่วันหยุดราชการ
      // ไม่เพิ่มวันเข้าพรรษาเพราะเป็นวันอาทิตย์
      
      // วันออกพรรษา - 18 ตุลาคม 2024 (วันศุกร์)
      if (month === 10) {
        holidays['10-18'] = 'วันออกพรรษา';
      }
    }
    
    return holidays;
  };

  // Use static holiday data instead of external APIs
  useEffect(() => {
    const fetchPublicHolidays = () => {
      setLoading(true);
      
      try {
        // Use local holiday data to avoid API issues
        const staticHolidays = getThaiPublicHolidays(year, month);
        const buddhistHolidays = getBuddhistHolidays(year, month);
        
        // สร้างวันหยุดจากข้อมูลคงที่
        const staticHolidayList = staticHolidays;
        
        // สร้างวันหยุดทางพุทธศาสนา
        const buddhistHolidayList = Object.entries(buddhistHolidays).map(([date, name]) => ({
          date: `${year}-${date}`,
          name,
          type: 'public'
        }));
        
        // รวมข้อมูลและกรองซ้ำ
        const publicHolidays = [...staticHolidayList, ...buddhistHolidayList].filter((holiday, index, self) => 
          index === self.findIndex(h => h.date === holiday.date && h.name === holiday.name)
        );



        setPublicHolidays(publicHolidays);
      } catch (error) {
        console.error('Error loading holidays:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicHolidays();
  }, [year, month, customHolidays, getThaiPublicHolidays]);

  return (
    <>
      <Paper
        elevation={3}
        sx={{
          p: 3,
          mb: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '20px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          border: '2px solid rgba(255,255,255,0.1)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4)',
            borderRadius: '20px 20px 0 0'
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ff6b6b, #4ecdc4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2,
              boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
              fontSize: '24px'
            }}
          >
            📊
          </Box>
          <Typography
            variant="h5"
            sx={{
              background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 'bold',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            สรุปวันทำการประจำเดือน
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                p: 2,
                borderRadius: '15px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  color: 'white',
                  mb: 2,
                  fontWeight: 'bold',
                  textAlign: 'center',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}
              >
                🏥 วันทำการ
              </Typography>
              <Box sx={{ textAlign: 'center' }}>
                <Chip
                  label={`${daysInfo.actualWorkingDays} วัน`}
                  size="medium"
                  variant="filled"
                  sx={{
                    background: 'linear-gradient(135deg, #4caf50, #45a049)',
                    color: 'white',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    padding: '8px 16px',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 16px rgba(76, 175, 80, 0.4)',
                      transition: 'all 0.3s ease'
                    }
                  }}
                />
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box
              sx={{
                p: 2,
                borderRadius: '15px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  color: 'white',
                  mb: 2,
                  fontWeight: 'bold',
                  textAlign: 'center',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}
              >
                🎉 วันหยุดราชการ
              </Typography>
              <Box sx={{ textAlign: 'center' }}>
                <IconButton
                  onClick={() => setIsAddDialogOpen(true)}
                  sx={{
                    background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
                    color: 'white',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #ee5a52, #d63031)',
                      transform: 'scale(1.1)',
                      transition: 'all 0.3s ease'
                    }
                  }}
                >
                  <AddIcon />
                </IconButton>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {loading && (
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <CircularProgress
              sx={{
                color: 'white',
                mb: 2
              }}
            />
            <Typography
              variant="body2"
              sx={{
                color: 'white',
                opacity: 0.8
              }}
            >
              กำลังโหลดข้อมูล...
            </Typography>
          </Box>
        )}

        {allHolidays.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography
              variant="h6"
              sx={{
                color: 'white',
                mb: 2,
                fontWeight: 'bold',
                textAlign: 'center',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}
            >
              รายการวันหยุด
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
              {allHolidays.map((holiday, index) => (
                <Chip
                  key={`${holiday.date}-${holiday.name}-${index}`}
                  label={`${format(new Date(holiday.date), 'd')} ${holiday.name}`}
                  variant="filled"
                  onDelete={() => openDeleteDialog(holiday)}
                  sx={{
                    background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
                    color: 'white',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 16px rgba(255, 107, 107, 0.4)',
                      transition: 'all 0.3s ease'
                    },
                    '& .MuiChip-deleteIcon': {
                      color: 'white',
                      '&:hover': {
                        color: '#ffeaa7'
                      }
                    }
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        {allHolidays.length === 0 && !loading && (
          <Typography
            variant="body1"
            sx={{
              color: 'white',
              textAlign: 'center',
              mt: 3,
              opacity: 0.8,
              fontStyle: 'italic'
            }}
          >
            🎯 ไม่มีวันหยุดราชการในเดือนนี้
          </Typography>
        )}
      </Paper>

      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </>
  );
};

export default MonthlySummary; 