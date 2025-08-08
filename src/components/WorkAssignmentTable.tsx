import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Grid,
  Checkbox,
  Chip,
  ListItemText,
  ToggleButtonGroup,
  ToggleButton,
  Card,
  CardContent,
} from '@mui/material';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { WorkAssignment, ScheduleEntry } from '../types';
import { allStaff } from '../data/nurses';

// ข้อมูลอ้างอิง
const SHIFTS = [
  { id: 'morning', name: 'เช้า' },
  { id: 'afternoon', name: 'บ่าย' },
  { id: 'night', name: 'ดึก' }
];

const BED_AREAS = [
  'B1-B3',
  'B4-Y2', 
  'B5-B7',
  'Y3-Y4',
  'B1-B2',
  'B3-B4',
  'Y1-Y2'
];

const DUTIES = [
  'Productivity',
  'ลงทะเบียน / จองเตียง',
  'Pipe line',
  'Check Delfib',
  'ยา Stock',
  'รถ Emergency'
];

const ERT_ROLES = [
  'หัวหน้าแผน',
  'เคลื่อนย้ายกู้ชีพ',
  'เช็คชีวิตติดต่อ',
  'ดับเพลิง',
  'ช่างและเส้นทาง'
];

const TEAMS = [
  'ทีม A',
  'ทีม B'
];

interface WorkAssignmentTableProps {
  year: number;
  month: number;
  assignments: WorkAssignment[];
  onAssignmentChange: (assignments: WorkAssignment[]) => void;
  schedule: ScheduleEntry[]; // เพิ่มตารางเวรเพื่อกรองเจ้าหน้าที่
  isReadOnly?: boolean;
  currentStaffId?: string;
}

