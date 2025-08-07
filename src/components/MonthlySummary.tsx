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
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" sx={{ mb: 1.5, fontFamily: 'Kanit', fontSize: '1.1rem' }}>
        สรุปวันทำการประจำเดือน
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontFamily: 'Kanit', fontWeight: 'bold', mb: 0.5, fontSize: '0.9rem' }}>
              วันทำการ
            </Typography>
            <Chip 
              label={`${daysInfo.actualWorkingDays} วัน`} 
              color="primary" 
              size="small"
              sx={{ fontFamily: 'Kanit', fontSize: '0.8rem' }}
            />
          </Box>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="subtitle2" sx={{ fontFamily: 'Kanit', fontWeight: 'bold', fontSize: '0.9rem' }}>
                วันหยุดราชการ
              </Typography>
              {isAdmin && (
                <Tooltip title="เพิ่มวันหยุด">
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => setIsAddDialogOpen(true)}
                    sx={{ fontFamily: 'Kanit', width: 28, height: 28 }}
                  >
                    <AddIcon sx={{ fontSize: '1rem' }} />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
            
            {loading && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={14} />
                <Typography variant="body2" sx={{ fontFamily: 'Kanit', color: 'text.secondary', fontSize: '0.8rem' }}>
                  กำลังดึงข้อมูลวันหยุดราชการ...
                </Typography>
              </Box>
            )}
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {allHolidays.length > 0 ? (
                allHolidays.map((holiday, index) => (
                  <Box key={`${holiday.date}-${holiday.name}-${index}`} sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                    <Chip
                      label={`${format(new Date(holiday.date), 'd')} ${holiday.name}`}
                      size="small"
                      color={holiday.type === 'custom' ? 'success' : 'error'}
                      variant="outlined"
                      sx={{ fontFamily: 'Kanit', fontSize: '0.7rem', height: '24px' }}
                    />
                    {isAdmin && (
                      <Tooltip title="ลบวันหยุด">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => openDeleteDialog(holiday)}
                          sx={{ 
                            fontFamily: 'Kanit',
                            width: 18,
                            height: 18,
                            '& .MuiSvgIcon-root': {
                              fontSize: '0.7rem'
                            }
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                ))
              ) : !loading ? (
                <Typography variant="body2" sx={{ fontFamily: 'Kanit', color: 'text.secondary', fontSize: '0.8rem' }}>
                  ไม่มีวันหยุดราชการในเดือนนี้
                </Typography>
              ) : null}
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Add Holiday Dialog */}
      <Dialog open={isAddDialogOpen} onClose={closeAddDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: 'Kanit' }}>
          เพิ่มวันหยุด
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="เลือกวันที่"
              type="date"
              value={newHoliday.date}
              onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
              InputLabelProps={{ 
                sx: { fontFamily: 'Kanit' },
                shrink: true
              }}
              sx={{ fontFamily: 'Kanit' }}
            />
            
            <TextField
              fullWidth
              label="ชื่อวันหยุด"
              value={newHoliday.name}
              onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
              placeholder="เช่น วันหยุดชดเชย, วันหยุดพิเศษ"
              InputLabelProps={{ sx: { fontFamily: 'Kanit' } }}
              sx={{ fontFamily: 'Kanit' }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeAddDialog} sx={{ fontFamily: 'Kanit' }}>
            ยกเลิก
          </Button>
          <Button 
            onClick={handleAddHoliday} 
            variant="contained" 
            disabled={!newHoliday.date || !newHoliday.name.trim()}
            sx={{ fontFamily: 'Kanit' }}
          >
            เพิ่ม
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Holiday Dialog */}
      <Dialog open={isDeleteDialogOpen} onClose={closeDeleteDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: 'Kanit' }}>
          ยืนยันการลบวันหยุด
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontFamily: 'Kanit', mt: 2 }}>
            คุณต้องการลบวันหยุด "{holidayToDelete?.name}" ในวันที่ {holidayToDelete ? format(new Date(holidayToDelete.date), 'd MMMM yyyy', { locale: th }) : ''} หรือไม่?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} sx={{ fontFamily: 'Kanit' }}>
            ยกเลิก
          </Button>
          <Button 
            onClick={() => holidayToDelete && handleDeleteHoliday(holidayToDelete)} 
            variant="contained" 
            color="error"
            sx={{ fontFamily: 'Kanit' }}
          >
            ลบ
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default MonthlySummary; 