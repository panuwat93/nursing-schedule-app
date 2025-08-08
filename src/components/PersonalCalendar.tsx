import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { ScheduleEntry, WorkAssignment } from '../types';
import { nurses, assistants } from '../data/nurses';
import { nurseShifts, assistantShifts } from '../data/shifts';

interface PersonalCalendarProps {
  year: number;
  month: number;
  schedule: ScheduleEntry[];
  assignments: WorkAssignment[];
  currentStaffId: string;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
}

const PersonalCalendar: React.FC<PersonalCalendarProps> = ({
  year,
  month,
  schedule,
  assignments,
  currentStaffId,
  onYearChange,
  onMonthChange,
}) => {
  const allStaff = [...nurses, ...assistants];
  const currentStaff = allStaff.find(s => s.id === currentStaffId);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

  const getDayName = (date: Date) => {
    const days = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
    return days[date.getDay()];
  };

  const getShiftForDate = (date: string, shiftType?: 'morning' | 'afternoon' | 'night') => {
    const entry = schedule.find(e => 
      e.nurseId === currentStaffId && 
      e.date === date && 
      e.shiftType === shiftType
    );
    
    if (!entry) return null;

    // ถ้ามี customText ให้ใช้ customText แทน
    if (entry.customText) {
      return { code: entry.customText };
    }

    const shifts = currentStaff?.type === 'nurse' ? nurseShifts : assistantShifts;
    return shifts.find(s => s.id === entry.shiftId) || null;
  };

  const getAssignmentsForDate = (date: string) => {
    return assignments.filter(a => a.nurseId === currentStaffId && a.date === date);
  };

  const getShiftName = (shiftId: string) => {
    const shifts = currentStaff?.type === 'nurse' ? nurseShifts : assistantShifts;
    const shift = shifts.find(s => s.id === shiftId);
    return shift?.code || shiftId;
  };

  return (
    <Box>
      {/* ส่วนเลือกเดือน/ปี */}
      <Paper sx={{ p: 2, mb: 2, backgroundColor: '#f8f9fa' }}>
        <Typography variant="h6" sx={{ fontFamily: 'Kanit', mb: 2 }}>
          เลือกเดือน/ปี
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel sx={{ fontFamily: 'Kanit' }}>เดือน</InputLabel>
              <Select
                value={month.toString()}
                label="เดือน"
                onChange={(e) => onMonthChange(Number(e.target.value))}
                sx={{ fontFamily: 'Kanit' }}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <MenuItem key={month} value={month.toString()} sx={{ fontFamily: 'Kanit' }}>
                    {format(new Date(year, month - 1, 1), 'MMMM', { locale: th })}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel sx={{ fontFamily: 'Kanit' }}>ปี</InputLabel>
              <Select
                value={year.toString()}
                label="ปี"
                onChange={(e) => onYearChange(Number(e.target.value))}
                sx={{ fontFamily: 'Kanit' }}
              >
                {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 2 + i).map((year) => (
                  <MenuItem key={year} value={year.toString()} sx={{ fontFamily: 'Kanit' }}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1" sx={{ fontFamily: 'Kanit', fontWeight: 'bold', color: 'primary.main' }}>
              ปฏิทินส่วนตัว {currentStaff?.name} - {format(new Date(year, month - 1), 'MMMM yyyy', { locale: th })}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* ปฏิทิน */}
      <Grid container spacing={1}>
        {Array.from({ length: getDaysInMonth(year, month) }, (_, i) => {
          const day = i + 1;
          const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
          const date = new Date(year, month - 1, day);
          const dayName = getDayName(date);
          const isWeekend = date.getDay() === 0 || date.getDay() === 6;
          
          // ดึงเวรและงานที่ได้รับมอบหมาย
          const morningShift = getShiftForDate(dateStr, 'morning');
          const afternoonShift = getShiftForDate(dateStr, 'afternoon');
          const nightShift = getShiftForDate(dateStr, 'night');
          const partTimeShift = currentStaff?.isPartTime ? getShiftForDate(dateStr) : null;
          const dayAssignments = getAssignmentsForDate(dateStr);
          
          return (
            <Grid item xs={6} sm={4} md={3} lg={2} key={day}>
              <Card 
                sx={{ 
                  height: 200,
                  backgroundColor: isWeekend ? '#ffebee' : '#ffffff',
                  border: '1px solid #e0e0e0',
                  '&:hover': { backgroundColor: isWeekend ? '#ffcdd2' : '#f5f5f5' }
                }}
              >
                <CardContent sx={{ p: 1, textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontFamily: 'Kanit', fontSize: '1.1rem' }}>
                    {day}
                  </Typography>
                  <Typography variant="caption" sx={{ fontFamily: 'Kanit', color: isWeekend ? '#d32f2f' : '#666' }}>
                    {dayName}
                  </Typography>
                  
                  <Box sx={{ mt: 0.5, display: 'flex', flexDirection: 'column', gap: 0.3 }}>
                                         {/* แสดงเวร */}
                     {morningShift && (
                       <Chip
                         label={morningShift.code}
                         size="small"
                         sx={{ 
                           fontFamily: 'Kanit',
                           backgroundColor: '#e3f2fd',
                           color: '#1976d2',
                           fontSize: '0.6rem',
                           height: '16px'
                         }}
                       />
                     )}
                     
                     {afternoonShift && (
                       <Chip
                         label={afternoonShift.code}
                         size="small"
                         sx={{ 
                           fontFamily: 'Kanit',
                           backgroundColor: '#fff3e0',
                           color: '#e65100',
                           fontSize: '0.6rem',
                           height: '16px'
                         }}
                       />
                     )}
                     
                     {nightShift && (
                       <Chip
                         label={nightShift.code}
                         size="small"
                         sx={{ 
                           fontFamily: 'Kanit',
                           backgroundColor: '#f3e5f5',
                           color: '#7b1fa2',
                           fontSize: '0.6rem',
                           height: '16px'
                         }}
                       />
                     )}
                     
                     {partTimeShift && (
                       <Chip
                         label={partTimeShift.code}
                         size="small"
                         sx={{ 
                           fontFamily: 'Kanit',
                           backgroundColor: '#e8f5e8',
                           color: '#2e7d32',
                           fontSize: '0.6rem',
                           height: '16px'
                         }}
                       />
                     )}
                    
                    {/* แสดงงานที่ได้รับมอบหมาย */}
                    {dayAssignments.length > 0 && (
                      <Box sx={{ mt: 0.5 }}>
                        <Typography variant="caption" sx={{ fontFamily: 'Kanit', color: '#666', display: 'block', mb: 0.5 }}>
                          งานที่ได้รับมอบหมาย:
                        </Typography>
                        {dayAssignments.map((assignment, index) => (
                          <Box key={assignment.id} sx={{ mb: 0.3 }}>
                            {/* เตียง */}
                            {assignment.bedArea && (
                              <Chip
                                label={`เตียง: ${assignment.bedArea}`}
                                size="small"
                                sx={{ 
                                  fontFamily: 'Kanit',
                                  backgroundColor: '#fff3e0',
                                  color: '#e65100',
                                  fontSize: '0.5rem',
                                  height: '14px',
                                  mb: 0.2
                                }}
                              />
                            )}
                            
                            {/* หน้าที่ */}
                            {assignment.duties && assignment.duties.length > 0 && (
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.2 }}>
                                {assignment.duties.map((duty, dutyIndex) => (
                                  <Chip
                                    key={dutyIndex}
                                    label={duty}
                                    size="small"
                                    sx={{ 
                                      fontFamily: 'Kanit',
                                      backgroundColor: '#f3e5f5',
                                      color: '#7b1fa2',
                                      fontSize: '0.5rem',
                                      height: '14px'
                                    }}
                                  />
                                ))}
                              </Box>
                            )}
                            
                            {/* ERT */}
                            {assignment.ert && (
                              <Chip
                                label={`ERT: ${assignment.ert}`}
                                size="small"
                                sx={{ 
                                  fontFamily: 'Kanit',
                                  backgroundColor: '#e8f5e8',
                                  color: '#2e7d32',
                                  fontSize: '0.5rem',
                                  height: '14px'
                                }}
                              />
                            )}
                            
                            {/* ยาเสพติด */}
                            {assignment.drugSupervision && (
                              <Chip
                                label="ยาเสพติด"
                                size="small"
                                sx={{ 
                                  fontFamily: 'Kanit',
                                  backgroundColor: '#ffebee',
                                  color: '#c62828',
                                  fontSize: '0.5rem',
                                  height: '14px'
                                }}
                              />
                            )}
                            
                            {/* ทีม */}
                            {assignment.team && (
                              <Chip
                                label={assignment.team}
                                size="small"
                                sx={{ 
                                  fontFamily: 'Kanit',
                                  backgroundColor: '#e0f2f1',
                                  color: '#00695c',
                                  fontSize: '0.5rem',
                                  height: '14px'
                                }}
                              />
                            )}
                          </Box>
                        ))}
                      </Box>
                    )}
                    
                    {/* แสดงข้อความเมื่อไม่มีงาน */}
                    {!morningShift && !afternoonShift && !nightShift && !partTimeShift && dayAssignments.length === 0 && (
                      <Typography variant="caption" sx={{ fontFamily: 'Kanit', color: '#999', mt: 0.5 }}>
                        ไม่มีเวร/งาน
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default PersonalCalendar; 