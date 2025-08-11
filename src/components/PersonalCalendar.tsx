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
  Fade,
  Grow,
  Zoom,
} from '@mui/material';
import { 
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  Event as EventIcon
} from '@mui/icons-material';
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
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes shimmer {
            0% { background-position: -200px 0; }
            100% { background-position: calc(200px + 100%) 0; }
          }
          
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          
          @keyframes slideIn {
            from { transform: translateX(-20px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
        `}
      </style>

      {/* ส่วนเลือกเดือน/ปี - สวยแบบตะโกน */}
      <Fade in timeout={800}>
        <Paper sx={{ 
          p: 3, 
          mb: 3, 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '20px',
          boxShadow: '0 15px 35px rgba(102, 126, 234, 0.3)',
          border: '2px solid rgba(255, 255, 255, 0.1)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Background Pattern */}
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)',
            pointerEvents: 'none'
          }} />
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <CalendarIcon sx={{ 
              fontSize: 32, 
              color: 'white',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
            }} />
            <Typography variant="h5" sx={{ 
              fontFamily: 'Kanit', 
              fontWeight: 'bold',
              color: 'white',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>
              เลือกเดือน/ปี
            </Typography>
          </Box>
          
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel sx={{ 
                  fontFamily: 'Kanit', 
                  color: 'white',
                  fontWeight: 'bold',
                  '&.Mui-focused': { color: 'white' }
                }}>
                  เดือน
                </InputLabel>
                <Select
                  value={month.toString()}
                  label="เดือน"
                  onChange={(e) => onMonthChange(Number(e.target.value))}
                  sx={{ 
                    fontFamily: 'Kanit',
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: '15px',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 1)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                      },
                      '&.Mui-focused': {
                        backgroundColor: 'rgba(255, 255, 255, 1)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
                      }
                    },
                    transition: 'all 0.3s ease'
                  }}
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
                <InputLabel sx={{ 
                  fontFamily: 'Kanit', 
                  color: 'white',
                  fontWeight: 'bold',
                  '&.Mui-focused': { color: 'white' }
                }}>
                  ปี
                </InputLabel>
                <Select
                  value={year.toString()}
                  label="ปี"
                  onChange={(e) => onYearChange(Number(e.target.value))}
                  sx={{ 
                    fontFamily: 'Kanit',
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: '15px',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 1)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                      },
                      '&.Mui-focused': {
                        backgroundColor: 'rgba(255, 255, 255, 1)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
                      }
                    },
                    transition: 'all 0.3s ease'
                  }}
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
              <Box sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderRadius: '15px',
                p: 2,
                textAlign: 'center',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
              }}>
                <Typography variant="h5" sx={{ 
                  fontFamily: 'Kanit', 
                  fontWeight: 'bold',
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                }}>
                  ปฏิทินส่วนตัว {currentStaff?.name} - {format(new Date(year, month - 1), 'MMMM yyyy', { locale: th })}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Fade>

      {/* ปฏิทิน - สวยแบบตะโกน */}
      <Grow in timeout={1000}>
        <Grid container spacing={2}>
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
                <Zoom in timeout={500 + i * 50}>
                  <Card 
                    sx={{ 
                      height: 220,
                      borderRadius: '20px',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                      border: '2px solid rgba(0,0,0,0.05)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 15px 35px rgba(0,0,0,0.15)',
                        '& .day-number': {
                          transform: 'scale(1.1)',
                          color: isWeekend ? '#d32f2f' : '#667eea'
                        }
                      },
                      background: isWeekend 
                        ? 'linear-gradient(135deg, #ffebee, #ffcdd2)' 
                        : 'linear-gradient(135deg, #ffffff, #f8f9fa)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Top Border Gradient */}
                    <Box sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: isWeekend 
                        ? 'linear-gradient(90deg, #d32f2f, #f44336)' 
                        : 'linear-gradient(90deg, #667eea, #764ba2)',
                      borderRadius: '20px 20px 0 0'
                    }} />
                    
                    <CardContent sx={{ p: 2, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column' }}>
                      {/* วันและชื่อวัน */}
                      <Box sx={{ mb: 1 }}>
                        <Typography 
                          variant="h4" 
                          className="day-number"
                          sx={{ 
                            fontFamily: 'Kanit', 
                            fontWeight: 'bold',
                            color: isWeekend ? '#d32f2f' : '#667eea',
                            transition: 'all 0.3s ease',
                            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}
                        >
                          {day}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontFamily: 'Kanit', 
                            fontWeight: 'bold',
                            color: isWeekend ? '#d32f2f' : '#666',
                            fontSize: '0.9rem',
                            textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                          }}
                        >
                          {dayName}
                        </Typography>
                      </Box>
                      
                      {/* แสดงเวร */}
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 1 }}>
                        {morningShift && (
                          <Chip
                            label={morningShift.code}
                            size="small"
                            sx={{ 
                              fontFamily: 'Kanit',
                              background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)',
                              color: '#1976d2',
                              fontSize: '0.7rem',
                              height: '18px',
                              fontWeight: 'bold',
                              boxShadow: '0 2px 4px rgba(25, 118, 210, 0.2)',
                              '&:hover': {
                                transform: 'scale(1.05)',
                                boxShadow: '0 4px 8px rgba(25, 118, 210, 0.3)'
                              },
                              transition: 'all 0.3s ease'
                            }}
                          />
                        )}
                        
                        {afternoonShift && (
                          <Chip
                            label={afternoonShift.code}
                            size="small"
                            sx={{ 
                              fontFamily: 'Kanit',
                              background: 'linear-gradient(135deg, #fff3e0, #ffe0b2)',
                              color: '#e65100',
                              fontSize: '0.7rem',
                              height: '18px',
                              fontWeight: 'bold',
                              boxShadow: '0 2px 4px rgba(230, 81, 0, 0.2)',
                              '&:hover': {
                                transform: 'scale(1.05)',
                                boxShadow: '0 4px 8px rgba(230, 81, 0, 0.3)'
                              },
                              transition: 'all 0.3s ease'
                            }}
                          />
                        )}
                        
                        {nightShift && (
                          <Chip
                            label={nightShift.code}
                            size="small"
                            sx={{ 
                              fontFamily: 'Kanit',
                              background: 'linear-gradient(135deg, #f3e5f5, #e1bee7)',
                              color: '#7b1fa2',
                              fontSize: '0.7rem',
                              height: '18px',
                              fontWeight: 'bold',
                              boxShadow: '0 2px 4px rgba(123, 31, 162, 0.2)',
                              '&:hover': {
                                transform: 'scale(1.05)',
                                boxShadow: '0 4px 8px rgba(123, 31, 162, 0.3)'
                              },
                              transition: 'all 0.3s ease'
                            }}
                          />
                        )}
                        
                        {partTimeShift && (
                          <Chip
                            label={partTimeShift.code}
                            size="small"
                            sx={{ 
                              fontFamily: 'Kanit',
                              background: 'linear-gradient(135deg, #e8f5e8, #c8e6c9)',
                              color: '#2e7d32',
                              fontSize: '0.7rem',
                              height: '18px',
                              fontWeight: 'bold',
                              boxShadow: '0 2px 4px rgba(46, 125, 50, 0.2)',
                              '&:hover': {
                                transform: 'scale(1.05)',
                                boxShadow: '0 4px 8px rgba(46, 125, 50, 0.3)'
                              },
                              transition: 'all 0.3s ease'
                            }}
                          />
                        )}
                      </Box>
                      
                      {/* แสดงงานที่ได้รับมอบหมาย */}
                      {dayAssignments.length > 0 && (
                        <Box sx={{ mt: 'auto' }}>
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 0.5, 
                            mb: 1,
                            justifyContent: 'center'
                          }}>
                            <AssignmentIcon sx={{ 
                              fontSize: 14, 
                              color: isWeekend ? '#d32f2f' : '#667eea' 
                            }} />
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                fontFamily: 'Kanit', 
                                color: isWeekend ? '#d32f2f' : '#666', 
                                fontWeight: 'bold',
                                fontSize: '0.7rem'
                              }}
                            >
                              งานที่ได้รับมอบหมาย:
                            </Typography>
                          </Box>
                          
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            {dayAssignments.slice(0, 2).map((assignment, index) => (
                              <Box key={assignment.id} sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
                                {/* เตียง */}
                                {assignment.bedArea && (
                                  <Chip
                                    label={`เตียง: ${assignment.bedArea}`}
                                    size="small"
                                    sx={{ 
                                      fontFamily: 'Kanit',
                                      background: 'linear-gradient(135deg, #fff3e0, #ffe0b2)',
                                      color: '#e65100',
                                      fontSize: '0.6rem',
                                      height: '16px',
                                      fontWeight: 'bold',
                                      boxShadow: '0 2px 4px rgba(230, 81, 0, 0.2)'
                                    }}
                                  />
                                )}
                                
                                {/* หน้าที่ */}
                                {assignment.duties && assignment.duties.length > 0 && (
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.3, justifyContent: 'center' }}>
                                    {assignment.duties.slice(0, 2).map((duty, dutyIndex) => (
                                      <Chip
                                        key={dutyIndex}
                                        label={duty}
                                        size="small"
                                        sx={{ 
                                          fontFamily: 'Kanit',
                                          background: 'linear-gradient(135deg, #f3e5f5, #e1bee7)',
                                          color: '#7b1fa2',
                                          fontSize: '0.6rem',
                                          height: '16px',
                                          fontWeight: 'bold',
                                          boxShadow: '0 2px 4px rgba(123, 31, 162, 0.2)'
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
                                      background: 'linear-gradient(135deg, #e8f5e8, #c8e6c9)',
                                      color: '#2e7d32',
                                      fontSize: '0.6rem',
                                      height: '16px',
                                      fontWeight: 'bold',
                                      boxShadow: '0 2px 4px rgba(46, 125, 50, 0.2)'
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
                                      background: 'linear-gradient(135deg, #ffebee, #ffcdd2)',
                                      color: '#c62828',
                                      fontSize: '0.6rem',
                                      height: '16px',
                                      fontWeight: 'bold',
                                      boxShadow: '0 2px 4px rgba(198, 40, 40, 0.2)'
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
                                      background: 'linear-gradient(135deg, #e0f2f1, #b2dfdb)',
                                      color: '#00695c',
                                      fontSize: '0.6rem',
                                      height: '16px',
                                      fontWeight: 'bold',
                                      boxShadow: '0 2px 4px rgba(0, 105, 92, 0.2)'
                                    }}
                                  />
                                )}
                              </Box>
                            ))}
                          </Box>
                        </Box>
                      )}
                      
                      {/* แสดงข้อความเมื่อไม่มีงาน */}
                      {!morningShift && !afternoonShift && !nightShift && !partTimeShift && dayAssignments.length === 0 && (
                        <Box sx={{ 
                          mt: 'auto', 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center',
                          gap: 1
                        }}>
                          <EventIcon sx={{ 
                            fontSize: 24, 
                            color: '#ccc',
                            animation: 'float 3s ease-in-out infinite'
                          }} />
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              fontFamily: 'Kanit', 
                              color: '#999', 
                              fontStyle: 'italic',
                              fontSize: '0.7rem'
                            }}
                          >
                            ไม่มีเวร/งาน
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Zoom>
              </Grid>
            );
          })}
        </Grid>
      </Grow>
    </Box>
  );
};

export default PersonalCalendar; 