const WorkAssignmentTable: React.FC<WorkAssignmentTableProps> = ({
  year,
  month,
  assignments,
  onAssignmentChange,
  schedule,
  isReadOnly = false,
  currentStaffId = '',
}) => {
  const [selectedAssignment, setSelectedAssignment] = useState<WorkAssignment | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Partial<WorkAssignment>>({});
  const [shiftAssignments, setShiftAssignments] = useState<{ [staffId: string]: Partial<WorkAssignment> }>({});
  
  // Date selection state
  const [selectedYear, setSelectedYear] = useState(year.toString());
  const [selectedMonth, setSelectedMonth] = useState(month.toString());
  const [selectedDay, setSelectedDay] = useState('1');
  
  // View mode state
  const [viewMode, setViewMode] = useState<'daily' | 'individual'>('daily');

  // Get current date for default selection
  const currentDate = new Date();
  const defaultYear = currentDate.getFullYear();
  const defaultDay = currentDate.getDate();

  // Initialize with current date if not provided
  React.useEffect(() => {
    if (year && month) {
      setSelectedYear(year.toString());
      setSelectedMonth(month.toString());
      setSelectedDay(defaultDay.toString());
    }
  }, [year, month, defaultDay]);

  // Get selected date string
  const getSelectedDateString = () => {
    const monthStr = selectedMonth.padStart(2, '0');
    const dayStr = selectedDay.padStart(2, '0');
    return `${selectedYear}-${monthStr}-${dayStr}`;
  };

  // Get assignments for selected date
  const getAssignmentsForSelectedDate = () => {
    const selectedDate = getSelectedDateString();
    return assignments.filter(a => a.date === selectedDate);
  };

  // Get days in selected month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

  const getAssignmentsForStaff = (staffId: string, date: string) => {
    return assignments.filter(a => a.nurseId === staffId && a.date === date);
  };

  const getDayName = (date: Date) => {
    const days = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
    return days[date.getDay()];
  };

  const handleAddAssignment = () => {
    setSelectedAssignment(null);
    setEditingAssignment({ date: getSelectedDateString() });
    setIsDialogOpen(true);
  };

  const handleEditAssignment = (assignment: WorkAssignment) => {
    setSelectedAssignment(assignment);
    setEditingAssignment(assignment);
    setIsDialogOpen(true);
  };

  const handleSaveAssignment = () => {
    if (!editingAssignment.date || !editingAssignment.shift) {
      return;
    }

    let newAssignments = [...assignments];
    
    // ลบข้อมูลเก่าของเวรและวันที่นี้ก่อน
    newAssignments = newAssignments.filter(a => 
      !(a.date === editingAssignment.date && a.shift === editingAssignment.shift)
    );

    // เพิ่มข้อมูลใหม่สำหรับทุกคนในเวร
    Object.values(shiftAssignments).forEach(staffAssignment => {
      if (staffAssignment.nurseId) {
        const newAssignment: WorkAssignment = {
          id: Date.now().toString() + Math.random().toString(),
          date: staffAssignment.date!,
          shift: staffAssignment.shift!,
          nurseId: staffAssignment.nurseId!,
          bedArea: staffAssignment.bedArea,
          duties: staffAssignment.duties,
          drugSupervision: staffAssignment.drugSupervision,
          ert: staffAssignment.ert,
          team: staffAssignment.team,
          assignment: '', // เซ็ตเป็นค่าว่าง
          notes: '',
        };
        newAssignments.push(newAssignment);
      }
    });

    onAssignmentChange(newAssignments);
    handleCloseDialog();
  };

  const handleDeleteAssignment = (id: string) => {
    const newAssignments = assignments.filter(a => a.id !== id);
    onAssignmentChange(newAssignments);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedAssignment(null);
    setEditingAssignment({});
    setShiftAssignments({});
  };

  const getNurseName = (nurseId: string) => {
    return allStaff.find(n => n.id === nurseId)?.name || '';
  };

  // กรองเจ้าหน้าที่ตามเวรและวันที่ที่เลือก (ใช้ตรรกะเดียวกับตารางเวร)
  const getStaffByShift = (shift: string, date: string) => {
    if (!shift || !date) return [];

    const staffInShift: typeof allStaff = [];

    allStaff.forEach(staff => {
      let shouldInclude = false;

      // ตรวจสอบเวรเช้า
      const morningShift = schedule.find(e => e.nurseId === staff.id && e.date === date && e.shiftType === 'morning');
      if (morningShift) {
        const shiftId = morningShift.shiftId;
        if (shift === 'morning') {
          // สำหรับเวรเช้า ไม่นับประนอม (n1) และศิรินทรา (n2) เมื่อขึ้นเวรเช้าปกติ
          if (shiftId === 'morning' && (staff.id === 'n1' || staff.id === 'n2')) {
            shouldInclude = false;
          } else if (['morning', 'morning_special', 'morning_afternoon'].includes(shiftId)) {
            shouldInclude = true;
          }
        } else if (shift === 'afternoon' && ['afternoon', 'morning_afternoon', 'night_afternoon'].includes(shiftId)) {
          shouldInclude = true;
        } else if (shift === 'night' && ['night', 'night_afternoon'].includes(shiftId)) {
          shouldInclude = true;
        }
      }

      // ตรวจสอบเวรบ่าย
      const afternoonShift = schedule.find(e => e.nurseId === staff.id && e.date === date && e.shiftType === 'afternoon');
      if (afternoonShift) {
        const shiftId = afternoonShift.shiftId;
        if (shift === 'morning') {
          // สำหรับเวรเช้า ไม่นับประนอม (n1) และศิรินทรา (n2) เมื่อขึ้นเวรเช้าปกติ
          if (shiftId === 'morning' && (staff.id === 'n1' || staff.id === 'n2')) {
            shouldInclude = false;
          } else if (['morning', 'morning_special', 'morning_afternoon'].includes(shiftId)) {
            shouldInclude = true;
          }
        } else if (shift === 'afternoon' && ['afternoon', 'morning_afternoon', 'night_afternoon'].includes(shiftId)) {
          shouldInclude = true;
        } else if (shift === 'night' && ['night', 'night_afternoon'].includes(shiftId)) {
          shouldInclude = true;
        }
      }

      // สำหรับผู้ช่วยพาร์ทไทม์ (ไม่มี shiftType)
      if (staff.isPartTime) {
        const partTimeShift = schedule.find(e => e.nurseId === staff.id && e.date === date && !e.shiftType);
        if (partTimeShift) {
          const shiftId = partTimeShift.shiftId;
          if (shift === 'morning') {
            // สำหรับเวรเช้า ไม่นับประนอม (n1) และศิรินทรา (n2) เมื่อขึ้นเวรเช้าปกติ
            if (shiftId === 'morning' && (staff.id === 'n1' || staff.id === 'n2')) {
              shouldInclude = false;
            } else if (['morning', 'morning_special', 'morning_afternoon'].includes(shiftId)) {
              shouldInclude = true;
            }
          } else if (shift === 'afternoon' && ['afternoon', 'morning_afternoon', 'night_afternoon'].includes(shiftId)) {
            shouldInclude = true;
          } else if (shift === 'night' && ['night', 'night_afternoon'].includes(shiftId)) {
            shouldInclude = true;
          }
        }
      }

      if (shouldInclude) {
        staffInShift.push(staff);
      }
    });

    return staffInShift;
  };

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), 'd MMMM yyyy', { locale: th });
  };

  // เริ่มต้นข้อมูลสำหรับทุกคนในเวร
  const initializeShiftAssignments = (shift: string, date: string) => {
    const staffInShift = getStaffByShift(shift, date);
    const initialAssignments: { [staffId: string]: Partial<WorkAssignment> } = {};
    
    staffInShift.forEach(staff => {
      // ตรวจสอบว่ามีข้อมูลเดิมอยู่แล้วหรือไม่
      const existingAssignment = assignments.find(a => 
        a.nurseId === staff.id && a.date === date && a.shift === shift
      );
      
      initialAssignments[staff.id] = existingAssignment || {
        date,
        shift,
        nurseId: staff.id,
        bedArea: '',
        duties: [],
        drugSupervision: false,
        ert: '',
        team: '',
        assignment: '',
        notes: ''
      };
    });
    
    setShiftAssignments(initialAssignments);
  };

  // ดึงข้อมูลมอบหมายของเจ้าหน้าที่
  const getStaffAssignment = (staffId: string, field: keyof WorkAssignment) => {
    const assignment = shiftAssignments[staffId];
    if (!assignment) return field === 'duties' ? [] : field === 'drugSupervision' ? false : '';
    
    const value = assignment[field];
    if (field === 'duties') return value || [];
    if (field === 'drugSupervision') return Boolean(value);
    return value || '';
  };

  // อัปเดตข้อมูลมอบหมายของเจ้าหน้าที่
  const updateStaffAssignment = (staffId: string, field: string, value: any) => {
    setShiftAssignments(prev => ({
      ...prev,
      [staffId]: {
        ...prev[staffId],
        [field]: value
      }
    }));
  };

  const selectedDateAssignments = getAssignmentsForSelectedDate();
  const daysInMonth = getDaysInMonth(Number(selectedYear), Number(selectedMonth));

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontFamily: 'Kanit' }}>
          ตารางมอบหมายงานประจำวัน
        </Typography>
        {!isReadOnly && (
          <Button
            variant="contained"
            onClick={handleAddAssignment}
            sx={{ fontFamily: 'Kanit' }}
          >
            เพิ่มมอบหมายงาน
          </Button>
        )}
      </Box>

      {/* Date Selection */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontFamily: 'Kanit', fontWeight: 'bold', mb: 2 }}>
          เลือกวันที่
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel sx={{ fontFamily: 'Kanit' }}>วัน</InputLabel>
              <Select
                value={selectedDay}
                label="วัน"
                onChange={(e: SelectChangeEvent) => setSelectedDay(e.target.value)}
                sx={{ fontFamily: 'Kanit' }}
              >
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
                  <MenuItem key={day} value={day.toString()} sx={{ fontFamily: 'Kanit' }}>
                    {day}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel sx={{ fontFamily: 'Kanit' }}>เดือน</InputLabel>
              <Select
                value={selectedMonth}
                label="เดือน"
                onChange={(e: SelectChangeEvent) => {
                  const newMonth = Number(e.target.value);
                  setSelectedMonth(newMonth.toString());
                  // Reset day if it exceeds days in new month
                  const newDaysInMonth = getDaysInMonth(Number(selectedYear), newMonth);
                  if (Number(selectedDay) > newDaysInMonth) {
                    setSelectedDay(newDaysInMonth.toString());
                  }
                }}
                sx={{ fontFamily: 'Kanit' }}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <MenuItem key={month} value={month.toString()} sx={{ fontFamily: 'Kanit' }}>
                    {format(new Date(Number(selectedYear), month - 1, 1), 'MMMM', { locale: th })}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel sx={{ fontFamily: 'Kanit' }}>ปี</InputLabel>
              <Select
                value={selectedYear}
                label="ปี"
                onChange={(e: SelectChangeEvent) => {
                  const newYear = Number(e.target.value);
                  setSelectedYear(newYear.toString());
                  // Reset day if it exceeds days in new year/month
                  const newDaysInMonth = getDaysInMonth(newYear, Number(selectedMonth));
                  if (Number(selectedDay) > newDaysInMonth) {
                    setSelectedDay(newDaysInMonth.toString());
                  }
                }}
                sx={{ fontFamily: 'Kanit' }}
              >
                {Array.from({ length: 10 }, (_, i) => defaultYear - 2 + i).map((year) => (
                  <MenuItem key={year} value={year.toString()} sx={{ fontFamily: 'Kanit' }}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Typography variant="body1" sx={{ fontFamily: 'Kanit', fontWeight: 'bold', color: 'primary.main' }}>
              {formatDate(getSelectedDateString())}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* โหมดการดู */}
      <Paper sx={{ p: 2, mb: 2, backgroundColor: '#f8f9fa' }}>
        <Typography variant="h6" sx={{ fontFamily: 'Kanit', mb: 2 }}>
          โหมดการดู
        </Typography>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(e, newMode) => {
            if (newMode !== null) {
              setViewMode(newMode);
            }
          }}
          sx={{ fontFamily: 'Kanit' }}
        >
          <ToggleButton value="daily">
            รายวัน
          </ToggleButton>
          <ToggleButton value="individual">
            รายบุคคล
          </ToggleButton>
        </ToggleButtonGroup>
      </Paper>

      {viewMode === 'daily' ? (
        <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontFamily: 'Kanit', fontWeight: 'bold' }}>เวร</TableCell>
              <TableCell sx={{ fontFamily: 'Kanit', fontWeight: 'bold' }}>เจ้าหน้าที่</TableCell>
              <TableCell sx={{ fontFamily: 'Kanit', fontWeight: 'bold' }}>รายละเอียด</TableCell>
              {!isReadOnly && (
                <TableCell sx={{ fontFamily: 'Kanit', fontWeight: 'bold' }}>การจัดการ</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {selectedDateAssignments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isReadOnly ? 3 : 4} align="center" sx={{ fontFamily: 'Kanit' }}>
                  ไม่มีงานที่มอบหมายในวันที่ {formatDate(getSelectedDateString())}
                </TableCell>
              </TableRow>
            ) : (
              selectedDateAssignments.map((assignment) => {
                const staff = allStaff.find(s => s.id === assignment.nurseId);
                const shiftName = SHIFTS.find(s => s.id === assignment.shift)?.name || '';
                
                return (
                  <TableRow key={assignment.id}>
                    <TableCell sx={{ fontFamily: 'Kanit' }}>
                      {shiftName}
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'Kanit' }}>
                      {getNurseName(assignment.nurseId)} ({staff?.type === 'nurse' ? 'พยาบาล' : 'ผู้ช่วย'})
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'Kanit' }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        {/* เตียงที่ดูแล */}
                        {assignment.bedArea && (
                          <Typography variant="caption" sx={{ fontFamily: 'Kanit' }}>
                            เตียง: {assignment.bedArea}
                          </Typography>
                        )}
                        {/* หน้าที่ */}
                        {assignment.duties && assignment.duties.length > 0 && (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {assignment.duties.map((duty) => (
                              <Chip key={duty} label={duty} size="small" variant="outlined" />
                            ))}
                          </Box>
                        )}
                        {/* ดูแลยาเสพติด */}
                        {assignment.drugSupervision && (
                          <Chip label="ดูแลยาเสพติด" size="small" color="warning" />
                        )}
                        {/* ERT */}
                        {assignment.ert && (
                          <Typography variant="caption" sx={{ fontFamily: 'Kanit' }}>
                            ERT: {assignment.ert}
                          </Typography>
                        )}
                        {/* ทีม */}
                        {assignment.team && (
                          <Typography variant="caption" sx={{ fontFamily: 'Kanit' }}>
                            {assignment.team}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    {!isReadOnly && (
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleEditAssignment(assignment)}
                            sx={{ fontFamily: 'Kanit' }}
                          >
                            แก้ไข
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => handleDeleteAssignment(assignment.id)}
                            sx={{ fontFamily: 'Kanit' }}
                          >
                            ลบ
                          </Button>
                        </Box>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
      ) : (
        // โหมดรายบุคคล - แสดงปฏิทิน
        <Box>
          <Typography variant="h5" sx={{ fontFamily: 'Kanit', mb: 2, textAlign: 'center' }}>
            ตารางมอบหมายงานของ {getNurseName(currentStaffId)} - {format(new Date(Number(selectedYear), Number(selectedMonth) - 1), 'MMMM yyyy', { locale: th })}
          </Typography>
          
          <Grid container spacing={1}>
            {Array.from({ length: getDaysInMonth(Number(selectedYear), Number(selectedMonth)) }, (_, i) => {
              const day = i + 1;
              const dateStr = `${selectedYear}-${selectedMonth.padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
              const date = new Date(Number(selectedYear), Number(selectedMonth) - 1, day);
              const dayName = getDayName(date);
              const isWeekend = date.getDay() === 0 || date.getDay() === 6;
              
              // ดึงงานที่ได้รับมอบหมายสำหรับเจ้าหน้าที่นี้ในวันนี้
              const dayAssignments = getAssignmentsForStaff(currentStaffId, dateStr);
              
              return (
                <Grid item xs={6} sm={4} md={3} lg={2} key={day}>
                  <Card 
                    sx={{ 
                      height: 160,
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
                      
                      {/* แสดงงานที่ได้รับมอบหมาย */}
                      {dayAssignments.length > 0 ? (
                        <Box sx={{ mt: 0.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          {dayAssignments.map((assignment, index) => (
                            <Box key={assignment.id} sx={{ display: 'flex', flexDirection: 'column', gap: 0.2 }}>
                              {/* เวร */}
                              <Chip
                                label={SHIFTS.find(s => s.id === assignment.shift)?.name || ''}
                                size="small"
                                sx={{ 
                                  fontFamily: 'Kanit',
                                  backgroundColor: '#e3f2fd',
                                  color: '#1976d2',
                                  fontSize: '0.6rem',
                                  height: '16px',
                                  mb: 0.2
                                }}
                              />
                              
                              {/* เตียง */}
                              {assignment.bedArea && (
                                <Chip
                                  label={assignment.bedArea}
                                  size="small"
                                  sx={{ 
                                    fontFamily: 'Kanit',
                                    backgroundColor: '#fff3e0',
                                    color: '#e65100',
                                    fontSize: '0.5rem',
                                    height: '14px'
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
                      ) : (
                        <Typography variant="caption" sx={{ fontFamily: 'Kanit', color: '#999', mt: 0.5 }}>
                          ไม่มีงาน
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}

      {/* Dialog for adding/editing assignment */}
      <Dialog open={isDialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontFamily: 'Kanit' }}>
          {selectedAssignment ? 'แก้ไขงานที่มอบหมาย' : 'เพิ่มงานที่มอบหมาย'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            {/* 1. วันที่ */}
            <TextField
              fullWidth
              label="วันที่"
              type="date"
              value={editingAssignment.date || getSelectedDateString()}
              onChange={(e) => setEditingAssignment({ ...editingAssignment, date: e.target.value })}
              InputLabelProps={{ sx: { fontFamily: 'Kanit' } }}
              sx={{ fontFamily: 'Kanit' }}
            />
            
            {/* 2. เวร */}
            <FormControl fullWidth>
              <InputLabel sx={{ fontFamily: 'Kanit' }}>เวร</InputLabel>
              <Select
                value={editingAssignment.shift || ''}
                label="เวร"
                onChange={(e: SelectChangeEvent) => {
                  const selectedShift = e.target.value;
                  setEditingAssignment({ 
                    ...editingAssignment, 
                    shift: selectedShift,
                    nurseId: '' 
                  });
                  // เริ่มต้นข้อมูลสำหรับทุกคนในเวร
                  initializeShiftAssignments(selectedShift, editingAssignment.date || getSelectedDateString());
                }}
                sx={{ fontFamily: 'Kanit' }}
              >
                {SHIFTS.map((shift) => (
                  <MenuItem key={shift.id} value={shift.id} sx={{ fontFamily: 'Kanit' }}>
                    {shift.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* 3. ตารางมอบหมายงานสำหรับทุกคนในเวร */}
            {editingAssignment.shift && editingAssignment.date && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" sx={{ fontFamily: 'Kanit', mb: 2 }}>
                  มอบหมายงานสำหรับเวร{SHIFTS.find(s => s.id === editingAssignment.shift)?.name}
                </Typography>
                
                <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontFamily: 'Kanit', fontWeight: 'bold' }}>ชื่อเจ้าหน้าที่</TableCell>
                        <TableCell sx={{ fontFamily: 'Kanit', fontWeight: 'bold' }}>เตียง</TableCell>
                        <TableCell sx={{ fontFamily: 'Kanit', fontWeight: 'bold' }}>หน้าที่</TableCell>
                        <TableCell sx={{ fontFamily: 'Kanit', fontWeight: 'bold' }}>ERT</TableCell>
                        <TableCell sx={{ fontFamily: 'Kanit', fontWeight: 'bold' }}>ยาเสพติด</TableCell>
                        <TableCell sx={{ fontFamily: 'Kanit', fontWeight: 'bold' }}>ทีม</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {getStaffByShift(editingAssignment.shift || '', editingAssignment.date || '').map((staff) => (
                        <TableRow key={staff.id}>
                          <TableCell sx={{ fontFamily: 'Kanit' }}>
                            {staff.name} ({staff.type === 'nurse' ? 'พยาบาล' : 'ผู้ช่วย'})
                          </TableCell>
                          
                          {/* เตียง (เฉพาะพยาบาล) */}
                          <TableCell>
                            {staff.type === 'nurse' ? (
                              <Select
                                size="small"
                                value={getStaffAssignment(staff.id, 'bedArea')}
                                onChange={(e) => updateStaffAssignment(staff.id, 'bedArea', e.target.value)}
                                sx={{ fontFamily: 'Kanit', minWidth: 100 }}
                              >
                                <MenuItem value="">-</MenuItem>
                                {BED_AREAS.map((area) => (
                                  <MenuItem key={area} value={area} sx={{ fontFamily: 'Kanit' }}>
                                    {area}
                                  </MenuItem>
                                ))}
                              </Select>
                            ) : '-'}
                          </TableCell>
                          
                          {/* หน้าที่ (เฉพาะพยาบาล) */}
                          <TableCell>
                            {staff.type === 'nurse' ? (
                              <Select
                                multiple
                                size="small"
                                value={getStaffAssignment(staff.id, 'duties') as string[]}
                                onChange={(e) => {
                                  const value = typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value;
                                  updateStaffAssignment(staff.id, 'duties', value);
                                }}
                                renderValue={(selected) => (
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.3 }}>
                                    {(selected as string[]).map((value: string) => (
                                      <Chip key={value} label={value} size="small" />
                                    ))}
                                  </Box>
                                )}
                                sx={{ fontFamily: 'Kanit', minWidth: 150 }}
                              >
                                {DUTIES.map((duty) => (
                                  <MenuItem key={duty} value={duty} sx={{ fontFamily: 'Kanit' }}>
                                    <Checkbox 
                                      checked={(getStaffAssignment(staff.id, 'duties') as string[]).indexOf(duty) > -1}
                                      sx={{ mr: 1 }}
                                    />
                                    <ListItemText primary={duty} />
                                  </MenuItem>
                                ))}
                              </Select>
                            ) : '-'}
                          </TableCell>
                          
                          {/* ERT (ทุกคน) */}
                          <TableCell>
                            <Select
                              size="small"
                              value={getStaffAssignment(staff.id, 'ert')}
                              onChange={(e) => updateStaffAssignment(staff.id, 'ert', e.target.value)}
                              sx={{ fontFamily: 'Kanit', minWidth: 120 }}
                            >
                              <MenuItem value="">-</MenuItem>
                              {ERT_ROLES.map((role) => (
                                <MenuItem key={role} value={role} sx={{ fontFamily: 'Kanit' }}>
                                  {role}
                                </MenuItem>
                              ))}
                            </Select>
                          </TableCell>
                          
                          {/* ดูแลยาเสพติด (เฉพาะพยาบาล) */}
                          <TableCell>
                            {staff.type === 'nurse' ? (
                              <Checkbox
                                checked={getStaffAssignment(staff.id, 'drugSupervision') as boolean}
                                onChange={(e) => updateStaffAssignment(staff.id, 'drugSupervision', e.target.checked)}
                              />
                            ) : '-'}
                          </TableCell>
                          
                          {/* ทีม (เฉพาะผู้ช่วย) */}
                          <TableCell>
                            {staff.type === 'assistant' ? (
                              <Select
                                size="small"
                                value={getStaffAssignment(staff.id, 'team')}
                                onChange={(e) => updateStaffAssignment(staff.id, 'team', e.target.value)}
                                sx={{ fontFamily: 'Kanit', minWidth: 80 }}
                              >
                                <MenuItem value="">-</MenuItem>
                                {TEAMS.map((team) => (
                                  <MenuItem key={team} value={team} sx={{ fontFamily: 'Kanit' }}>
                                    {team}
                                  </MenuItem>
                                ))}
                              </Select>
                            ) : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} sx={{ fontFamily: 'Kanit' }}>
            ยกเลิก
          </Button>
          <Button 
            onClick={handleSaveAssignment} 
            variant="contained" 
            disabled={!editingAssignment.date || !editingAssignment.shift}
            sx={{ fontFamily: 'Kanit' }}
          >
            บันทึก
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WorkAssignmentTable; 